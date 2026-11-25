# Development and deployment

The [README](../README.md) covers the credential-free example. Use Node 24 and the checked-in lockfile. For secure local origins, open the exact 127.0.0.1 URL printed by Vite. Each origin has its own study.

## Firebase AI Logic and App Check

1. In your Firebase project, register a web app and enable Firebase AI Logic with the Gemini Developer API.
2. Register reCAPTCHA Enterprise App Check for the web app. Allow the hosting domains on the site key and enable enforcement for AI Logic.
3. Copy `.env.example` to `.env.local` and populate only Firebase web client configuration and the Enterprise public site key. A Vite variable ships to the client.
4. For localhost development only, set `VITE_APPCHECK_DEBUG=true` and register the SDK-generated debug token privately. Debug mode requires both a development build and a loopback hostname. Do not paste tokens in issues or documentation.
5. Leave `VITE_FIREBASE_MODEL` empty for the SDK default or choose a supported cloud model. The runtime verifies inference-source metadata and validates all accepted output.

Read [Firebase's hybrid web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started) for device prerequisites and applicable browser flags. Use **Settings & AI setup** to check the browser model and prepare it before an offline session.

## Release

Run `npm test`, `npm run build`, and the [browser checks](../TESTING.md). Build using the production App Check site key. Deploy this project's verified bundle with `npx firebase-tools deploy --only hosting --project quietquorum-358a5`. Inspect the public bundle and exercise a real request from a fresh browser context. An already-open tab can retain the previous service worker until closed and reopened.

The app uses the Spark plan. Raw-note inference never falls back to cloud, even if the local model cannot initialize. A cloud outage leaves manual findings and report review available. [Architecture](../ARCHITECTURE.md) · [Historical evaluation](evaluation/2026-11-24.md) · [Current evaluation](evaluation/readiness.md)
