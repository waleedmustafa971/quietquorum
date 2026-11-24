// Run this function through Chrome DevTools evaluate_script on the local Vite app.
// It uses synthetic fixtures, does not edit the user's workspace, and starts a
// background run. Read window.quietQuorumEvaluation to inspect progress/results.
async () => {
  if (window.quietQuorumEvaluation?.running) return { alreadyRunning: true };
  const [{ default: fixtures }, inference, domain] = await Promise.all([
    import('/fixtures/evaluation.json'), import('/src/inference.ts'), import('/src/domain.ts')
  ]);
  const state = window.quietQuorumEvaluation = { running: true, startedAt: new Date().toISOString(), local: [], cloud: [] };
  const local = async () => {
    for (const test of fixtures.local) {
      state.localCurrent = test.id;
      try {
        const result = await inference.extractEvidence({ id: test.id, label: test.id, text: test.text, privateName: '', privateContact: '' }, () => {});
        const missed = test.expected.filter(s => !result.quotes.some(q => q.includes(s)));
        const forbidden = (test.forbidden || []).filter(s => result.quotes.some(q => q.includes(s)));
        state.local.push({ id: test.id, exploratory: !!test.exploratory, ...result, missed, forbidden, criteriaPassed: !missed.length && !forbidden.length });
      } catch (error) { state.local.push({ id: test.id, error: error.message, criteriaPassed: false }); }
    }
    delete state.localCurrent;
  };
  const cloud = async () => {
    for (const test of fixtures.cloud) {
      // Two runs reveal output variation; manually assess semantics using the rubric.
      for (let run = 1; run <= 2; run++) {
        state.cloudCurrent = `${test.id}/${run}`;
        const payload = { question: test.question, evidence: test.evidence };
        try {
          const result = await inference.synthesize(payload);
          state.cloud.push({ id: test.id, run, rubric: test.rubric, ...result, counts: result.findings.map(f => ({ title: f.title, support: domain.countPeople(f.support, payload), conflict: domain.countPeople(f.conflict, payload) })) });
        } catch (error) { state.cloud.push({ id: test.id, run, error: error.message }); }
      }
    }
    delete state.cloudCurrent;
  };
  Promise.allSettled([local(), cloud()]).then(results => { state.running = false; state.finishedAt = new Date().toISOString(); state.workerErrors = results.filter(r => r.status === 'rejected').map(r => String(r.reason)); });
  return { started: true, localCases: fixtures.local.length, cloudCalls: fixtures.cloud.length * 2 };
}
