import {restoreOutbox} from './payments.mjs';
export function loanRequest(form,settings){
 if(!/^\d+$/.test(form.amount)||!Number.isSafeInteger(Number(form.amount))||Number(form.amount)<1||Number(form.amount)>1e9)throw Error('invalidAmount');
 if(!/^\d+$/.test(form.term)||Number(form.term)<1||Number(form.term)>settings.term)throw Error('invalidTerm');
 const purpose=form.purpose.trim();if(purpose.length<1||purpose.length>300)throw Error('reasonRequired');
 return {amount:Number(form.amount),term:Number(form.term),purpose};
}
export function loanDecision(id,decision,reason){if(!['approved','rejected'].includes(decision))throw Error('invalidInput');if(decision==='rejected'&&reason.trim().length<5)throw Error('reasonRequired');return {id,decision,reason:reason.trim()};}
export function loanDisbursement(id,reference,confirmed){if(!confirmed)throw Error('confirmDisbursed');if(!reference.trim()||reference.trim().length>100)throw Error('referenceRequired');return {id,reference:reference.trim()};}

// Keep repayment calculations in parity with the website domain.
export function loanSchedule(l){
 const bps=Math.round(l.rate*100),round=(n)=>Number((BigInt(n)*BigInt(bps)+5000n)/10000n),part=Math.floor(l.amount/l.term),flatTotal=Number((BigInt(l.amount)*BigInt(bps)*BigInt(l.term)+5000n)/10000n);
 let remaining=l.amount,paid=l.paid||0;const schedule=[];
 for(let i=0;i<l.term;i++){const principal=i===l.term-1?remaining:part;const interest=l.interestMethod==='reducing'?round(remaining):(i===l.term-1?flatTotal-Math.floor(flatTotal/l.term)*(l.term-1):Math.floor(flatTotal/l.term));const interestPaid=Math.min(paid,interest);paid-=interestPaid;const principalPaid=Math.min(paid,principal);paid-=principalPaid;let dueDate=null;if(l.disbursedAt){const start=new Date(l.disbursedAt+'T12:00:00Z'),year=start.getUTCFullYear(),month=start.getUTCMonth()+i+1,day=start.getUTCDate(),last=new Date(Date.UTC(year,month+1,0)).getUTCDate();dueDate=new Date(Date.UTC(year,month,Math.min(day,last),12)).toISOString().slice(0,10);}schedule.push({number:i+1,dueDate,principal,interest,total:principal+interest,principalPaid,interestPaid,outstanding:principal+interest-principalPaid-interestPaid});remaining-=principal;}
 return schedule;
}
export function loanTotals(l){const schedule=loanSchedule(l),interest=schedule.reduce((n,e)=>n+e.interest,0),principalPaid=schedule.reduce((n,e)=>n+e.principalPaid,0),interestPaid=schedule.reduce((n,e)=>n+e.interestPaid,0);return {principal:l.amount,interest,total:l.amount+interest,outstanding:l.amount+interest-(l.paid||0),principalPaid,interestPaid,principalOutstanding:l.amount-principalPaid};}

export function restoreLoanAction(raw,user,group){const saved=restoreOutbox(raw,user,group);if(!saved)return null;const action=({'loan.request':'request','loan.review':'review','loan.disburse':'disburse'})[saved.command];if(!action||saved.selection?.action!==action||action!=='request'&&(typeof saved.selection?.loan?.id!=='string'||saved.data.id!==saved.selection.loan.id))throw Error('invalidDraft');return saved;}
