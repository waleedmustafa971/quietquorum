// One paced retry of missing synthetic cloud observations. Preserve all prior attempts.
async () => {
  const state=window.qqHeldOut;
  if (location.origin!=='http://127.0.0.1:5173' || !state || state.running || state.retryStarted) throw Error('Complete the first local evaluation before retrying once.');
  const {default:cases}=await import('/fixtures/held-out.json');
  const {synthesize}=await import('/src/inference.ts');
  const {baselineSummary}=await import('/scripts/held-out-baseline.ts');
  state.retryStarted=true;state.running=true;
  (async()=>{
    let failures=0;
    for(const c of cases) {
      const payload={question:c.question,evidence:c.interviews.map((n,i)=>({id:'e'+(i+1),participant:n.participant,excerpt:n.approvedExcerpt}))};
      const repeated=['repeat-visit','mixed-route','minority-distance'].includes(c.id);
      for(let run=1;run<=(repeated?2:1);run++){
        if(state.cloud.some(r=>r.id===c.id && r.run===run && !r.error)) continue;
        await new Promise(r=>setTimeout(r,8000));
        try{state.cloud.push({id:c.id,run,phase:'paced',...await synthesize(payload)});failures=0;}
        catch(e){state.cloud.push({id:c.id,run,phase:'paced',error:e.message});if(++failures===3){state.retryStopped='Three consecutive errors';return;}}
      }
      if(repeated && !state.baseline.some(r=>r.id===c.id)){
        try{state.baseline.push({id:c.id, ...await baselineSummary(payload)});}catch{state.baseline.push({id:c.id,error:'Baseline call failed'});}
      }
    }
  })().finally(()=>{state.running=false;state.finishedAt=new Date().toISOString();});
  return 'Retry started';
}
