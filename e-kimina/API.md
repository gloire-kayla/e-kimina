# Shared e-Kimina API (v0.2 development)

Base path: /api. Responses are JSON. Error responses are {"error":"code"}. The browser and future phone client must use the same server authorization and business rules.

## Authentication

- POST /auth/register — name, phone, password, language (rw/en/fr).
- POST /auth/login — phone, password.
- GET /session — current user, groups and CSRF token.
- POST /auth/logout — revoke current session.
- GET /sessions — active sessions belonging to the current user.
- DELETE /sessions/:id — revoke a session belonging to the current user.

Registration and login set an HttpOnly, SameSite=Strict session cookie. The JSON response includes user, groups and csrf, never the cookie token or password hash. Sessions expire after seven days.

Every write requires an Origin header matching APP_ORIGIN. Authenticated writes additionally require X-CSRF-Token from the current session. All frontend requests use same-origin cookies. Cross-origin access is not enabled. Native app authentication will be designed before mobile integration rather than exposing cookie tokens to JavaScript.

Phones are normalized to 07xxxxxxxx. Password length: 12–128 characters. scrypt uses a fresh random salt per password. Auth attempts are limited per phone and connection IP within 15-minute windows.

## Groups

- POST /groups — name, contribution (integer RWF), frequency (monthly), rate (monthly percent, max two decimal places), term (1–60 months), goal (integer RWF), interestMethod (flat/reducing). Creates a chairperson membership.
- GET /groups/:id — authorized group view, actor ID, groupTotals and monthly activity.
- POST /groups/:id/invitations — chairperson only; phone and role (member/treasurer/secretary). Returns a one-time displayed token and expiry.
- POST /groups/join — token; requires an account matching the invited phone.
- GET /groups/:id/journal — leaders only; balanced journal lines.

Reading a group requires membership. A member view excludes other members' phones, financial details and private audit events. Full group financial data is returned only to group leaders. No arbitrary user ID or role from a browser request is trusted.

## Financial commands

POST /groups/:id/commands requires **Idempotency-Key**, a unique UUID per intended operation. Reuse the same key and exact payload after a lost response; a replay returns success without reposting. Reusing a key with a changed payload returns 409.

Body: {"command":"payment.submit","data":{...}}.

- payment.submit: amount, date (YYYY-MM-DD), method (cash/momo/bank), purpose (contribution/repayment), optional reference; period (YYYY-MM) for contributions or loan ID for repayments. Actor always comes from the authenticated session.
- payment.review: id, decision (approved/rejected), reason (required for rejection). Treasurer only.
- loan.request: amount, term, purpose. Member's own application; group terms are snapshotted.
- loan.review: id, decision, reason. Chairperson only.
- loan.disburse: id, reference. Treasurer only; records confirmed external disbursement.
- settings.update: all group configuration fields. Chairperson only; existing loan snapshots remain unchanged.

Each command runs in a BEGIN IMMEDIATE transaction. State changes, audit events, accounting lines and the request key commit together, or roll back together. Posted sources have an additional unique constraint. Unexpected duplicate approval gets 409.

Amounts are integer RWF from 1 to 1,000,000,000 per operation. Invalid dates, unsupported methods, foreign loans, overpayments and insufficient recorded cash are rejected. No external payment provider is connected.

Success returns {replayed, state}. Expected errors include 400 validation, 401 unauthorized, 403 forbidden/origin/CSRF, 404 notFound, 409 conflict, 413 oversized body and 429 rateLimited. Never expose database errors or secrets to clients.

## Current boundaries

There are no endpoints for rewriting posted entries, deleting financial history, changing another person's password, public exports or unrestricted administration. Financial corrections and leadership transfer require separately designed, audited workflows. No real SMS provider is connected. Version 0.3 adds local test-code confirmation and recovery, described below.

## Version 0.3 — local verification and recovery

All routes below use local terminal codes only. The API never returns the code. The server rejects public origins and non-loopback connections while this mode is enabled.

User responses now include verified (boolean) and verificationMode (local or null). Existing accounts migrate as unconfirmed. All /groups routes require a completed local confirmation in addition to authentication and the existing role checks.

Authenticated, same-origin, CSRF-protected routes:

- POST /auth/phone/request — {}. Issue a verification challenge for the signed-in user's stored phone. Returns challengeId, expiresAt (Unix milliseconds), mode (local); already-confirmed accounts return alreadyVerified.
- POST /auth/phone/confirm — challengeId, code (six digits). Confirms only the signed-in account, rotates its session and CSRF token, and returns user, csrf and groups.
- GET /session — now also returns phoneChallenge with safe challengeId/expiry metadata for an active verification challenge, or null.

Public, same-origin routes:

- POST /auth/recovery/request — phone, optional language. Always returns the same response shape for eligible and ineligible accounts. Only previously locally confirmed accounts receive a terminal code.
- POST /auth/recovery/reset — challengeId, code, password. Enforces password length, consumes a valid recovery code once, updates the password hash and revokes every session belonging to that user. Returns {ok:true}; requires a fresh sign-in.

Requests are limited to three per phone/purpose/hour, a minimum 60-second resend interval and 20 per connection IP/hour. Each challenge permits five incorrect attempts and expires after 10 minutes. Resending invalidates the previous code. Successful confirmation or recovery consumes outstanding challenges for that phone. Verification and recovery are separate purposes. Password-reset attempts also pass through the authentication limiter.

New errors: phoneUnverified (403), codeInvalid (400), codeRateLimited (429), deliveryUnavailable (503 for authenticated verification). Recovery-delivery failure retains the generic response to avoid disclosing account eligibility.

The database adds nullable verified_at/verification_method fields without changing existing IDs, passwords or financial data; phone_challenges stores HMAC digests and attempt/expiry/delivery metadata. security_events records local confirmation and password-recovery events without codes or passwords. The HMAC key is ephemeral in local mode, so pending codes become invalid after a server restart.

GET /health identifies phoneVerification and accountRecovery as local-test, and smsDelivery as terminal. These are test features, not claims of real phone ownership.

## Version 0.4 workflows

Verified group members use the same Origin, CSRF and authorization checks as existing routes.

- POST /groups/:id/receipts: raw bytes, Content-Type, URI-encoded X-File-Name and Idempotency-Key; maximum 5 MB.
- GET or HEAD /groups/:id/receipts/:receiptId: private attachment; owner only before binding, payment owner and group leaders after binding.
- DELETE /groups/:id/receipts/:receiptId: uploader may discard an unattached draft.
- POST /groups/:id/notifications/read: JSON {ids:[...]}, at most 100 authorized notice IDs.

Additional group commands require Idempotency-Key:

- payment.submit accepts optional receipt ID, bound atomically.
- ledger.reverse: {id,reason}, chairperson only.
- reconciliation.record: {cash,momo,bank,note}, treasurer only; non-negative integer RWF values.
- announcement.publish: {title,message}, chairperson or secretary only.

Group settings accept trackContributions (boolean), dueDay (1..31), trackingStart (YYYY-MM). Responses add tracking, scoped notifications/read state, receipt metadata, leader reconciliation records and group-wide activityTargets by month. No SMS or push delivery is connected.

## Version 0.5 membership commands

Use the existing authenticated, CSRF-protected group commands route and Idempotency-Key. Only the current chairperson can execute these commands.

- member.role: {id,role,reason}; role is member, treasurer or secretary. The target must be another existing member.
- chair.transfer: {id,reason,confirm:true}; atomically makes the other member chairperson and the actor a regular member.
- invitation.revoke: {id}; expires an unused invitation belonging to the group.

Reasons require 5 to 300 trimmed characters. Member role changes apply on the next request, including existing sessions. Financial history remains unchanged. Group responses include invitations (id,phone,role,expiresAt) only for the current chairperson; invitation tokens are never returned by reads. Every successful change writes an audit entry.

## Version 0.6 expense commands

The existing group commands endpoint accepts:

- expense.request: {amount,payee,description}, group leaders only. Positive integer RWF amount; payee 1..100 characters; description 5..300 characters.
- expense.review: {id,decision,reason}, chairperson only; decision approved or rejected. Rejection reason requires at least five characters. Only pending requests can be reviewed.
- expense.pay: {id,reference}, treasurer only, after external payment; reference 1..100 characters. Only approved expenses can be paid, funds must be sufficient, and an already-used paid-expense reference is rejected.

All mutations require CSRF and Idempotency-Key. Group responses expose expenses to leaders only and add net confirmed expenses to groupTotals.expenses. Only confirmed payment posts a balanced group_expense debit/cash credit. ledger.reverse also supports paid expenses and preserves original entries.

## Version 0.7 membership status

member.status command: {id,status,reason}; current chairperson only. Target must be another regular member; status is active, suspended or exited. Reason requires 5..300 trimmed characters. Exited memberships cannot be reactivated. Existing data defaults to active.

Member responses include status and exitedAt. Suspended members may submit payment notices but cannot execute other commands. Exited members cannot execute financial commands. Loan approval/disbursement requires an active borrower. Exit is blocked by nonzero net contribution savings, pending payments, open loans or unpaid tracked contributions through the current month. Historical records and membership rows are preserved; future months after exit generate no contribution obligations.

## Version 0.8 withdrawal commands

- withdrawal.request: {amount,reason}, own member savings only; positive integer RWF and 5..300 character reason. Suspended members may request.
- withdrawal.review: {id,decision,reason}, chairperson only; pending requests only, rejection requires reason.
- withdrawal.cancel: {id,reason}, chairperson only; pending or approved requests, reason required.
- withdrawal.pay: {id,reference}, treasurer only after external payment; approved request, sufficient member savings and group cash, no open loans. Reference must be 1..100 characters and unique among paid withdrawals.

All commands share existing CSRF, authorization, transaction and idempotency protections. Member responses filter withdrawals to their own records. Paid withdrawals post member_savings debit/cash credit. groupTotals adds contributions and withdrawals; savings is net contributions less withdrawals. Paid withdrawal reversal is unsupported.

## Version 0.8.2 authentication

Phone verification is not required for group access. Accounts keep verified=false until an actual legacy verification occurred; no account is falsely marked verified. The local server defaults requirePhoneVerification to false, and phone request/confirm endpoints return 404 in that mode. The legacy option is used only in compatibility tests. Recovery routes retain local terminal codes, rate limits and session revocation.

## Version 0.8.3 current recovery behavior

With the default requirePhoneVerification=false, existing accounts are eligible for local terminal recovery codes even if verified=false. Unknown accounts still get the generic response and no code. The API never returns codes. Reset revokes every old session and leaves verification flags unchanged. With the legacy requirePhoneVerification=true option, only locally verified accounts remain eligible. All existing expiry, replay, resend and rate-limit rules still apply. The version 0.3 eligibility and group-verification text above describes historical behavior only.
