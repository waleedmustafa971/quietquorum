# Architecture

QuietQuorum is a static React/TypeScript application served by Firebase Hosting. IndexedDB holds one study per origin and browser profile. There is no account, research database or server-side copy of interviews.

| Boundary | Runtime decision |
| --- | --- |
| Capture | Each interview has a unique note ID and a separate stable participant pseudonym. Link a returning person's interviews explicitly. Private labels, names and contacts do not establish identity. |
| Extraction | Firebase AI Logic initializes the desktop Chrome model on request. Local-only generation proposes up to 12 exact source quotes. The application rejects mismatched SDK origin and invented quotes before creating unapproved cards. The 18,000-character limit avoids silently truncating a note. |
| Approval | Manual and local-AI cards use the same path. A card retains an exact local quote and independent editable sharing text. Editing a note removes its cards. Editing an excerpt or changing its participant clears approval. |
| Synthesis | The user previews the research question and a packet containing only approved card IDs, pseudonyms and shared text. A separate cloud-only Firebase model receives the packet inside a fixed instruction prompt after Send. No reconnect handler sends data. |
| Correction | A result freezes the sent packet and origin. Four mutually exclusive citation roles per excerpt per finding are validated against that packet. The same excerpt may inform multiple findings. Every finding needs support. Unique people are counted per role, with the support/conflict overlap displayed explicitly. |
| Review | Changes invalidate the affected finding and overall review. Up to 30 local changes per analysis preserve the prior wording and citation roles. Regenerating or replacing an analysis starts a new history. The reviewer can create a fully manual analysis from approved cards. |
| Export | All findings and the overall review must be current. A report projection includes the title, approved research material and provenance. A sandboxed print-ready HTML preview or JSON preview supplies the exact download bytes. |

Version 1 used note order as the participant identity. Loading it assigns the old positional pseudonyms once, carries forward existing review status and persists version 2 using the same object store. Subsequent IDs are allocated monotonically within a study. Reassignment requires explicit input. There is no matching by name or contact.

The application serializes saves. An IndexedDB read/write transaction compares the last-read revision before committing the study and its new revision together. A conflicting tab keeps its unsaved edits in memory and reports the conflict. There is no automatic merge. An in-flight model response must match both its run token and the workspace revision. Stop waiting invalidates the token.

Entry points are `src/inference.ts` for the two Firebase models, `src/domain.ts` for approval/counting/review, `src/storage.ts` for persistence and `src/report.ts` for standalone HTML. The app shell caches only build assets. The evaluation baseline under `scripts/` runs only in development.
