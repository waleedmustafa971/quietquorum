# QuietQuorum product plan

## Audience and outcome

A volunteer researcher collects feedback for a community workshop, service, or event. Notes may contain contact details and personal circumstances. The researcher needs a clear account of common requests and conflicting constraints, with an inspectable connection to what participants actually said.

The first release supports one researcher on one computer. It is not a complete research platform, voting system, automated consent manager, or statistical representation of a population.

## Core workflow

1. Create a study with a single research question.
2. Type notes or import a UTF-8 text transcript. Keep originals in the browser's local storage database.
3. On a compatible desktop Chrome installation, run Firebase AI Logic on-device to suggest excerpt cards and a neutral follow-up question. Validate every selected quote against the source text.
4. Review each card. Remove identifying details, choose whether it can be sent to the cloud, and inspect the exact outgoing payload.
5. When online, ask cloud Gemini through Firebase AI Logic to group approved cards into themes and identify possible tensions. Return card IDs with every proposed finding.
6. Show supporting evidence, conflicting evidence, and all cards not represented in a finding. Compute counts in code from unique participant IDs, not model-generated numbers.
7. Review and export the findings. The default shared report includes approved excerpts and pseudonymous labels only; raw notes and the identity mapping are excluded.

## Hybrid design

- Raw-note assistance uses `ONLY_ON_DEVICE`. It must never silently fall back to cloud processing.
- Cloud synthesis uses `ONLY_IN_CLOUD` with the explicitly approved card payload. Keep participant contact information and local source mappings out of it.
- If local AI is unavailable, offer manual excerpt creation. A separately disclosed cloud-assistance option may operate only on text the user has explicitly reviewed and approved to send.
- Capture and review continue offline. Cloud synthesis pauses until online and the user initiates it; reconnecting alone does not send pending notes.
- Use actual SDK response metadata to label inference origin. Cached examples, manual work and deterministic checks get separate labels.

Firebase documents desktop Chrome support, single-turn text and JSON output, explicit inference modes, user-initiated model setup, and App Check configuration. These capabilities fit a bounded extraction task. Device support, download size and latency must be tested before committing to the final demo. [Firebase web hybrid guide](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)

## Data boundaries

Browser-local data is not automatically encrypted or protected from someone using the same computer. The MVP must describe storage honestly, offer local export and deletion, and use synthetic data in the public demo.

Automatic redaction is only a suggestion; contextual details can still identify someone. The human reviews exactly what will leave the device. Editing an approved card invalidates its approval. Every synthesis uses a frozen payload revision, so later edits cannot silently change what a result refers to.

Treat interview text as untrusted data. Instructions embedded in it must not override the extraction or synthesis task. Validate returned IDs and quotes; do not render arbitrary model HTML.

Valid citations establish where a finding came from, not that the interpretation is necessarily correct. Mark findings as drafts until reviewed. Distinguish a participant's report from an externally verified fact.

## Planned stack

Web/Chrome: TypeScript, React, Vite, IndexedDB and a service worker. Firebase AI Logic for both inference paths; App Check for protected requests; Firebase Hosting for the public demo. Add Remote Config only if it simplifies operational model settings. Do not add Firestore or authentication merely to increase the technology list.

No real-time audio, PDF OCR, translation, multi-user collaboration, automatic sending, or native mobile client in the initial scope. Mobile browsers can be a later manual-capture surface; do not claim desktop Chrome local AI works on phones.

## Demonstration scenario

Use the synthetic interviews in `fixtures/community-workshop.json`. Several participants prefer Saturdays; other participants cannot attend then. One person repeats a request twice. A bad summary could claim everyone wants Saturday, double-count a person, or omit the incompatible schedule.

The intended demo:

- Show one new note being processed with networking disabled and a real on-device result.
- Show the private name/contact fields excluded from the outgoing cloud payload.
- Reconnect and synthesize approved cards.
- Open a finding and inspect both support and counterevidence in the original local note.
- Reveal a card that was not included in any theme.
- Export the reviewed report and show exact participant counts.

Target under three minutes. Clearly label the scenario as synthetic. Never substitute a recorded output for a live result without labeling it.

## Acceptance checks

1. Source quotes and returned IDs must resolve; invented quotes and unknown IDs are rejected.
2. A repeated statement from one participant counts once for a theme.
3. No request containing raw notes is sent through an automatic fallback path.
4. Editing a card requires renewed cloud approval.
5. Offline capture survives a reload after the app is cached.
6. The interface remains useful without an available local model.
7. Returned findings visibly distinguish support, possible conflict and uncovered cards.
8. Actual inference origin, payload size and latency are recorded without claiming unmeasured benefits.
9. Keyboard navigation, readable contrast, empty states and recoverable errors work.

Measure model quality separately using unseen synthetic interviews. Record failed cases as well as successful ones. Real user feedback and model evaluation remain outstanding.

## Six-day delivery plan

| Date in Dubai | Deliverable |
| --- | --- |
| Nov 24 | Create Devpost project; verify eligibility; validate one genuine on-device and one cloud request; finalize scope |
| Nov 25 | Local study/notes storage, excerpt validation, manual editing; submit optional quota request before 22:00 |
| Nov 26 | Reviewed payload workflow, cloud synthesis, citation graph and participant counts |
| Nov 27 | Offline reload support, conflict/coverage view, export and deletion |
| Nov 28 | User feedback, edge cases, privacy request inspection and held-out model evaluation |
| Nov 29 | Deploy, record actual demo, prepare repository and submission evidence |
| Nov 30 | Final checks and submission by 15:00 Dubai time; preserve buffer before the official 02:00 Dec 1 deadline |

If local inference cannot be demonstrated by the first technical checkpoint, reassess the platform before spending the sprint on interface work. Any scope extension must leave time for the real demo and testing.

