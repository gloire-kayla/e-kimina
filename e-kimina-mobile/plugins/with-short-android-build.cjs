const {withProjectBuildGradle}=require('expo/config-plugins');
// pnpm's physical package directories can exceed Windows' batch-file path limit.
// Keep generated commands, objects and CMake state in short, ignored project paths.
module.exports=function withShortAndroidBuild(config){return withProjectBuildGradle(config,mod=>{
 const marker='// e-Kimina short native build paths',endMarker='// end e-Kimina short native build paths';
 const contents=mod.modResults.contents,start=contents.indexOf(marker),end=contents.indexOf(endMarker,start);
 if(start>=0&&end<0)throw Error('Incomplete e-Kimina native build configuration');
 const clean=start<0?contents:contents.slice(0,start)+contents.slice(end+endMarker.length);
 const block=`
${marker}
subprojects { subproject ->
    subproject.layout.buildDirectory.set(new File(rootProject.projectDir.parentFile, "build/android/native/" + subproject.name))
    ["com.android.application", "com.android.library"].each { pluginId ->
        subproject.plugins.withId(pluginId) {
            subproject.extensions.getByName("androidComponents").finalizeDsl { androidExtension ->
                androidExtension.externalNativeBuild.cmake.buildStagingDirectory = new File(rootProject.projectDir.parentFile, "build/android/cxx/" + subproject.name)
            }
        }
    }
}
${endMarker}
`;
 // React's root plugin eagerly evaluates :app. Register callbacks before it runs.
 const insertion=clean.search(/^apply plugin:/m);
 if(insertion<0)throw Error('Android root plugin application point was not found');
 mod.modResults.contents=clean.slice(0,insertion)+block.trimStart()+'\n'+clean.slice(insertion);
 return mod;
});};
