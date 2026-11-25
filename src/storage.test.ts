import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { openDB } from 'idb';
import { beforeEach, expect, it, vi } from 'vitest';
import { demoStudy, exampleFindings, makePayload } from './domain';

beforeEach(() => { vi.stubGlobal('indexedDB', new IDBFactory()); vi.resetModules(); });

it('migrates an actual v1 record and keeps its reviewed snapshot and source IDs after reopening', async () => {
  const s = demoStudy();
  s.cards.forEach(c => { c.approved = true; });
  const payload = makePayload(s);
  const db = await openDB('quietquorum', 1, { upgrade(db) { db.createObjectStore('workspace'); } });
  const legacy = { ...s, version: 1, notes: s.notes.map(({participant: _, ...n}) => n),
    result: { payload, findings: exampleFindings(payload), reviewed: true, origin: 'Written example', elapsedMs: 0, createdAt: '2026-11-24' } };
  await db.put('workspace', legacy, 'study');
  const store = await import('./storage');
  const read = (await store.loadStudy())!;
  expect(read.version).toBe(2);
  expect(makePayload(read)).toEqual(payload);
  expect(read.result?.findings.every(f => f.reviewed)).toBe(true);
  await store.saveStudy(read);
  expect(await store.loadStudy()).toEqual(read);
});

it('rejects a stale writer and retains the winning write', async () => {
  const tabA = await import('./storage');
  await tabA.loadStudy();
  vi.resetModules();
  const tabB = await import('./storage');
  await tabB.loadStudy();
  const study = demoStudy();
  await tabA.saveStudy(study);
  await expect(tabB.assertStoredRevision()).rejects.toThrow('Another tab');
  await expect(tabB.saveStudy({...study,title:'Stale tab'})).rejects.toThrow('Another tab');
  expect((await tabB.loadStudy())?.title).toBe(study.title);
});

it('recovers after a storage open failure without replacing existing data', async () => {
  const store = await import('./storage');
  const saved = demoStudy();
  await store.loadStudy();
  await store.saveStudy(saved);
  vi.resetModules();
  const retry = await import('./storage');
  const blocked = vi.spyOn(indexedDB,'open').mockImplementationOnce(() => { throw new Error('Storage unavailable'); });
  await expect(retry.loadStudy()).rejects.toThrow();
  blocked.mockRestore();
  expect(await retry.loadStudy()).toEqual(saved);
});
