async () => {
  if (window.quietQuorumCloudEvaluation?.running) return { alreadyRunning: true };
  const [{ default: original }, { default: followup }, { synthesize }, domain] = await Promise.all([
    import('/fixtures/evaluation.json'), import('/fixtures/evaluation-followup.json'), import('/src/inference.ts'), import('/src/domain.ts')
  ]);
  const tests = [...original.cloud, ...followup];
  const state = window.quietQuorumCloudEvaluation = { running: true, startedAt: new Date().toISOString(), results: [] };
  (async () => {
    for (const test of tests) for (let run = 1; run <= 2; run++) {
      state.current = `${test.id}/${run}`;
      const payload = { question: test.question, evidence: test.evidence };
      try {
        const result = await synthesize(payload);
        state.results.push({ id: test.id, run, rubric: test.rubric, ...result, counts: result.findings.map(f => ({ title: f.title, support: domain.countPeople(f.support, payload), conflict: domain.countPeople(f.conflict, payload) })) });
      } catch (e) { state.results.push({ id: test.id, run, error: e.message }); }
    }
    state.running = false; delete state.current; state.finishedAt = new Date().toISOString();
  })().catch(e => { state.running = false; state.error = String(e); });
  return { started: true, cloudCalls: tests.length * 2 };
}
