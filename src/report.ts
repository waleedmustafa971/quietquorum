import { reviewedReport, roles, roleLabels } from './domain';

// All researcher and model text enters HTML through text nodes encoded here.
const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (text: string) => text.replace(/[&<>"']/g, char => entities[char]);

export function reportHtml(r: ReturnType<typeof reviewedReport>) {
  const evidence = new Map(r.evidence.map(e => [e.id, e]));
  const list = (ids: string[]) => '<ul>' + ids.map(id => {
    const e = evidence.get(id)!;
    return '<li><b>' + escape(e.participant) + '</b> “' + escape(e.excerpt) + '” <small>[' + escape(id) + ']</small></li>';
  }).join('') + '</ul>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${escape(r.title)} · QuietQuorum</title><style>
*{box-sizing:border-box}body{max-width:54rem;padding:clamp(1rem,5vw,3.5rem);margin:auto;font:16px/1.6 system-ui,sans-serif;color:#263c33;overflow-wrap:anywhere}
header{border-bottom:3px solid #51765c}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}h1{font-size:2.4rem}h2{margin-top:2rem}h4{margin-bottom:0}ul{padding-left:1.5rem}li{margin:.5rem 0}
article{border-top:1px solid #b4c4b6;margin-top:1.5rem}small,.meta{font-size:.83em;color:#46594c}blockquote{border-left:3px solid #719477;padding-left:1em;margin-left:0}
@media print{@page{margin:16mm}body{padding:0;font-size:10pt}h1,h2,h3,h4{break-after:avoid}li{break-inside:avoid}}
</style></head><body><header><p>QuietQuorum · Reviewed research report${r.synthetic ? ' · Fictional study' : ''}</p><h1>${escape(r.title)}</h1><blockquote>${escape(r.question)}</blockquote><p class="meta">Generated ${escape(r.generatedAt)} · Original synthesis ${escape(r.createdAt)}</p></header>
<section><h2>Executive summary</h2><p>${r.findings.length} reviewed findings draw on ${r.evidence.length} approved excerpts from ${r.participants} participants.</p><ul>${r.findings.map(f => '<li>'+escape(f.title)+'</li>').join('')}</ul></section>
<h2>Reviewed findings</h2>${r.findings.map(f => `<article><h3>${escape(f.title)}</h3><p>${escape(f.summary)}</p><p class="meta">${escape(f.author)} · Human reviewed</p>${roles.map(role => {
    const ids = f[role] ?? [];
    const count = new Set(ids.map(id => evidence.get(id)!.participant)).size;
    return ids.length || role === 'conflict' ? '<h4>'+roleLabels[role]+' · '+count+' participants</h4>'+(ids.length ? list(ids) : '<p>No excerpts classified here.</p>') : '';
  }).join('')}${f.mixedParticipants.length ? '<p>Participants with both supporting and conflicting statements: '+f.mixedParticipants.map(escape).join(', ')+'</p>' : ''}</article>`).join('')}
<section><h2>Approved evidence outside the findings</h2>${r.uncovered.length ? list(r.uncovered) : '<p>Every approved excerpt has a citation.</p>'}</section>
<section><h2>Method and limitations</h2><p>${escape(r.note)}</p><p>Source of initial findings: ${escape(r.origin)}. The reviewer selected the shared excerpts and checked the final interpretations. Citation checks establish traceability.</p></section></body></html>`;
}
