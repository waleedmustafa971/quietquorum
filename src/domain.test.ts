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
});
