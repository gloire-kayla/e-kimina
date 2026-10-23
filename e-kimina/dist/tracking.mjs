
import {loanSchedule,today} from './domain.mjs';
export function dateAt(ms){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Kigali',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));}
export function addMonths(period,n){const d=new Date(period+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,7);}
export function dueDate(period,day){const [y,m]=period.split('-').map(Number);const last=new Date(Date.UTC(y,m,0)).getUTCDate();return period+'-'+String(Math.min(day,last)).padStart(2,'0');}
export function contributionDues(s,asOf=today()){
 const rules=s.contributionPlans||[];if(!rules.length)return [];
 const rows=[],end=asOf.slice(0,7),start=rules.reduce((a,r)=>r.period<a?r.period:a,rules[0].period);
 const payments=new Map();for(const p of s.payments)if(p.purpose==='contribution'&&p.status==='approved'&&!p.reversedAt)payments.set(p.member+':'+p.period,(payments.get(p.member+':'+p.period)||0)+p.amount);
 for(let period=start,guard=0;period<=end&&guard<1200;period=addMonths(period,1),guard++){
  const rule=rules.filter(r=>r.period<=period).at(-1);if(!rule?.enabled)continue;
  for(const m of s.members){const joined=m.joinedAt?dateAt(m.joinedAt):start+'-01';const deadline=dueDate(period,rule.dueDay);if(joined>deadline||(m.exitedAt&&period>m.exitedAt.slice(0,7)))continue;
   const paid=payments.get(m.id+':'+period)||0,remaining=Math.max(0,rule.amount-paid);
   rows.push({id:m.id+':'+period,member:m.id,period,date:deadline,expected:rule.amount,paid,remaining,credit:Math.max(0,paid-rule.amount),status:!remaining?'paid':deadline<asOf?'overdue':paid?'partial':deadline===asOf?'due':'upcoming'});
  }
 }
 return rows;
}
export function loanDues(s,asOf=today()){return s.loans.filter(l=>['active','repaid'].includes(l.status)).flatMap(l=>loanSchedule(l).map(e=>({id:l.id+':'+e.number,loan:l.id,member:l.member,installment:e.number,date:e.dueDate,expected:e.total,paid:e.total-e.outstanding,remaining:e.outstanding,status:!e.outstanding?'paid':e.dueDate<asOf?'overdue':e.outstanding<e.total?'partial':e.dueDate===asOf?'due':'upcoming'})));}
export function tracking(s,actor,asOf=today()){const leader=s.members.find(m=>m.id===actor)?.role!=='member',contributions=contributionDues(s,asOf).filter(r=>leader||r.member===actor),installments=loanDues(s,asOf).filter(r=>leader||r.member===actor);return {asOf,enabled:!!s.contributionPlans?.length,contributions,installments,overdueContributions:contributions.filter(r=>r.status==='overdue').reduce((n,r)=>n+r.remaining,0),overdueLoans:installments.filter(r=>r.status==='overdue').reduce((n,r)=>n+r.remaining,0)};}
export function notices(s,actor,asOf=today()){
 const me=s.members.find(m=>m.id===actor),items=[];
 for(const p of s.payments){if(p.member===actor&&p.reviewedAt)items.push({id:'payment:'+p.id+':'+p.status,type:'paymentStatus',status:p.status,amount:p.amount,date:p.reviewedAt.slice(0,10)});if(p.member===actor&&p.reversedAt)items.push({id:'reversed:'+p.id,type:'paymentReversed',amount:p.amount,date:p.reversedAt.slice(0,10)});if(me?.role==='treasurer'&&p.status==='pending')items.push({id:'review:'+p.id,type:'reviewPayment',amount:p.amount,date:p.date});}
 for(const l of s.loans){if(l.member===actor&&l.reviewedAt)items.push({id:'loan:'+l.id+':'+l.reviewedAt,type:'loanStatus',status:l.status,amount:l.amount,date:l.reviewedAt.slice(0,10)});if(me?.role==='chairperson'&&l.status==='submitted')items.push({id:'loanReview:'+l.id,type:'reviewLoan',amount:l.amount,date:l.createdAt?.slice(0,10)||asOf});if(l.member===actor&&l.disbursedAt&&l.status==='active')items.push({id:'disbursed:'+l.id+':'+l.disbursedAt,type:'loanDisbursed',amount:l.amount,date:l.disbursedAt});}
 for(const r of [...contributionDues(s,asOf),...loanDues(s,asOf)].filter(r=>r.member===actor&&['overdue','due'].includes(r.status)))items.push({id:'due:'+r.id,type:r.loan?'loanDue':'contributionDue',amount:r.remaining,date:r.date,status:r.status});
 for(const a of s.announcements||[])items.push({id:'announcement:'+a.id,type:'announcement',title:a.title,message:a.message,date:a.createdAt.slice(0,10)});
 return items.sort((a,b)=>b.date.localeCompare(a.date));
}
