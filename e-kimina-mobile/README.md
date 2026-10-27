# e-Kimina mobile — version 0.7.0

Native Expo/React Native app for Android and iOS, sharing the website's accounts, SQLite records, permissions and accounting. Kinyarwanda is the default; English and French are available throughout.

## Available features

- Register, sign in, recover a password using a local terminal code, view active sessions, revoke a session and sign out.
- Create, join and switch between ibimina. Each group chooses its contribution, savings goal, monthly interest rate, repayment limit and flat or reducing-balance interest.
- Submit contributions and loan repayments with optional private image/PDF receipts. Only treasurer confirmation posts received money.
- Request loans, review them as chairperson, record external disbursements as treasurer and view repayment schedules.
- Invite members with phone-bound codes, share/revoke invitations, change roles, suspend/reactivate members, record settled exits and transfer leadership.
- Request savings withdrawals; chairpersons review/cancel them and treasurers record external payouts.
- Request group expenses; chairpersons review them and treasurers confirm external payment.
- Change group settings and monthly contribution tracking, with prospective contribution plans and unchanged existing loan terms.
- Publish announcements, read the notification inbox and mark notifications read.
- Record cash/Mobile Money/bank balance counts without changing financial totals.
- Post linked corrections for eligible contributions, repayments, disbursements and expenses, preserving original records.
- Preview and share CSV reports for permitted records. Leaders also access member, expense, reconciliation and balanced journal reports. Preview displays up to 100 rows; exports include all permitted rows.

No money is transferred by e-Kimina. All payouts require an external-payment reference and deliberate confirmation. No SMS provider or phone verification is required. Paid withdrawal reversal, profit sharing, penalties and loan restructuring are outside this version's scope.

## Start on this Windows computer

Keep `e-kimina` and `e-kimina-mobile` beside each other. Use Node.js 24 or newer.

1. Start the website backend with `../e-kimina/Start-e-Kimina.cmd`.
2. In this folder, install dependencies with `pnpm install --frozen-lockfile` (or `npm install` if pnpm is unavailable).
3. Connect an unlocked USB-debugging Android device or start the Android emulator. Install compatible Expo Go.
4. Double-click `../Test-e-Kimina-Android.cmd`, or this folder's `Test-Android.cmd`.
5. Keep the terminal open and open `exp://127.0.0.1:8082` in Expo Go.

The launcher defaults to the persistent website server on port **4173**, so website and mobile accounts share records. To use a separately running isolated test API instead, set its loopback URL before starting:

```powershell
$env:EXPO_PUBLIC_API_URL='http://127.0.0.1:4174'
.\Test-Android.cmd
```

The launcher forwards API and Metro ports to online Android devices. Use `ANDROID_SERIAL` to select one device. Port 8082 must be free; stop an older Expo terminal before restarting. A fresh GitHub clone needs dependency installation in its own mobile folder.

For manual development, set `EXPO_PUBLIC_API_URL` before `npx expo start --localhost --port 8082`. USB `adb reverse` is required because the backend accepts loopback connections only. Wi-Fi alone does not expose this local server.

## Recovery and saved requests

Select **Recover account**, request a code for your existing test account and read the server terminal line with purpose `reset`. Codes expire after ten minutes. Resends have a 60-second cooldown; five incorrect attempts lock a challenge. A successful reset revokes every old session and requires a fresh sign-in. Unknown accounts receive the same response shape. Codes and passwords are never saved by the app. Restarting the backend invalidates pending codes.

Interrupted financial/member actions are stored in SecureStore per account and group. Retry uses the original payload and request key, preventing duplicate posting. For a definitive rejection, refresh before editing. An uncertain invitation is checked and revoked rather than automatically recreated. Receipts and CSV files use private app cache; share sheets open only on request.

## Sessions and privacy

The app uses HttpOnly session cookies, Origin validation and CSRF protection. The CSRF token stays in memory; startup restores the session through `/api/session`. Regular members receive only their own financial records and cannot see other members' phone numbers. The API enforces permissions on every action.

The API URL is fixed at startup/build time and accepts HTTPS or loopback HTTP. This backend intentionally remains local-only. A public production backend is a separate deployment task.

## Validation and builds

### Build an installable Android test APK

With Android Studio, its SDK tools and Java installed, double-click **Build-Android-APK.cmd**. The first build downloads Gradle and native dependencies; later builds reuse the cache. It creates `build/e-kimina-0.7.0-test.apk` only after a successful build. The launcher includes both Pixel-phone and emulator architectures and bundles JavaScript, so Expo Go and Metro are not needed to run the installed APK.

This APK uses the template's test signing key and is for internal testing. Keep the local website server running and forward its port with `adb -s DEVICE_ID reverse tcp:4173 tcp:4173`. Install through Android Studio/ADB or open the APK on your test phone. The default API is `http://127.0.0.1:4173`; set EXPO_PUBLIC_API_URL before building to use a different loopback test API. Changing that URL requires rebuilding. Android permits HTTP only to loopback hosts; other destinations require HTTPS.

The generated Android project keeps module outputs under `build/android/native` and CMake staging under `build/android/cxx`, avoiding Windows command-path limits with pnpm. The launcher reuses the prepared Gradle cache on this computer and uses installed CMake 4.1.2 when available. Build output is mirrored to `build/android-build.log`; keep the window open while it compiles.

The 27 October 2026 build completed and its APK signature, package identity, embedded bundle and two architectures were verified. The installer is `build/e-kimina-0.7.0-test.apk`; on-device installation testing remains pending because no Android device was connected.

### Automated checks

```sh
node --test tests/*.test.mjs
npx expo export --platform all --output-dir build/full-platform --no-bytecode
```

See [BUILD-STATUS.md](BUILD-STATUS.md) for exact test results, device evidence and installer status. JavaScript exports are not APK/IPA installers. iOS native builds/device testing require a Mac with Xcode or a configured build service; neither an App Store nor Play Store release is included.

Source archives and GitHub exclude dependencies, databases, caches, generated native/build directories and signing secrets. Source code backup does not back up account or financial data; use the website's database backup command separately.
