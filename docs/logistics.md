# QuietQuorum registration and quota logistics

## Current state

Verified in Chrome on November 24, 2026:

- Devpost account `waleedmustafa971` was already registered for the hackathon.
- Created [QuietQuorum](https://devpost.com/software/quietquorum), saved its name, pitch and in-development story, and verified those contents on the project page.
- The hackathon entry is still a draft (2/5 steps complete), not a final submission. The page labels it INCOMPLETE SUBMISSION.
- The user accepted the identity-verification requirement. The quota form was submitted and Google Forms confirmed: "Your response has been recorded." Eligibility review, identity verification and account approval remain pending. Screenshot evidence is stored locally at `.local/quota-confirmation.png`.
- Corrected the quota email to match the actual Devpost account settings. The original restored form had a different email. Personal contact details are kept in the browser form rather than committed here.
- A working local prototype is implemented. Firebase project `quietquorum-358a5` and its web app were created on the Spark plan. Gemini Developer API and Firebase AI Logic are enabled, App Check enforcement was enabled by the setup flow, and a local debug token was registered. Live cloud synthesis passed. See `development.md` for remaining release work.
- The prototype is deployed at https://quietquorum-358a5.web.app. Production App Check is registered and a live cloud request from the hosted app succeeded. On-device and offline local inference were also verified in development. No billing upgrade was made.
- Source is public at https://github.com/waleedmustafa971/quietquorum. Devpost's project story now describes the verified implementation, and its demo and repository links were saved and checked on the project page. The page still says INCOMPLETE SUBMISSION; the demo video and final steps remain outstanding.

The canonical project URL was obtained from Devpost's Preview link and verified in the signed-in browser. A separate unauthenticated HTTP check encountered Cloudflare, so anonymous access was not independently verified.

Chrome control is working through the official Chrome DevTools CLI with autoConnect after the user enabled remote debugging. The `.local/chrome-devpost` directory is an old temporary profile, not the Devpost project.

Chrome DevTools MCP 1.13.0 is also registered globally in Codex as `chrome-devtools`, enabled, with `cmd /c npx -y chrome-devtools-mcp@latest --autoConnect --no-usage-statistics --no-performance-crux`. Node 24.19.0 and Chrome 158.0.8127.38 were verified. Browser connection and interaction are now verified through the package's CLI; native MCP tools were not hotloaded into this conversation.

## Required facts still to confirm

- Age eligibility and any final contest declarations not already verified.
- Whether teammates will join later (the created project currently lists only Waleed).
- Whether an employer/organizer/government affiliation triggers the contest exclusions.
- Complete the later government-ID and selfie verification through Didit if instructions arrive; consent to this requirement was given by the user before submission.

The restored user form already stated United Arab Emirates as residence. The current signed-in Devpost account, profile name and account email were checked directly.

Do not infer these declarations from a timezone, filesystem username or an unrelated connected account.

## Devpost sequence

1. Open https://firebasehybridaihackathon.devpost.com/ in the user's connected browser.
2. Inspect the signed-in account and existing project list to avoid creating duplicates.
3. Register if needed, using confirmed eligibility facts.
4. Use Start project. Enter QuietQuorum and the elevator pitch from `devpost-draft.md`.
5. Save the current in-development project details. If publication is needed for the quota form, publish only truthful current project information; do not invent a working demo or completed build.
6. Open the actual project page and copy its canonical `devpost.com/software/...` URL. Do not construct a URL from the name.
7. Verify the page is accessible as required by the form. A saved project and a final submitted hackathon entry are different states.
8. Record the verified URL in `submission/project.json`.

Devpost explains that Start project creates a draft, and final submission requires completing the Submit step. [Devpost submission guide](https://help.devpost.com/article/122-how-to-enter-a-submission)

## Optional Google quota request

Official form: https://forms.gle/uPcDhaYW3iVo2AYw5

Final request window: November 25, 2026 at 10:00 Pacific / 22:00 Dubai. Accounts are scheduled for November 27 and valid for four days from issuance. Approval is discretionary. The free tier remains the initial implementation path. [Official quota schedule](https://firebasehybridaihackathon.devpost.com/)

The complete live form has now been inspected and filled. It requires name, Devpost account email, profile URL, country, project URL, teammates, a 2-3 sentence description, and consent to identity verification. The exact prepared description is:

> QuietQuorum is a planned Web/Chrome application that will help community organizations turn private interview notes into evidence-backed findings without losing dissenting voices. We plan to use Firebase AI Logic for on-device evidence extraction and cloud Gemini to compare only user-reviewed excerpts, with source links, conflicting evidence, and omitted cards visible. The workflow, architecture, and synthetic demonstration scenario are prepared; implementation and inference testing are next.

The form states that text generation can use the free tier without billing, and that the temporary account is needed only for features requiring billing. Every approved request requires later government-ID and face photographs through Didit. No identity documents were requested or uploaded by the agent. The user accepted this requirement and the agent submitted the form. No identity check or account approval has been completed yet.

Use confirmed account information and the real Devpost URL. If the form restricts access to use cases or platforms the project does not meet, do not misrepresent the project to obtain quota. Inspect the conditions and report the mismatch.

After submission, verify a confirmation screen or receipt and record its date. Do not mark it submitted after merely opening or filling the form.

## Firebase and final delivery

- Create or choose the user's project; begin with the free tier and avoid enabling paid billing without authorization.
- Register the web app, enable Firebase AI Logic and configure App Check.
- Verify real on-device and cloud calls; keep configuration credentials out of public artifacts where appropriate.
- Publish a public GitHub or GitLab repository with an open-source license and reproducible instructions once implementation exists.
- Supply a working project, English description, public YouTube demonstration up to three minutes, and actual technology use.
- Submit the completed entry before November 30 at 22:00 UTC / December 1 at 02:00 Dubai; internal target November 30 at 15:00 Dubai.

[Contest requirements](https://firebasehybridaihackathon.devpost.com/rules) Â· [Firebase setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)


