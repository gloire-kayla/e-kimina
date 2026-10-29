# e-Kimina documentation

Start here. Updated 28 October 2026.

- [Demo access and fictional profiles](DEMO-ACCESS.md)
- [User guide](USER-GUIDE.md)
- [Architecture and setup](TECHNICAL.md)
- [Testing evidence and limitations](TESTING.md)
- [Deployment status](DEPLOYMENT.md)
- [Completed demonstration video: 2:49 WebM](video/README.md)
- [Screen-recording walkthrough](RECORDING-SCRIPT.md)
- [Evidence and methodology](EVIDENCE-AND-METHODOLOGY.md)
- [Reproducible published-data analysis and chart](../analysis/README.md)
- [Submission checklist](SUBMISSION-CHECKLIST.md)

## Project

e-Kimina helps Rwandan savings groups record external contributions and member loans. Groups choose contribution amounts, rates and repayment periods. The full website/mobile application uses server-enforced roles; treasurers confirm receipt of money before payments count. Languages: Kinyarwanda, English and French.

## Two separate versions

The free public demonstration in ../docs/index.html uses fictional profiles and browser storage only. It has no real authentication, shared server or real payment processing. Its role selector illustrates workflows; it is not a security boundary. Use fictional data only.

The full application in ../e-kimina and ../e-kimina-mobile has a Node.js/SQLite backend, real sessions and authorization. The installed APK currently needs the local backend and USB forwarding. It is not connected to the static public demo.

## Submission status

This folder provides technical and user documentation, a sourced evidence brief and a submission checklist. The evidence brief uses published FinScope aggregate findings; no respondent-level NISR dataset analysis has been implemented. The final analytical work and submission narrative remain outstanding. A user-recorded walkthrough has been shortened to 2:48.87, checked, and saved under video/. Do not describe this package as a complete hackathon submission.
