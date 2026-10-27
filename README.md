# e-Kimina

A savings and lending platform for Rwandan ibimina, with a website and a native Android/iOS app. Available in Kinyarwanda, English and French.

## Documentation and free demonstration

- [Documentation folder](documentation/README.md): user guide, demo access, architecture, test evidence and recording walkthrough.
- [Free demo source](docs/index.html): fictional data in browser storage; no backend or real login. Public deployment is being prepared.

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

This repository contains source code and documentation. Local databases, account records, environment secrets, dependencies, generated bundles and release signing files are excluded. The agreed local-development workflows are implemented, with 83 automated tests passing. See project documentation for device QA and deployment limitations.

This is a source backup snapshot. The original development folders remain in place on the computer. Future changes must be copied into this repository before committing and pushing another backup.
