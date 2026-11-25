// Evaluate this function only in a local Vite development tab. Uses fictional fixtures.
async () => {
  if (location.origin !== 'http://127.0.0.1:5173') throw Error('Use the dedicated development origin.');
  if (window.qqHeldOut?.running) return 'Already running';
  const {default: cases} = await import('/fixtures/held-out.json');
  const {extractEvidence, synthesize} = await import('/src/inference.ts');
  const state = window.qqHeldOut = {running:true, startedAt:new Date().toISOString(), local:[], cloud:[], baseline:[]};
  // Vite resolves these installed SDK imports from a development module.
  const {baselineSummary} = await import('/scripts/held-out-baseline.ts');
  async function assessCloud() {
    for (const c of cases) {
      const payload = {question:c.question,evidence:c.interviews.map((n,i)=>({id:'e'+(i+1),participant:n.participant,excerpt:n.approvedExcerpt}))};
      for (let run=1; run <= (['repeat-visit','mixed-route','minority-distance'].includes(c.id) ? 2 : 1); run++) {
        try { state.cloud.push({id:c.id,run,...await synthesize(payload)}); }
        catch(e) {state.cloud.push({id:c.id,run,error:e.message});}
      }
      if (['repeat-visit','mixed-route','minority-distance'].includes(c.id)) {
        try {state.baseline.push({id:c.id,...await baselineSummary(payload)});}
        catch {state.baseline.push({id:c.id,error:'Baseline call failed'});}
      }
      if (state.cloud.length >= 3 && state.cloud.slice(-3).every(r=>r.error)) {state.cloudStopped='Three consecutive errors'; break;}
    }
  }
  async function assessLocal() {
    for (const c of cases) {
      for (const [i,n] of c.interviews.entries()) {
        try {
          const result = await extractEvidence({id:'n'+i,label:'Synthetic',text:n.text,privateName:'',privateContact:''},()=>{});
          state.local.push({id:c.id,interview:i,...result,expectedFound:result.quotes.includes(n.approvedExcerpt),extra:result.quotes.filter(q=>q!==n.approvedExcerpt)});
        } catch(e) {state.local.push({id:c.id,interview:i,error:e.message});}
      }
      if (state.local.length >= 3 && state.local.slice(-3).every(r=>r.error)) {state.localStopped='Three consecutive errors'; break;}
    }
  }
  Promise.allSettled([assessLocal(),assessCloud()]).then(() => {state.running=false;state.finishedAt=new Date().toISOString();});
  return {started:true,cases:cases.length};
}
