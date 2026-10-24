import {groupData} from './groups.mjs';
import {restoreOutbox,localDate} from './payments.mjs';
export const operationCommands=['expense.request','expense.review','expense.pay','withdrawal.request','withdrawal.review','withdrawal.cancel','withdrawal.pay','settings.update','announcement.publish','ledger.reverse','reconciliation.record'];
export const editableOperationErrors=['invalidInput','invalidAmount','reasonRequired','forbidden','membershipRestricted','alreadyReviewed','insufficient','invalidTracking','invalidSettings','invalidReversal','alreadyReversed','unsettledMembership','duplicate','notFound'];
const field=(key,label,type='text',extra={})=>({key,label,type,...extra});
export function access(group,user){const me=group.members.find(m=>m.id===user.id);return {me,active:me?.status==='active',leader:['chairperson','treasurer','secretary'].includes(me?.role),chair:me?.role==='chairperson',treasurer:me?.role==='treasurer'};}
export function canOperate(command,group,user){const a=access(group,user);if(!a.me||a.me.status==='exited')return false;if(command==='withdrawal.request')return true;if(!a.active)return false;if(command==='expense.request')return a.leader;if(['expense.review','withdrawal.review','withdrawal.cancel','settings.update','ledger.reverse'].includes(command))return a.chair;if(['expense.pay','withdrawal.pay','reconciliation.record'].includes(command))return a.treasurer;if(command==='announcement.publish')return a.chair||a.me.role==='secretary';return false;}
export function operationForm(command,group,user,target){
 if(!canOperate(command,group,user))throw Error('forbidden');
 const amount=field('amount','amount','integer',{min:1,max:1e9}),reason=field('reason','membershipReason','text',{minLength:5,maxLength:300}),reference=field('reference','disbursementReference','text',{minLength:1,maxLength:100});
 let fields=[],initial={},confirm=null;
 if(command==='expense.request')fields=[amount,field('description','expenseDescription','text',{minLength:5,maxLength:300}),field('payee','payee','text',{minLength:1,maxLength:100})];
 if(command==='withdrawal.request')fields=[amount,reason];
 if(command.endsWith('.review')){fields=[field('decision','decision','choice',{choices:['approved','rejected']}),field('reason','reason','text',{maxLength:300})];initial.decision='approved';}
 if(command.endsWith('.pay')){fields=[reference];confirm='confirmExternalSent';}
 if(command==='withdrawal.cancel'){fields=[reason];confirm='confirmMembershipAction';}
 if(command==='ledger.reverse'){fields=[reason];confirm='confirmCorrection';}
 if(command==='announcement.publish')fields=[field('title','announcementTitle','text',{minLength:1,maxLength:80}),field('message','announcementMessage','multiline',{minLength:1,maxLength:1000})];
 if(command==='reconciliation.record'){fields=['cash','momo','bank'].map(key=>field(key,key,'integer',{min:0,max:1e12})).concat(field('note','reconciliationNote','multiline',{maxLength:300}));initial={cash:'0',momo:'0',bank:'0',note:''};confirm='confirmCount';}
 if(command==='settings.update'){
  fields=[field('name','groupName','text',{minLength:1,maxLength:80}),field('contribution','groupContribution','integer',{min:1,max:1e9}),field('goal','groupGoal','integer',{min:1,max:1e9}),field('rate','groupRate','decimal'),field('term','groupTerm','integer',{min:1,max:60}),field('interestMethod','groupInterestMethod','choice',{choices:['flat','reducing']}),field('trackContributions','trackContributions','boolean'),field('dueDay','dueDay','integer',{min:1,max:31}),field('trackingStart','trackingStart','month')];initial={...group.settings,trackingStart:group.settings.trackingStart||localDate().slice(0,7)};confirm='confirmSettings';
 }
 if(!fields.length)throw Error('invalidInput');
 if(!['expense.request','withdrawal.request','settings.update','announcement.publish','reconciliation.record'].includes(command)&&!target?.id)throw Error('notFound');
 return {command,fields,initial:Object.fromEntries(fields.map(f=>[f.key,initial[f.key]??(f.type==='boolean'?false:'')])),confirm,targetId:target?.id||null,targetSummary:target?[target.amount?target.amount+' RWF':'',target.description||target.reason||target.detail||'',group.members.find(m=>m.id===target.member)?.name||''].filter(Boolean).join(' · '):''};
}
export function operationData(form,values,confirmed,group,user){
 if(!canOperate(form.command,group,user))throw Error('forbidden');if(form.confirm&&!confirmed)throw Error('confirmationRequired');const data={};
 for(const f of form.fields){let value=values[f.key];if(f.type==='boolean'){if(typeof value!=='boolean')throw Error('invalidInput');}else if(f.type==='integer'){if(!/^\d+$/.test(String(value)))throw Error('invalidAmount');value=Number(value);if(!Number.isSafeInteger(value)||value<f.min||value>f.max)throw Error('invalidAmount');}else if(f.type==='choice'){if(!f.choices.includes(value))throw Error('invalidInput');}else {value=String(value??'').trim();if(value.length<(f.minLength||0)||value.length>(f.maxLength||1000))throw Error('invalidInput');if(f.type==='month'&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))throw Error('invalidTracking');}data[f.key]=value;}
 if(form.targetId)data.id=form.targetId;
 if(form.command.endsWith('.review')&&data.decision==='rejected'&&data.reason.length<5)throw Error('reasonRequired');
 if(form.command==='settings.update'){Object.assign(data,groupData({...data,contribution:String(data.contribution),goal:String(data.goal),rate:String(data.rate),term:String(data.term)}));}
 if(form.command==='reconciliation.record'&&data.cash+data.momo+data.bank!==group.groupTotals.cash&&data.note.length<5)throw Error('reasonRequired');
 return data;
}
export function restoreOperation(raw,user,group){const saved=restoreOutbox(raw,user,group);if(saved&&!operationCommands.includes(saved.command))throw Error('invalidDraft');return saved;}
export async function sendOperation({api,group,saved,persist}){await persist(saved);return api.command(group,saved.command,saved.data,saved.key);}
export function csvCell(value){let text=String(value??'');if(/^(?:\s*[=+@\-]|[\t\r\n])/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
export function reportRows(kind,group,user,journal=[]){
 const a=access(group,user),own=rows=>(rows||[]).filter(r=>a.leader||r.member===user.id),name=id=>group.members.find(m=>m.id===id)?.name||'';
 if(kind==='ledger')return [['date','member','kind','amount_RWF','reference','record_id','reverses','original_kind','cash_change_RWF'],...own(group.ledger).map(e=>[e.date,name(e.member),e.kind,e.amount,e.detail,e.id,e.reverses,e.originalKind||e.kind,(e.kind==='reversal'?-1:1)*e.amount*(['contribution','repayment','opening'].includes(e.originalKind||e.kind)?1:-1)])];
 if(kind==='payments')return [['date','member','purpose','amount_RWF','status','reference','reversed_at'],...own(group.payments).map(p=>[p.date,name(p.member),p.purpose,p.amount,p.status,p.reference,p.reversedAt])];
 if(kind==='loans')return [['member','purpose','principal_RWF','paid_RWF','status','rate_percent','interest_method','months','disbursed_at'],...own(group.loans).map(l=>[name(l.member),l.purpose,l.amount,l.paid||0,l.status,l.rate,l.interestMethod||'flat',l.term,l.disbursedAt])];
 if(kind==='dues')return [['member','period_or_installment','due_date','expected_RWF','paid_RWF','remaining_RWF','status'],...own([...(group.tracking?.contributions||[]),...(group.tracking?.installments||[])]).map(r=>[name(r.member),r.period||r.installment,r.date,r.expected,r.paid,r.remaining,r.status])];
 if(kind==='withdrawals')return [['date','member','amount_RWF','status','reason','reference'],...own(group.withdrawals).map(r=>[r.date,name(r.member),r.amount,r.status,r.reason,r.reference])];
 if(kind==='audit')return [['timestamp','actor','event','detail'],...(group.audit||[]).filter(e=>a.leader||e.actor===user.id).map(e=>[e.at||e.timestamp||e.date,name(e.actor),e.action,e.detail])];
 if(!a.leader)throw Error('forbidden');
 if(kind==='members')return [['name','phone','role','status','joined_at','exited_at'],...group.members.map(m=>[m.name,m.phone,m.role,m.status,m.joinedAt?new Date(m.joinedAt).toISOString():'',m.exitedAt])];
 if(kind==='expenses')return [['date','description','payee','amount_RWF','status','reference'],...(group.expenses||[]).map(e=>[e.date,e.description,e.payee,e.amount,e.status,e.reference])];
 if(kind==='reconciliations')return [['date','cash_RWF','momo_RWF','bank_RWF','recorded_RWF','actual_RWF','difference_RWF','note'],...(group.reconciliations||[]).map(r=>[r.date,r.observed.cash,r.observed.momo,r.observed.bank,r.recorded,r.actual,r.difference,r.note])];
 if(kind==='journal')return [['source','date','account','member','debit_RWF','credit_RWF'],...journal.map(e=>[e.source,new Date(e.created_at).toISOString(),e.account,name(e.member_id),e.debit,e.credit])];
 throw Error('invalidInput');
}
export function reportCsv(rows){return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');}
