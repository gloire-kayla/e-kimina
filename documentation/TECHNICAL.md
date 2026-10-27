# Technical architecture

## Full application

Browser frontend -> Node.js HTTP API -> SQLite database.
React Native / Expo mobile application -> same API -> same database.

The backend enforces permissions, account/group isolation, strict Origin/Host checks, CSRF tokens and HttpOnly session cookies. Passwords use salted scrypt hashes. Financial actions use request keys to protect retries from duplicate posting. Receipt data and private records remain outside public source snapshots. No money is transferred by the application.

Use Node.js 24 or newer. From the repository root:

~~~sh
node e-kimina/server.mjs
node --test e-kimina/tests/*.test.mjs
node --test e-kimina-mobile/tests/*.test.mjs
~~~

Start the website at http://127.0.0.1:4173. Mobile development requires dependencies installed in e-kimina-mobile. Native Android builds additionally require Android Studio, SDK tools and Java. See the project READMEs for platform details. The Windows APK launcher has Windows-specific paths; the backend and mobile source are separate from that convenience launcher.

[API reference](../e-kimina/API.md) describes routes and authorization; some older introductory wording predates native integration. [Hosted-backend preparation](../e-kimina/DEPLOYMENT.md) covers HTTPS and persistent storage. No hosted backend has been deployed.

## Static demonstration

The free demonstration is a self-contained HTML/CSS/JavaScript page, using localStorage for fictional records. Static hosting needs no Node server, SQLite database or secret credentials. It cannot provide real multi-user authentication or cross-device records. The full application and this demo must not be described as equivalent deployments.
