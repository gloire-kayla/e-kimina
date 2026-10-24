# Mobile build status — version 0.6.1

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

Physical Pixel 8 with Expo Go, 24 October 2026:

- Invited test account signed in and joined the fictional group using the exact invitation code created on the emulator. An independent API read confirmed membership and consumption of the invitation.
- Regular-member roster was visually inspected: names, roles and statuses were visible; phone numbers and chairperson controls were absent.
- Chairperson suspended and reactivated the test member through the native forms, including reasons and confirmation. API reads confirmed each status.
- Chairperson appointed the test member as Secretary. The native roster and API both showed the new role.
- A second invitation was created and revoked through the phone UI. The server confirmed no pending invitations remained and retained the revocation audit entry.
- Leadership transfer was blocked with the confirmation unchecked; the server roles and audit stayed unchanged. After confirmation, exactly one new chairperson remained and the former chairperson lost management controls.
- The new chairperson recorded a settled exit for the former chairperson. The server preserved both member records and the audit trail, with unchanged zero financial balances; the exited member had no management/reactivation actions in the native roster.
- The outdated group-chooser role label found during transfer testing was corrected and the Member label was verified on the phone. The API integration test now checks session metadata after a real leadership transfer.
- Test credentials were not saved to Android's password manager. The test account was signed out after checks.

Earlier emulator checks passed chairperson sign-in, Members roster, invitation creation, displayed code/expiry and Android sharing-sheet opening; the share sheet was dismissed without sending anything. The emulator repeatedly displayed “System UI isn’t responding,” including after a data-preserving reboot. The checks above were completed on the physical phone instead.

Native loan applications and schedules were tested on the emulator in version 0.5. All device tests used fictional accounts and the isolated in-memory API on port 4174; no money moved and the persistent website database was not used.

Still pending on-device: interrupted-action recovery after restart, chairperson loan decisions, treasurer disbursement, native receipt selection/upload/preview, cookie expiry and cache eviction. Existing API tests cover membership exits, transfers and retry identity. No iOS device has been tested.

Expenses, withdrawals, report exports and password recovery still use the website. No APK/IPA, signed release, public backend or store submission exists. JavaScript development exports are not native installers and stay outside the source archive.


## Version 0.6.1 correction

Group responses now update the cached session group name and role alongside the open group. The chooser no longer retains an old Chairperson label after leadership transfer. Authority continues to be enforced by the unchanged backend. All 18 tests, syntax checking and Android/iOS development exports passed after the correction (652/654 modules).
