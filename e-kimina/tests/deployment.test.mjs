import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createApp} from '../backend/server.mjs';
const origin='https://ekimina.example';
async function fixture(t,options={}){
 const app=createApp({database:':memory:',origin,deployment:'public-beta',...options});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));app.store.close();});
 const call=(route,{method='GET',data,headers={}}={})=>new Promise((resolve,reject)=>{
  const req=http.request({host:'127.0.0.1',port:app.server.address().port,path:route,method,headers:{Host:'ekimina.example',Origin:origin,...(data?{'Content-Type':'application/json'}:{}),...headers}},res=>{
   let raw='';res.on('data',c=>raw+=c);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(raw)}));
  });req.on('error',reject);req.end(data?JSON.stringify(data):undefined);
 });return {...app,call};
}
test('online mode is explicit and requires HTTPS with secure cookies',()=>{
 assert.throws(()=>createApp({database:':memory:',origin}),/loopback/);
 for(const settings of [{origin:'http://ekimina.example'},{secure:false},{requirePhoneVerification:true}])assert.throws(()=>createApp({database:':memory:',origin,deployment:'public-beta',...settings}),/requires HTTPS/);
 assert.throws(()=>createApp({database:':memory:',deployment:'production'}),/Invalid deployment/);
 assert.throws(()=>createApp({database:':memory:',origin,deployment:'public-beta',trustedProxyHops:1.5}),/proxy hop/);
});
test('online sessions retain secure cookies, strict Host, Origin and CSRF checks',async t=>{
 const {call}=await fixture(t);
 const health=await call('/api/health');assert.equal(health.body.stage,'public-beta');assert.equal(health.body.smsDelivery,'disabled');assert.match(health.headers['strict-transport-security'],/max-age/);
 assert.equal((await call('/api/health',{headers:{Host:'other.example'}})).status,403);
 const data={name:'Hosted QA',phone:'0799887700',password:'fictional-test-password',language:'en'};
 assert.equal((await call('/api/auth/register',{method:'POST',data,headers:{Origin:'https://wrong.example'}})).status,403);
 const registered=await call('/api/auth/register',{method:'POST',data});assert.equal(registered.status,201);
 const cookie=registered.headers['set-cookie'][0];assert.match(cookie,/; Secure/);assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
 const headers={Cookie:cookie.split(';')[0]};assert.equal((await call('/api/session',{headers})).status,200);
 const group={name:'Hosted group',contribution:1000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'reducing'};
 assert.equal((await call('/api/groups',{method:'POST',headers,data:group})).status,403);
 assert.equal((await call('/api/groups',{method:'POST',headers:{...headers,'X-CSRF-Token':registered.body.csrf},data:group})).status,201);
});
test('online recovery cannot deliver or consume terminal codes',async t=>{
 let deliveries=0;const {call,store}=await fixture(t,{sendSms:()=>deliveries++});
 for(const route of ['request','reset'])assert.equal((await call('/api/auth/recovery/'+route,{method:'POST',data:{phone:'0799887701',code:'123456',password:'fictional-test-password'}})).status,503);
 assert.equal(deliveries,0);assert.equal(store.db.prepare('SELECT count(*) n FROM phone_challenges').get().n,0);
});
test('configured proxy rate limits cannot be bypassed by spoofing a forwarded prefix',async t=>{
 const {call}=await fixture(t,{trustedProxyHops:1});
 assert.equal((await call('/api/auth/login',{method:'POST',data:{phone:'0799887701',password:'x'}})).status,403);
 for(let i=0;i<31;i++){
  const result=await call('/api/auth/login',{method:'POST',headers:{'X-Forwarded-For':`192.0.2.${i+1}, 203.0.113.9`},data:{phone:'079900'+String(i).padStart(4,'0'),password:'x'.repeat(129)}});
  assert.equal(result.status,i===30?429:401);
 }
});
