export function normalizeOrigin(value){const url=new URL(value);if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('invalidServer');if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)))throw Error('invalidServer');return url.origin;}
export class Api {
 constructor(origin,{fetcher=globalThis.fetch}={}){this.origin=normalizeOrigin(origin);this.fetcher=fetcher;this.csrf='';}
 async call(path,method='GET',data,key){if(!path.startsWith('/api/'))throw Error('invalidPath');let response;try{response=await this.fetcher(this.origin+path,{method,credentials:'include',headers:{Origin:this.origin,...(data?{'Content-Type':'application/json'}:{}),...(this.csrf?{'X-CSRF-Token':this.csrf}:{}),...(key?{'Idempotency-Key':key}:{})},...(data?{body:JSON.stringify(data)}:{})});}catch{throw Error('connectionError');}let result;try{result=await response.json();}catch{throw Error('connectionError');}if(!response.ok){if(response.status===401)this.csrf='';throw Error(result.error||'serverError');}if(result.csrf)this.csrf=result.csrf;return result;}
 async uploadReceipt(group,file,bytes,key){let res;try{res=await this.fetcher(this.origin+'/api/groups/'+encodeURIComponent(group)+'/receipts',{method:'POST',credentials:'include',headers:{Origin:this.origin,'X-CSRF-Token':this.csrf,'X-File-Name':encodeURIComponent(file.name),'Content-Type':file.mime,'Idempotency-Key':key},body:bytes});}catch{throw Error('connectionError');}let result;try{result=await res.json();}catch{throw Error('connectionError');}if(!res.ok)throw Error(result.error||'serverError');return result;}
 async receipt(group,id){let res;try{res=await this.fetcher(this.origin+'/api/groups/'+encodeURIComponent(group)+'/receipts/'+encodeURIComponent(id),{credentials:'include',headers:{Origin:this.origin}});}catch{throw Error('connectionError');}if(!res.ok){let result;try{result=await res.json();}catch{}throw Error(result?.error||'serverError');}return {mime:res.headers.get('content-type'),bytes:new Uint8Array(await res.arrayBuffer())};}
 session(){return this.call('/api/session');}
 login(phone,password){return this.call('/api/auth/login','POST',{phone,password});}
 register(name,phone,password,language){return this.call('/api/auth/register','POST',{name,phone,password,language});}
 async logout(){await this.call('/api/auth/logout','POST',{});this.csrf='';}
 group(id){return this.call('/api/groups/'+encodeURIComponent(id));}
 command(id,command,data,key){return this.call('/api/groups/'+encodeURIComponent(id)+'/commands','POST',{command,data},key);}
 createGroup(data){return this.call('/api/groups','POST',data);}
 invite(id,data){return this.call('/api/groups/'+encodeURIComponent(id)+'/invitations','POST',data);}
 join(token){return this.call('/api/groups/join','POST',{token});}
}
export function savings(state,id){return state.ledger.filter(e=>e.member===id).reduce((sum,e)=>{const kind=e.kind==='reversal'?e.originalKind:e.kind;return sum+(e.kind==='reversal'?-1:1)*e.amount*(kind==='contribution'?1:kind==='withdrawal'?-1:0);},0);}

export function sessionWithGroup(session,group){if(!session)return session;const membership=group.members.find(m=>m.id===session.user.id);if(!membership)return session;return {...session,groups:session.groups.map(entry=>entry.id===group.id?{...entry,name:group.settings.name,role:membership.role}:entry)};}
