import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const source=process.env.DATABASE_PATH||path.join(root,'data/e-kimina.sqlite');
if(!existsSync(source))throw Error('No database found. Start the application first.');
const destination=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'backups','e-kimina-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');
if(existsSync(destination))throw Error('Backup target already exists; choose a new filename.');
mkdirSync(path.dirname(destination),{recursive:true});
const db=new DatabaseSync(source,{readOnly:true});
try{await backup(db,destination);console.log('Backup saved: '+destination);}finally{db.close();}
