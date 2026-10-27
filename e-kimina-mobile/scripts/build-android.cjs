const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),cli=path.join(root,'node_modules/expo/bin/cli');
function fail(message){console.error(message);process.exit(1);}
if(process.platform!=='win32')fail('This launcher uses Windows Android Studio. Use Gradle directly on other systems.');
if(!fs.existsSync(cli))fail('Run npm install in the mobile folder first.');
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||path.join(process.env.LOCALAPPDATA||'','Android/Sdk');
const java=process.env.JAVA_HOME||path.join(process.env.ProgramFiles||'C:/Program Files','Android/Android Studio/jbr');
if(!fs.existsSync(path.join(sdk,'platform-tools/adb.exe')))fail('Install Android SDK platform-tools in Android Studio.');
if(!fs.existsSync(path.join(java,'bin/java.exe')))fail('Set JAVA_HOME to Android Studio\'s jbr folder.');
const api=process.env.EXPO_PUBLIC_API_URL||'http://127.0.0.1:4173';let url;
try{url=new URL(api);if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/'||url.username||url.password||url.search||url.hash)throw Error();}catch{fail('The local test APK requires a loopback HTTP API URL.');}
const preparedCache=path.resolve(root,'../../work/gradle-home'),cache=fs.existsSync(path.join(preparedCache,'wrapper/dists/gradle-9.4.1-bin'))?preparedCache:path.join(root,'build/gradle-home');
const existingCache=path.join(process.env.USERPROFILE||'','.gradle/caches');
const env={...process.env,JAVA_HOME:java,ANDROID_HOME:sdk,GRADLE_USER_HOME:process.env.GRADLE_USER_HOME||cache,ANDROID_USER_HOME:process.env.ANDROID_USER_HOME||path.join(root,'build/android-home'),EXPO_PUBLIC_API_URL:url.origin,EXPO_NO_TELEMETRY:'1',PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH};
if(!env.GRADLE_RO_DEP_CACHE&&fs.existsSync(path.join(existingCache,'modules-2')))env.GRADLE_RO_DEP_CACHE=existingCache;
fs.mkdirSync(path.join(root,'build'),{recursive:true});
const logFile=path.join(root,'build/android-build.log'),log=fs.createWriteStream(logFile);
function run(command,args,cwd=root){return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});for(const [stream,out]of [[child.stdout,process.stdout],[child.stderr,process.stderr]])stream.on('data',chunk=>{out.write(chunk);log.write(chunk);});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Build did not complete (exit '+code+'). Keep the cache and check '+logFile)));});}
console.log('Building an internal test APK using '+url.origin+'. No Expo Go or Metro is needed after installation.');
console.log('The website backend and USB API forwarding are still required. This uses the template test signing key, not a store release key.');
async function main(){
console.log('Build log: '+logFile);
await run(process.execPath,[cli,'prebuild','--platform','android','--no-install']);
const gradleArgs=['/d','/c','gradlew.bat',':app:assembleRelease','-PreactNativeArchitectures=arm64-v8a,x86_64','--no-daemon','--max-workers=2','--console=plain','--stacktrace'];
if(fs.existsSync(path.join(sdk,'cmake/4.1.2/bin/cmake.exe')))gradleArgs.push('-Pandroid.cmakeVersion=4.1.2');
await run('cmd.exe',gradleArgs,path.join(root,'android'));
const version=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo.version,apk=path.join(root,'build/android/native/app/outputs/apk/release/app-release.apk'),dest=path.join(root,'build','e-kimina-'+version+'-test.apk');
if(!fs.existsSync(apk))throw Error('Gradle finished without the expected APK.');
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(apk,dest);
console.log('APK ready: '+dest);
log.write('APK ready: '+dest+'\n');
}
main().catch(error=>{console.error(error.message);log.write(error.message+'\n');process.exitCode=1;}).finally(()=>log.end());
