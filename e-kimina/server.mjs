import {createApp} from './backend/server.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173),origin=process.env.APP_ORIGIN||`http://127.0.0.1:${port}`;
const {server,store}=createApp({database:process.env.DATABASE_PATH||path.join(root,'data/e-kimina.sqlite'),origin});
if(!['127.0.0.1','localhost','::1'].includes(process.env.HOST||'127.0.0.1'))throw Error('Local test-code delivery requires a loopback HOST.');
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`e-Kimina: ${origin}\nLocal test verification: codes appear in this terminal. No SMS is sent.`));
function stop(){server.close(()=>{store.close();process.exit(0);});}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
