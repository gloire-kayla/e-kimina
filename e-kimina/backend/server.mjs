import http from 'node:http';
import {isIP} from 'node:net';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scrypt as scryptCallback,timingSafeEqual,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
import {Store,hash,token,fail,text,phone} from './store.mjs';
import {createPhoneSecurity} from './phone-security.mjs';
import {readReceipt,uploadReceipt,getReceipt} from './receipts.mjs';
const scrypt=promisify(scryptCallback),root=path.resolve(fileURLToPath(new URL('../dist',import.meta.url)));
const safeUser=u=>({id:u.id,name:u.name,phone:u.phone,language:u.language,verified:!!u.verified_at&&u.verification_method==='local',verificationMode:u.verification_method||null});
async function passwordHash(password){if(typeof password!=='string'||password.length<12||password.length>128)fail('passwordLength');const salt=randomBytes(16).toString('hex');const digest=await scrypt(password,salt,64);return salt+':'+digest.toString('hex');}
async function passwordMatch(password,stored){const [salt,digest]=stored.split(':');const candidate=await scrypt(password,salt,64);return timingSafeEqual(candidate,Buffer.from(digest,'hex'));}
async function body(req){if(!req.headers['content-type']?.startsWith('application/json'))fail('invalidInput',415);let raw='';for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>16384)fail('bodyTooLarge',413);}try{const parsed=JSON.parse(raw);if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')fail('invalidInput');return parsed;}catch{fail('invalidInput');}}
function cookie(req){return (req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('ek_session='))?.slice(11)||'';}
export function createApp({database=path.resolve('data/e-kimina.sqlite'),origin='http://127.0.0.1:4173',secure=new URL(origin).protocol==='https:',sendSms,clock=Date.now,verificationSecret,requirePhoneVerification=false,deployment='local',trustedProxyHops=0}={}){
 if(!['local','public-beta'].includes(deployment))throw Error('Invalid deployment mode');
 const online=deployment==='public-beta';
 if(!Number.isInteger(trustedProxyHops)||trustedProxyHops<0||trustedProxyHops>5)throw Error('Invalid trusted proxy hop count');
 if(online&&(new URL(origin).protocol!=='https:'||!secure||requirePhoneVerification))throw Error('Public beta requires HTTPS, secure cookies and disabled phone verification');
 if(new URL(origin).origin!==origin)throw Error('APP_ORIGIN must be an origin without a trailing slash');
 if(!online&&!['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname))throw Error('Local test verification must use a loopback origin. Real SMS delivery is not connected.');
 if(new URL(origin).username||new URL(origin).password)throw Error('APP_ORIGIN must not contain credentials');
 const store=new Store(database,{now:clock}),db=store.db,dummyHash=randomBytes(16).toString('hex')+':'+randomBytes(64).toString('hex');
 const phoneSecurity=createPhoneSecurity({db,sendSms,now:clock,secret:verificationSecret,allowUnverifiedRecovery:!requirePhoneVerification});
 const publicUser=id=>safeUser(store.user(id));
 function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'}).end(JSON.stringify(data));}
 function clientIp(req){
  if(!online||!trustedProxyHops)return req.socket.remoteAddress||'unknown';
  const chain=typeof req.headers['x-forwarded-for']==='string'?req.headers['x-forwarded-for'].split(',').map(v=>v.trim()):[];
  const value=chain.at(-trustedProxyHops);
  if(!value||!isIP(value))fail('invalidOrigin',403);
  return value;
 }
 function authenticate(req){const raw=cookie(req);if(!/^[\w-]{43}$/.test(raw))fail('unauthorized',401);const session=db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').get(hash(raw),Date.now());if(!session)fail('unauthorized',401);return session;}
 function sessionCookie(res,raw,maxAge=604800){res.setHeader('Set-Cookie',`ek_session=${raw}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure?'; Secure':''}`);}
 function newSession(res,userId){const raw=token(),csrf=token(),now=Date.now();db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now);db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),hash(raw),userId,csrf,now,now+604800000);sessionCookie(res,raw);return csrf;}
 function rateLimit(req,identifier){const now=Date.now(),ip=clientIp(req);db.prepare('DELETE FROM auth_attempts WHERE at<?').run(now-900000);for(const [key,limit] of [['ip:'+ip,30],['phone:'+identifier,8]]){const bucket=hash(key);if(db.prepare('SELECT count(*) AS n FROM auth_attempts WHERE bucket=? AND at>?').get(bucket,now-900000).n>=limit)fail('rateLimited',429);db.prepare('INSERT INTO auth_attempts VALUES(?,?)').run(bucket,now);}}
 const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
 if(online)res.setHeader('Strict-Transport-Security','max-age=31536000');
 try{
 if(!online&&!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))fail('invalidOrigin',403);
 if(req.headers.host!==new URL(origin).host)fail('invalidOrigin',403);
 const url=new URL(req.url,origin),p=url.pathname;
 if(!p.startsWith('/api/')){if(req.method!=='GET'&&req.method!=='HEAD')fail('notFound',404);const pathname=decodeURIComponent(p),filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!filename.startsWith(root+path.sep))fail('notFound',404);const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8'},type=types[path.extname(filename)];if(!type)fail('notFound',404);let contents;try{contents=await readFile(filename);}catch{fail('notFound',404);}res.writeHead(200,{'Content-Type':type}).end(req.method==='HEAD'?'':contents);return;}
 const write=!['GET','HEAD'].includes(req.method);if(write&&req.headers.origin!==origin)fail('invalidOrigin',403);
 if(p==='/api/health'&&req.method==='GET'){send(res,200,{status:'ok',stage:online?'public-beta':'development',phoneVerification:requirePhoneVerification?'local-test':'disabled',accountRecovery:online?'disabled':'local-test',smsDelivery:online?'disabled':'terminal'});return;}
 if((p==='/api/auth/register'||p==='/api/auth/login')&&req.method==='POST'){
 const data=await body(req),normalized=phone(data.phone);rateLimit(req,normalized);if(typeof data.password!=='string'||data.password.length>128)fail('invalidCredentials',401);
 if(p.endsWith('register')){const name=text(data.name,80);if(!name||!['rw','en','fr'].includes(data.language))fail('invalidInput');const digest=await passwordHash(data.password);if(db.prepare('SELECT 1 FROM users WHERE phone=?').get(normalized))fail('accountUnavailable',409);const id=crypto.randomUUID();db.prepare('INSERT INTO users(id,name,phone,password_hash,language,created_at) VALUES(?,?,?,?,?,?)').run(id,name,normalized,digest,data.language,Date.now());const csrf=newSession(res,id);send(res,201,{user:publicUser(id),csrf,groups:[]});return;}
 const u=db.prepare('SELECT * FROM users WHERE phone=?').get(normalized),valid=await passwordMatch(data.password,u?.password_hash||dummyHash);if(!u||!valid||db.prepare('SELECT password_hash FROM users WHERE id=?').get(u.id)?.password_hash!==u.password_hash)fail('invalidCredentials',401);const csrf=newSession(res,u.id);send(res,200,{user:safeUser(u),csrf,groups:store.groups(u.id)});return;
 }

 if(p==='/api/auth/recovery/request'&&req.method==='POST'){
  if(online)fail('deliveryUnavailable',503);
  const data=await body(req);const result=await phoneSecurity.issue({purpose:'reset',number:data.phone,ip:req.socket.remoteAddress,language:['rw','en','fr'].includes(data.language)?data.language:'rw'});send(res,200,result);return;
 }
 if(p==='/api/auth/recovery/reset'&&req.method==='POST'){
  if(online)fail('deliveryUnavailable',503);
  const data=await body(req);rateLimit(req,'recovery:'+req.socket.remoteAddress);const digest=await passwordHash(data.password);phoneSecurity.reset(data.challengeId,data.code,digest);sessionCookie(res,'',0);send(res,200,{ok:true});return;
 }
 const session=authenticate(req),userId=session.user_id;
 if(write){const csrf=req.headers['x-csrf-token'];if(typeof csrf!=='string'||csrf.length!==session.csrf.length||!timingSafeEqual(Buffer.from(csrf),Buffer.from(session.csrf)))fail('csrf',403);}
 if(p==='/api/session'&&req.method==='GET'){send(res,200,{user:publicUser(userId),csrf:session.csrf,groups:store.groups(userId),phoneChallenge:db.prepare('SELECT id AS challengeId,expires_at AS expiresAt FROM phone_challenges WHERE user_id=? AND purpose=\'verify\' AND delivered=1 AND consumed_at IS NULL AND expires_at>? AND attempts<5 ORDER BY issued_at DESC LIMIT 1').get(userId,clock())||null});return;}
 if(p==='/api/auth/logout'&&req.method==='POST'){db.prepare('DELETE FROM sessions WHERE id=?').run(session.id);sessionCookie(res,'',0);send(res,200,{ok:true});return;}
 if(p==='/api/sessions'&&req.method==='GET'){send(res,200,{sessions:db.prepare('SELECT id,created_at,expires_at FROM sessions WHERE user_id=? AND expires_at>?').all(userId,Date.now()).map(s=>({...s,current:s.id===session.id}))});return;}
 if(/^\/api\/sessions\/[^/]+$/.test(p)&&req.method==='DELETE'){db.prepare('DELETE FROM sessions WHERE id=? AND user_id=?').run(p.split('/').at(-1),userId);send(res,200,{ok:true});return;}

 if(p==='/api/auth/phone/request'&&req.method==='POST'){
  if(!requirePhoneVerification)fail('notFound',404);await body(req);const u=store.user(userId);if(phoneSecurity.verified(u)){send(res,200,{alreadyVerified:true});return;}
  send(res,200,await phoneSecurity.issue({purpose:'verify',userId,number:u.phone,ip:req.socket.remoteAddress,language:u.language}));return;
 }
 if(p==='/api/auth/phone/confirm'&&req.method==='POST'){
  if(!requirePhoneVerification)fail('notFound',404);const data=await body(req);phoneSecurity.verify(userId,data.challengeId,data.code);db.prepare('DELETE FROM sessions WHERE id=?').run(session.id);const csrf=newSession(res,userId);send(res,200,{user:publicUser(userId),csrf,groups:store.groups(userId)});return;
 }
 if(requirePhoneVerification&&p.startsWith('/api/groups')&&!phoneSecurity.verified(store.user(userId)))fail('phoneUnverified',403);
 if(p==='/api/groups'&&req.method==='POST'){const id=store.createGroup(userId,await body(req));send(res,201,{id,groups:store.groups(userId)});return;}
 if(p==='/api/groups/join'&&req.method==='POST'){const data=await body(req),id=store.join(userId,data.token);send(res,200,{id,groups:store.groups(userId)});return;}

 const receiptRoute=p.match(/^\/api\/groups\/([\w-]+)\/receipts(?:\/([\w-]+))?$/);
 if(receiptRoute){const [,groupId,id]=receiptRoute;store.load(groupId,userId);
  if(!id&&req.method==='POST'){const file=await readReceipt(req);send(res,201,uploadReceipt(store,groupId,userId,req.headers['idempotency-key'],file));return;}
  if(id&&req.method==='DELETE'){const r=getReceipt(store,groupId,userId,id);if(r.owner_id!==userId||r.payment_id)fail('invalidReceipt',409);db.prepare('DELETE FROM receipts WHERE id=? AND owner_id=? AND payment_id IS NULL').run(id,userId);send(res,200,{ok:true});return;}
  if(id&&['GET','HEAD'].includes(req.method)){const r=getReceipt(store,groupId,userId,id);res.setHeader('Content-Security-Policy',"sandbox; default-src 'none'");res.writeHead(200,{'Content-Type':r.mime,'Content-Length':r.size,'Content-Disposition':"attachment; filename=\"receipt"+({ 'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','application/pdf':'.pdf'}[r.mime])+"\"; filename*=UTF-8''"+encodeURIComponent(r.filename).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16))});res.end(req.method==='HEAD'?undefined:Buffer.from(r.bytes));return;}
 }
 const readRoute=p.match(/^\/api\/groups\/([\w-]+)\/notifications\/read$/);
 if(readRoute&&req.method==='POST'){const data=await body(req);store.markRead(readRoute[1],userId,data.ids);send(res,200,{state:store.view(readRoute[1],userId)});return;}

 const match=p.match(/^\/api\/groups\/([\w-]+)(?:\/(commands|invitations|journal))?$/);
 if(match){const [,groupId,action]=match;if(!action&&req.method==='GET'){send(res,200,store.view(groupId,userId));return;}if(action==='invitations'&&req.method==='POST'){send(res,201,store.invite(userId,groupId,await body(req)));return;}if(action==='commands'&&req.method==='POST'){const {command,data}=await body(req);if(!data||Array.isArray(data)||typeof data!=='object')fail('invalidInput');const result=store.command(groupId,userId,req.headers['idempotency-key'],command,data);send(res,200,{...result,state:store.view(groupId,userId)});return;}if(action==='journal'&&req.method==='GET'){if(store.load(groupId,userId).role==='member')fail('forbidden',403);send(res,200,{entries:db.prepare('SELECT j.source,j.created_at,l.account,l.member_id,l.debit,l.credit FROM journal j JOIN journal_lines l ON l.journal_id=j.id WHERE j.group_id=? ORDER BY j.created_at,l.id').all(groupId)});return;}}
 fail('notFound',404);
 }catch(e){let status=e.status||({forbidden:403,alreadyReviewed:409,duplicate:409,invalidLoan:409,insufficient:409}[e.message])||400,code=e.message;if(!/^[A-Za-z]+$/.test(code)||code.startsWith('SQLITE')||e.code?.startsWith('SQLITE')||e instanceof TypeError){status=500;code='serverError';}if(!res.headersSent)send(res,status,{error:code});else res.end();}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;return {server,store};
}
