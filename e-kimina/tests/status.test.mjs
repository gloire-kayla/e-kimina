import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../backend/store.mjs';
import {contributionDues} from '../dist/tracking.mjs';
import '../dist/status-i18n.mjs';
import {translations} from '../dist/i18n.mjs';
test('suspension, reactivation and settled exit preserve membership and history',()=>{
const store=new Store(':memory:');try{
for(const [i,id] of ['chair','treasurer','member','empty'].entries())store.db.prepare('INSERT INTO users(id,name,phone,password_hash,language,created_at) VALUES(?,?,?,?,?,?)').run(id,id,'079911000'+i,'test','en',Date.now());
const group=store.createGroup('chair',{name:'Status test',contribution:10000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'flat'});
for(const [i,id,role] of [[1,'treasurer','treasurer'],[2,'member','member'],[3,'empty','member']]){const invite=store.invite('chair',group,{phone:'079911000'+i,role});store.join(id,invite.token);}
const call=(actor,command,data,key=crypto.randomUUID())=>store.command(group,actor,key,command,data);
const status=(id,value)=>({id,status:value,reason:'Group membership decision'});
assert.throws(()=>call('member','member.status',status('empty','suspended')),/forbidden/);
assert.throws(()=>call('chair','member.status',status('chair','suspended')),/invalidInput/);
assert.throws(()=>call('chair','member.status',status('treasurer','suspended')),/invalidInput/);
call('member','loan.request',{amount:1000,term:3,purpose:'Test loan purpose'});const loan=store.view(group,'chair').loans[0];
call('chair','member.status',status('member','suspended'));
assert.throws(()=>call('member','loan.request',{amount:1000,term:3,purpose:'Test loan purpose'}),/membershipRestricted/);
assert.throws(()=>call('chair','loan.review',{id:loan.id,decision:'approved'}),/membershipRestricted/);
assert.throws(()=>call('chair','member.role',{id:'member',role:'secretary',reason:'New leader assignment'}),/invalidInput/);
call('member','payment.submit',{amount:10000,date:'2026-10-21',period:'2026-10',method:'cash',purpose:'contribution',reference:'STATUS-FUNDING'});
assert.throws(()=>call('chair','member.status',status('member','exited')),/unsettledMembership/);
const payment=store.view(group,'chair').payments[0];call('treasurer','payment.review',{id:payment.id,decision:'approved'});
assert.throws(()=>call('chair','member.status',status('member','exited')),/unsettledMembership/);
call('chair','member.status',status('member','active'));call('member','loan.request',{amount:2000,term:3,purpose:'Reactivated member loan'});
const key=crypto.randomUUID();call('chair','member.status',status('empty','exited'),key);assert.equal(call('chair','member.status',status('empty','exited'),key).replayed,true);
assert.equal(store.view(group,'empty').members.find(m=>m.id==='empty').status,'exited');assert.throws(()=>call('empty','payment.submit',{}),/membershipRestricted/);assert.throws(()=>call('chair','member.status',status('empty','active')),/invalidInput/);
assert.equal(store.view(group,'chair').groupTotals.savings,10000);assert.equal(store.view(group,'chair').payments[0].id,payment.id);
assert.ok(store.view(group,'chair').audit.some(e=>e.action==='memberStatus'));
}finally{store.close();}
});
test('exit stops future months while suspension retains existing obligations',()=>{
const s={contributionPlans:[{period:'2026-01',enabled:true,amount:100,dueDay:15}],members:[{id:'ex',joinedAt:Date.parse('2026-01-01'),exitedAt:'2026-02-20',status:'exited'},{id:'su',joinedAt:Date.parse('2026-01-01'),status:'suspended'}],payments:[]};
const rows=contributionDues(s,'2026-03-20');assert.equal(rows.filter(r=>r.member==='ex').length,2);assert.equal(rows.filter(r=>r.member==='su').length,3);
for(const l of ['rw','fr'])assert.deepEqual(Object.keys(translations[l]).sort(),Object.keys(translations.en).sort());
});
