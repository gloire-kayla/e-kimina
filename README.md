# e-Kimina

A savings and lending platform for Rwandan ibimina, with a website and a native Android/iOS app. Available in Kinyarwanda, English and French.

## Submission summary

e-Kimina explores digital recordkeeping for existing savings groups: contributions, member loans and treasurer confirmation of externally received payments. Its intended contribution is clearer records and accountability, aligned with NST2's digital-transformation and financial-sector priorities. Increased savings or reduced poverty has not been demonstrated.

### Data and information communicated

The project uses published aggregate findings from Access to Finance Rwanda's **FinScope 2024**, available through the [NISR study catalogue](https://www.microdata.statistics.gov.rw/index.php/catalog/120) (RWA-NISR-FINSCOPE-2024-v01). [Original report](https://statistics.gov.rw/sites/default/files/documents/2024-09/Rwanda-Finscope-2024-Report_compressed.pdf#page=45), Figure 35, printed page 45.

The [included input CSV](analysis/inputs/saving-channels.csv) contains four manually transcribed channel comparisons for 2020 and 2024. The [analysis script](analysis/analyze.py) subtracts the earlier percentage from the later percentage and generates [results](analysis/results/comparison.csv) and a [chart](analysis/results/saving-channels.svg). Run `python analysis/analyze.py` with Python 3; no extra packages are required.

Savings-group use is reported at 55% in 2020 and 52% in 2024, a change of -3 percentage points. Groups remain the highest-use channel among the four selected channels. This motivates investigating an existing activity, not a forecast of app adoption. Channels overlap; these percentages must not be added. No respondent microdata, significance testing, causal findings or impact estimates are claimed. [Methods and limitations](analysis/README.md).

The original report is linked rather than copied into this repository. The demo's people and transactions are fictional and are separate from the official aggregate figures. The live demo illustrates group workflows; the survey analysis is provided in the repository, not displayed within its dashboard.

### How to interact

Open the [public demo](https://gloire-kayla.github.io/e-kimina/). No login or sample password is required. Use **Try a role** to explore fictional member and leadership views, then inspect contributions, loans and reports. Use **Reset demo** to restore the sample state. Choose Kinyarwanda, English or French. [Demo profiles and walkthrough](documentation/DEMO-ACCESS.md).

This is a lightweight, browser-only demonstration: changes stay in the current browser and role switching is not authentication. The full backend/mobile source is included separately; the installed internal Android APK still needs the local API and USB forwarding. It is not connected to the public static demo. iOS source/export support does not constitute physical iOS testing.

### AI assistance and responsibility

OpenAI Codex/ChatGPT assisted with implementation, debugging, tests, documentation, published-data analysis and video processing; an AI image-generation tool assisted with the app icon. The submitted work should be reviewed and understood by the participants, who remain responsible for its correctness, sources and declarations. This statement discloses assistance; it does not claim that participant review has already been completed.

### Submission materials

- Code: [website](e-kimina/), [mobile](e-kimina-mobile/) and [analysis](analysis/).
- Data and source: [input CSV](analysis/inputs/saving-channels.csv) and the NISR/report links above.
- Screen recording: [2:49 WebM](documentation/video/e-kimina-demo-under-3-minutes.webm).
- Eligibility: both members' student cards or other official proof are required by webinar 2, slide 17; these have not yet been included in this prepared package. Confirm the permitted submission channel with the organisers before publishing personal documents.
- This README is the concise documentation entry point. Additional guides below are supporting references.

## Documentation and free demonstration

- [Documentation folder](documentation/README.md): user guide, demo access, architecture, test evidence and recording walkthrough.
- [Free demo source](docs/index.html): fictional data in browser storage; no backend or real login. [Public demo](https://gloire-kayla.github.io/e-kimina/) deployed successfully through GitHub Pages; the user confirmed the demo opens in Chrome.

- [Completed demonstration video](documentation/video/README.md): 2:49 WebM, below the three-minute limit.

## Programming languages and technologies

- **JavaScript:** website backend and browser functionality; mobile application using React Native and Expo.
- **HTML and CSS:** website structure, layout and styling.
- **SQL with SQLite:** persistent storage for the full application's records.
- **Python 3:** reproducible analysis of published FinScope figures.
- **Node.js:** runtime for the website backend and automated JavaScript tests.

Interface languages: **Kinyarwanda, English and French**.

## Projects

- [Website](e-kimina/README.md): Node.js backend, SQLite storage and browser application.
- [Mobile app](e-kimina-mobile/README.md): Expo/React Native app using the website API.
- [Mobile validation status](e-kimina-mobile/BUILD-STATUS.md).

Groups choose contribution amounts, monthly interest rates, flat or reducing-balance interest, and repayment periods. Payments take place outside e-Kimina and are recorded after the appropriate confirmation. Phone verification is disabled; password recovery uses local development codes.

## Local setup

Use Node.js 24 or newer. Start the website with `node e-kimina/server.mjs`, then follow the mobile README to install dependencies and launch Expo. Keep the two project directories beside each other; mobile integration tests import the website backend.

```sh
node --test e-kimina/tests/*.test.mjs
node --test e-kimina-mobile/tests/*.test.mjs
```

This repository contains source code and documentation. Local databases, account records, environment secrets, dependencies, generated bundles and release signing files are excluded. The agreed local-development workflows are implemented, with 87 automated tests passing. See project documentation for device QA and deployment limitations.

This is a source backup snapshot. The original development folders remain in place on the computer. Future changes must be copied into this repository before committing and pushing another backup.
