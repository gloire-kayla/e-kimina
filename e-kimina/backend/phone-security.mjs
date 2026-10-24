
import {randomInt,randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
import {hash,phone,fail} from './store.mjs';
export function createPhoneSecurity({db,sendSms,now=Date.now,secret=randomBytes(32),allowUnverifiedRecovery=false}){
 const ttl=10*60*1000;
 const digest=(id,purpose,code)=>createHmac('sha256',secret).update(id+':'+purpose+':'+code).digest('hex');
 const deliver=sendSms||((m)=>console.log('[e-Kimina LOCAL TEST CODE] '+m.phone+' | '+m.purpose+' | '+m.code+' | expires in 10 minutes'));
 function transact(fn){db.exec('BEGIN IMMEDIATE');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}
 function verified(u){return !!u?.verified_at&&u.verification_method==='local';}
 async function issue({purpose,userId=null,number,ip,language='rw'}){
  const normalized=phone(number),at=now(),id=crypto.randomUUID(),code=String(randomInt(100000,1000000));
  const u=purpose==='verify'?db.prepare('SELECT * FROM users WHERE id=?').get(userId):db.prepare('SELECT * FROM users WHERE phone=?').get(normalized);
  const eligible=purpose==='verify'?u?.phone===normalized:!!u&&(verified(u)||allowUnverifiedRecovery);
  const targetId=eligible?u.id:null;
  transact(()=>{
   db.prepare('DELETE FROM phone_challenges WHERE issued_at<?').run(at-86400000);
   const phoneHash=hash(normalized),ipHash=hash(ip);
   const recent=db.prepare('SELECT max(issued_at) last,count(*) n FROM phone_challenges WHERE phone_hash=? AND purpose=? AND issued_at>?').get(phoneHash,purpose,at-3600000);
   const count=db.prepare('SELECT count(*) n FROM phone_challenges WHERE ip_hash=? AND issued_at>?').get(ipHash,at-3600000).n;
   if((recent.last!=null&&at-recent.last<60000)||recent.n>=3||count>=20)fail('codeRateLimited',429);
   db.prepare('UPDATE phone_challenges SET consumed_at=? WHERE phone_hash=? AND purpose=? AND consumed_at IS NULL').run(at,phoneHash,purpose);
   db.prepare('INSERT INTO phone_challenges(id,user_id,phone_hash,ip_hash,purpose,code_digest,issued_at,expires_at) VALUES(?,?,?,?,?,?,?,?)').run(id,targetId,phoneHash,ipHash,purpose,digest(id,purpose,code),at,at+ttl);
  });
  if(targetId){try{await deliver({phone:normalized,code,purpose,language});db.prepare('UPDATE phone_challenges SET delivered=1 WHERE id=? AND consumed_at IS NULL').run(id);}catch{db.prepare('UPDATE phone_challenges SET consumed_at=? WHERE id=?').run(now(),id);if(purpose==='verify')fail('deliveryUnavailable',503);}}
  return {challengeId:id,expiresAt:at+ttl,mode:'local'};
 }
 function consume({id,code,purpose,userId=null},apply){
  const outcome=transact(()=>{
   const c=typeof id==='string'?db.prepare('SELECT * FROM phone_challenges WHERE id=? AND purpose=?').get(id,purpose):null;
   if(!c||!c.user_id||c.consumed_at!=null||!c.delivered||c.expires_at<=now()||c.attempts>=5||(purpose==='verify'&&c.user_id!==userId))return false;
   db.prepare('UPDATE phone_challenges SET attempts=attempts+1 WHERE id=?').run(c.id);
   const valid=typeof code==='string'&&/^\d{6}$/.test(code)&&timingSafeEqual(Buffer.from(c.code_digest,'hex'),Buffer.from(digest(c.id,purpose,code),'hex'));
   if(!valid)return false;
   const u=db.prepare('SELECT * FROM users WHERE id=?').get(c.user_id);
   if(!u||(purpose==='reset'&&!verified(u)&&!allowUnverifiedRecovery))return false;
   apply(u);
   db.prepare('UPDATE phone_challenges SET consumed_at=? WHERE phone_hash=? AND consumed_at IS NULL').run(now(),c.phone_hash);
   db.prepare('INSERT INTO security_events(user_id,event,created_at) VALUES(?,?,?)').run(u.id,purpose==='verify'?'phoneVerifiedLocal':'passwordRecoveredLocal',now());
   return true;
  });
  if(!outcome)fail('codeInvalid');
 }
 return {
  mode:'local',verified,issue,
  verify(userId,id,code){consume({id,code,purpose:'verify',userId},u=>db.prepare("UPDATE users SET verified_at=?,verification_method='local' WHERE id=?").run(now(),u.id));},
  reset(id,code,passwordHash){consume({id,code,purpose:'reset'},u=>{db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(passwordHash,u.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);});}
 };
}
