# Mobile build status — version 0.7.0

Updated 27 October 2026. Feature implementation is complete for the agreed local-development scope. Production deployment and store distribution are separate work.

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

On 27 October the signed internal APK was installed successfully on the physical Pixel 8 (3B170DLJH000CY). Cold launch, English sign-in, group selection/dashboard with the expected 100,000 RWF test funds, More tools navigation, CSV export opening the Android share sheet, saved session restoration after force-stop/relaunch, and creation of a new group using reducing-balance interest passed. No report was sent to another person. Tests used an isolated in-memory backend and fictional accounts. The QA account was signed out, the test server was stopped, and USB port 4173 was restored to the persistent website backend. This is a startup/workflow smoke test, not a complete pass for all financial and recovery flows.

Still requiring device QA: CSV opening in a receiving app; recovery UI; receipt selection/preview; treasurer loan disbursement; interrupted requests after restart; cookie expiry/cache eviction. No iOS device has been tested.

## Branded app icon

On 27 October a gold hands-and-sprout icon was generated with the built-in imagegen tool and saved as assets/icon.png. Expo standard/adaptive icon configuration and a reproducible 12% Android drawable inset replace the template icon. The APK rebuilt successfully (278 tasks), its v2 signature verified, and adb install -r updated the physical Pixel 8 successfully. The circular icon was visually inspected in Android App info: the full symbol is visible and legible. The updated app launches successfully. The original pre-icon APK is retained locally as build/e-kimina-0.7.0-before-icon-test.apk; neither installer is included in source archives.

## Distribution

Final Android and iOS development JavaScript exports passed (655/658 modules, approximately 1.1 MB each). App.js, Operations.js, Account.js and Recovery.js passed syntax checks. The combined website/mobile run passed all 83 tests with no failures or skips.

Android native prebuild completed using the official Expo template. On 25 October the Gradle 9.4.1 distribution download was completed with resumable chunks and verified against its official SHA-256 checksum. The archive is cached for reuse. The APK now has a reproducible Expo configuration plugin permitting local HTTP only for loopback hosts; the generated manifest and network policy were checked.

The restricted execution environment reproduces a Java path-access error; the reviewed normal Windows build can compile successfully past that point. No system-wide permissions or TLS settings were relaxed.

On 27 October the native-path plugin was corrected to register its Android DSL callbacks before React's root plugin evaluates the app, and to apply CMake staging through androidComponents.finalizeDsl. Output directories include an android path segment required by Expo autolinking. Module outputs now use build/android/native and CMake staging uses build/android/cxx; generated prefab command paths measure 177-180 characters instead of 266.

The corrected build passed native C++ compilation for ARM64 and x86_64, generated the embedded Android JavaScript bundle (656 modules), and passed release lint and signing validation. Slow Google Maven downloads were completed from the official repository and checked against Google's published checksums. The release build completed successfully (278 actionable tasks). The physical Pixel 8 was subsequently connected; installation and the smoke checks listed above passed.

Android test APK: `build/e-kimina-0.7.0-test.apk` (39,676,771 bytes). Android apksigner verification passed with APK Signature Scheme v2 and the template Android Debug certificate. Package identity is `rw.ekimina.mobile`, version 0.7.0/code 1, minimum Android API 24, target API 36. The APK contains ARM64 and x86_64 native libraries and a 1,497,768-byte embedded JavaScript bundle. The packaged network policy was inspected and permits HTTP only to loopback hosts.

APK SHA-256: `65d89a11b5ecff0dc5309b44c2e5f9a0863a4fc3811cb89658e14c549d0dd2a2`. A matching `.apk.sha256` sidecar is beside the installer. No IPA has been produced. Generated native directories, downloads, build logs and signing files stay outside the source snapshot. Expo's [local native build guide](https://docs.expo.dev/guides/local-app-production/) and Android's [CMake staging API](https://developer.android.com/reference/tools/gradle-api/9.3/com/android/build/api/dsl/Cmake) describe the build configuration.

A JavaScript export is not an APK or IPA. No public backend, production signing credentials, Play Store or App Store submission is included. This local backend is intentionally loopback-only; a physical iPhone cannot reach it from this Windows computer. The Android launcher now defaults to the persistent website API on port 4173; isolated test servers remain selectable through EXPO_PUBLIC_API_URL. Restart older backend/Expo terminals to load the updated code and API setting.

Paid withdrawal reversal, profit distribution, penalties and loan restructuring remain outside the agreed version scope. Automatic bank/Mobile Money payment processing, live SMS and background push delivery have no provider connection.
