import fixture from '../fixtures/community-workshop.json';

export type Note = { id: string; label: string; text: string; privateName: string; privateContact: string };
export type Card = { id: string; noteId: string; quote: string; shareText: string; approved: boolean; origin: 'manual' | 'on-device' | 'example' };
export type Finding = { id: string; title: string; summary: string; support: string[]; conflict: string[] };
export type Payload = { question: string; evidence: { id: string; participant: string; excerpt: string }[] };
export type Result = { findings: Finding[]; payload: Payload; origin: string; elapsedMs: number; createdAt: string; reviewed: boolean };
export type Study = { version: 1; title: string; question: string; synthetic: boolean; notes: Note[]; cards: Card[]; result: Result | null };

export const uid = () => crypto.randomUUID();
export function emptyStudy(): Study {
  return { version: 1, title: 'Untitled study', question: '', synthetic: false, notes: [], cards: [], result: null };
}
export function demoStudy(): Study {
  const notes = fixture.interviews.map(n => ({ id: n.id, label: n.id, text: n.text, privateName: n.privateName, privateContact: n.privateContact }));
  const cards: Card[] = fixture.interviews.flatMap(n => n.expectedEvidence.map((quote, i) => ({ id: `${n.id}-${i}`, noteId: n.id, quote, shareText: quote, approved: false, origin: 'example' })));
  return { version: 1, title: 'A workshop for everyone', question: fixture.question, synthetic: true, notes, cards, result: null };
}
export function createCard(note: Note, quote: string, origin: Card['origin'] = 'manual'): Card {
  if (!quote.trim() || !note.text.includes(quote)) throw new Error('Use an exact excerpt from the source note.');
  return { id: uid(), noteId: note.id, quote, shareText: quote, approved: false, origin };
}
export function editCard(card: Card, shareText: string): Card { return { ...card, shareText, approved: false }; }
export function uncoveredPassages(note: Note, cards: Card[]): string[] {
  const passages = (note.text.match(/[^.!?\n]+(?:[.!?]+|$)/g) || []).map(s => s.trim()).filter(Boolean);
  return passages.filter(p => !cards.some(c => c.noteId === note.id && c.quote.includes(p)));
}
export function makePayload(study: Study): Payload {
  const approved = study.cards.filter(c => c.approved && c.shareText.trim());
  if (!study.question.trim()) throw new Error('Add a research question before synthesizing.');
  if (!approved.length) throw new Error('Review and approve at least one evidence card first.');
  const participantIds = new Map(study.notes.map((n, i) => [n.id, `P${String(i + 1).padStart(2, '0')}`]));
  return { question: study.question, evidence: approved.map(c => {
    const note = study.notes.find(n => n.id === c.noteId);
    if (!note || !note.text.includes(c.quote)) throw new Error('An evidence card no longer matches its source. Review it again.');
    return { id: c.id, participant: participantIds.get(c.noteId)!, excerpt: c.shareText };
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
    return { id: `finding-${i + 1}`, title: row.title, summary: row.summary, support: support as string[], conflict: conflict as string[] };
  });
}
export function countPeople(ids: string[], payload: Payload): number {
  return new Set(payload.evidence.filter(c => ids.includes(c.id)).map(c => c.participant)).size;
}
export function uncovered(result: Result) {
  const used = new Set(result.findings.flatMap(f => [...f.support, ...f.conflict]));
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
export function exportReport(study: Study): string {
  if (!study.result || isStale(study) || !study.result.reviewed) throw new Error('Review current findings before exporting.');
  const r = study.result;
  return JSON.stringify({ format: 'quietquorum-report-v1', synthetic: study.synthetic, question: r.payload.question, createdAt: r.createdAt, origin: r.origin, reviewed: r.reviewed, note: 'Qualitative findings, not population estimates. Citations do not establish factual accuracy.', findings: r.findings.map(f => ({ ...f, supportingParticipants: countPeople(f.support, r.payload), conflictingParticipants: countPeople(f.conflict, r.payload) })), evidence: r.payload.evidence, uncovered: uncovered(r).map(c => c.id) }, null, 2);
}
