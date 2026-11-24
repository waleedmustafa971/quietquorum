import { openDB } from 'idb';
import type { Study } from './domain';

const db = openDB('quietquorum', 1, { upgrade(database) { database.createObjectStore('workspace'); } });
export async function loadStudy(): Promise<Study | undefined> { return (await db).get('workspace', 'study'); }
export async function saveStudy(study: Study): Promise<void> { await (await db).put('workspace', study, 'study'); }
