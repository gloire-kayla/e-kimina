# Testing and current limitations

On 27 October 2026, all 65 backend tests and 22 mobile tests passed (87 total). Tests cover roles, accounting, retry identities, privacy, recovery and explicit online-mode security boundaries. Android/iOS JavaScript exports also passed with a placeholder HTTPS origin. A placeholder export is not a live backend or an online APK.

The branded internal Android APK was signed, installed on a Pixel 8 and visually checked. Earlier device smoke checks passed startup, sign-in, dashboard, group creation, CSV sharing-sheet opening and session restoration. This is not a claim that every financial or recovery workflow passed on-device.

Remaining device checks include receipt selection/preview, recovery UI, treasurer loan disbursement, CSV opening in a receiving app, interrupted requests and cookie-expiry behavior. No physical iOS device was tested.

The free static demo is an older, narrower prototype. Its browser role selector is not authentication. Validation of full-backend permissions does not prove security for a browser-only simulation.

[Full website QA report](../e-kimina/QA-REPORT.md) and [mobile evidence](../e-kimina-mobile/BUILD-STATUS.md) retain detailed results. No NISR methodology, dataset analysis or final judging-compliance pass is claimed.
