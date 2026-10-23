export function groupData(values){
 const name=values.name.trim(),contribution=Number(values.contribution),goal=Number(values.goal),rate=Number(values.rate.replace(',','.')),term=Number(values.term);
 if(!name||name.length>80||![contribution,goal].every(n=>Number.isSafeInteger(n)&&n>0&&n<=1e9)||!values.rate.trim()||!Number.isFinite(rate)||rate<0||rate>100||Math.abs(rate*100-Math.round(rate*100))>1e-8||!Number.isInteger(term)||term<1||term>60||!['flat','reducing'].includes(values.interestMethod))throw Error('invalidGroup');
 return {name,contribution,goal,rate,term,interestMethod:values.interestMethod,frequency:'monthly'};
}
