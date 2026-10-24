# Mobile build status — version 0.7.0

Updated 25 October 2026. Feature implementation is complete for the agreed local-development scope. Production deployment and store distribution are separate work.

## Automated validation

- 22 mobile tests pass, including all 18 earlier tests and four tests for the remaining workflows.
- 61 website/backend tests pass.
- Financial integration tests cover role enforcement, external expense/withdrawal confirmations, unchanged balances during balance counts, one-time posting on retry, linked corrections and balanced journal entries.
- Settings tests cover both interest methods, decimal rates, whole-RWF limits, prospective contribution plans and deliberate confirmation.
- Reports enforce member privacy and leader-only exports, quote CSV values and protect formula-like text.
- Saved actions persist before transmission and reject foreign/corrupt outboxes.
- Recovery works for an existing unverified local-test account, exposes no code through the API, rejects replay, revokes sessions and preserves financial history and verification flags.
- All translation keys exist in Kinyarwanda, English and French.

## Available native workflows

Accounts and local recovery; create/join/switch groups; payments, private receipts and treasurer review; loans and schedules; invitations and member administration; savings withdrawals; group expenses; settings and contribution tracking; announcements and inbox; reconciliation; eligible linked corrections; CSV reporting; active sessions and revocation.

Saved requests are scoped to account/group and retain the original key/payload on retry. Phone verification remains disabled. No SMS is sent and no money moves through e-Kimina.

## Device evidence

Earlier physical Pixel 8 checks passed invitation joining, roster privacy, suspension/reactivation, secretary appointment, invitation revocation, confirmed leadership transfer and settled exit with retained records. Chairperson controls disappeared after transfer and the cached group-role label updated correctly. Earlier emulator checks passed loan applications/schedules and invitation sharing-sheet opening. Test credentials were not saved to the phone password manager.

On 25 October, only emulator-5554 was connected. It repeatedly displayed Android System UI ANR dialogs. The USB Pixel 8 was unavailable. Reliable on-device validation of the new tools could not be completed. These screens have automated workflow validation and bundle compilation, not a claimed native device pass.

Still requiring device QA: new tools navigation and CSV share/open; recovery UI; receipt selection/preview; treasurer loan disbursement; interrupted requests after restart; cookie expiry/cache eviction. No iOS device has been tested.

## Distribution

Final Android and iOS development JavaScript exports passed (655/658 modules, approximately 1.1 MB each). App.js, Operations.js, Account.js and Recovery.js passed syntax checks. The combined website/mobile run passed all 83 tests with no failures or skips.

Android native prebuild completed using the official Expo template. On 25 October the Gradle 9.4.1 distribution download was completed with resumable chunks and verified against its official SHA-256 checksum. The archive is cached for reuse. The APK now has a reproducible Expo configuration plugin permitting local HTTP only for loopback hosts; the generated manifest and network policy were checked.

Compilation in the agent's execution environment fails while generating Gradle classes: Java raises AccessDeniedException in WindowsLinkSupport.getRealPath for the readable gradle-classloaders-9.4.1.jar. Standalone Java 17 and Java 25 probes reproduce it, and a specific folder-access grant did not resolve it. Build-Android-APK.cmd therefore runs in the user's normal Windows session, reuses the download, and saves build/android-build.log for diagnosis.

The normal-session build compiled the React Native and Expo build plugins, installed Java 17 and NDK 27.1.12297006, and reached native release compilation (46 executed tasks). It then failed starting Expo's generated prefab_command.bat: its physical pnpm path was 266 characters long, although the file existed. A reproducible Expo plugin now moves subproject build directories to build/native and CMake staging to build/cxx, outside each module's temporary build directory. The equivalent command path is 172 characters. The launcher uses installed CMake 4.1.2 when available and copies the resulting APK from the new output directory. The short-path configuration passed source checks and native project generation; the next normal-session compilation remains pending.

No APK or IPA has been produced yet. Generated native directories, downloads, build logs and signing files stay outside the source snapshot. Expo's [local native build guide](https://docs.expo.dev/guides/local-app-production/) and Android's [CMake staging API](https://developer.android.com/reference/tools/gradle-api/9.3/com/android/build/api/dsl/Cmake) describe the build configuration.

A JavaScript export is not an APK or IPA. No public backend, production signing credentials, Play Store or App Store submission is included. This local backend is intentionally loopback-only; a physical iPhone cannot reach it from this Windows computer. The Android launcher now defaults to the persistent website API on port 4173; isolated test servers remain selectable through EXPO_PUBLIC_API_URL. Restart older backend/Expo terminals to load the updated code and API setting.

Paid withdrawal reversal, profit distribution, penalties and loan restructuring remain outside the agreed version scope. Automatic bank/Mobile Money payment processing, live SMS and background push delivery have no provider connection.
