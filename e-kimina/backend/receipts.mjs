
import {createHash} from 'node:crypto';
import {fail,text} from './store.mjs';
const MAX=5*1024*1024;
export function validateReceipt(bytes,filename,declared){
 if(!Buffer.isBuffer(bytes))bytes=Buffer.from(bytes);
 if(!bytes.length||bytes.length>MAX)fail('receiptTooLarge',413);
 const name=text(filename,180).replace(/[\\/\x00-\x1f]/g,'_');let type,ext;
 if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){type='image/png';ext=/\.png$/i;}
 else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){type='image/jpeg';ext=/\.(jpg|jpeg)$/i;}
 else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){type='image/webp';ext=/\.webp$/i;}
 else if(/^%PDF-[0-9]\.[0-9]/.test(bytes.toString('ascii',0,8))){type='application/pdf';ext=/\.pdf$/i;}
 else fail('receiptType');
 if(!ext.test(name)||(declared&&declared!=='application/octet-stream'&&declared!==type))fail('receiptType');
 return {bytes,name,type,size:bytes.length,hash:createHash('sha256').update(name).update(type).update(bytes).digest('hex')};
}
export async function readReceipt(req){if(Number(req.headers['content-length'])>MAX)fail('receiptTooLarge',413);const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>MAX)fail('receiptTooLarge',413);chunks.push(chunk);}let name;try{name=decodeURIComponent(req.headers['x-file-name']||'');}catch{fail('receiptType');}return validateReceipt(Buffer.concat(chunks),name,req.headers['content-type']);}
export function uploadReceipt(store,groupId,userId,key,file){
 if(typeof key!=='string'||!/^[\w-]{16,100}$/.test(key))fail('idempotencyRequired');
 return store.transaction(()=>{
  const access=store.load(groupId,userId);if(access.state.members.find(m=>m.id===userId)?.status==='exited')fail('membershipRestricted',403);
  const prior=store.db.prepare('SELECT id,content_hash FROM receipts WHERE group_id=? AND owner_id=? AND upload_key=?').get(groupId,userId,key);if(prior){if(prior.content_hash!==file.hash)fail('idempotencyConflict',409);return {id:prior.id,name:file.name,size:file.size,replayed:true};}
  const hour=store.db.prepare('SELECT count(*) n FROM receipt_upload_events WHERE group_id=? AND user_id=? AND created_at>?').get(groupId,userId,Date.now()-3600000).n;
  const pending=store.db.prepare('SELECT count(*) n FROM receipts WHERE group_id=? AND owner_id=? AND payment_id IS NULL').get(groupId,userId).n;
  const size=store.db.prepare('SELECT coalesce(sum(size),0) n FROM receipts WHERE group_id=?').get(groupId).n;
  if(hour>=20||pending>=3||size+file.size>100*1024*1024)fail('receiptQuota',429);
  store.db.prepare('DELETE FROM receipt_upload_events WHERE created_at<?').run(Date.now()-86400000);store.db.prepare('INSERT INTO receipt_upload_events VALUES(?,?,?)').run(groupId,userId,Date.now());const id=crypto.randomUUID();store.db.prepare('INSERT INTO receipts(id,group_id,owner_id,filename,mime,size,bytes,created_at,upload_key,content_hash) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,groupId,userId,file.name,file.type,file.size,file.bytes,Date.now(),key,file.hash);
  return {id,name:file.name,size:file.size,replayed:false};
 });
}
export function getReceipt(store,groupId,userId,id){const {state,role}=store.load(groupId,userId);const row=store.db.prepare('SELECT * FROM receipts WHERE id=? AND group_id=?').get(id,groupId);if(!row)fail('notFound',404);if(row.payment_id){const p=state.payments.find(p=>p.id===row.payment_id);if(!p||(role==='member'&&p.member!==userId))fail('forbidden',403);}else if(row.owner_id!==userId)fail('forbidden',403);return row;}
