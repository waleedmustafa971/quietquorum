# Security review

Use a synthetic reproduction when reporting a problem through the repository owner's GitHub contact. Do not post interview data, authentication codes, App Check debug tokens or identity documents in a public issue.

| Surface | Implemented controls and residual risks |
| --- | --- |
| Browser storage | Origin-scoped IndexedDB, atomic writes and stale-writer detection. Device/profile access and malicious same-origin code remain threats. See [privacy](PRIVACY.md). |
| Model input | Interview and evidence text are treated as untrusted data. Models have no application tools. Deterministic code constructs the approved packet and validates quotes, allowed IDs and citation roles. Prompt wording cannot guarantee correct interpretation or complete extraction. |
| Cloud | User-confirmed payload and forced cloud mode. Production uses the registered Enterprise App Check provider. Debug mode requires a development build on localhost. App Check addresses client abuse, not consent or anonymity. |
| Browser display | React escapes note and model text. The standalone HTML report encodes all dynamic text and has no scripts, external resources, active links or forms. Its preview iframe is sandboxed. JSON is shown as text. |
| Caching and logs | Workbox precaches build assets. There is no runtime request cache for Gemini or interviews and no application analytics. SDK diagnostics may appear in browser developer tools. Do not share console dumps, personal browser profiles or network traces. |
| Errors and retries | Generation failures present actionable messages. Returning online does not resubmit. Abandoned results are ignored. Storage failures preserve the current session. |
| Credentials | Firebase public client configuration belongs in ignored local environment files. Never place private service credentials in Vite variables. The production host requires App Check. CI uses synthetic fixtures and no secrets. |

The dependency check, scoped secret scan and test results for this release are recorded in [readiness](HACKATHON_READINESS.md). These checks cover selected failure modes and do not constitute an independent security audit.
