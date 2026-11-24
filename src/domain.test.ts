import { describe, expect, it } from 'vitest';
import { demoStudy, createCard, editCard, makePayload, validateExtraction, validateFindings, countPeople, exampleFindings, uncovered, uncoveredPassages, exportReport, isStale } from './domain';

const prepared = () => { const s = demoStudy(); s.cards.forEach(c => c.approved = true); return s; };
describe('privacy and evidence boundaries', () => {
  it('surfaces a negative constraint that extraction missed', () => {
    const note = { id: 'held-out', label: 'Held out', text: 'I cannot attend on weekends. A Tuesday session would work for me.', privateName: '', privateContact: '' };
    const cards = [createCard(note, 'A Tuesday session would work for me.', 'on-device')];
    expect(uncoveredPassages(note, cards)).toEqual(['I cannot attend on weekends.']);
  });
  it('sends only explicitly approved excerpts with pseudonyms', () => {
    const s = prepared(); s.cards[0].approved = false;
    const payload = makePayload(s); const encoded = JSON.stringify(payload);
    expect(payload.evidence).toHaveLength(s.cards.length - 1);
    expect(encoded).not.toContain('privateName'); expect(encoded).not.toContain('@example.invalid');
    expect(encoded).not.toContain('Please do not put my email');
    expect(payload.evidence[0].participant).toBe('P01');
  });
  it('invalidates approval after editing and rejects invented source quotes', () => {
    const s = prepared(); expect(editCard(s.cards[0], 'redacted').approved).toBe(false);
    expect(() => createCard(s.notes[0], 'Everyone agrees')).toThrow();
    expect(() => validateExtraction({ quotes: ['invented quote'] }, s.notes[0])).toThrow();
  });
  it('rejects unknown citations and support/conflict overlap', () => {
    const p = makePayload(prepared());
    expect(() => validateFindings({ findings: [{ title: 'Test', summary: 'Test', support: ['unknown'], conflict: [] }] }, p)).toThrow();
    expect(() => validateFindings({ findings: [{ title: 'Test', summary: 'Test', support: [p.evidence[0].id], conflict: [p.evidence[0].id] }] }, p)).toThrow();
  });
  it('counts a repeated participant once and retains two opposing voices', () => {
    const p = makePayload(prepared()); const f = exampleFindings(p)[0];
    expect(countPeople(f.support, p)).toBe(4); expect(countPeople(f.conflict, p)).toBe(2);
  });
  it('reports uncovered cards and excludes originals and identity fields from export', () => {
    const s = prepared(); const p = makePayload(s);
    s.result = { findings: exampleFindings(p), payload: p, origin: 'Example — not AI', elapsedMs: 0, createdAt: '2026-11-24', reviewed: true };
    expect(uncovered(s.result).map(c => c.id)).toEqual(['P05-1', 'P05-2']);
    expect(exportReport(s)).not.toContain('privateContact');
    expect(exportReport(s)).not.toContain('Demo Participant');
    s.cards[0] = editCard(s.cards[0], 'changed');
    expect(isStale(s)).toBe(true); expect(() => exportReport(s)).toThrow();
  });
  it('does not reuse fixed example claims for modified data', () => {
    const p = makePayload(prepared()); p.evidence[0].excerpt = 'I prefer Sunday.';
    expect(() => exampleFindings(p)).toThrow();
  });
  it('does not hide unpunctuated lines from source coverage', () => {
    const note = { id: 'lines', label: 'Interview', text: 'I cannot attend Friday\nWednesday works for me\nI need a ramp', privateName: '', privateContact: '' };
    expect(uncoveredPassages(note, [createCard(note, 'Wednesday works for me')])).toEqual(['I cannot attend Friday', 'I need a ramp']);
  });
  it.each([null, {}, { quotes: [3] }, { quotes: [''] }, { quotes: Array(13).fill('Saturday mornings would work best for me.') }])('rejects malformed extraction %j', value => {
    expect(() => validateExtraction(value, prepared().notes[0])).toThrow();
  });
  it('deduplicates exact extraction suggestions', () => {
    const n = prepared().notes[0], q = 'Saturday mornings would work best for me.';
    expect(validateExtraction({ quotes: [q, q] }, n)).toEqual([q]);
  });
  it.each([null, {}, { findings: [] }, { findings: [{ title: '', summary: 'x', support: ['P01-0'], conflict: [] }] }, { findings: [{ title: 'x', summary: 'x', support: [], conflict: [] }] }, { findings: [{ title: 'x', summary: 'x', support: [5], conflict: [] }] }])('rejects malformed findings %j', value => {
    expect(() => validateFindings(value, makePayload(prepared()))).toThrow();
  });
  it('does not infer consent from empty or blank evidence', () => {
    const s = demoStudy(); expect(() => makePayload(s)).toThrow();
    s.cards.forEach(c => { c.approved = true; c.shareText = '  '; });
    expect(() => makePayload(s)).toThrow();
    const p = prepared(); p.question = ' '; expect(() => makePayload(p)).toThrow();
  });
  it('rejects deleted sources and changed quotes even with retained approval', () => {
    const s = prepared(); s.notes = s.notes.slice(1); expect(() => makePayload(s)).toThrow();
    const p = prepared(); p.notes[0].text = 'Changed source'; expect(() => makePayload(p)).toThrow();
  });
  it('excludes local names, contacts, labels and unapproved text', () => {
    const s = prepared();
    s.notes[0].privateName = 'PRIVATE_NAME_SENTINEL'; s.notes[0].privateContact = 'PRIVATE_CONTACT_SENTINEL'; s.notes[0].label = 'PRIVATE_LABEL_SENTINEL';
    s.cards[0].approved = false; s.cards[0].shareText = 'UNAPPROVED_SENTINEL';
    expect(JSON.stringify(makePayload(s))).not.toMatch(/PRIVATE_|UNAPPROVED_/);
  });
  it.each(['question', 'approval', 'excerpt'] as const)('blocks old exports after a %s change', kind => {
    const s = prepared(), payload = makePayload(s);
    s.result = { findings: exampleFindings(payload), payload, origin: 'Written example', elapsedMs: 0, createdAt: '2026-11-24', reviewed: true };
    if (kind === 'question') s.question = 'A different question?';
    if (kind === 'approval') s.cards[0].approved = false;
    if (kind === 'excerpt') s.cards[0].shareText = 'Changed but still approved';
    expect(isStale(s)).toBe(true); expect(() => exportReport(s)).toThrow();
  });
  it('blocks exporting results before review and keeps frozen payload counts', () => {
    const s = prepared(), payload = makePayload(s);
    s.result = { findings: exampleFindings(payload), payload, origin: 'Written example', elapsedMs: 0, createdAt: '2026-11-24', reviewed: false };
    expect(() => exportReport(s)).toThrow();
    expect(countPeople(['P03-0', 'P03-1', 'P03-1'], payload)).toBe(1);
    expect(countPeople(['unknown'], payload)).toBe(0);
  });
});
