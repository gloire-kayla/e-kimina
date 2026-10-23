
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../backend/store.mjs';
import {createPhoneSecurity} from '../backend/phone-security.mjs';
import {createApp} from '../backend/server.mjs';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,unlinkSync,rmdirSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
function fixture(t,{deliveryFails=false}={}){
 const store=new Store(':memory:'),messages=[];let time=Date.now();
 for(const [id,p] of [['u1','0799770001'],['u2','0799770002']])store.db.prepare('INSERT INTO users(id,name,phone,password_hash,language,created_at) VALUES(?,?,?,?,?,?)').run(id,id,p,'hash','rw',time);
 const security=createPhoneSecurity({db:store.db,now:()=>time,sendSms:m=>{if(deliveryFails)throw Error('offline');messages.push(m);}});
 t.after(()=>store.close());
 return {store,messages,security,advance:n=>time+=n,issue:()=>security.issue({purpose:'verify',userId:'u1',number:'0799770001',ip:'127.0.0.1'})};
}
test('test codes are not returned or stored in plain text; verification is one-use and user-bound',async t=>{
 const f=fixture(t),challenge=await f.issue(),code=f.messages[0].code;
 assert.equal(challenge.mode,'local');assert.equal(challenge.code,undefined);assert.match(code,/^[0-9]{6}$/);
 assert.notEqual(f.store.db.prepare('SELECT code_digest FROM phone_challenges').get().code_digest,code);
 assert.throws(()=>f.security.verify('u2',challenge.challengeId,code),/codeInvalid/);
 f.security.verify('u1',challenge.challengeId,code);assert.equal(f.security.verified(f.store.user('u1')),true);
 assert.equal(f.store.user('u1').verification_method,'local');
 assert.throws(()=>f.security.verify('u1',challenge.challengeId,code),/codeInvalid/);
 assert.equal(f.store.db.prepare('SELECT count(*) n FROM security_events').get().n,1);
});
test('five incorrect attempts lock the challenge even with the correct code',async t=>{
 const f=fixture(t),c=await f.issue(),correct=f.messages[0].code,wrong=correct==='111111'?'222222':'111111';
 for(let i=0;i<5;i++)assert.throws(()=>f.security.verify('u1',c.challengeId,wrong),/codeInvalid/);
 assert.throws(()=>f.security.verify('u1',c.challengeId,correct),/codeInvalid/);
 assert.equal(f.store.db.prepare('SELECT attempts FROM phone_challenges').get().attempts,5);
 assert.equal(f.security.verified(f.store.user('u1')),false);
});
test('expiry, resend invalidation, cooldown and hourly limits are enforced',async t=>{
 const f=fixture(t),first=await f.issue(),oldCode=f.messages[0].code;
 await assert.rejects(f.issue(),/codeRateLimited/);f.advance(60001);
 const second=await f.issue();assert.throws(()=>f.security.verify('u1',first.challengeId,oldCode),/codeInvalid/);
 f.advance(600001);assert.throws(()=>f.security.verify('u1',second.challengeId,f.messages[1].code),/codeInvalid/);
 await f.issue();f.advance(60001);await assert.rejects(f.issue(),/codeRateLimited/);
});
test('delivery failure invalidates the challenge without marking a phone verified',async t=>{
 const f=fixture(t,{deliveryFails:true});await assert.rejects(f.issue(),/deliveryUnavailable/);
 const c=f.store.db.prepare('SELECT * FROM phone_challenges').get();assert.notEqual(c.consumed_at,null);assert.equal(c.delivered,0);assert.equal(f.security.verified(f.store.user('u1')),false);
});
test('local code mode refuses a public origin',()=>{assert.throws(()=>createApp({requirePhoneVerification:true,database:':memory:',origin:'https://example.com'}),/loopback/);});
test('version 0.2 accounts migrate without losing passwords or records',t=>{
 const dir=mkdtempSync(path.join(tmpdir(),'ekimina-migration-')),file=path.join(dir,'db.sqlite');
 let db=new DatabaseSync(file);db.exec('CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT NOT NULL,phone TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,language TEXT NOT NULL,created_at INTEGER NOT NULL)');
 db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run('old','Old Test','0799770099','existing-hash','rw',1);db.close();
 const store=new Store(file);const u=store.user('old');assert.equal(u.name,'Old Test');assert.equal(u.verified_at,null);assert.equal(store.db.prepare('SELECT password_hash FROM users WHERE id=?').get('old').password_hash,'existing-hash');store.close();
 for(const name of ['db.sqlite','db.sqlite-wal','db.sqlite-shm'])try{unlinkSync(path.join(dir,name));}catch(e){if(e.code!=='ENOENT')throw e;}rmdirSync(dir);
});
test('verification and recovery APIs preserve identity, reject replay and revoke every session',async t=>{
 const messages=[];let time=Date.now();const origin='http://127.0.0.1:4185',app=createApp({requirePhoneVerification:true,database:':memory:',origin,clock:()=>time,sendSms:m=>messages.push(m)});
 await new Promise(resolve=>app.server.listen(4185,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));app.store.close();});
 function client(){return {cookie:'',csrf:'',async call(url,method='GET',data,headers={}){const res=await fetch(origin+url,{method,headers:{Origin:origin,...(this.cookie?{Cookie:this.cookie}:{}),...(this.csrf?{'X-CSRF-Token':this.csrf}:{}),...(data?{'Content-Type':'application/json'}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});const body=await res.json();if(res.headers.get('set-cookie'))this.cookie=res.headers.get('set-cookie').split(';')[0];if(body.csrf)this.csrf=body.csrf;return {status:res.status,data:body};}};}
 const a=client(),b=client(),other=client(),oldPassword='Existing-test-password!',newPasswords=['Updated-test-password-1!','Updated-test-password-2!'];
 let r=await a.call('/api/auth/register','POST',{name:'Recovery Test',phone:'0799770011',password:oldPassword,language:'en',verified:true,verificationMode:'local'});assert.equal(r.status,201);assert.equal(r.data.user.verified,false);
 await t.test('unconfirmed accounts cannot open groups; requests require CSRF',async()=>{assert.equal((await a.call('/api/groups','POST',{})).status,403);assert.equal((await a.call('/api/auth/phone/request','POST',{}, {'X-CSRF-Token':'wrong'})).status,403);});
 const challenge=await a.call('/api/auth/phone/request','POST',{});assert.equal(challenge.status,200);const verifyCode=messages.at(-1).code;
 await t.test('active challenge survives reload without disclosing its code',async()=>{const session=await a.call('/api/session');assert.equal(session.data.phoneChallenge.challengeId,challenge.data.challengeId);assert.equal(session.data.phoneChallenge.code,undefined);});
 const stale=client();stale.cookie=a.cookie;stale.csrf=a.csrf;
 r=await a.call('/api/auth/phone/confirm','POST',{challengeId:challenge.data.challengeId,code:verifyCode});assert.equal(r.status,200);assert.equal(r.data.user.verified,true);
 await t.test('confirmation rotates session; verification code cannot be reused for recovery',async()=>{assert.equal((await stale.call('/api/session')).status,401);assert.equal((await a.call('/api/auth/recovery/reset','POST',{challengeId:challenge.data.challengeId,code:verifyCode,password:newPasswords[0]})).status,400);});
 r=await b.call('/api/auth/login','POST',{phone:'0799770011',password:oldPassword});assert.equal(r.status,200);
 const reset=await other.call('/api/auth/recovery/request','POST',{phone:'0799770011',language:'en'});const resetCode=messages.at(-1).code,count=messages.length;
 const missing=await other.call('/api/auth/recovery/request','POST',{phone:'0799770012',language:'en'});
 await t.test('unknown numbers get the same recovery response shape and no delivery',async()=>{assert.equal(missing.status,reset.status);assert.deepEqual(Object.keys(missing.data).sort(),Object.keys(reset.data).sort());assert.equal(messages.length,count);assert.equal((await other.call('/api/auth/recovery/reset','POST',{challengeId:missing.data.challengeId,code:resetCode,password:newPasswords[0]})).status,400);});
 await t.test('invalid new password does not consume a valid recovery code',async()=>{assert.equal((await other.call('/api/auth/recovery/reset','POST',{challengeId:reset.data.challengeId,code:resetCode,password:'short'})).status,400);});
 const results=await Promise.all(newPasswords.map(password=>client().call('/api/auth/recovery/reset','POST',{challengeId:reset.data.challengeId,code:resetCode,password})));
 await t.test('racing resets allow one success and invalidate every old session',async()=>{assert.deepEqual(results.map(x=>x.status).sort(),[200,400]);assert.equal((await a.call('/api/session')).status,401);assert.equal((await b.call('/api/session')).status,401);assert.equal(app.store.db.prepare('SELECT count(*) n FROM sessions').get().n,0);});
 const winner=results[0].status===200?newPasswords[0]:newPasswords[1];
 await t.test('only the new password works; replay does not change it again',async()=>{assert.equal((await client().call('/api/auth/login','POST',{phone:'0799770011',password:oldPassword})).status,401);assert.equal((await client().call('/api/auth/login','POST',{phone:'0799770011',password:winner})).status,200);assert.equal((await client().call('/api/auth/recovery/reset','POST',{challengeId:reset.data.challengeId,code:resetCode,password:'Another-test-password!'})).status,400);assert.equal(app.store.db.prepare("SELECT count(*) n FROM security_events WHERE event='passwordRecoveredLocal'").get().n,1);});
});
