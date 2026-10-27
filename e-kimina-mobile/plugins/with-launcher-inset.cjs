const {withDangerousMod}=require('expo/config-plugins');
const fs=require('node:fs/promises'),path=require('node:path');
// Keep the generated mark inside Android's adaptive-icon mask safe area.
module.exports=config=>withDangerousMod(config,['android',async mod=>{
 const res=path.join(mod.modRequest.platformProjectRoot,'app/src/main/res');
 await fs.mkdir(path.join(res,'drawable'),{recursive:true});
 await fs.writeFile(path.join(res,'drawable/ekimina_launcher_foreground.xml'),`<?xml version="1.0" encoding="utf-8"?>
<inset xmlns:android="http://schemas.android.com/apk/res/android" android:drawable="@mipmap/ic_launcher_foreground" android:inset="12%" />
`);
 for(const file of ['ic_launcher.xml','ic_launcher_round.xml']){
  const target=path.join(res,'mipmap-anydpi-v26',file);
  const xml=await fs.readFile(target,'utf8');
  await fs.writeFile(target,xml.replace('@mipmap/ic_launcher_foreground','@drawable/ekimina_launcher_foreground'));
 }
 return mod;
}]);
