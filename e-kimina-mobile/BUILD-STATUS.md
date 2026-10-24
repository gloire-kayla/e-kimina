# Mobile build status — version 0.6

Verified on 24 October 2026.

## Passed

- Eighteen automated tests covering sessions, group setup, payments, receipts, loans, invitations and member administration.
- Membership API tests: phone-bound invitations, wrong-recipient rejection, regular-member phone privacy, chairperson-only creation, revocation, role updates, suspension/reactivation, settled exit, unsettled-exit rejection and leadership transfer with safe replay.
- Invitation tests verify saving an uncertainty marker before transmitting and retaining the returned code; a failed local save prevents transmission.
- Member form tests cover valid Rwandan phone normalization, eligible targets, reasons and deliberate confirmation of status/leadership changes.
- Existing loan schedule parity, financial workflow and receipt privacy tests remain passing.
- JavaScript syntax checks for App.js and Members.js passed.
- Android and iOS JavaScript development exports passed: 652 and 654 modules respectively, about 1.1 MB each.

## Implemented

Native Members screen in Kinyarwanda, English and French. Active chairpersons invite members, choose member/treasurer/secretary roles, share invitation codes through the native share sheet, revoke invitations, change roles, suspend/reactivate regular members, record settled exits and transfer leadership. All members can view the roster with the existing server privacy rules.

No SMS is sent. Codes are limited to the invited phone and expire after 48 hours. The most recent invitation is retained in SecureStore until Done; server-side hashed codes cannot be recovered. Interrupted creation is not automatically retried: check the pending invitation list and revoke the uncertain invitation before making another. Role/status/leadership/revocation commands retain a request key for safe retries.

The website backend and authentication are unchanged. Phone verification remains disabled. Financial records are preserved by membership changes.

## Device validation

Version 0.6 was launched in Expo Go on emulator-5554. Native chairperson sign-in, group selection, Members roster, invitation creation, displayed code/expiry, and Android sharing-sheet opening passed. The sheet was dismissed without sending anything. An independent API read confirmed exactly one pending invitation for the fictional recipient. Joining, role/status changes, leadership transfer and restart recovery remain pending on-device: Android repeatedly showed “System UI isn’t responding,” and the emulator was restarted without clearing data. The activity service was not ready during the subsequent boot wait. Native loan applications and schedules were tested on the Android emulator in version 0.5; the user previously confirmed Expo Go launch on emulator and physical phone. No iOS device has been tested.

Chairperson loan decisions, treasurer disbursement, native receipts, cookie expiry and cache eviction still need full device QA. Synthetic prior device tests used the isolated in-memory API on port 4174; no money moved.

Expenses, withdrawals, report exports and password recovery still use the website. No APK/IPA, signed release, public backend or store submission exists. JavaScript development exports are not native installers and stay outside the source archive.

