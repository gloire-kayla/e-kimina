import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../backend/store.mjs';
import '../dist/settlement-i18n.mjs';
test('savings settlement prevents overdrawing and enables settled exit',()=>{
const store=new Store(':memory:');try{
for(const [i,id] of ['chair','treasurer','member'].entries())store.db.prepare('INSERT INTO users(id,name,phone,password_hash,language,created_at) VALUES(?,?,?,?,?,?)').run(id,id,'079900000'+i,'test','en',Date.now());
const group=store.createGroup('chair',{name:'Settlement',contribution:10000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'flat'});
for(const [i,role] of [[1,'treasurer'],[2,'member']]){const inv=store.invite('chair',group,{phone:'079900000'+i,role});store.join(role,inv.token);}
const call=(actor,command,data,key=crypto.randomUUID())=>store.command(group,actor,key,command,data);
assert.throws(()=>call('member','withdrawal.request',{amount:1,reason:'No savings yet'}),/insufficient/);
call('member','payment.submit',{amount:10000,date:'2026-10-21',period:'2026-10',method:'cash',purpose:'contribution',reference:'SETTLE-FUND'});const pay=store.view(group,'chair').payments[0];call('treasurer','payment.review',{id:pay.id,decision:'approved'});
for(let i=0;i<2;i++)call('member','withdrawal.request',{amount:10000,reason:'End of membership settlement'});
let state=store.view(group,'chair');const [a,b]=state.withdrawals;assert.equal(store.view(group,'treasurer').withdrawals.length,2);
assert.throws(()=>call('treasurer','withdrawal.review',{id:a.id,decision:'approved'}),/forbidden/);
assert.throws(()=>call('treasurer','withdrawal.pay',{id:a.id,reference:'SETTLE-OUT'}),/alreadyReviewed/);
for(const w of [a,b])call('chair','withdrawal.review',{id:w.id,decision:'approved'});
assert.equal(store.view(group,'chair').groupTotals.cash,10000);
call('member','loan.request',{amount:1000,term:3,purpose:'Loan blocks settlement'});const loan=store.view(group,'chair').loans[0];assert.throws(()=>call('treasurer','withdrawal.pay',{id:a.id,reference:'BLOCKED-LOAN'}),/unsettledMembership/);call('chair','loan.review',{id:loan.id,decision:'rejected',reason:'Member chose settlement'});
const key=crypto.randomUUID(),data={id:a.id,reference:'SETTLE-OUT'};call('treasurer','withdrawal.pay',data,key);assert.equal(call('treasurer','withdrawal.pay',data,key).replayed,true);
assert.throws(()=>call('treasurer','withdrawal.pay',{id:b.id,reference:'SETTLE-OUT-2'}),/insufficient/);
state=store.view(group,'chair');assert.equal(state.groupTotals.savings,0);assert.equal(state.groupTotals.cash,0);assert.equal(state.groupTotals.withdrawals,10000);
assert.throws(()=>call('chair','ledger.reverse',{id:state.ledger.find(e=>e.kind==='contribution').id,reason:'Cannot reverse withdrawn savings'}),/insufficient/);
assert.throws(()=>call('chair','member.status',{id:'member',status:'exited',reason:'All savings returned'}),/unsettledMembership/);
// An approved but unpaid request must be resolvable without changing money.
call('chair','withdrawal.cancel',{id:b.id,reason:'Duplicate withdrawal request'});
call('chair','member.status',{id:'member',status:'exited',reason:'All savings returned'});assert.equal(store.view(group,'member').members.find(m=>m.id==='member').status,'exited');
for(const row of store.db.prepare('SELECT SUM(l.debit-l.credit) balance FROM journal j JOIN journal_lines l ON j.id=l.journal_id GROUP BY j.id').all())assert.equal(row.balance,0);
}finally{store.close();}
});
