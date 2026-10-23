# Mobile build status — version 0.5

Verified on 23 October 2026.

## Passed

- Fifteen automated tests covering sessions, group creation, payments, receipts, loans, permissions and retry identity.
- Loan API integration: member applications, chairperson approval/rejection, treasurer disbursement, insufficient funds and duplicate retry protection.
- Mobile repayment calculations match the website for flat/reducing interest, rounding, payment allocation and month-end due dates.
- Syntax checks for App.js and Loans.js.
- Android and iOS JavaScript development exports passed: 649 and 652 modules respectively, about 1.1 MB each.
- Android emulator: signed in as a synthetic test member, opened the Loans screen, visually inspected repayment schedule and application form, and submitted a 1,500 RWF test application. An independent API read confirmed exactly one submitted application with the expected amount and purpose.

## Implemented

Account registration/sign-in without phone verification; group creation and invitation joining; three languages; savings and dues; payment notices and receipts; treasurer payment review; loan requests, chairperson decisions, treasurer external disbursement records and repayment schedules.

Loan actions persist in SecureStore before transmission, scoped to account/group. Retried actions reuse the saved request key and payload. Disbursement requires explicit confirmation that money has already been paid outside e-Kimina. The existing website API and authentication remain unchanged.

## Device QA still pending

Chairperson decision and treasurer disbursement screens have API integration coverage but have not been exercised end to end on a device. App-restart loan retry recovery, native receipt selection/upload/preview, PDF opening, cookie expiry and cache eviction still need device testing. No iOS device was tested. The user previously confirmed Expo Go launch on both the Android emulator and physical phone.

Synthetic device testing uses the isolated in-memory API on port 4174, not the website's persistent database. No actual money was moved.

Invitations, member administration, expenses, withdrawals, exports and password recovery still use the website. No APK/IPA, signed release, public backend or store submission exists. Development exports use --no-bytecode and are not native installers; generated bundles are excluded from the source archive.

