import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../backend/store.mjs';
import '../dist/expense-i18n.mjs';
import {translations} from '../dist/i18n.mjs';
test('expenses require approval, confirmed external payment and balanced correction',()=>{
const store=new Store(':memory:');try{
for(const [i,id] of ['chair','treasurer','member'].entries())store.db.prepare('INSERT INTO users(id,name,phone,password_hash,language,created_at) VALUES(?,?,?,?,?,?)').run(id,id,'079922000'+i,'test','en',Date.now());
const group=store.createGroup('chair',{name:'Expense test',contribution:10000,goal:100000,rate:2,term:3,frequency:'monthly',interestMethod:'flat'});
for(const [i,role] of [[1,'treasurer'],[2,'member']]){const invite=store.invite('chair',group,{phone:'079922000'+i,role});store.join(role,invite.token);}
const call=(actor,command,data,key=crypto.randomUUID())=>store.command(group,actor,key,command,data);
const request={amount:1000,description:'Meeting stationery',payee:'Test supplier'};
assert.throws(()=>call('member','expense.request',request),/forbidden/);
assert.throws(()=>call('chair','expense.request',{...request,amount:-1}));
call('treasurer','expense.request',request);let e=store.view(group,'chair').expenses[0];
assert.equal(store.view(group,'member').expenses.length,0);
assert.throws(()=>call('treasurer','expense.review',{id:e.id,decision:'approved'}),/forbidden/);
assert.throws(()=>call('treasurer','expense.pay',{id:e.id,reference:'TEST-EXPENSE'}),/alreadyReviewed/);
call('chair','expense.review',{id:e.id,decision:'approved'});assert.equal(store.view(group,'chair').groupTotals.cash,0);
assert.throws(()=>call('treasurer','expense.pay',{id:e.id,reference:'TEST-EXPENSE'}),/insufficient/);
call('member','payment.submit',{amount:10000,date:'2026-10-21',period:'2026-10',method:'cash',purpose:'contribution',reference:'FUNDING'});const payment=store.view(group,'chair').payments[0];call('treasurer','payment.review',{id:payment.id,decision:'approved'});
assert.throws(()=>call('chair','expense.pay',{id:e.id,reference:'TEST-EXPENSE'}),/forbidden/);
const key=crypto.randomUUID(),paid={id:e.id,reference:'TEST-EXPENSE'};call('treasurer','expense.pay',paid,key);assert.equal(call('treasurer','expense.pay',paid,key).replayed,true);assert.throws(()=>call('treasurer','expense.pay',paid),/alreadyReviewed/);
let state=store.view(group,'chair');assert.equal(state.groupTotals.cash,9000);assert.equal(state.groupTotals.savings,10000);assert.equal(state.groupTotals.expenses,1000);
const entry=state.ledger.find(x=>x.kind==='expense');call('chair','ledger.reverse',{id:entry.id,reason:'Wrong expense record corrected'});state=store.view(group,'chair');assert.equal(state.groupTotals.cash,10000);assert.equal(state.groupTotals.expenses,0);assert.equal(state.expenses[0].status,'reversed');assert.throws(()=>call('chair','ledger.reverse',{id:entry.id,reason:'Duplicate correction'}),/alreadyReversed/);
call('treasurer','expense.request',request);e=store.view(group,'chair').expenses[0];assert.throws(()=>call('chair','expense.review',{id:e.id,decision:'rejected'}),/reasonRequired/);call('chair','expense.review',{id:e.id,decision:'rejected',reason:'Not a group expense'});assert.throws(()=>call('treasurer','expense.pay',{id:e.id,reference:'TEST-REJECTED'}),/alreadyReviewed/);
for(const row of store.db.prepare('SELECT SUM(l.debit-l.credit) AS balance FROM journal j JOIN journal_lines l ON j.id=l.journal_id GROUP BY j.id').all())assert.equal(row.balance,0);
for(const language of ['rw','fr'])assert.deepEqual(Object.keys(translations[language]).sort(),Object.keys(translations.en).sort());
}finally{store.close();}
});
