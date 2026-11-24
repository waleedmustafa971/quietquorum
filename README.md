# QuietQuorum

Turn private interview notes into evidence-backed findings without losing the voices that disagree.

[Open the live prototype](https://quietquorum-358a5.web.app) · [Devpost project](https://devpost.com/software/quietquorum)

QuietQuorum is a desktop Chrome research app for small community organizations. It keeps original notes in IndexedDB, extracts exact quotes with on-device Firebase AI Logic, and sends only approved excerpts to cloud Gemini for cross-interview synthesis. Findings link to supporting and conflicting evidence; participant counts are computed in code, and uncited excerpts stay visible.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The fictional workshop study works without AI credentials. In **Review evidence**, approve the example excerpts and choose **View example findings**. These findings are explicitly labeled as written examples, not live AI.

For live AI, copy `.env.example` to `.env.local` and configure your Firebase web app, AI Logic and App Check. See [setup](docs/development.md). Never place a private Meta or other model API key in a `VITE_` variable: Vite exposes those variables to browsers.

```sh
npm test
npm run build
npm run preview
```

The production build includes a service worker for offline capture and review after the first successful online load. The development server does not install that service worker.

## What is implemented

- Local interview capture, text-file import, private name/contact fields, and deletion.
- Manual exact-quote cards and Firebase on-device extraction using `ONLY_ON_DEVICE`.
- Editable shared excerpts; edits revoke approval.
- A preview of the exact evidence payload before any cloud synthesis.
- Firebase cloud synthesis using `ONLY_IN_CLOUD`, strict citation checks, supporting/conflicting participant counts, and uncovered evidence.
- Frozen result snapshots, stale-result warnings, human review, and JSON report export excluding original notes and private identity fields.
- Responsive interface, native accessible dialogs, and an offline application shell.

Live verification status and remaining release work are recorded in [development notes](docs/development.md). A successful build or written example is not proof of live inference.

## Data boundaries

Local data is not encrypted by this app. It belongs to the current browser profile and origin; clearing browser data removes it. Use one interview note per participant: separate notes count as separate participants. Redaction is manual and contextual identifiers may remain. Review the research question and the entire payload before sending. The app does not automatically send notes on reconnect.

A citation confirms provenance, not that an AI interpretation is correct. Counts describe the supplied interviews, not the wider population. Use synthetic data until you have reviewed the service terms and participants' consent.

## Project and submission

[Devpost project](https://devpost.com/software/quietquorum) exists as an incomplete draft. The optional quota request was submitted and its confirmation recorded. Identity verification and account approval remain pending. Firebase project: `quietquorum-358a5`, Spark plan. The public Firebase Hosting deployment and live cloud inference with production App Check were verified. Demo video, broader held-out evaluation and final hackathon submission remain outstanding.

The final deadline is November 30, 2026 at 22:00 UTC / December 1 at 02:00 Dubai. Our internal target is November 30 at 15:00 Dubai.

## Materials

- [Research and selection](docs/research-and-selection.md)
- [Product scope](docs/product-plan.md)
- [Development and validation](docs/development.md)
- [Devpost draft](docs/devpost-draft.md)
- [Registration and quota](docs/logistics.md)
- [Submission state](submission/project.json)
- [Fictional interviews](fixtures/community-workshop.json)

MIT licensed. Local evidence, browser helper files and evaluation output in `.local/` are ignored by Git.
