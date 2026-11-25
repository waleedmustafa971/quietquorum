# Verification

Use Node 24 and `npm ci`. Run `npm test`, `npx --no-install tsc -b`, then `npm run build`. No lint task is configured. GitHub Actions installs the lockfile, runs the automated suite and builds without Firebase credentials.

| Group | What runs |
| --- | --- |
| Domain and reports | Exact quote checks, malformed responses, approvals, stale exports, correction and review, all four citation roles, changed evidence, unique people, mixed positions, escaped report text, and the 22 held-out fixture boundaries. These assertions do not score a model. |
| IndexedDB integration | The real storage module and idb library run against fake-indexeddb. Tests load a version 1 record, reopen a migrated study, reject a stale tab and recover from an open failure. |
| Mocked Firebase | The application calls controlled SDK models. Tests assert mode selection, reject wrong inference metadata, inspect the actual generated cloud prompt, and exercise unavailable model, quota and offline errors. |
| Browser | Actual Chrome, production build, native IndexedDB and service worker. Use the official chrome-devtools CLI with the current page IDs. The destructive helpers guard their dedicated local origins. |
| Real Firebase | Separate measurements use the configured developer browser and synthetic material. Source metadata is checked before accepting output. Live cloud needs App Check and quota. |

## Browser workflows

Build first. Run `npm run preview -- --port 4175 --strictPort` and open exactly `http://127.0.0.1:4175` in a disposable Chrome test tab. Use the official CLI's `list_pages` to find its ID. Run `chrome-devtools evaluate_script --pageId PAGE --sourcePath scripts/browser-readiness.js`. It replaces that test origin's workspace. It exercises editing, removal, review, identity changes, export preview and a fresh manual analysis. The download check captures actual Blob bytes and suppresses the final file-save gesture.

With that study still open, block network requests for **that tab**, reload, and open Explore findings. Verify the persisted “Offline review” finding and five distinct participants. Confirm a fresh uncached fetch fails and a service worker controls the page, then restore network access. The older capture/import workflow uses port 4174 and `scripts/browser-workflow-test.js`.

## Live evaluation

Keep the local development server on 127.0.0.1:5173 using your registered development App Check setup. Run `scripts/browser-held-out.js` with the same CLI evaluate command. It imports only repository fixtures, runs local extraction on the interviews, sends only their designated synthetic shared excerpts to cloud synthesis and compares selected cases to a plain summary on the same packet. Inspect `window.qqHeldOut` until its running flag clears. A single paced retry of missing cloud observations is available in `scripts/browser-resume-held-out.js`. Both stop a stream after consecutive errors.

The local check requires exact source substrings. Separately assess whether the intended whole quote is present, whether extra text was selected, and whether claims and roles respect the case rubric. Treat an error as a failed call with no semantic score. Source metadata confirms placement only. Keep raw attempts, counts, latency and the method with the report in [evaluation](docs/evaluation). The original development and diagnostic fixtures are separate from `fixtures/held-out.json`.
