import {createApp} from './backend/server.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173),origin=process.env.APP_ORIGIN||`http://127.0.0.1:${port}`;
const {server,store}=createApp({database:process.env.DATABASE_PATH||path.join(root,'data/e-kimina.sqlite'),origin});
if(!['127.0.0.1','localhost','::1'].includes(process.env.HOST||'127.0.0.1'))throw Error('Local test-code delivery requires a loopback HOST.');
server.on('error',async error=>{
 store.close();
 if(error.code==='EADDRINUSE'){
  try{
   const response=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(3000),redirect:'error'});
   const health=await response.json();
   if(response.ok&&health.status==='ok'&&health.stage==='development'&&health.accountRecovery==='local-test'&&health.smsDelivery==='terminal'){
    console.log(`e-Kimina is already running on http://127.0.0.1:${port}.\nUse the existing server. Recovery test codes appear in the terminal that started it.\nThis duplicate launcher can be closed.`);
    return;
   }
  }catch{}
  console.error(`Port ${port} is already in use. No new e-Kimina server was started.\nClose the application using that port before starting e-Kimina again.`);
 }else console.error(`e-Kimina could not start: ${error.message}`);
 process.exitCode=1;
});
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`e-Kimina: ${origin}\nPhone verification disabled. Password-recovery test codes appear in this terminal. No SMS is sent.`));
function stop(){server.close(()=>{store.close();process.exit(0);});}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
