import { readFile } from 'node:fs/promises';
const load = async path => JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const cases = new Map((await load('fixtures/held-out.json')).map(c => [c.id,c]));
const results = await load('docs/evaluation/readiness-results.json');
const stats = { localCalls:results.local.length, exactQuotes:0, quotes:0, expectedWhole:0, expectedIncluded:0, cloudAttempts:results.cloud.length, cloudSuccess:0, findings:0, validRoles:0, assignments:0, covered:0, available:0 };
for (const r of results.local) {
  const note = cases.get(r.id).interviews[r.interview];
  const quotes = r.quotes ?? [];
  stats.quotes += quotes.length;
  stats.exactQuotes += quotes.filter(q=>note.text.includes(q)).length;
  stats.expectedWhole += Number(quotes.includes(note.approvedExcerpt));
  stats.expectedIncluded += Number(quotes.some(q=>q.includes(note.approvedExcerpt)));
}
for (const r of results.cloud.filter(r=>r.findings)) {
  const valid = new Set(cases.get(r.id).interviews.map((_,i)=>'e'+(i+1)));
  const used = new Set();
  stats.cloudSuccess++;
  stats.findings += r.findings.length;
  for (const f of r.findings) {
    const citations = ['support','conflict','uncertain','neutral'].flatMap(role=>f[role]??[]);
    stats.assignments += citations.length;
    stats.validRoles += citations.filter(id=>valid.has(id) && citations.filter(c=>c===id).length===1).length;
    citations.forEach(id=>used.add(id));
  }
  stats.covered+=used.size;
  stats.available+=valid.size;
}
function latency(rows) {
  const t=rows.filter(r=>Number.isFinite(r.elapsedMs)).map(r=>r.elapsedMs/1000).sort((a,b)=>a-b);
  const middle=Math.floor(t.length/2);
  return {successful:t.length,minSeconds:t[0],medianSeconds:t.length%2?t[middle]:(t[middle-1]+t[middle])/2,maxSeconds:t.at(-1)};
}
console.log(JSON.stringify({checks:stats,local:latency(results.local),cloud:latency(results.cloud),baseline:latency(results.baseline)},null,2));
