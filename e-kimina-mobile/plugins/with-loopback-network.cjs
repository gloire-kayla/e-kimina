const {withAndroidManifest,withDangerousMod,AndroidConfig}=require('expo/config-plugins');
const fs=require('node:fs/promises'),path=require('node:path');
// USB adb reverse exposes the existing local API at device loopback only.
// Every other HTTP destination remains blocked by Android's network policy.
module.exports=function withLoopbackNetwork(config){
 config=withAndroidManifest(config,mod=>{const app=AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);app.$['android:networkSecurityConfig']='@xml/ekimina_network_security';return mod;});
 return withDangerousMod(config,['android',async mod=>{const dir=path.join(mod.modRequest.platformProjectRoot,'app/src/main/res/xml');await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'ekimina_network_security.xml'),`<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">127.0.0.1</domain>
    <domain includeSubdomains="false">localhost</domain>
    <domain includeSubdomains="false">::1</domain>
  </domain-config>
</network-security-config>
`);return mod;}]);
};
