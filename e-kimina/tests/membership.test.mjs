import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../backend/store.mjs';
import '../dist/membership-i18n.mjs';
import '../dist/account-i18n.mjs';
import '../dist/security-i18n.mjs';
import '../dist/workflow-i18n.mjs';
import {translations} from '../dist/i18n.mjs';
test('membership changes preserve history and enforce current authority',()=>{
const store=new Store(':memory:');try{
for(const [i,id] of ['chair','member','outsider'].entries())store.db.prepare('INSERT INTO users(id,name,phone,password_hash,language,created_at) VALUES(?,?,?,?,?,?)').run(id,id,'079933000'+i,'test','en',Date.now());
const group=store.createGroup('chair',{name:'Membership test',contribution:10000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'flat'});
const invitation=store.invite('chair',group,{phone:'0799330001',role:'member'});store.join('member',invitation.token);
const call=(actor,command,data,key=crypto.randomUUID())=>store.command(group,actor,key,command,data);
assert.throws(()=>call('member','member.role',{id:'chair',role:'treasurer',reason:'Forged change'}),/forbidden/);
assert.throws(()=>call('outsider','chair.transfer',{id:'member',reason:'Forged transfer',confirm:true}),/forbidden/);
assert.throws(()=>call('chair','member.role',{id:'chair',role:'member',reason:'Self demotion'}),/invalidInput/);
assert.throws(()=>call('chair','member.role',{id:'member',role:'chairperson',reason:'Invalid promotion'}),/invalidInput/);
call('member','payment.submit',{amount:10000,date:'2026-10-21',period:'2026-10',method:'cash',purpose:'contribution',reference:'ROLE-TEST'});
const before=store.view(group,'chair').payments;
const key=crypto.randomUUID(),change={id:'member',role:'treasurer',reason:'Elected treasurer'};
call('chair','member.role',change,key);assert.equal(store.load(group,'member').role,'treasurer');assert.equal(call('chair','member.role',change,key).replayed,true);
const payment=before[0];call('member','payment.review',{id:payment.id,decision:'approved'});assert.equal(store.view(group,'chair').groupTotals.savings,10000);
call('chair','member.role',{...change,role:'member',reason:'End of treasury term'});
assert.throws(()=>call('member','payment.review',{id:payment.id,decision:'approved'}),/forbidden/);
const invite=store.invite('chair',group,{phone:'0799330002',role:'secretary'});const row=store.view(group,'chair').invitations[0];assert.equal(store.view(group,'member').invitations.length,0);
call('chair','invitation.revoke',{id:row.id});assert.throws(()=>store.join('outsider',invite.token),/invalidInvite/);
assert.throws(()=>call('chair','chair.transfer',{id:'member',reason:'Elected new chair'}),/invalidInput/);
call('chair','chair.transfer',{id:'member',reason:'Elected new chair',confirm:true});assert.equal(store.load(group,'chair').role,'member');assert.equal(store.load(group,'member').role,'chairperson');assert.equal(store.load(group,'member').state.members.filter(m=>m.role==='chairperson').length,1);
assert.throws(()=>call('chair','member.role',{...change,role:'secretary'}),/forbidden/);
assert.equal(store.view(group,'member').groupTotals.savings,10000);assert.equal(store.view(group,'member').payments[0].id,payment.id);assert.ok(store.view(group,'member').audit.some(e=>e.action==='chairTransferred'));
}finally{store.close();}
});
test('membership labels cover all languages',()=>{for(const language of ['rw','fr'])assert.deepEqual(Object.keys(translations[language]).sort(),Object.keys(translations.en).sort());});
