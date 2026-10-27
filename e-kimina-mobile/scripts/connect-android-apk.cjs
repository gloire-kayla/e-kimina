const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
async function main(){
 const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||path.join(process.env.LOCALAPPDATA||'','Android/Sdk');
 const adb=path.join(sdk,'platform-tools/adb.exe');
 if(!fs.existsSync(adb))throw Error('Android SDK platform-tools not found. Install them in Android Studio.');
 const response=await fetch('http://127.0.0.1:4173/api/health',{signal:AbortSignal.timeout(4000),redirect:'error'}).catch(()=>{throw Error('Start the website with e-kimina/Start-e-Kimina.cmd, keep its window open, then run this shortcut again.');});
 const health=await response.json();
 if(!response.ok||health.status!=='ok'||health.stage!=='development'||health.accountRecovery!=='local-test')throw Error('Port 4173 is not responding as the expected e-Kimina development backend.');
 const output=execFileSync(adb,['devices','-l'],{encoding:'utf8',windowsHide:true});
 const devices=output.split(/\r?\n/).map(line=>line.trim().split(/\s+/)).filter(parts=>parts[1]==='device'&&(!process.env.ANDROID_SERIAL||parts[0]===process.env.ANDROID_SERIAL));
 if(!devices.length)throw Error('Connect and unlock your Android phone, allow USB debugging, and run this shortcut again.');
 for(const [id]of devices){execFileSync(adb,['-s',id,'reverse','tcp:4173','tcp:4173'],{stdio:'inherit',windowsHide:true});console.log('e-Kimina backend connected to '+id);}
 console.log('Open the installed e-Kimina app and retry. Keep USB connected and the website backend running.\nRun this shortcut again after reconnecting USB or restarting the phone. No Expo or rebuild is needed.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
