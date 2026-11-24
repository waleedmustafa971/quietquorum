# Development and verification

QuietQuorum is a working prototype. Verification below used fictional interviews on November 24, 2026; it is not a model-accuracy study or evidence of real-world impact.

## Local setup

Use Node.js 24 or a compatible current Node release, then `npm ci` and `npm run dev`. The written example needs no Firebase configuration. Original notes are stored in IndexedDB for the current origin and browser profile. Development, preview and hosted origins have separate workspaces.

For live inference, copy `.env.example` to ignored `.env.local` and add your Firebase web configuration. Enable Firebase AI Logic with the Gemini Developer API. Enable App Check enforcement and register your web app with a reCAPTCHA Enterprise score-based site key. Allow your actual hosting domains on that key. Put the public site key in `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.

For localhost development only, set `VITE_APPCHECK_DEBUG=true` and register the generated debug token in Firebase App Check. Treat that token as a secret. The debug path is guarded by Vite's development flag and a localhost hostname check, so a production build does not enable it. Do not place private model keys in any `VITE_` variable.

`VITE_FIREBASE_MODEL` is an optional supported cloud-model override; leaving it empty uses the Firebase SDK default. Local extraction uses `ONLY_ON_DEVICE`; synthesis uses `ONLY_IN_CLOUD`. Both reject results without the expected `inferenceSource` metadata. No raw-note cloud fallback is implemented.

Run `npm test` and `npm run build`. `npm run preview` serves the production build. The PWA caches the application shell after its first successful online visit. Offline model inference additionally requires compatible desktop Chrome, sufficient hardware and an already downloaded model. Manual capture and review remain available without local AI.

## Verification completed

| Check | Observed result |
| --- | --- |
| Unit tests | 7 passed: payload boundaries, exact quotes, citation validity, unique participant counts, omitted passages, stale export, written-example guard. |
| Production build | TypeScript and Vite build passed; offline assets generated. |
| Dependency audit | Zero reported vulnerabilities after dependency overrides. This is not a security audit. |
| Browser workflow | Approval, written findings, 4/2 participant counts, source viewing, reviewed export, edit revocation and stale-export blocking passed. |
| Responsive UI | Inspected desktop and 390px mobile layouts; no horizontal overflow in the tested viewport. |
| Offline application | Production preview reloaded with network requests blocked; app and stored edits survived. The browser's online indicator was not a reliable signal under emulation. |
| Live cloud SDK | Real Firebase AI Logic response verified with cloud inference metadata. |
| Live cloud UI | Approved 15 synthetic excerpts; returned four findings in about four seconds. Saturday finding showed four supporting and two conflicting participants. |
| Hosted cloud UI | Production App Check registration and real cloud synthesis verified at https://quietquorum-358a5.web.app. Four findings returned in 4.2 seconds; no debug App Check token enabled. |
| Hosted offline reload | Public deployment reloaded successfully with network requests blocked and an active service worker. |
| Live local SDK | Exact quotes returned through Firebase AI Logic with on-device inference metadata after model download. |
| Offline local SDK | A synthetic note returned an exact quote while network requests were blocked. |
| Revised local prompt/schema | Both positive preference and negative constraint returned for a two-sentence synthetic probe. |
| Meta development probe | Muse API test succeeded on fictional data. This optional developer experiment is separate from the Firebase runtime. |

Local test scripts, screenshots and result evidence are in ignored `.local/`. They are not application dependencies or public submission assets. Firebase CLI authentication succeeded and the hosting site was listed successfully. On this Windows installation, Firebase CLI 15.37.0 sometimes prints a Node/libuv assertion while exiting after a successful operation; verify the operation's remote result instead of interpreting that exit message alone.

## Observed limitations

An early local extraction omitted a negative constraint. The revised prompt and JSON schema recovered both sentences in a small follow-up, but this does not establish reliable recall. The interface therefore displays source passages not fully covered by cards and allows manual excerpt creation.

The live cloud UI run correctly identified the main 4/2 split, but incorrectly labeled a Saturday exclusion as counterevidence to weekday availability. Citation-ID validation cannot detect semantic mistakes. All findings remain drafts, with source links, uncovered evidence and explicit human review before export. Do not export a result merely because its citation IDs are valid. Broader held-out evaluation and a richer correction workflow remain release work.

Sentence coverage is a heuristic, not a language-aware segmentation guarantee. One note represents one participant; duplicate participant interviews would inflate counts unless combined first. Storage is local and unencrypted, has no account sync or backup, and is not coordinated across multiple tabs. Clearing browser data deletes the workspace. A reviewed report excludes original notes and private identity fields, but shared excerpts and the research question can still contain identifying information if the researcher leaves it in.

Stopping a request stops waiting and discards late results; it does not promise cancellation of a model download or a remote request already sent. First model download can be lengthy. Offline capture does not imply that cloud synthesis is available offline.

## Deployment and final submission

Deployment configuration is `firebase.json` and `.firebaserc`. Build with the production App Check site key, then run `npx firebase-tools deploy --only hosting --project quietquorum-358a5`. Confirm a real cloud request from the hosted origin before calling production inference verified. Keep App Check enforcement enabled.

The prototype was deployed successfully to https://quietquorum-358a5.web.app on November 24, 2026. A score-based Enterprise key was registered for the `quietquorum-358a5.web.app` and `quietquorum-358a5.firebaseapp.com` domains. The project remains on Spark with no billing upgrade. An initial request immediately after App Check registration returned "App not registered"; a later request succeeded after propagation. The hosted test did not repeat the incorrect weekday counterevidence seen in the earlier development run; variability still warrants human review.

The source is published at https://github.com/waleedmustafa971/quietquorum. Devpost's implementation story and demo/source links are saved. The source of truth for completed logistics is `submission/project.json`. Before final contest submission: record the working demo video, evaluate unseen scenarios, verify outstanding eligibility declarations, and complete Devpost's final Submit step. The existing Devpost project is a draft.
