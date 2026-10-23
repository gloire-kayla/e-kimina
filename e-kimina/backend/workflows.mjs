import {audit,loanTotals,totals,today} from '../dist/domain.mjs';
import {savings} from './settlement.mjs';
import {addMonths} from '../dist/tracking.mjs';

export function planFields(data){
 const enabled=data.trackContributions??false,day=data.dueDay??31,start=data.trackingStart||today().slice(0,7);
 if(typeof enabled!=='boolean'||!Number.isInteger(day)||day<1||day>31||!/^\d{4}-(0[1-9]|1[0-2])$/.test(start))throw Error('invalidTracking');
 return {trackContributions:enabled,dueDay:day,trackingStart:start};
}
export function applyPlan(s,previous,asOf){
 const cfg=s.settings,plans=s.contributionPlans||=[],month=asOf.slice(0,7);
 if(!plans.length&&!cfg.trackContributions){s.contributionPlans=[];return;}
 if(plans.length&&previous&&cfg.trackContributions===previous.trackContributions&&cfg.contribution===previous.contribution&&cfg.dueDay===previous.dueDay)return;
 let period=cfg.trackingStart;
 if(!plans.length){if(period<month||period>addMonths(month,12))throw Error('invalidTracking');}
 else {period=addMonths(month,1);const first=plans.reduce((n,r)=>r.period<n?r.period:n,plans[0].period);if(period<first)period=first;}
 cfg.trackingStart=period;plans.push({period,amount:cfg.contribution,dueDay:cfg.dueDay,enabled:cfg.trackContributions});s.contributionPlans=plans;
}
export function reverseEntry(store,s,actor,role,data){
 if(role!=='chairperson')throw Object.assign(Error('forbidden'),{status:403});
 const reason=typeof data.reason==='string'?data.reason.trim():'';
 if(reason.length<5||reason.length>300)throw Error('reasonRequired');
 const e=s.ledger.find(e=>e.id===data.id);if(!e||!['contribution','repayment','disbursement','expense'].includes(e.kind))throw Error('invalidReversal');
 if(s.ledger.some(r=>r.reverses===e.id))throw Object.assign(Error('alreadyReversed'),{status:409});
 let lines;
 if(e.kind==='contribution'||e.kind==='repayment'){
  const p=s.payments.find(p=>p.id===e.payment);if(!p||p.status!=='approved'||p.reversedAt)throw Error('invalidReversal');
  if(e.kind==='contribution'&&savings(s,e.member)<e.amount)throw Error('insufficient');
  if(e.kind==='contribution')lines=[{account:'member_savings',member:e.member,debit:e.amount,credit:0},{account:'cash',debit:0,credit:e.amount}];
  else {const l=s.loans.find(l=>l.id===e.loan);if(!l||(l.paid||0)<e.amount)throw Error('invalidReversal');const before=loanTotals(l).principalPaid;l.paid-=e.amount;if(l.status==='repaid')l.status='active';const principal=before-loanTotals(l).principalPaid;lines=[{account:'cash',debit:0,credit:e.amount}];if(principal)lines.push({account:'loan_principal',member:e.member,debit:principal,credit:0});if(e.amount-principal)lines.push({account:'interest_income',member:e.member,debit:e.amount-principal,credit:0});}
  p.reversedAt=new Date(store.now()).toISOString();p.reversalReason=reason;
 }else if(e.kind==='expense'){const expense=s.expenses?.find(x=>x.id===e.expense);if(!expense||expense.status!=='paid')throw Error('invalidReversal');expense.status='reversed';expense.reversalReason=reason;lines=[{account:'cash',debit:e.amount,credit:0},{account:'group_expense',debit:0,credit:e.amount}];}else{
  const l=s.loans.find(l=>l.id===e.loan);if(!l||l.status!=='active'||l.paid)throw Error('invalidReversal');l.status='approved';l.disbursedAt=null;
  lines=[{account:'cash',debit:e.amount,credit:0},{account:'loan_principal',member:e.member,debit:0,credit:e.amount}];
 }
 const id=crypto.randomUUID();store.post(s.id||data.groupId,'reversal:'+id,lines);
 s.ledger.unshift({id,date:store.currentDate(),kind:'reversal',originalKind:e.kind,reverses:e.id,amount:e.amount,member:e.member,payment:e.payment||null,loan:e.loan||null,detail:reason,actor});
 audit(s,actor,'reversed',e.id+' · '+reason);
}
export function recordReconciliation(store,s,actor,role,data){
 if(role!=='treasurer')throw Object.assign(Error('forbidden'),{status:403});
 const observed={cash:data.cash,momo:data.momo,bank:data.bank};if(!Object.values(observed).every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000000000))throw Error('invalidAmount');
 const actual=observed.cash+observed.momo+observed.bank,recorded=totals(s).cash,note=typeof data.note==='string'?data.note.trim():'';
 if(note.length>300||(actual!==recorded&&note.length<5))throw Error('reasonRequired');
 const record={id:crypto.randomUUID(),date:store.currentDate(),createdAt:new Date(store.now()).toISOString(),actor,observed,actual,recorded,difference:actual-recorded,note};
 s.reconciliations||=[];s.reconciliations.unshift(record);audit(s,actor,'reconciled',String(record.difference));
}
