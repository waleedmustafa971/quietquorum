# QuietQuorum release checklist
# QuietQuorum hackathon readiness

## Executive summary

QuietQuorum can now take a researcher from private interviews to a corrected, reviewed, printable report. A second interview from the same person no longer inflates participant counts. The release ran in desktop Chrome, preserved a corrected study through a network-blocked reload, and passed the review/export workflow. Model interpretations still need scrutiny. The Devpost project remains a draft.

## Baseline and implementation checklist

Baseline commit `b1134b9` was rebuilt from a Git archive against the locked dependencies. All 27 original tests and the production build passed. The repository had four commits, an existing hosted PWA, live Firebase AI Logic verification and diagnostic evaluations. Its main engineering gaps were positional participant IDs, uneditable findings and JSON-only export. There was no configured lint task.

| Priority | Implemented and verified | Evidence |
| --- | --- | --- |
| P0 | Stable pseudonyms, explicit linking and splitting, migration and overlap reporting | Domain and IndexedDB integration tests, Chrome reassignment check |
| P0 | Create, correct, remove and review findings, with support, conflict, neutral and uncertain citations | Real editor workflow, invalid reference tests, 30-entry local revision history per analysis |
| P0 | Exact HTML/JSON report previews, printable layout, stale and review gates | Preview/download byte comparisons, escaped-text and private-field tests |
| P0 | Preserve forced inference modes, provenance and explicit sending | Mocked SDK boundary assertions, real device and cloud calls |
| P1 | Availability check, user-triggered model preparation, differentiated quota errors and safe abandonment | Released runtime, unavailable-model tests and six real quota errors |
| P1 | Held-out suite, plain-summary comparison, CI, first-time demo entry and documentation | 22 scenarios, evidence bundle and GitHub Actions workflow |
| P1 | Reproducible recording guide, English narration and prospective-user protocol | [Demo materials](docs/demo/README.md) |
| P2 | Optional encryption investigated and deferred | [Storage and threat model](PRIVACY.md) |

## Architecture decisions and changed files

- `src/domain.ts` now owns version 2 participant allocation, snapshot validation, review, citations, revision history and the allowlisted report projection. Working records retain source provenance. Migrated v1 records keep their original ordinal pseudonyms. `src/storage.ts` adds transactional conflict detection and a pre-send/pre-download revision check.
- `src/App.tsx`, `src/FindingEditor.tsx` and `src/style.css` implement participant selection, local/cloud status, researcher corrections, review, coverage and manual analysis. `src/ReportPreview.tsx` and `src/report.ts` implement exact previews and standalone script-free HTML.
- `src/inference.ts` keeps the two Firebase AI Logic paths separate, checks source metadata, reports setup progress and handles quota or connectivity errors. No new backend or production AI provider was added.
- `src/*.test.ts`, the lockfile and `package.json` cover unit, storage and SDK-boundary checks with one new development-only IndexedDB test dependency. `.github/workflows/check.yml` runs the suite and build with no production credentials.
- `fixtures/held-out.json`, the new browser scripts and evaluation summary script preserve test inputs, expected outcomes and reproducible measurements. `docs/evaluation/readiness*` records all new live attempts. The prior diagnostic results remain available.
- Root documentation, `docs/demo/`, the Devpost draft text, handoff and submission record describe the shipped workflows, screenshots, limitations and pending declarations. [Architecture](ARCHITECTURE.md) · [Testing](TESTING.md)

## Verification and model quality

| Check | Actual result |
| --- | --- |
| Automated suite | 61 passing. 30 domain/privacy/correction tests, 26 research/report checks including the 22 fixture boundaries, three emulated IndexedDB integration tests and two mocked SDK tests. |
| Browser | 16 checks passed against the production bundle. Exact preview bytes matched both downloads. Returned interviews, manual analysis, review invalidation and stale export were exercised. A separate offline reload retained the edited finding and five-person count. |
| Build | Strict TypeScript and Vite production build passed. Workbox precached seven resources. No standalone lint script is configured. |
| Dependency and repository checks | npm audit reported zero known advisories. A local pattern scan found no matches for selected key, private-key and token signatures in four historical commits (46 unique blobs) or the scanned nonignored release files. Private environment files and developer captures are ignored. This is a scoped scan. |
| Model evaluation | 43/43 local calls completed. All 44 quotes were verbatim. 42/43 target quotes were standalone, and the remaining target was bundled with irrelevant text. 25 successful cloud runs produced 53 valid citation assignments, with six additional rate-limit failures. |
| Timing | Median 4.87 s local, 2.06 s cloud, 1.62 s plain cloud summary. Successful cloud calls ranged up to 24.22 s. One machine and small fictional packets limit interpretation. |

One minority constraint was visible only in a citation and had a questionable conflict role. The plain summary also counted the repeated contributor correctly. The demonstrated engineering advantage is the ability to inspect, correct and re-review the report. The evaluation does not establish general superiority in summarization. [Metrics, methods and raw results](docs/evaluation/readiness.md)

## Privacy, security and unresolved issues

Raw notes use local-only inference because participants can disclose information they would never authorize for cloud processing. Local model unavailability leads to manual selection. The cloud receives the reviewed question and approved excerpts only after confirmation. Both paths check inference-source metadata. App Check remains enabled. Human text, including titles and edited wording, can disclose contextual identifiers. Reports require exact preview and human review.

Storage is unencrypted and tied to one browser profile. Simultaneous tab writes are rejected on revision conflict without merging. Already-open tabs can retain the previous app until closed. The in-memory Stop waiting control discards late results without guaranteeing provider-side cancellation. Participant identity depends on the researcher's assignment. Uncertainty and mixed positions can be recorded, but an AI model can miss either. Device diversity, assistive-technology testing and prospective-user outcomes remain limited. [Security review](SECURITY.md) · [Privacy](PRIVACY.md)

## Deployment and competition checklist

| Requirement | Status |
| --- | --- |
| Web/Chrome runtime, on-device and cloud Firebase AI Logic, App Check | Implemented. The SDK confirms the placement of successful results. The browser manages its Nano model; inference metadata alone does not independently attest the Nano 4 version number. |
| Public free app | Verified production bundle `index-B6p3kaZz.js` deployed to the existing Firebase Hosting project. Keep access available throughout judging, ending December 16, 2026. Cloud access remains subject to provider quota. |
| Public source, license and reproducible instructions | Existing public GitHub repository, MIT license, English setup, no-credential demo and CI configuration. |
| Period and third-party disclosure | Include the work completed during the contest and disclose applicable pre-existing components and dependencies. Entrant ownership, permissions and representations require the entrant's confirmation. |
| English demonstration | The [English demo](https://youtu.be/ZtYqxEungjs) is public on Musashi. Its duration is 103.262 seconds. The video URL and updated story were verified after reopening the existing Devpost draft. |
| Eligibility, team and final entry | Registration and existing draft verified previously. Age, excluded affiliations/employment, other eligibility and ownership declarations remain with the entrant. No final submission confirmation. |

The rules accept Web/Chrome as a platform and require runtime use, access for judging, source, license and submission materials. Award decisions and entrant eligibility are determined by the organizers. [Official competition rules](https://firebasehybridaihackathon.devpost.com/rules)

## Four judging criteria

| Criterion | Demonstrated evidence | Remaining uncertainty |
| --- | --- | --- |
| Technological implementation | Genuine local and cloud Firebase inference; explicit privacy boundary; frozen payload; tested review, migration and export. | Device availability, latency, quota and semantic errors constrain live use. |
| Design | A researcher can move from a note to a cited claim, correct it, see who is represented and export a reviewed document. | First-time task success has not been measured with prospective users. |
| Potential impact | A facilitator can locate contributors excluded by a majority preference and check repeated interviews without double counting. | No measured time savings or organizational adoption. A timed protocol is ready. |
| Quality of the idea | Evidence omitted by a summary stays visible, source text remains private, and disagreement can survive the review process. | A facilitator still needs to judge whether the evidence warrants a particular conclusion. |

## Recommended final submission description

QuietQuorum helps community facilitators analyze interviews while protecting original notes and keeping minority constraints visible. Firebase AI Logic suggests exact excerpts on the device. The researcher redacts and approves evidence, inspects what will be sent, and asks cloud Gemini to draft cross-interview findings. Stable participant codes keep return interviews from inflating counts. Researchers can inspect sources, correct claims and citation roles, flag uncertainty, and export a reviewed report with the approved evidence. The fictional workshop demonstrates how four Saturday preferences can coexist with two people who cannot attend.
Baseline commit `b1134b9` rebuilt from a Git archive with the installed locked dependencies. All 27 tests and the production build passed. TypeScript strict checking runs in the build. This repository has no lint script.

| Priority | Deliverable | Status |
| --- | --- | --- |
| P0 | Stable participant identity and safe legacy migration | In progress |
| P0 | Finding authorship, citation roles, review and revision history | In progress |
| P0 | Exact report preview, HTML/print and JSON | Planned |
| P0 | Regression and browser verification | Planned |
| P1 | Held-out scenarios, hybrid resilience and CI | Planned |
| P1 | Privacy, setup, demo and usability protocol | Planned |
| Release | Verified Hosting deployment and public source | Pending |

## November 25 reconnect verification

Offline-first use exposed a stalled App Check initialization during rehearsal. The runtime now initializes separate SDK instances for local and cloud inference and registers App Check before obtaining the cloud AI service. The corrected release passed 61 automated tests, 16 Chrome checks and a live development reconnect using one approved excerpt. Public CI passed for commit `964a7ca`.

The post-deployment rehearsal on November 25 confirmed three exact quotes in 131.1 seconds with a failed network probe, followed by four cloud findings from 15 approved excerpts in 26.7 seconds with production App Check. Saturday showed four supporting participants and two unable to attend. Researcher correction, reviewed HTML download and stale-export blocking passed in the hosted UI. The 103.262-second English demo uses genuine footage with shortened waits labeled on screen.
