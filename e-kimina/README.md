# e-Kimina website — version 0.8.3

Register or sign in with a phone number and password, then create or join a group immediately. Existing accounts and financial records are preserved. Password recovery still uses local terminal test codes; no SMS provider is needed.

## Start

1. If an older e-Kimina server is running, stop it with Ctrl+C.
2. Double-click **Start-e-Kimina.cmd** in this folder.
3. Keep that terminal window open.
4. Open **http://127.0.0.1:4173**.

Alternatively, with Node.js 24 or newer:

```sh
node server.mjs
node --test tests/*.test.mjs
```

No package installation or SMS account is needed for this test version. The launcher uses Node on PATH, or the bundled Codex Node runtime on this computer.

## Phone verification

No verification code is required. Phone numbers identify accounts and invitations; they are not verified for ownership.

## Recover an account

1. On the sign-in screen, select **Forgot your password?**
2. Enter the phone number of an existing test account.
3. Request a code.
4. Find the terminal line for that number with purpose **reset**.
5. Enter the code, a new password of 12–128 characters, and the matching confirmation.
6. Sign in again with the new password.

A successful reset invalidates all of that user's previous sessions. The website does not sign the user in automatically.

For privacy, recovery gives the same response shape for known and unknown accounts. Existing accounts can receive a local terminal recovery code without phone verification. Unknown accounts receive no code. This does not mark any phone number as verified.

## Code rules

- Codes expire after 10 minutes and work only once.
- Five incorrect attempts lock a challenge.
- Wait at least 60 seconds between requests.
- Up to three requests per purpose and phone number per hour; a separate limit applies per connection IP.
- Requesting another code invalidates the previous one.
- Verification and recovery codes are not interchangeable.
- Verification is bound to the signed-in account.
- Only an HMAC digest of a code is saved. Codes are not returned by the API or stored in browser storage.
- The signing secret is held in memory for this local build. Restarting the server invalidates pending codes; request another when the cooldown allows.
- A pending verification challenge survives a page reload through its safe ID/expiry metadata.
- Recovery request state is held in page memory. If that page is refreshed, start again and wait for the resend cooldown if needed.

The local test server refuses public origins, non-loopback HOST bindings and requests from non-loopback connections. A future real SMS integration must use a separate verification method; the database marks today's confirmations as **local**, not SMS.

## Group workflows retained from version 0.2

- Kinyarwanda, English and French, including verification and recovery.
- Account sign-in with scrypt password hashes and HttpOnly SameSite session cookies.
- Group creation, multiple memberships, phone-bound single-use invitations and role-based permissions.
- Member payment notices; treasurer receipt confirmation or rejection.
- Loan requests, chairperson decisions, separate treasurer disbursement confirmation, and repayments.
- Atomic financial posting, duplicate-request protection, balanced accounting entries, activity history and CSV statements.
- Group configuration of contribution amount, monthly rate, repayment limit, savings target and **flat or reducing-balance** interest.
- Repayment schedules and fixed loan-term snapshots.
- Session listing and revocation.

Each new group starts at zero. Members receive their own financial details and permitted group summaries; other members' phone numbers are omitted from member views.

## Interest and accounting

Rates are monthly. New settings do not rewrite existing loan terms.

- Flat interest is based on the original principal across the loan term.
- Reducing balance uses equal principal installments and monthly interest on scheduled remaining principal.
- Whole-RWF rounding is explicit; the final principal installment absorbs any division remainder.
- Due dates start a month after confirmed disbursement and clamp to the final valid day of shorter months.
- Payments cover each scheduled installment's interest first, then principal, then the next installment.
- Early payments do not yet reduce future contractual interest.
- Contributions debit recorded cash and credit member savings. Disbursement debits loan principal and credits cash. Repayments debit cash and credit principal/interest income according to allocation.
- Dashboard loan totals include contractual future interest; journal principal is shown separately.

Allocation and early-payment policy still need review before a live pilot. Contribution frequency remains monthly.

## Data and backups

The default database is **data/e-kimina.sqlite**, outside the served website directory and excluded from Git and the source ZIP. Browser storage keeps only language preference, not passwords, verification codes or financial records.

Version 0.1 browser-local records are left untouched and are not automatically imported. The original standalone demo remains at **../e-kimina-demo.html**. The current **../e-kimina.html** is the startup guide for the server-backed version.

Create a consistent online backup:

```sh
node scripts/backup.mjs
```

You may also supply an absolute destination filename. Backups contain sensitive account/group records; keep them private. Do not copy only a live SQLite main file while WAL writes are active.

Restore only with the server stopped. Retain the current database and sidecars in a recovery folder, restore a verified backup to the configured path and restart. Invalidate restored sessions before a real recovery deployment. Automated tests restore a backup into a separate temporary database.

## Runtime configuration

- PORT: 4173 by default.
- HOST: loopback only; defaults to 127.0.0.1.
- APP_ORIGIN: defaults to http://127.0.0.1:PORT, no trailing slash; must be a loopback origin.
- DATABASE_PATH: optional absolute SQLite filename.

## Verification

All 33 automated checks pass. They cover financial workflows, permissions, duplicate/racing approvals, rollback on accounting failure, backup restoration, schema migration, code expiry/replay/attempt limits, resend rules, session rotation and recovery revocation.

Browser checks cover sign-in, the confirmation gate, requesting and entering a terminal code, access to group onboarding after confirmation, and rendering the password-recovery form. Password-reset behavior is exercised through isolated automated API tests. No real SMS was sent and no user's password was changed during browser testing.

## Remaining before a real pilot

A real SMS provider and phone-ownership verification, stronger leader authentication, leadership changes, arrears/penalties, secure receipts, financial corrections/reconciliation, notifications, privacy controls, production operations and hosting remain unfinished. Translations require fluent-speaker review. The phone app is not yet built.

This release is local only. The existing .openai/hosting.json identifies the old static Site, not a deployable backend configuration for this version. Uploading dist alone will not provide APIs. Public deployment requires a suitable backend runtime and real verification delivery.

See **API.md** for the shared backend interface.

## Version 0.4: receipts, deadlines and corrections

This release adds private receipt uploads (PNG, JPEG, WebP or PDF, up to 5 MB), contribution and loan overdue tracking, in-app notifications, group announcements, linked financial corrections and treasurer balance checks. Local test codes remain enabled; no SMS is sent.

Existing groups start with contribution tracking off. Enable it in Group settings and choose a start month and due day. Short months use their last day. Active schedule changes take effect next month and preserve past obligations. Members joining after a deadline start the following month. Confirmed payments settle the selected month; excess does not automatically carry forward. No penalties are added.

Receipts remain private in SQLite and are included in database backups. Payment owners and group leaders can download attached receipts; other members cannot. Attached receipts are retained. Draft limits are three per user/group, twenty uploads per hour, and 100 MB per group. Files are served as attachments; a malware scanning service is not connected.

The chairperson can reverse mistaken contributions, repayments and disbursements from Reports, with a reason. Original entries are preserved with linked corrections. Reversing older repayments recalculates principal and interest allocation. Repayments must be reversed before reversing a disbursement. Actual money is handled outside e-Kimina.

Treasurers can record cash, Mobile Money and bank balances in Reports. The combined total is compared with recorded available funds. Differences require a note; balances are never automatically adjusted. Chairpersons and secretaries can publish group announcements. Notifications are in-app only.

The website remains a local development build. Remaining work includes fuller membership/leadership management, expenses, production hosting and real phone verification, security review, and operational/privacy documentation. Loan restructuring, grace periods and penalties are not implemented. The native mobile app is available in ../e-kimina-mobile; see its BUILD-STATUS.md for validation and release limitations.

## Version 0.5: membership and leadership

On Members, the chairperson can select Manage role beside another member, choose a member, treasurer or secretary role, and enter a reason. Changes take effect immediately for existing sign-ins. Each person holds one role per group; several people may hold the same treasurer or secretary role.

To hand over leadership, choose Transfer chairperson responsibility, provide a reason and tick the explicit confirmation. The recipient becomes chairperson and the previous chairperson becomes a regular member, in one transaction. Self-demotion and direct chairperson promotion are blocked. Existing payments, loans and journal entries are preserved.

Unused invitations appear on Members for the chairperson, with phone, assigned role and expiry. Revoke invitation prevents that code from being used; a new invitation can be created later. Codes are not shown again or stored in plain text. Revocation does not remove an existing member.

All changes create audit entries. The complete automated suite passes 52 checks, including role authorization, immediate loss of former permissions, transfer invariants, invitation revocation and preservation of savings history. Browser preview was unavailable for this phase; the new UI has syntax and translation checks but awaits visual verification.

Member suspension, leaving a group and member removal are not included in this release. Local test codes remain enabled; no SMS is sent.

## Version 0.6: group expenses

In Reports, group leaders can request an expense with amount, payee and description. The chairperson approves or rejects it; rejection requires a reason. Approval does not change funds. After paying outside e-Kimina, the treasurer selects Confirm external payment and supplies a reference. The recorded available balance must cover the expense. Duplicate confirmations are blocked. Several approved expenses do not reserve funds; funds are checked when payment is confirmed.

Paid expenses reduce available funds and post balanced group_expense/cash journal entries. They do not reduce members’ contribution histories or savings balances. Expense details are visible to leaders; regular members see the resulting group available-funds total. Requests, decisions, payment confirmations and corrections are audited.

The chairperson can reverse an incorrect expense entry from the Reports ledger. This preserves the original and adds a linked correction. Only correct the recorded expense when it was incorrect or the money has actually been returned outside e-Kimina. A reversed expense cannot be paid again; create a fresh request if needed.

The full automated suite passes 53 checks. Browser visual verification remains pending. Expense receipt uploads, budgets and scheduled recurring expenses are not included. Local test codes remain in use.

## Remaining pilot roadmap

1. Member suspension, reactivation and exit rules that preserve existing obligations.
2. Final reports and exports, including expenses and member balances.
3. Complete website flow, browser, language, mobile-layout and security testing.
4. Production hosting, real phone verification, backup operations and privacy documentation.

These are broad stages, not a guarantee of four individual coding sessions. The phone app follows website readiness.

## Version 0.7: membership status

Chairpersons open Members, select Manage role beside a regular member, then Manage membership status. Choose active, suspended or exited, provide a reason and confirm. Leaders must first be demoted to regular members. Status changes are immediate and audited. Existing groups default to active without losing records.

Suspension blocks new loan requests and all financial commands except submitting payment notices. Contribution obligations and existing loan debts continue. Leaders cannot approve or disburse a loan to an inactive member. Reactivation restores ordinary member activity.

Exit requires zero net recorded member savings, no pending payment notices, no submitted/approved/active loans, and no remaining tracked contribution obligations through the current month, including amounts due later this month. Exit retains the account, membership and historical records for viewing. Exited members cannot post financial commands or receive leadership roles. New contribution obligations stop from the following month. Exit is permanent in this build; rejoining and reversing exit are not implemented.

Savings withdrawals and end-of-cycle settlements are not implemented yet. Consequently, a member with recorded savings cannot complete exit; do not reverse valid contributions merely to bypass the exit check. Settlement is a remaining feature before pilot readiness.

The complete automated suite passes 55 checks. Browser visual verification remains pending. Local test codes remain enabled.

The remaining broad stages are final reports/exports and savings settlement, full website testing, and production setup. These can require several coding sessions.

## Version 0.8: savings settlement

Open Reports and find Savings settlement. Members can request their own savings withdrawal, including while suspended. The chairperson reviews it. Only after actual payment outside e-Kimina does the treasurer confirm payment with a reference. Approval reserves no money: both member savings and available group funds are rechecked atomically when paid. Open loan applications, approved loans and active loans block payment. Partial withdrawals are supported.

Paid withdrawals debit member_savings and credit cash. Reports show remaining savings; contributions and paid withdrawals remain in history. Group totals expose gross contributions, net savings and withdrawals separately. Withdrawals do not erase contribution-month fulfillment. Exit is available after all savings and other obligations have been settled; pending or approved withdrawals block exit. The chairperson can cancel unpaid withdrawal requests with a reason.

Paid withdrawals cannot be reversed in this version. Check external payment carefully. A mistaken paid withdrawal requires a future correction workflow; do not fabricate a contribution to hide it. Profit distribution, end-of-cycle interest sharing and automatic debt offsets are not implemented.

CSV statements now include record IDs, original event kinds, reversal links and signed cash changes, covering expenses and withdrawals as well as earlier transactions. Reports restrict member data to the current member; leaders see the group.

The automated suite includes settlement overdraw protection, approval authorization, idempotent payment, cancellation, balanced journals and settled exit. Browser verification is still pending. Local test codes remain enabled.

## Version 0.8.1: verification and reporting fixes

The member dashboard now shows net remaining savings, including withdrawals and contribution corrections. Active-member counts exclude suspended and exited memberships. Withdrawal audit events have labels in all three languages.

See QA-REPORT.md for verification evidence and remaining browser/pilot checks. Automated rendered-HTML checks cover seven workspace pages for four roles in three languages; these are not browser or visual layout tests. Local test codes remain enabled.

## Version 0.8.2: navigation and sign-in

The left sidebar scrolls independently at short screen heights and in the mobile navigation drawer. Phone verification is disabled in the shipped local server and no longer appears after sign-in. Verification endpoints are disabled by default; the legacy verification implementation is retained solely for compatibility tests using an explicit server option. Recovery codes remain local to the terminal. Restart the server and refresh the browser to apply these changes.

## Version 0.8.3: recovery without phone verification

Existing accounts can use local terminal password-recovery codes while phone verification is disabled. The API never returns the code, successful reset revokes all sessions, and verified flags stay unchanged. Legacy verification-required mode retains its earlier eligibility checks. The full website/backend suite passes 61 tests; the mobile suite adds an end-to-end recovery check for an unverified account. Native mobile screens now cover expenses, withdrawals, settings, contribution plans, announcements, the inbox, reconciliation, corrections, CSV reports and sessions. See ../e-kimina-mobile/README.md. Earlier version sections below/above are historical records; current verification requirements are described at the top.
