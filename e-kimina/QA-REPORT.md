# e-Kimina QA report — 22 October 2026

Build: 0.8.1. Scope: local development website; local test verification codes.

## Verified

The complete Node test suite passes 59 tests, with no failures. It covers authentication, local code verification and recovery, CSRF, group isolation, invitation roles, approval permissions, transaction rollback, idempotency, balanced journal entries, loan schedules, repayments, receipt access and backups, deadlines, corrections, expenses, membership changes and savings settlement.

Rendered-HTML tests exercise seven workspace pages across four roles and three languages (84 combinations), plus savings/count regressions and escaped dialog data. These execute the application's rendering functions in a controlled JavaScript test context. They do not simulate a real browser, CSS layout, navigation events or form submissions.

Additional settlement coverage confirms that an open loan application blocks withdrawal payment. Existing settlement tests verify overdraw protection, repeated-payment safety, cancellation and exit after settlement.

## Fixed

- Member dashboard savings now include withdrawals and reversed contributions.
- Active-member counts exclude suspended and exited memberships.
- Withdrawal audit actions have Kinyarwanda, English and French labels.

## Pending verification

No browser is connected to this session. Real browser checks remain required for registration/recovery, role management, status changes, expenses, settlement, receipt downloads, CSV downloads, keyboard navigation, phone widths and all three languages. The earlier receipt workflow browser check is historical evidence, not validation of this build.

Review translation quality with fluent Kinyarwanda and French speakers. Automated key parity does not establish linguistic quality.

Before a pilot: complete the pending browser flows, independent security review, backup/restore operating procedure, real phone ownership verification, production hosting and privacy documentation. No deployment or live SMS connection was performed.

## Functional limits

Paid withdrawal correction remains unsupported. Profit distribution, interest sharing, automatic debt offsets and rejoining after exit remain unsupported. Avoid recording a mistaken paid withdrawal: it cannot be repaired through the normal UI yet. These limits must be resolved or explicitly accepted for any pilot scope.

## Re-run

With Node.js 24 or newer, run `node --test tests/*.test.mjs` from this project folder. Use synthetic test data. To manually test, restart Start-e-Kimina.cmd and open http://127.0.0.1:4173.

## Update: version 0.8.2

Phone verification is disabled by default as requested. New integration coverage verifies immediate group creation/access without a challenge, disabled verification endpoints, and sign-in to an existing account. Render coverage verifies an unverified account reaches its workspace. Password recovery still uses terminal test codes.

The sidebar has viewport-bounded height, vertical overflow scrolling and non-shrinking children so lower navigation/profile content remains reachable on short screens. Real-browser scroll and mobile visual checks remain pending.

## 25 October 2026 — mobile completion and recovery compatibility

Website/backend: 61 tests passed. Mobile: 22 tests passed against this same backend. New mobile integration checks cover the complete expense and withdrawal lifecycle, balance counts, linked correction, settings and contribution plans, announcements/read state, private CSV scopes, balanced journals, session revocation and password recovery for an unverified account. Recovery never returns the code, invalidates old sessions, rejects replay and does not mark a phone verified. Physical-device evidence and remaining device limitations are tracked in ../e-kimina-mobile/BUILD-STATUS.md.

## Online preparation: 27 October 2026

65 backend tests passed; 22 mobile tests passed. New deployment tests verify explicit online opt-in, HTTPS/Secure-cookie enforcement, Host/Origin/CSRF rejection, no online terminal-code delivery and spoof-resistant configured proxy rate limiting. Frontend syntax checks and Android/iOS JavaScript exports passed using a non-live placeholder HTTPS origin. Deployment has not occurred; live HTTPS, provider proxy configuration, persistent storage/backup restoration and unplugged-phone acceptance remain unverified.
