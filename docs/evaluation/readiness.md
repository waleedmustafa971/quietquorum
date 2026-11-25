# Held-out engineering evaluation · November 24, 2026

The 22 fictional scenarios, participant assignments, approved excerpts and expected outcomes were written before running this suite. They are separate from the earlier prompt-development cases. No synthesis or extraction prompt was tuned using these results. The same person who prepared the fixtures (Codex) assessed the outputs. No independent raters or prospective users participated. [Fixtures](../../fixtures/held-out.json) · [All attempts, including errors](readiness-results.json) · [Prior evaluation](2026-11-24.md)

## Programmatic measurements

| Measurement | Observed |
| --- | --- |
| Local Firebase calls | 43 completed with on-device inference metadata. |
| Exact quote validity | All 44 returned strings appeared verbatim in the corresponding note. |
| Extraction coverage | 42/43 target sentences appeared as standalone cards. All 43 were present somewhere in a returned quote. |
| Cloud Firebase calls | 31 attempts, 25 completed with cloud metadata and 6 returned quota/rate-limit errors. A paced follow-up finished the planned 22 cases plus three repeats. |
| Citation validity | All 53 assignments across 39 findings referred to known evidence and used one role per excerpt per finding. |
| Approved evidence coverage | 51/51 available excerpts across the 25 successful packets were cited. Repeated runs contribute to this denominator. |
| Unique participants | Counts from approved packets matched the preregistered unique-person total in all 22 deterministic fixture checks. Repeated interviews and local labels were exercised separately from AI generation. |
| Privacy | Neither the synthetic contact nor the embedded instructions appeared in the 22 approved fixture packets. No local card is automatically approved. The mocked SDK test inspected the cloud prompt assembled by the actual application function. |
| Desktop Chrome offline | On the release preview a fresh network probe failed, the service worker served a reload, and the saved manual finding and five-person count survived. |
| Latency, min / median / max | Local 4.03 / 4.87 / 33.62 s. Successful cloud calls 0.92 / 2.06 / 24.22 s. Plain summaries 1.31 / 1.62 / 1.69 s. |

Run `node scripts/summarize-evaluation.mjs` to recompute quote, role, coverage and timing measurements. Times are observed end-to-end SDK calls on one warmed machine and account, with local and cloud work overlapping. Failed call durations were not captured. These runs do not establish a speedup over earlier measurements.

## Semantic review

The researcher compared every returned title, summary and citation role with its own scope and the fixture's expected outcome. Of 53 assignments, 52 had a defensible role against the written finding on this reading. The library case assigned a visitor's inability to come after sunset as conflict with some other visitors preferring longer opening hours. Longer hours can coexist with earlier access. The excerpt deserved visibility, but its relationship to the claim needed correction. No clear invented participant attributes were identified in the other completed structured outputs. These are descriptive judgments on short cases.

- **Minority recall.** In the library and central-venue scenarios, the minority excerpt was cited in 3/3 completed runs. Only the two venue runs expressed the constraint in finding prose. Citation coverage alone hides the library omission.
- **Opposition and mixed positions.** The signage run represented both opposing views and cited them on opposite sides. The deposit reversal and both seasonal-route runs represented both statements from the same person. The route runs cited both as support for a seasonal claim. A mixed-person indicator is meaningful only when that person's excerpts actually occupy both support and conflict for the same finding.
- **Scope and uncertainty.** The childcare condition, ambiguous return visit, mixed-language guide preference, and limited-scope caption request were preserved. This suite provides one exploratory mixed-language case. The runtime requests English text support.
- **Over-extraction.** In the long note, the model combined the break request with a neutral agenda sentence and also returned the neutral sentence alone. Both quotes passed provenance checks. The fixture description intended a late constraint, but its input actually placed the constraint first. It tests repetition and over-extraction. Late-position recall is unmeasured here.
- **Unavailable services.** The named outage fixtures alone cannot simulate an outage. Unavailable initialization and disconnected sending were tested with the SDK mock. Network-blocked reload was tested independently in Chrome. Six genuine cloud errors exercised the provider failure path.

## Plain Gemini comparison

Three matching fictional approved packets were summarized through cloud-only Firebase AI Logic using a plain summarization prompt. The large-print baseline correctly counted one contributor and the seasonal-route baseline preserved the same person's two positions. The venue baseline included the bus limitation, then generalized it to the venue being inaccessible to everyone in the sense of failing universal access. The excerpt established a bus-route limitation, leaving other transport unknown. Both structured venue outputs kept that distinction. The plain summaries had no required citation schema or review interface. The structured workflow provided verifiable references and a correction path. Three baselines are insufficient for a comparative accuracy claim.

All predeclared repeated structured calls and baseline outputs are in the results file. Explicit rejection of fabricated IDs is a validator test. The fabricated-ID instruction in the private note was intentionally excluded from the designated cloud packet. The earlier development suite separately exercised an instruction inside a cloud evidence packet.
