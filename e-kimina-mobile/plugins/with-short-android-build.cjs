const {withProjectBuildGradle}=require('expo/config-plugins');
// pnpm's physical package directories can exceed Windows' batch-file path limit.
// Keep generated commands, objects and CMake state in short, ignored project paths.
module.exports=function withShortAndroidBuild(config){return withProjectBuildGradle(config,mod=>{
 const marker='// e-Kimina short native build paths',endMarker='// end e-Kimina short native build paths';
 const contents=mod.modResults.contents,start=contents.indexOf(marker),end=contents.indexOf(endMarker,start);
 const block=`
${marker}
subprojects { subproject ->
    subproject.layout.buildDirectory.set(new File(rootProject.projectDir.parentFile, "build/native/" + subproject.name))
    ["com.android.application", "com.android.library"].each { pluginId ->
        subproject.plugins.withId(pluginId) {
            def androidExtension = subproject.extensions.getByName("android")
            androidExtension.externalNativeBuild.cmake.buildStagingDirectory = new File(rootProject.projectDir.parentFile, "build/cxx/" + subproject.name)
        }
    }
}
${endMarker}
`;
 mod.modResults.contents=start<0?contents+block:contents.slice(0,start)+block.trimStart()+(end>=0?contents.slice(end+endMarker.length):'');
 return mod;
});};
