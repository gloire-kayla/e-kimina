# e-Kimina mobile — version 0.6.1

An Expo/React Native app for Android and iOS, sharing the website API. Phone verification is disabled. This is source code and a JavaScript development bundle, not an APK or App Store release.

## Implemented

- Kinyarwanda by default, with English and French language switching.
- Sign in, account registration and joining a group by invitation.
- Group selection and switching.
- Personal remaining savings, recorded group funds and overdue obligations.
- Own payment records, loan records and contribution/loan deadlines.
- Group notifications and announcements, pull to refresh and sign out.

The app is a native React Native interface. It does not embed the website. Contribution and loan-repayment notices can now be submitted in the app. Loan applications, chairperson decisions, treasurer disbursements and repayment schedules are available in the Loans tab. Create a group from Your groups. Invitations and member administration are available in Members. Expenses, withdrawals, exports and password recovery still use the website.

## Shared sessions

The app uses the website's existing session cookies, Origin validation and CSRF tokens. No backend authentication changes were made. Passwords are never saved. The native networking layer manages the HttpOnly cookie; the app keeps its CSRF token in memory and restores the session through /api/session on startup. Cookie persistence and expiry behavior must be verified on actual Android and iOS devices. Language preference uses Expo SecureStore.

The API URL is fixed through EXPO_PUBLIC_API_URL at build/start time. It accepts HTTPS or loopback HTTP. Do not enter real data into the local development setup.

## Run on this Windows computer

The Expo packages have been installed in this workspace. Install Node.js 24+ on your computer if npm/npx are unavailable. With a standard Node/npm installation, open a terminal in this folder and run:

```powershell
npm install
npx expo start --localhost
```

If using the installed pnpm lockfile, use pnpm install instead of npm install. The project uses Expo SDK 58, React 19.3 and React Native 0.88. Expo dependency checking completed using the installed SDK's offline version map.

Start the website using the adjacent e-kimina/Start-e-Kimina.cmd. The default API is http://127.0.0.1:4173. Keep that server running. It retains its local-only network restrictions.

### Android emulator

Install Android Studio and create/start an emulator. Ensure Android platform-tools (adb) are on PATH. Forward the local API and Metro ports:

```powershell
adb reverse tcp:4173 tcp:4173
adb reverse tcp:8081 tcp:8081
npx expo start --localhost --port 8081
```

Use a compatible Expo Go installation or a development build, then press a in the Expo terminal. Device setup, Expo Go compatibility and native cookie behavior have not been tested here. No Android emulator or adb tool was available in this session.

### Android phone connected by USB

Enable developer options and USB debugging on your own test phone, connect it and authorize that computer on the phone. Run adb devices, then the same reverse commands above. If more than one device is connected, specify adb -s DEVICE_ID. Use Expo Go/development build to open the local Metro project. Wi-Fi alone cannot reach the current local-only API.

### iPhone / iOS

iOS Simulator requires a Mac with Xcode. Run the website backend on the same Mac, then start Expo and open the simulator. A physical iPhone cannot reach this Windows loopback backend. A reachable HTTPS backend is required for that later phase; no public server or tunnel has been created.

## Validation

Ten automated mobile tests pass, including a real local website API integration test for registration, session restoration, group creation/access, logout and login without verification. That test supplies a Node test cookie jar; it does not prove native device cookie handling.

App.js passes a Node syntax check. See BUILD-STATUS.md for bundle results. No APK/IPA has been built or installed, and visual/native device QA remains outstanding. The website backend and its existing data were not modified.

Run tests with the website source kept adjacent to this folder:

```powershell
node --test tests/*.test.mjs
```

## Next increment

Test Android sign-in and session persistence first, then add loan requests and chairperson loan approval flows. Complete device QA before release packaging.

On this computer, you can also double-click Start-e-Kimina-Mobile.cmd after starting the website server. The launcher uses Node on PATH or the bundled Codex Node runtime. Android SDK/adb and a compatible Expo Go or development build are still required to open it on an Android device.

## Mobile payment notices (version 0.2)

Inside a group, choose Submit a payment notice. Enter a whole RWF amount and payment date, then contribution month or one of your active loans. Choose Mobile Money, cash or bank, add an optional reference, and confirm that you already paid outside the platform. Sending creates a pending notice; balances change only after treasurer approval. The form labels are available in all three languages.

Before sending, the app saves the submission in Expo SecureStore using an account-and-group-specific key. On a connection failure, use Retry this submission. It sends the same payload and idempotency key. Returning to the form after restarting the app restores that draft. Do not create a separate notice on the website while an app submission has an unknown result.

Once a saved request has been sent, its fields remain locked until it succeeds. Explicit validation failures allow Edit payment; ambiguous failures keep the same request identity. If successful submission is followed by a local storage error, retry is still safe: the server returns the earlier result. A corrupted saved draft blocks sending; use the website and obtain support before resubmitting.

Payment notices do not transfer money. No SMS provider is needed, and phone verification remains disabled. Suspended members can submit notices; exited members cannot. Optional receipt attachments are implemented in version 0.3.

## Receipt attachments and treasurer review (version 0.3)

The payment form can attach one PNG, JPEG, WebP or PDF up to 5 MB using the system document picker. It copies the chosen file to app cache. Uploads use the existing private receipt endpoint and a separate idempotency key. The returned receipt ID is saved before sending the payment notice. Unknown upload outcomes retry the same upload key; unknown payment outcomes retry the same payment key. Server validation and access rules remain authoritative.

Cached files can be removed by the operating system. If the file disappears before payment submission, the app shows an error. An upload-stage draft can then be edited without posting a payment. Uploaded files without a known ID may remain as unattached server drafts and count toward the existing quotas. Receipt metadata and the cached-file URI are saved in SecureStore, while the file itself remains in private app cache.

Treasurers see Review received payments inside their group. Select a pending notice, inspect its amount, member, method, reference and receipt, then approve or reject. Approval requires confirming receipt of actual money. Rejection requires a reason of at least five characters. Decisions are saved before sending and retain their request key after connection failures. Returning to the review screen restores an interrupted decision.

Images display inside the review screen. PDFs use the device opening/sharing sheet; sharing to another app happens only when the user chooses that app. Downloaded review files are kept temporarily in app cache and removed when leaving the review screen. Opening private receipts on an actual device still needs QA. Other members cannot download another member’s receipt. Attached receipt records remain immutable.

No website backend change, phone verification, live SMS, APK/IPA or store release was introduced. Receipt selection, native upload bodies, preview/PDF opening and persisted-draft recovery must be tested on Android and iOS devices.

## Expo Go: “Failed to download remote update”

This error occurs before e-Kimina's sign-in screen. First confirm Metro is running: its terminal must stay open and show Waiting on ... for port 8082. Opening a cached Expo project after closing Metro cannot download the app.

For the isolated device test prepared in this chat, double-click Test-Android.cmd. It uses the test API on http://127.0.0.1:4174, forwards API and Metro ports for each authorized online device, and starts Expo in localhost/Expo Go mode. The test API must still be running separately. This launcher is intended for testing; the normal website server uses port 4173.

- ADB status device means online and authorized.
- ADB status offline means the emulator/device is not ready. Wait for its Android home screen, then rerun the test launcher.
- If the USB phone disappears from adb devices, reconnect it and rerun the launcher. Reconnecting can remove reverse-port forwarding.
- Open exp://127.0.0.1:8082 in Expo Go on the forwarded device. Do not reuse an unrelated QR code or remote update link.
- If another Metro terminal already occupies port 8082, use that terminal or stop it before starting another. Do not close the terminal while using the app.

No phone verification or SMS connection is required. As of the latest check, the app has not yet been visually verified on the user's device; device startup is still in progress.

The Android test launcher now uses port 8082 to avoid an observed IPv6 localhost conflict on 8081. It starts Node with --dns-result-order=ipv4first and advertises 127.0.0.1. Keep the original process on 8081 intact if another project uses it. Close the failed test window and rerun Test-Android.cmd. The source/build checks do not establish that this device connection is working until Metro reports Waiting on ... and the app opens.

## Create your first group (v0.4)

Sign in or create an account, then tap **Shinga ikimina / Create an ikimina / Créer une ikimina** on Your groups. Enter the group name, monthly contribution, savings goal, monthly interest rate, repayment period and either flat or reducing-balance interest. The creator becomes chairperson and the group opens automatically. Existing accounts can still join by invitation. Phone verification is not required.

If a network interruption leaves creation uncertain, return to Your groups and check the refreshed list before creating again. Open Members to invite people and appoint a treasurer.

## Mobile loans (v0.5)

Open an ikimina and tap **Inguzanyo / Loans / Prêts**. Active members can apply with a whole RWF amount, purpose and repayment period within the group maximum. Interest rate and calculation method come from the group settings.

The chairperson sees group loans and can approve or reject submitted requests. Rejection requires a reason of at least five characters. The treasurer can record disbursement of approved loans after confirming payment outside e-Kimina and entering a reference or description. The server checks available funds and permissions. This records an external payment; e-Kimina does not send money.

Schedules show principal, interest, installment totals and remaining balances. Dates are projected until disbursement and then use the server-recorded disbursement date. Approved repayments update outstanding amounts.

Interrupted loan actions are saved in SecureStore per account/group. Retry uses the same request key and frozen payload. If the server definitively rejects the action, Refresh retrieves current records and clears that failed action. Leave an uncertain request saved and retry it rather than submitting a second application.

## Members and invitations (v0.6)

Open a group and tap **Abanyamuryango / Members / Membres**. Members can see the roster and current roles/statuses; the server omits phone numbers from regular-member views.

Active chairpersons can:

- Invite a Rwandan phone number as member, treasurer or secretary. The invitation lasts 48 hours and is restricted to that phone number. No SMS is sent. Use Share invitation code to open the native share sheet, or select/copy the code. The recipient signs in and pastes it on Your groups.
- View and revoke pending invitations. Raw codes cannot be retrieved again from the server. The latest generated code is saved securely on this device until Done is pressed.
- Change active members’ roles, with a reason of at least five characters.
- Suspend or reactivate regular members. Financial records are preserved; suspended members can still submit payments.
- Record an exit only after savings, loans, dues and pending payments are settled. Exited membership cannot be reactivated. Use website settlement workflows where necessary.
- Transfer leadership to another active member. An explicit confirmation explains that the current chairperson becomes a regular member.

Status changes, invitation revocation and leadership transfer require an on-screen confirmation. Retriable commands are stored per account/group in SecureStore and reuse their request identity. If invitation creation is interrupted, Check invitations refreshes the list; revoke the uncertain invitation before making another. Invitation creation uses the existing endpoint and is not automatically retried.

### Version 0.6.1 role display fix

The group chooser now updates its role label immediately when an authoritative group response changes your membership role, including after leadership transfer. Switching groups no longer shows an old Chairperson label after the transfer. Server permission checks remain unchanged.
