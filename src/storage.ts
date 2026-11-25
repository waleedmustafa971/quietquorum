import { openDB } from 'idb';
import { migrateStudy, type Study } from './domain';

const openWorkspace = () => openDB('quietquorum', 1, { upgrade(database) { database.createObjectStore('workspace'); } });
let connection: ReturnType<typeof openWorkspace> | undefined;
let lastRevision: number | undefined;
let lastSaved: Study | undefined;
const conflictMessage = 'Another tab saved this study. Your edits are still in this tab. Copy any unsaved work before reloading.';
async function database() {
  connection ??= openWorkspace().catch(error => { connection = undefined; throw error; });
  return connection;
}
export async function loadStudy(): Promise<Study | undefined> {
  const tx = (await database()).transaction('workspace');
  const [stored, revision] = await Promise.all([tx.store.get('study'), tx.store.get('revision')]);
  lastRevision = revision ?? 0;
  lastSaved = stored?.version === 2 ? stored : undefined;
  return stored && migrateStudy(stored);
}
export async function assertStoredRevision() {
  const revision = (await (await database()).get('workspace', 'revision')) ?? 0;
  if (revision !== lastRevision) throw new Error(conflictMessage);
}
export async function saveStudy(study: Study): Promise<void> {
  if (study === lastSaved) return;
  const tx = (await database()).transaction('workspace', 'readwrite');
  const revision = (await tx.store.get('revision')) ?? 0;
  if (lastRevision !== revision) throw new Error(conflictMessage);
  await tx.store.put(study, 'study');
  await tx.store.put(revision + 1, 'revision');
  await tx.done;
  lastRevision = revision + 1;
  lastSaved = study;
}
