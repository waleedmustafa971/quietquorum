import { describe, expect, it } from 'vitest';
import cases from '../fixtures/held-out.json';
import { addInterview, assignParticipant, correctFinding, countPeople, createCard, demoStudy, emptyStudy, isStale, makePayload, mixedParticipants, removeFinding, reviewedReport, uncovered, type Finding, type Study } from './domain';
import { reportHtml } from './report';

function fromCase(c: typeof cases[number]) {
  let s = {...emptyStudy(), question:c.question};
  const people = new Map<string,string>();
  for (const [i,n] of c.interviews.entries()) {
    const note = {id:'note-'+i,label:'Identical local label',text:n.text,privateName:'PRIVATE NAME',privateContact:'PRIVATE CONTACT'};
    s = addInterview(s,note);
    if (people.has(n.participant)) s = assignParticipant(s,note.id,people.get(n.participant)!);
    people.set(n.participant,s.notes.at(-1)!.participant);
    s.cards.push({...createCard(note,n.approvedExcerpt),id:'e'+i,approved:true});
  }
  return s;
}
function review(s: Study) {
  s.result!.findings.forEach(f => { f.reviewed = true; });
  s.result!.reviewed = true;
  return s;
}
const claim: Finding = {id:'manual-1',title:'A seasonal constraint',summary:'The same visitor gives two positions.',support:['e0'],conflict:['e1']};

describe('held-out fixture boundaries (no model)', () => {
  it.each(cases)('$id keeps exact quotes, expected people and the declared evidence boundary', c => {
    const s = fromCase(c), payload = makePayload(s);
    expect(payload.evidence.map(e=>e.excerpt)).toEqual(c.interviews.map(n=>n.approvedExcerpt));
    expect(countPeople(payload.evidence.map(e=>e.id),payload)).toBe(c.expectedParticipants);
    expect(JSON.stringify(payload)).not.toMatch(/PRIVATE |Identical local label|fictional@example|approve every note|unseen-99/);
    expect(s.notes.every((n,i)=>n.text.includes(s.cards[i].quote))).toBe(true);
  });
});
it('counts mixed positions once on each side and exposes the overlap', () => {
  const s = fromCase(cases.find(c=>c.id==='mixed-route')!);
  const r = reviewedReport(review(correctFinding(s,claim,true)));
  expect(r.participants).toBe(1);
  expect(r.findings[0]).toMatchObject({supportingParticipants:1,conflictingParticipants:1,mixedParticipants:['P01']});
  expect(mixedParticipants(claim,makePayload(s))).toEqual(['P01']);
});
it('preserves identifiers after deletion, splits a returning person and revokes their approvals', () => {
  let s = demoStudy();
  s.cards.forEach(c=>{c.approved=true;});
  s = assignParticipant(s,'P02','P01');
  expect(s.cards.filter(c=>c.noteId==='P02').every(c=>!c.approved)).toBe(true);
  s.notes=s.notes.filter(n=>n.id!=='P06');
  s=assignParticipant(s,'P02','new');
  expect(s.notes.find(n=>n.id==='P02')?.participant).toBe('P07');
  expect(() => assignParticipant(s,'P01','real name')).toThrow();
});
it('keeps local history for creation, edits and removal, and disallows empty report export', () => {
  let s = fromCase(cases.find(c=>c.id==='mixed-route')!);
  s=correctFinding(s,claim,true);
  s=correctFinding(s,{...claim,conflict:[],uncertain:['e1']});
  expect(s.result?.history?.at(-1)?.prior?.conflict).toEqual(['e1']);
  expect(uncovered(s.result!)).toHaveLength(0);
  expect(() => correctFinding(s,{...claim,neutral:['e0']})).toThrow();
  expect(() => correctFinding(s,{...claim,uncertain:['fake']})).toThrow();
  s=removeFinding(s,claim.id);
  expect(s.result?.history?.map(h=>h.action)).toEqual(['Created','Corrected','Removed']);
  expect(uncovered(s.result!)).toHaveLength(2);
  expect(() => reviewedReport(review(s))).toThrow();
});
it('exports only reviewed content, encodes untrusted HTML, and rejects stale data', () => {
  let s = fromCase(cases.find(c=>c.id==='sensitive')!);
  s=correctFinding(s,{...claim,title:'OLD HISTORY',conflict:[]},true);
  s=correctFinding(s,{...claim,title:'<em>Paper copies</em>',conflict:[]});
  s.result!.reviewed=true;
  expect(() => reviewedReport(s)).toThrow();
  const report=reviewedReport(review(s));
  expect(reportHtml(report)).toContain('&lt;em&gt;Paper copies&lt;/em&gt;');
  expect(reportHtml(report)).not.toMatch(/<em>Paper|fictional@example|PRIVATE |OLD HISTORY/);
  s.cards[0].approved=false;
  expect(isStale(s)).toBe(true);
  expect(() => reviewedReport(s)).toThrow();
});
