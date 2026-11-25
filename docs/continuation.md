# QuietQuorum — resume here

Last updated: November 24, 2026. User: Waleed. Workspace: `D:\Gemini Hackathon` on Windows/PowerShell. This file is a project handoff, not a promise that unrelated future chats automatically retain the conversation. Root `AGENTS.md` points here for future work in this checkout.

## Idea in plain language

QuietQuorum helps an organizer understand interview feedback without overlooking people whose needs differ from the majority. Original notes stay in the browser. Local AI suggests exact excerpts. The researcher removes identifying details and approves what may be sent to cloud AI. Cloud AI groups the approved evidence into draft findings with source links, participant counts, possible disagreement and omitted evidence.

Demo: four people prefer Saturday, but two cannot attend. A repeated comment by one person counts once. The product should help an organizer notice both the popular option and who it excludes. It is a research aid, not a voting system or a guarantee that AI interpretations are correct.

## What is already completed

- Research of organizer-announced hackathon winners and competing products: `docs/research-and-selection.md`. QuietQuorum selected for a focused audience, useful hybrid architecture and a clear demonstration; no guaranteed-win claim.
- Devpost registration verified and **one** project created: https://devpost.com/software/quietquorum. Implementation story, live demo and GitHub links saved and verified. Entry remains **INCOMPLETE SUBMISSION / draft**, last seen 2/5 steps done.
- Optional quota request submitted; Google Forms confirmed receipt. User consented to later identity verification. Quota approval/identity verification still pending. Do not submit duplicate requests or store identity documents here.
- Firebase project `quietquorum-358a5`, Spark/no-cost plan; web app, Gemini Developer API, Firebase AI Logic and App Check configured. Production reCAPTCHA Enterprise score-based provider registered for the two Firebase Hosting domains. No billing upgrade.
- Firebase CLI login completed and hosting deployment verified. Live app: https://quietquorum-358a5.web.app.
- Public MIT-licensed repository: https://github.com/waleedmustafa971/quietquorum, branch `main`.
- Working notes, manual excerpts, on-device extraction, explicit cloud approval, exact payload preview, cloud synthesis, citation checks, participant deduplication, uncovered evidence, source trace, human-reviewed export and stale-result blocking.
- Live on-device extraction and offline local inference verified using Firebase SDK inference-source metadata. Hosted cloud synthesis verified with production App Check and no debug token enabled.
- Offline app reload and IndexedDB persistence verified; responsive desktop/mobile layouts inspected.
- Meta Muse test API request succeeded on synthetic data as a developer experiment. Meta is **not** the app runtime. No private model key is stored in source. Never copy keys or old OAuth codes from the conversation into tracked files.
- Broad testing completed: 27 passing unit tests, 12 new browser checks, 6/6 local extraction probes, 12 baseline cloud calls and 16 revised-prompt cloud calls. Failures are preserved in `docs/evaluation/2026-11-24.md` and its results JSON.
- Fixed source-coverage omission for notes with unpunctuated lines. Revised the cloud prompt to distinguish different needs from counterevidence; semantic mistakes still remain.
- Coverage fix and revised prompt deployed on November 24 after broad testing. The service worker can keep an already-open tab on the previous build; close all app tabs and reopen to activate a waiting update. Add an explicit update notification if time allows.

## Current release and remaining work

November 25 release `964a7ca` is published on main. Firebase Hosting serves `index-B6p3kaZz.js`. The previous positional participant model, JSON-only export and missing correction workflow have been replaced. Researchers can link repeat interviews, correct or create findings, review roles and preview printable HTML or JSON. See [readiness](../HACKATHON_READINESS.md) and [held-out results](evaluation/readiness.md). All 61 automated tests, 16 browser workflow checks and the public GitHub Actions build passed.

A hosted rehearsal exposed a stalled cloud request after first using the app offline. Separate local/cloud SDK initialization now defers Enterprise App Check setup to cloud access. The development reconnect exercise sent a single approved fictional excerpt and obtained a confirmed cloud result in 2.25 seconds. Raw notes remain on device.

Remaining entrant work includes real prospective-user feedback, completion of Devpost additional information, verification of required personal declarations and confirmation of final submission. Keep the existing draft and preserve its incomplete state until these are satisfied.

Recommended target: Best Web/Chrome App ($3,000). The event also awards a $10,000 Grand Prize and gives cross-platform apps strong consideration for it, while allowing outstanding single-platform winners. Do not add rushed mobile platforms at the expense of a polished, honest web demonstration. Winning remains uncertain.

## Dates and official pages

- Official event: https://firebasehybridaihackathon.devpost.com/.
- Submission deadline: November 30, 2026, 14:00 PST = 22:00 UTC = **December 1, 02:00 Dubai**.
- Internal target: November 30, 15:00 Dubai.
- Final optional quota request deadline: November 25, 22:00 Dubai; already submitted. Accounts scheduled November 27, subject to approval.
- Devpost manage: https://devpost.com/submit-to/31808-buildhybridai-2026/manage/submissions/1318225-quietquorum/project-overview.
- Judging: technological implementation, complete product design, credible impact for a specific audience and quality/originality of idea. See official event page; no reliable win probability is known.

## Technical restart notes

- `npm ci`, `npm run dev` (127.0.0.1:5173), `npm test`, `npm run build`, `npm run preview`.
- `.env.local` is ignored and holds Firebase public web configuration/site key. Local debug is development-only plus localhost-guarded. Credentials stay in standard CLI/keyring storage; don't print them.
- Deploy: `npx firebase-tools deploy --only hosting --project quietquorum-358a5`. Verify the remote release and app. Firebase CLI 15.37.0 sometimes emits a Windows Node/libuv assertion on exit after a successful operation.
- Real Git: `C:/Program Files/Git/cmd/git.exe`. The first `git` in PATH may be a no-op. GitHub CLI is authenticated to `waleedmustafa971`; check current state before use.
- Chrome: `npx --yes --package=chrome-devtools-mcp@latest chrome-devtools list_pages`, then commands using fresh page IDs. Existing daemon uses autoConnect. User enabled remote debugging at 127.0.0.1:9222. Native browser MCP tools were not hotloaded; official CLI works.
- Browser evaluation helpers are in `scripts/browser-*.js`; run AI helpers on the development origin. They use synthetic fixtures, not real notes. The manual workflow helper deliberately only runs against isolated `http://127.0.0.1:4174` and replaces that test origin's study.
- **Do not assume `localhost:4173` is QuietQuorum.** An unrelated app was observed on the IPv6 localhost origin. Use the exact 127.0.0.1 URL and inspect the page first.
- Local reports/screenshots/helpers are in ignored `.local/`; sanitized evaluation evidence is committed under `docs/evaluation/`.
- Firebase runtime must remain in `src/inference.ts`; raw notes use ONLY_ON_DEVICE and reviewed excerpts use ONLY_IN_CLOUD. No automatic raw-note cloud fallback.
- Stable pseudonyms support several interviews per participant. Storage is local and unencrypted. Conflicting tab writes are rejected. There is no account sync. Citation validity does not prove correct interpretation. Arabic passed one exploratory probe; full multilingual support is not established.

For current factual completion flags, consult `submission/project.json`. Update this handoff at the end of the next work session.

The post-deployment rehearsal on November 25 confirmed three exact quotes in 131.1 seconds with a failed network probe, followed by four cloud findings from 15 approved excerpts in 26.7 seconds with production App Check. Saturday showed four supporting participants and two unable to attend. Researcher correction, reviewed HTML download and stale-export blocking passed in the hosted UI. The 103.262-second English demo uses genuine footage with shortened waits labeled on screen.

The finished [public YouTube demo](https://youtu.be/ZtYqxEungjs) is on Musashi. Public attribution and persisted Devpost video URL and story were independently checked. Final submission remains pending.
