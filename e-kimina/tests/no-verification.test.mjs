import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../backend/server.mjs';
test('accounts create and open groups without phone verification by default',async t=>{
const origin='http://127.0.0.1:4189',app=createApp({database:':memory:',origin});await new Promise(r=>app.server.listen(4189,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>app.server.close(r));app.store.close();});let cookie='',csrf='';
async function call(path,method='GET',data){const res=await fetch(origin+path,{method,headers:{Origin:origin,Cookie:cookie,'X-CSRF-Token':csrf,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];const body=await res.json();if(body.csrf)csrf=body.csrf;return {status:res.status,body};}
let r=await call('/api/auth/register','POST',{name:'No verification test',phone:'0799881122',password:'Local-no-sms-test-password!',language:'en'});assert.equal(r.status,201);assert.equal(r.body.user.verified,false);
r=await call('/api/groups','POST',{name:'Direct access',contribution:10000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'flat'});assert.equal(r.status,201);assert.equal((await call('/api/groups/'+r.body.id)).status,200);assert.equal((await call('/api/auth/phone/request','POST',{})).status,404);assert.equal((await call('/api/auth/phone/confirm','POST',{code:'123456'})).status,404);assert.equal(app.store.db.prepare('SELECT count(*) n FROM phone_challenges').get().n,0);
await call('/api/auth/logout','POST',{});r=await call('/api/auth/login','POST',{phone:'0799881122',password:'Local-no-sms-test-password!'});assert.equal(r.status,200);assert.equal(r.body.groups.length,1);
});
