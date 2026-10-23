let sequence=0;
export function requestKey(){return 'mobile-'+Date.now().toString(36)+'-'+(++sequence).toString(36)+'-'+Math.random().toString(36).slice(2,14);}
export function localDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Kigali',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function paymentData(form,group,userId,asOf=localDate()){
 if(!/^\d+$/.test(form.amount)||!Number.isSafeInteger(Number(form.amount))||Number(form.amount)<1||Number(form.amount)>1000000000)throw Error('invalidAmount');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(form.date)||Number.isNaN(Date.parse(form.date))||new Date(form.date).toISOString().slice(0,10)!==form.date||form.date>asOf)throw Error('invalidDate');
 if(!['cash','momo','bank'].includes(form.method)||!['contribution','repayment'].includes(form.purpose))throw Error('invalidInput');
 if(typeof form.reference!=='string'||form.reference.trim().length>100)throw Error('invalidInput');
 const data={amount:Number(form.amount),date:form.date,method:form.method,purpose:form.purpose,reference:form.reference.trim()};
 if(form.purpose==='contribution'){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(form.period))throw Error('invalidDate');data.period=form.period;}else{const loan=group.loans.find(l=>l.id===form.loan&&l.member===userId&&l.status==='active');if(!loan)throw Error('invalidLoan');data.loan=loan.id;}
 return data;
}
export function outboxKey(userId,groupId){return 'ekimina-payment-'+userId+'-'+groupId;}
export function restoreOutbox(raw,userId,groupId){if(!raw)return null;const saved=JSON.parse(raw);if(saved.owner!==userId||saved.group!==groupId||typeof saved.key!=='string'||!/^[\w-]{16,100}$/.test(saved.key)||!saved.data||typeof saved.data!=='object')throw Error('invalidDraft');return saved;}
