# What happens to an interview

**On this device.** The original interview, private fields, exact source quotes, local revision history and interview-to-participant mapping live in the browser's IndexedDB. Local AI receives the note through Firebase AI Logic's on-device-only mode. A missing model leaves manual selection available. The app never routes a raw-note request to a cloud model.

**When you choose Send.** Gemini receives the displayed research question plus each approved card's ID, pseudonym and edited excerpt, with the application's synthesis instructions. Firebase App Check attests the client. Hosting, model downloads and attestation can make network requests independently of synthesis. Raw notes and private fields are excluded from the packet. The app checks the returned inference source and citations. A valid citation can still support an incorrect interpretation.

**Before sharing.** Read the question and each excerpt for names, contact details and contextual identifiers. A pseudonym does not anonymize a distinctive story. Editing an excerpt clears approval. Revoking approval affects future requests and reports. It cannot recall a request already sent or a file already downloaded.

**Before export.** Inspect the exact report preview. It includes the study title, question, reviewed wording, citations, pseudonyms and all approved excerpts, including uncited material. User-entered titles and findings can themselves disclose information. The original notes, private fields and local revision history are excluded.

**Storage and deletion.** Anyone with access to this unlocked browser profile may read the workspace. Local storage and downloaded reports are unencrypted. Clear the study in Settings or clear this site's browser data. Downloads require separate deletion. Clearing browser data can also remove the offline shell. The app provides no backup of private notes.

Password protection was evaluated for this release. Web Crypto could derive a key using PBKDF2 and encrypt records with AES-GCM, but safe adoption also needs atomic plaintext migration, key lifetime and locking, wrong-password recovery behavior, and crash testing. Those workflows have not been implemented or validated. Use an appropriate protected device and choose data suitable for that environment.
