import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Api,normalizeOrigin,savings} from '../src/api.mjs';
import {languages,t,labelKeys} from '../src/i18n.mjs';
import {createApp} from '../../e-kimina/backend/server.mjs';
test('server addresses require HTTPS or loopback HTTP and reject embedded credentials',()=>{assert.equal(normalizeOrigin('http://127.0.0.1:4173'),'http://127.0.0.1:4173');for(const value of ['http://192.168.1.1','https://name:secret@example.com','https://example.com/path','https://example.com?token=a'])assert.throws(()=>normalizeOrigin(value));});
test('all mobile labels exist in Kinyarwanda, English and French',()=>{for(const lang of languages)for(const key of labelKeys)assert.notEqual(t(lang,key),key);});
test('mobile savings include withdrawals and corrections',()=>{assert.equal(savings({ledger:[{kind:'contribution',member:'m',amount:10000},{kind:'withdrawal',member:'m',amount:3000},{kind:'reversal',originalKind:'contribution',member:'m',amount:1000},{kind:'contribution',member:'other',amount:9000}]},'m'),6000);});
test('mobile client shares real website sessions, CSRF, groups and logout without verification',async context=>{
const origin='http://127.0.0.1:4192',app=createApp({database:':memory:',origin});await new Promise(resolve=>app.server.listen(4192,'127.0.0.1',resolve));context.after(async()=>{await new Promise(resolve=>app.server.close(resolve));app.store.close();});let cookie='';const requests=[];
const fetcher=async(url,options)=>{requests.push(options);const response=await fetch(url,{...options,headers:{...options.headers,...(cookie?{Cookie:cookie}:{})}});if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return response;};
const api=new Api(origin,{fetcher});await assert.rejects(api.session(),/unauthorized/);const r=await api.register('Mobile Test','0799119988','Mobile-client-test-password!','rw');assert.equal(r.user.verified,false);assert.ok(api.csrf);let session=await api.session();assert.equal(session.groups.length,0);
const group=await api.createGroup({name:'Shared mobile group',contribution:10000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'flat'});assert.equal((await api.group(group.id)).settings.name,'Shared mobile group');const reducing=await api.createGroup({name:'Reducing mobile group',contribution:2000,goal:200000,rate:1.5,term:6,frequency:'monthly',interestMethod:'reducing'});const state=await api.group(reducing.id);assert.equal(state.settings.interestMethod,'reducing');assert.equal(state.members.find(m=>m.id===session.user.id).role,'chairperson');assert.equal(app.store.db.prepare('SELECT count(*) n FROM phone_challenges').get().n,0);
assert.ok(requests.every(options=>options.credentials==='include'&&options.headers.Origin===origin));assert.equal(requests.at(-2).headers['X-CSRF-Token'],api.csrf);await api.logout();assert.equal(api.csrf,'');await assert.rejects(api.session(),/unauthorized/);await api.login('0799119988','Mobile-client-test-password!');session=await api.session();assert.equal(session.groups[0].id,group.id);
});

