const path=require('node:path'),fs=require('node:fs'),{execFileSync,spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
console.log('Mobile project: '+root);
const cli=path.join(root,'node_modules','expo','bin','cli');
if(!fs.existsSync(cli)){
 console.error('Expo dependencies are missing in: '+root);
 const original=path.resolve(root,'..','..','e-kimina-mobile');
 if(original!==root&&fs.existsSync(path.join(original,'node_modules','expo','bin','cli')))console.error('The installed development copy is here: '+path.join(original,'Test-Android.cmd'));
 console.error('For a fresh GitHub clone, run npm install in the mobile project folder first.');
 process.exit(1);
}
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||(process.env.LOCALAPPDATA&&path.join(process.env.LOCALAPPDATA,'Android','Sdk'));
const adb=sdk&&path.join(sdk,'platform-tools','adb.exe');
if(!adb||!fs.existsSync(adb)){console.error('Android SDK platform-tools were not found. Install them in Android Studio.');process.exit(1);}
const api=process.env.EXPO_PUBLIC_API_URL||'http://127.0.0.1:4174';let url;try{url=new URL(api);if(!['127.0.0.1','localhost'].includes(url.hostname)||url.protocol!=='http:')throw Error();}catch{console.error('This USB test launcher requires a loopback HTTP API URL.');process.exit(1);}
let output;try{output=execFileSync(adb,['devices','-l'],{encoding:'utf8'});}catch(e){console.error('ADB could not start. Run adb devices -l in your normal PowerShell terminal.');process.exit(1);}
console.log(output);const devices=output.split(/\r?\n/).map(line=>line.trim().split(/\s+/)).filter(parts=>parts[1]==='device').map(parts=>parts[0]);
const chosen=process.env.ANDROID_SERIAL?devices.filter(id=>id===process.env.ANDROID_SERIAL):devices;
if(!chosen.length){console.error('No authorized online device. Start the emulator or reconnect/unlock your USB phone, then run this launcher again. Offline emulators cannot open the app.');process.exit(1);}
const metroPort='8082';
for(const id of chosen){for(const port of [metroPort,url.port||'80'])execFileSync(adb,['-s',id,'reverse','tcp:'+port,'tcp:'+port],{stdio:'inherit'});console.log('USB forwarding ready for '+id);}
console.log('\nTest API: '+api+'\nKeep this terminal OPEN while using Expo Go.\nOpen exp://127.0.0.1:8082 on the forwarded device.\n');

const child=spawn(process.execPath,['--dns-result-order=ipv4first',cli,'start','--localhost','--port',metroPort,'--go'],{stdio:'inherit',env:{...process.env,EXPO_PUBLIC_API_URL:api,REACT_NATIVE_PACKAGER_HOSTNAME:'127.0.0.1',EXPO_NO_TELEMETRY:'1',PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH}});child.on('error',e=>{console.error(e.message);process.exitCode=1;});child.on('exit',code=>process.exitCode=code||0);
