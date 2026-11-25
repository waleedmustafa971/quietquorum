import fixture from '../fixtures/community-workshop.json';

export type Note = { id: string; label: string; text: string; privateName: string; privateContact: string };
export type Card = { id: string; noteId: string; quote: string; shareText: string; approved: boolean; origin: 'manual' | 'on-device' | 'example' };
export const roles = ['support', 'conflict', 'neutral', 'uncertain'] as const;
export type Role = typeof roles[number];
export const roleLabels: Record<Role, string> = { support: 'Supporting voices', conflict: 'Possible counterevidence', neutral: 'Neutral context', uncertain: 'Uncertain evidence' };
export type Finding = { id: string; title: string; summary: string; support: string[]; conflict: string[]; neutral?: string[]; uncertain?: string[]; editedAt?: string; manual?: boolean; reviewed?: boolean };
export type Payload = { question: string; evidence: { id: string; participant: string; excerpt: string }[] };
type Revision = { at: string; action: 'Created' | 'Corrected' | 'Removed'; findingId: string; prior?: Finding };
export type Result = { findings: Finding[]; payload: Payload; origin: string; elapsedMs: number; createdAt: string; reviewed: boolean; history?: Revision[] };
type LegacyStudy = { version: 1; title: string; question: string; synthetic: boolean; notes: Note[]; cards: Card[]; result: Result | null };
export type Study = Omit<LegacyStudy, 'version' | 'notes'> & { version: 2; nextParticipant: number; notes: (Note & { participant: string })[] };
const pseudonym = (n: number) => 'P' + String(n).padStart(2, '0');
export function migrateStudy(stored: LegacyStudy | Study): Study {
  if (stored.version === 2) return stored;
  if (stored.version !== 1) throw new Error('Unknown workspace version.');
  const notes = stored.notes.map((note, i) => ({ ...note, participant: pseudonym(i + 1) }));
  const result = stored.result;
  return { ...stored, version: 2, nextParticipant: notes.length + 1, notes,
    result: result && { ...result, findings: result.findings.map(f => ({ ...f, reviewed: result.reviewed })) } };
}
export function addInterview(study: Study, note: Note): Study {
  return { ...study, synthetic: false, nextParticipant: study.nextParticipant + 1,
    notes: [...study.notes, { ...note, participant: pseudonym(study.nextParticipant) }] };
}
export function assignParticipant(study: Study, noteId: string, participant: string): Study {
  const fresh = participant === 'new';
  if (!fresh && !study.notes.some(n => n.participant === participant)) throw new Error('Choose an existing participant.');
  const assigned = fresh ? pseudonym(study.nextParticipant) : participant;
  if (!study.notes.some(n => n.id === noteId && n.participant !== assigned)) return study;
  return { ...study, synthetic: false, nextParticipant: study.nextParticipant + Number(fresh),
    notes: study.notes.map(n => n.id === noteId ? { ...n, participant: assigned } : n),
    cards: study.cards.map(c => c.noteId === noteId ? { ...c, approved: false } : c) };
}

export const uid = () => crypto.randomUUID();
export function emptyStudy(): Study {
  return { version: 2, nextParticipant: 1, title: 'Untitled study', question: '', synthetic: false, notes: [], cards: [], result: null };
}
export function demoStudy(): Study {
  const notes = fixture.interviews.map(n => ({ id: n.id, participant: n.id, label: n.id, text: n.text, privateName: n.privateName, privateContact: n.privateContact }));
  const cards: Card[] = fixture.interviews.flatMap(n => n.expectedEvidence.map((quote, i) => ({ id: `${n.id}-${i}`, noteId: n.id, quote, shareText: quote, approved: false, origin: 'example' })));
  return { version: 2, nextParticipant: notes.length + 1, title: 'A workshop for everyone', question: fixture.question, synthetic: true, notes, cards, result: null };
}
export function createCard(note: Note, quote: string, origin: Card['origin'] = 'manual'): Card {
  if (!quote.trim() || !note.text.includes(quote)) throw new Error('Use an exact excerpt from the source note.');
  return { id: uid(), noteId: note.id, quote, shareText: quote, approved: false, origin };
}
export function editCard(card: Card, shareText: string): Card { return { ...card, shareText, approved: false }; }
export function uncoveredPassages(note: Note, cards: Card[]): string[] {
  const passages = (note.text.match(/[^.!?\n]+(?:[.!?]+|(?=\n|$))/g) || []).map(s => s.trim()).filter(Boolean);
  return passages.filter(p => !cards.some(c => c.noteId === note.id && c.quote.includes(p)));
}
export function makePayload(study: Study): Payload {
  const approved = study.cards.filter(c => c.approved && c.shareText.trim());
  if (!study.question.trim()) throw new Error('Add a research question before synthesizing.');
  if (!approved.length) throw new Error('Review and approve at least one evidence card first.');
  return { question: study.question, evidence: approved.map(c => {
    const note = study.notes.find(n => n.id === c.noteId);
    if (!note || !note.text.includes(c.quote)) throw new Error('An evidence card no longer matches its source. Review it again.');
    return { id: c.id, participant: note.participant, excerpt: c.shareText };
  }) };
}
export function parseJson(text: string): unknown {
  return JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
}
export function validateExtraction(value: unknown, note: Note): string[] {
  if (!value || typeof value !== 'object' || !('quotes' in value) || !Array.isArray(value.quotes)) throw new Error('The model returned an invalid evidence response.');
  const quotes = value.quotes;
  if (quotes.length > 12 || quotes.some(q => typeof q !== 'string' || !q.trim() || !note.text.includes(q))) throw new Error('The model suggested a quote that does not match the source. Nothing was added.');
  return [...new Set(quotes as string[])];
}
export function validateFindings(value: unknown, payload: Payload): Finding[] {
  if (!value || typeof value !== 'object' || !('findings' in value) || !Array.isArray(value.findings)) throw new Error('The model returned an invalid findings response.');
  const ids = new Set(payload.evidence.map(c => c.id));
  if (!value.findings.length || value.findings.length > 12) throw new Error('Expected between 1 and 12 findings.');
  return value.findings.map((f: unknown, i) => {
    if (!f || typeof f !== 'object') throw new Error('Invalid finding.');
    const row = f as Record<string, unknown>;
    if (typeof row.title !== 'string' || !row.title.trim() || row.title.length > 150 || typeof row.summary !== 'string' || !row.summary.trim() || row.summary.length > 3000) throw new Error('Invalid finding text.');
    if (!Array.isArray(row.support) || !Array.isArray(row.conflict) || !row.support.length) throw new Error('Each finding must cite supporting evidence.');
    const support = [...new Set(row.support as unknown[])];
    const conflict = [...new Set(row.conflict as unknown[])];
    if ([...support, ...conflict].some(id => typeof id !== 'string' || !ids.has(id)) || support.some(id => conflict.includes(id))) throw new Error('A finding contains unknown or contradictory citation IDs. Nothing was saved.');
    const used = new Set([...support, ...conflict]);
    const optionalRole = (role: 'neutral' | 'uncertain') => {
      const entries = row[role] === undefined ? [] : row[role];
      if (!Array.isArray(entries)) throw new Error('Invalid citation list.');
      const unique = [...new Set(entries)];
      if (unique.some(id => typeof id !== 'string' || !ids.has(id) || used.has(id))) throw new Error('Each approved citation must have a single role per finding.');
      unique.forEach(id => used.add(id));
      return unique as string[];
    };
    return { id: `finding-${i + 1}`, title: row.title, summary: row.summary, support: support as string[], conflict: conflict as string[], neutral: optionalRole('neutral'), uncertain: optionalRole('uncertain') };
  });
}
export function countPeople(ids: string[], payload: Payload): number {
  return new Set(payload.evidence.filter(c => ids.includes(c.id)).map(c => c.participant)).size;
}
export function correctFinding(study: Study, draft: Finding, creating = false): Study {
  const at = new Date().toISOString();
  const result = study.result ?? (creating ? { findings: [], payload: makePayload(study), origin: 'Researcher-created', elapsedMs: 0, createdAt: at, reviewed: false } : null);
  if (!result || isStale(study)) throw new Error('Generate current findings before saving a correction.');
  const original = result.findings.find(f => f.id === draft.id);
  if (creating === !!original) throw new Error('This finding is no longer available.');
  const [checked] = validateFindings({ findings: [draft] }, result.payload);
  const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every(id => b.includes(id));
  if (original && checked.title === original.title && checked.summary === original.summary &&
      roles.every(role => sameIds(checked[role] ?? [], original[role] ?? []))) return study;
  const corrected = { ...checked, id: draft.id, editedAt: at, manual: original?.manual ?? creating, reviewed: false };
  const findings = creating ? [...result.findings, corrected] : result.findings.map(f => f.id === draft.id ? corrected : f);
  return revise(study, result, findings, { at, action: creating ? 'Created' : 'Corrected', findingId: draft.id, prior: original });
}
function revise(study: Study, result: Result, findings: Finding[], revision: Revision): Study {
  return { ...study, result: { ...result, findings, reviewed: false, history: [...(result.history ?? []), revision].slice(-30) } };
}
export function removeFinding(study: Study, id: string): Study {
  const result = study.result, prior = result?.findings.find(f => f.id === id);
  if (!result || !prior || isStale(study)) throw new Error('A current finding is required.');
  return revise(study, result, result.findings.filter(f => f.id !== id), { at: new Date().toISOString(), action: 'Removed', findingId: id, prior });
}
export function mixedParticipants(f: Finding, payload: Payload) {
  const supports = new Set(payload.evidence.filter(e => f.support.includes(e.id)).map(e => e.participant));
  return [...new Set(payload.evidence.filter(e => f.conflict.includes(e.id) && supports.has(e.participant)).map(e => e.participant))];
}
export function uncovered(result: Result) {
  const used = new Set(result.findings.flatMap(f => roles.flatMap(role => f[role] ?? [])));
  return result.payload.evidence.filter(c => !used.has(c.id));
}
export function isStale(study: Study): boolean {
  if (!study.result) return false;
  try { return JSON.stringify(makePayload(study)) !== JSON.stringify(study.result.payload); } catch { return true; }
}
export function exampleFindings(payload: Payload): Finding[] {
  const original = demoStudy();
  const expected = new Map(original.cards.map(c => [c.id, c.shareText]));
  if (payload.question !== original.question || payload.evidence.some(c => expected.get(c.id) !== c.excerpt)) throw new Error('Example findings only work with the unchanged fictional workshop excerpts. Use cloud synthesis for your own evidence.');
  const available = new Set(payload.evidence.map(c => c.id));
  const candidates = [
    { title: 'Saturday works for some. A second time matters.', summary: 'Four participants prefer Saturday morning, while two cannot attend. Explore a weekday option with those participants before deciding. Repeated comments by P03 count as one voice.', support: ['P01-0', 'P02-0', 'P03-0', 'P03-1', 'P04-0'], conflict: ['P05-0', 'P06-0'] },
    { title: 'Design for practical, everyday tasks.', summary: 'Online forms are a shared learning goal. Practical examples and a take-home checklist could support the workshop.', support: ['P01-1', 'P06-2', 'P02-1', 'P04-1'], conflict: [] },
    { title: 'Bring-your-own-laptop would leave someone out.', summary: 'Access to a laptop differs. Check whether loan equipment or a phone-friendly activity is possible.', support: ['P06-1', 'P03-2'], conflict: [] }
  ];
  if (candidates.flatMap(f => [...f.support, ...f.conflict]).some(id => !available.has(id))) throw new Error('Approve all of the example evidence before loading the example findings.');
  return validateFindings({ findings: candidates }, payload);
}
export function reviewedReport(study: Study, generatedAt = new Date().toISOString()) {
  const r = study.result;
  if (!r || isStale(study) || !r.reviewed || !r.findings.length || r.findings.some(f => !f.reviewed)) throw new Error('Review current findings before exporting.');
  const findings = r.findings.map(f => {
    const [checked] = validateFindings({ findings: [f] }, r.payload);
    return { ...checked, id: f.id, editedAt: f.editedAt, author: f.manual ? 'Researcher' : f.editedAt ? r.origin + ' · researcher edited' : r.origin,
      reviewed: true, supportingParticipants: countPeople(f.support, r.payload), conflictingParticipants: countPeople(f.conflict, r.payload), mixedParticipants: mixedParticipants(f, r.payload) };
  });
  return { format: 'quietquorum-report-v2', title: study.title, synthetic: study.synthetic, question: r.payload.question, createdAt: r.createdAt, generatedAt, origin: r.origin, reviewed: true,
    participants: countPeople(r.payload.evidence.map(e => e.id), r.payload), findings,
    evidence: r.payload.evidence.map(({ id, participant, excerpt }) => ({ id, participant, excerpt })), uncovered: uncovered(r).map(c => c.id),
    note: 'Counts describe contributors to approved excerpts in this study. A person can appear on both sides. People who shared no approved evidence are absent. Check interpretations against the cited words before acting.' };
}
export function exportReport(study: Study): string {
  return JSON.stringify(reviewedReport(study), null, 2);
}
