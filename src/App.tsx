import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowRight, Check, CheckCheck, ChevronRight, CircleHelp, Cloud, FileText, FlaskConical, Leaf, ListFilter, LoaderCircle, LockKeyhole, MessageSquareQuote, MoreHorizontal, Plus, Settings2, ShieldCheck, Sparkles, Trash2, Users, WifiOff, X } from 'lucide-react';
import { countPeople, createCard, demoStudy, editCard, emptyStudy, exampleFindings, exportReport, isStale, makePayload, uid, uncovered, uncoveredPassages, type Card, type Payload, type Study } from './domain';
import { loadStudy, saveStudy } from './storage';
import { extractEvidence, synthesize, configurationStatus } from './inference';

type View = 'notes' | 'review' | 'findings';
type Dialog = 'payload' | 'settings' | 'new' | 'demo' | 'delete' | null;
const steps: { id: View; label: string; icon: typeof FileText }[] = [{ id: 'notes', label: 'Capture notes', icon: FileText }, { id: 'review', label: 'Review evidence', icon: ShieldCheck }, { id: 'findings', label: 'Explore findings', icon: MessageSquareQuote }];
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export default function App() {
  const [study, setStudy] = useState<Study | null>(null);
  const [view, setView] = useState<View>('notes');
  const [selected, setSelected] = useState('P01');
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [source, setSource] = useState<Card | null>(null);
  const [pending, setPending] = useState<Payload | null>(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');
  const [saved, setSaved] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [excerpt, setExcerpt] = useState('');
  const [progress, setProgress] = useState(0);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const upload = useRef<HTMLInputElement>(null);
  const noteArea = useRef<HTMLTextAreaElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const revision = useRef(0);
  const activeRun = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    loadStudy().then(value => { if (active) setStudy(value || demoStudy()); }).catch(() => {
      if (active) { setStorageAvailable(false); setFailure('Browser storage is unavailable. Changes in this session will not survive a reload.'); setStudy(emptyStudy()); }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!study || !storageAvailable) return;
    let active = true; setSaved(false);
    saveQueue.current = saveQueue.current.catch(() => {}).then(() => saveStudy(study));
    saveQueue.current.then(() => { if (active) setSaved(true); }).catch(() => { if (active) { setSaved(false); setFailure('Could not save locally. Storage may be full. Keep this tab open and free some browser storage.'); } });
    return () => { active = false; };
  }, [study, storageAvailable]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => {
    if (dialog || source) modal.current?.showModal(); else modal.current?.close();
  }, [dialog, source]);
  const change = (fn: (s: Study) => Study) => { revision.current++; setStudy(s => s ? fn(s) : s); setNotice(''); };
  const act = (fn: () => void) => { setFailure(''); try { fn(); } catch (e) { setFailure(errorText(e)); } };
  const close = () => { if (!busy || source || dialog === 'settings') { setDialog(null); setSource(null); setPending(null); } };
  if (!study) return <div className="loading"><Leaf size={32} /><p>Opening your workspace…</p></div>;
  const note = study.notes.find(n => n.id === selected) || study.notes[0];
  const approved = study.cards.filter(c => c.approved).length;
  const noteCards = study.cards.filter(c => c.noteId === note?.id);
  const result = study.result;
  const stale = isStale(study);
  const uncoveredCards = result ? uncovered(result) : [];
  const configuration = configurationStatus();
  const editNote = (field: 'text' | 'privateName' | 'privateContact' | 'label', value: string) => {
    if (!note) return;
    change(s => ({ ...s, synthetic: field === 'text' ? false : s.synthetic, notes: s.notes.map(n => n.id === note.id ? { ...n, [field]: value } : n), cards: field === 'text' ? s.cards.filter(c => c.noteId !== note.id) : s.cards }));
  };
  const addNote = (text = '') => {
    const id = uid();
    change(s => ({ ...s, synthetic: false, notes: [...s.notes, { id, label: `Interview ${s.notes.length + 1}`, text, privateName: '', privateContact: '' }] }));
    setSelected(id); setView('notes'); setExcerpt('');
  };
  const replaceStudy = (next: Study) => { change(() => next); setSelected(next.notes[0]?.id || ''); setView('notes'); setExcerpt(''); close(); };
  const addExcerpt = () => act(() => {
    if (!note) return;
    const c = createCard(note, excerpt);
    if (noteCards.some(x => x.quote === c.quote)) throw new Error('This excerpt already has an evidence card.');
    change(s => ({ ...s, cards: [...s.cards, c] })); setExcerpt(''); setNotice('Evidence card created. Review it before sharing.');
  });
  const runExtraction = async () => {
    if (!note) return;
    const currentRevision = revision.current;
    const run = ++activeRun.current;
    setBusy('Preparing on-device AI'); setFailure(''); setProgress(0);
    try {
      const output = await extractEvidence(note, p => { if (activeRun.current === run) setProgress(p); });
      if (activeRun.current !== run) return;
      if (currentRevision !== revision.current) throw new Error('The notes changed during extraction. Please try again.');
      const existing = new Set(noteCards.map(c => c.quote));
      const cards = output.quotes.filter(q => !existing.has(q)).map(q => createCard(note, q, 'on-device'));
      change(s => ({ ...s, cards: [...s.cards, ...cards] }));
      setNotice(`${cards.length} source-checked cards added · ${output.origin} · ${(output.elapsedMs / 1000).toFixed(1)}s. Review before sharing.`);
    } catch (e) { if (activeRun.current === run) setFailure(errorText(e)); } finally { if (activeRun.current === run) setBusy(''); }
  };
  const prepareSynthesis = () => act(() => { setPending(makePayload(study)); setDialog('payload'); });
  const runSynthesis = async () => {
    if (!pending || !online) return;
    const currentRevision = revision.current;
    const run = ++activeRun.current;
    setBusy('Comparing approved evidence'); setFailure('');
    try {
      const output = await synthesize(pending);
      if (activeRun.current !== run) return;
      if (currentRevision !== revision.current) throw new Error('Evidence changed while generating. Please review and try again.');
      change(s => ({ ...s, result: { ...output, payload: pending, reviewed: false, createdAt: new Date().toISOString() } }));
      setDialog(null); setPending(null); setView('findings'); setNotice('Draft findings are ready. Review citations and uncovered evidence.');
    } catch (e) { if (activeRun.current === run) setFailure(errorText(e)); } finally { if (activeRun.current === run) setBusy(''); }
  };
  const loadExample = () => act(() => {
    const payload = makePayload(study);
    const findings = exampleFindings(payload);
    change(s => ({ ...s, result: { findings, payload, origin: 'Written example · no AI request', elapsedMs: 0, createdAt: new Date().toISOString(), reviewed: false } }));
    setView('findings'); setNotice('Showing written example findings for fictional interviews. No AI request was made.');
  });
  const exportCurrent = () => act(() => {
    const blob = new Blob([exportReport(study)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'quietquorum-reviewed-report.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Report exported with approved excerpts and pseudonyms. Original notes and private identity fields are excluded.');
  });
  const cardElement = (card: Card) => <article className={`evidence-card ${card.approved ? 'approved' : ''}`} key={card.id}>
    <div className="card-top"><span className="person"><Users size={13}/>{study.notes.find(n => n.id === card.noteId)?.label}</span><span className="origin">{card.origin === 'example' ? 'Fictional excerpt' : card.origin === 'on-device' ? 'On-device AI' : 'Manual excerpt'}</span></div>
    <blockquote>“{card.shareText}”</blockquote>
    <details><summary>Edit shared excerpt</summary><label>Remove identifying details<textarea aria-label={`Shared excerpt ${card.id}`} value={card.shareText} disabled={!!busy} onChange={e => { const value = e.target.value; change(s => ({ ...s, cards: s.cards.map(c => c.id === card.id ? editCard(c, value) : c) })); }}/></label><p className="micro">Editing clears approval. The original quote remains on this device.</p></details>
    <div className="card-actions"><button className="text-button" onClick={() => setSource(card)}>View source <ChevronRight size={14}/></button><label className="approval"><input type="checkbox" checked={card.approved} disabled={!!busy || !card.shareText.trim()} onChange={e => { const checked = e.target.checked; change(s => ({ ...s, cards: s.cards.map(c => c.id === card.id ? { ...c, approved: checked } : c) })); }}/>{card.approved ? 'Approved for cloud' : 'Approve for cloud'}</label></div>
  </article>;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setView('notes'); }}><span className="brand-symbol"><MessageSquareQuote size={23}/></span><span>QuietQuorum<span className="brand-sub">EVERY VOICE ACCOUNTED FOR</span></span></a>
      <div className="workspace-label">YOUR WORKSPACE <span>01</span></div>
      <button className="study-switch" onClick={() => setDialog('new')} disabled={!!busy}><span className="study-icon"><Leaf size={18}/></span><span>{study.title}<small>Local research study</small></span><MoreHorizontal size={16}/></button>
      <div className="nav-label">STUDY WORKFLOW</div>
      <nav aria-label="Study workflow">{steps.map(({ id, label, icon: Icon }, i) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}><Icon size={18}/><span>{label}</span><span className="nav-count">{i === 0 ? study.notes.length : i === 1 ? study.cards.length : result?.findings.length || '—'}</span></button>)}</nav>
      <div className="sidebar-note"><LockKeyhole size={18}/><strong>A little room for trust.</strong><p>Your original notes stay in this browser. You choose what leaves.</p><button className="text-button" onClick={() => setDialog('settings')}>How privacy works <ArrowRight size={13}/></button></div>
      <div className="sidebar-bottom"><button onClick={() => setDialog('settings')}><Settings2 size={17}/> Settings & AI setup</button><button onClick={() => setDialog('demo')} disabled={!!busy}><FlaskConical size={17}/> Open example study</button><div className="profile"><span>W</span><div>My workspace<small>Stored on this device</small></div><span className="presence"/></div></div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/><span>{study.title}</span></div><div className="topbar-right"><span className={`save-state ${saved ? '' : 'pending'}`}>{saved ? <Check size={14}/> : <LoaderCircle size={14}/>} {saved ? 'Saved on this device' : storageAvailable ? 'Saving…' : 'Not saved'}</span><button className="icon-button" aria-label="Help and privacy" onClick={() => setDialog('settings')}><CircleHelp size={19}/></button></div></header>
      <main>
        {busy && <div className="notice" role="status"><LoaderCircle size={16} className="spin"/><span>{busy}{progress > 0 ? ` ? ${Math.round(progress * 100)}%` : ''}</span><button onClick={() => { activeRun.current++; setBusy(''); setNotice('Stopped waiting. Any model download or request may continue, but its results will not be added.'); }}>Stop waiting</button></div>}
        {!online && <div className="notice offline"><WifiOff size={16}/> You’re offline. Capture and review still work. Cloud synthesis waits for you to reconnect and choose Send.</div>}
        {failure && <div className="notice error" role="alert"><span>{failure}</span><button aria-label="Dismiss error" onClick={() => setFailure('')}><X size={17}/></button></div>}
        {notice && <div className="notice" role="status"><Check size={16}/><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={17}/></button></div>}
        <div className="page-heading"><div><div className="eyebrow">{study.synthetic ? <><span className="tiny-dot"/> FICTIONAL EXAMPLE STUDY</> : <><span className="tiny-dot"/> PRIVATE RESEARCH WORKSPACE</>}</div><h1>{view === 'notes' ? 'Good findings start with listening.' : view === 'review' ? 'A thoughtful pause before sharing.' : 'The whole story. Including the exceptions.'}</h1><p>{view === 'notes' ? 'Capture each perspective. Keep the details private. Make room for every voice.' : view === 'review' ? 'Check the evidence, remove identifying details, and decide what can leave this device.' : 'Follow the evidence, notice the disagreement, and see what still needs attention.'}</p></div><button className="button secondary" disabled={!result || stale || !result.reviewed || !!busy} onClick={exportCurrent}><ArrowDownToLine size={16}/> Export report</button></div>
        <section className="study-overview"><div className="question-block"><span className="eyebrow">RESEARCH QUESTION</span><textarea rows={2} aria-label="Research question" disabled={!!busy} value={study.question} placeholder="What do you want to understand?" onChange={e => { const value = e.target.value; change(s => ({ ...s, question: value, synthetic: false })); }}/><span className="study-meta"><LockKeyhole size={12}/> Original notes are local <span>·</span> {study.synthetic ? '6 fictional participants · Sample data, not real research' : `${study.notes.length} interview notes`}</span></div><div className="overview-stat"><strong>{study.notes.length.toString().padStart(2, '0')}</strong><span>Participants</span></div><div className="overview-stat"><strong>{study.cards.length.toString().padStart(2, '0')}</strong><span>Evidence cards</span></div><div className="overview-stat last"><strong>{approved.toString().padStart(2, '0')}</strong><span>Cloud approved</span></div></section>
        <div className="step-tabs">{steps.map(({ id, label }, i) => <button key={id} className={view === id ? 'selected' : ''} onClick={() => setView(id)}><span>{String(i + 1).padStart(2, '0')}</span>{label}{i < 2 && <ChevronRight size={15}/>}</button>)}<span className="local-badge"><ShieldCheck size={14}/> Private by default</span></div>

        {view === 'notes' && <div className="capture-layout"><section className="interview-list"><div className="section-title"><h2>Interviews <span>{study.notes.length}</span></h2><button className="icon-button" aria-label="Add interview" disabled={!!busy} onClick={() => addNote()}><Plus size={18}/></button></div><div className="interview-items">{study.notes.map((n, i) => <button key={n.id} className={`interview-item ${note?.id === n.id ? 'current' : ''}`} onClick={() => { setSelected(n.id); setExcerpt(''); }} disabled={!!busy}><span className={`avatar tone-${i % 4}`}>{String(i + 1).padStart(2, '0')}</span><span><strong>{n.label}</strong><small>{study.cards.filter(c => c.noteId === n.id).length} evidence cards</small></span><ChevronRight size={15}/></button>)}</div><button className="button add-note" disabled={!!busy} onClick={() => addNote()}><Plus size={16}/> New interview</button><button className="text-button import-link" disabled={!!busy} onClick={() => upload.current?.click()}><ArrowDownToLine size={14}/> Import a .txt note</button><input hidden type="file" accept=".txt,text/plain" ref={upload} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 100_000) { setFailure('Please use a text note smaller than 100 KB.'); return; } try { addNote(await file.text()); } catch { setFailure('Could not read that text file.'); } e.target.value = ''; }}/><div className="list-foot"><Leaf size={24}/><p>Different perspectives.<br/>A more complete picture.</p></div></section>
          <section className="note-panel">{note ? <><div className="section-title"><div><span className="eyebrow">INTERVIEW NOTE</span><input className="note-title" aria-label="Interview label" value={note.label} disabled={!!busy} onChange={e => editNote('label', e.target.value)}/></div><span className="pill muted"><LockKeyhole size={12}/> Only on this device</span></div><details className="identity-fields"><summary><LockKeyhole size={13}/> Private participant details <span>Optional</span></summary><div className="two-columns"><label>Name<input value={note.privateName} disabled={!!busy} onChange={e => editNote('privateName', e.target.value)}/></label><label>Contact<input value={note.privateContact} disabled={!!busy} onChange={e => editNote('privateContact', e.target.value)}/></label></div><p className="micro">These fields never go into the cloud payload or shared report.</p></details><label className="note-label" htmlFor="interview-text">What did they share?</label><textarea ref={noteArea} id="interview-text" className="note-text" placeholder="Write or paste the interview notes here…" value={note.text} disabled={!!busy} onChange={e => editNote('text', e.target.value)} onSelect={e => { const el = e.currentTarget; if (el.selectionEnd > el.selectionStart) setExcerpt(el.value.slice(el.selectionStart, el.selectionEnd)); }}/><div className="note-meta"><span>{note.text.length} characters · Editing notes removes their existing cards</span><button className="text-button danger" disabled={!!busy} onClick={() => setDialog('delete')} aria-label="Delete this interview"><Trash2 size={14}/></button></div><div className="ai-action"><div className="ai-icon"><Sparkles size={19}/></div><div><strong>Find the evidence, on this device</strong><p>AI suggests exact excerpts. You stay in control of what gets shared.</p></div><button className="button primary" disabled={!!busy || !note.text.trim()} onClick={runExtraction}>{busy ? <LoaderCircle size={15} className="spin"/> : <Sparkles size={15}/>} {busy ? `${busy}${progress ? ` ${Math.round(progress * 100)}%` : '…'}` : 'Suggest evidence'}</button></div><details className="manual-editor" open={!configuration.ready}><summary>Or create an evidence card yourself</summary><p className="micro">Select text above, or paste an exact excerpt below.</p><div className="manual-row"><textarea aria-label="Exact source excerpt" value={excerpt} disabled={!!busy} onChange={e => setExcerpt(e.target.value)} placeholder="An exact quote from this interview…"/><button className="button secondary" disabled={!!busy || !excerpt.trim()} onClick={addExcerpt}><Plus size={15}/> Add card</button></div></details></> : <div className="empty"><FileText size={34}/><h2>Start with one conversation.</h2><p>Add an interview or import a text note to begin.</p><button className="button primary" onClick={() => addNote()}><Plus size={16}/> Add interview</button></div>}</section>
          <section className="preview-panel"><div className="section-title"><h2>Evidence preview</h2><span className="count-circle">{noteCards.length}</span></div><p className="section-caption">Small pieces of a bigger story.</p>{noteCards.length ? noteCards.map(cardElement) : <div className="empty small"><MessageSquareQuote size={28}/><p>Exact excerpts will appear here.<br/>Create a card or ask on-device AI.</p></div>}{note && uncoveredPassages(note, noteCards).length > 0 && <details className="uncovered-source"><summary>{uncoveredPassages(note, noteCards).length} source passages without a full-sentence card</summary><p className="micro">Still on this device. Check for missed constraints; some passages may be irrelevant or private.</p>{uncoveredPassages(note, noteCards).map((passage, i) => <div key={i}><p>{passage}</p><button className="text-button" disabled={!!busy} onClick={() => act(() => { const card = createCard(note, passage); change(s => ({ ...s, cards: [...s.cards, card] })); })}><Plus size={12}/> Make a manual card</button></div>)}</details>}<button className="text-button next-step" onClick={() => setView('review')}>Review all evidence <ArrowRight size={15}/></button></section>
        </div>}

        {view === 'review' && <><div className="review-intro"><div><h2>What can leave this device?</h2><p>Approval is per excerpt. Names in your private fields stay local; check the excerpts for identifying details too.</p></div><span className="pill sage"><CheckCheck size={14}/>{approved} of {study.cards.length} approved</span></div><div className="review-toolbar"><div className="filter-pills" aria-label="Filter evidence">{['all', 'pending', 'approved'].map(f => <button key={f} className={filter === f ? 'chosen' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All evidence' : f === 'pending' ? 'Needs review' : 'Approved'}</button>)}</div><span className="micro"><ListFilter size={14}/> Grouped by participant</span></div><div className="review-grid">{study.cards.filter(c => filter === 'all' || (filter === 'approved' ? c.approved : !c.approved)).map(cardElement)}</div>{!study.cards.length && <div className="empty"><FileText size={32}/><h2>No evidence yet</h2><p>Create a card from a source note first.</p><button className="button secondary" onClick={() => setView('notes')}>Capture notes</button></div>}
        {study.synthetic && <div className="example-bar"><FlaskConical size={18}/><div><strong>Trying the fictional example?</strong><span>Approve its prepared excerpts, then explore written example findings. This makes no AI request.</span></div><button className="button secondary" disabled={!!busy} onClick={() => act(() => { const original = demoStudy(); if (JSON.stringify(study.notes) !== JSON.stringify(original.notes) || JSON.stringify(study.cards.map(c => ({ ...c, approved: false }))) !== JSON.stringify(original.cards)) throw new Error('The example was edited. Please review each card individually.'); change(s => ({ ...s, cards: s.cards.map(c => ({ ...c, approved: true })) })); })}>Approve example excerpts</button><button className="button secondary" disabled={!!busy || !approved} onClick={loadExample}>View example findings <ArrowRight size={15}/></button></div>}
        <div className="synthesis-bar"><div className="synthesis-icon"><Cloud size={23}/></div><div><strong>Find connections. Keep the contradictions.</strong><p>Compare approved excerpts with cloud AI. You’ll see the exact payload before sending.</p></div><button className="button primary" disabled={!approved || !!busy || !online} onClick={prepareSynthesis}>Review cloud payload <ArrowRight size={16}/></button></div></>}

        {view === 'findings' && (result ? <><div className="result-header"><div><h2>What the evidence is telling us <span className="pill lavender">{result.reviewed ? 'Reviewed' : 'Draft findings'}</span></h2><p>{result.origin} {result.elapsedMs > 0 && `· ${(result.elapsedMs / 1000).toFixed(1)} seconds`} · {result.payload.evidence.length} approved excerpts</p></div><button className="button secondary" onClick={() => setView('review')}>Review evidence</button></div>{stale && <div className="notice error">The evidence or question has changed. These findings refer to the previous snapshot. Generate new findings before exporting.</div>}<div className="findings-layout"><div>{result.findings.map((f, index) => <article className="finding" key={f.id}><div className="finding-kicker"><span>FINDING {String(index + 1).padStart(2, '0')}</span>{f.conflict.length > 0 && <span className="pill amber">Different perspectives</span>}</div><h3>{f.title}</h3><p>{f.summary}</p><div className="evidence-columns">{[{ label: 'Supporting voices', ids: f.support, kind: 'support' }, { label: 'Possible counterevidence', ids: f.conflict, kind: 'conflict' }].map(group => <div className={group.kind} key={group.kind}><h4><span className="tiny-dot"/>{group.label}<span>{countPeople(group.ids, result.payload)}</span></h4>{group.ids.length ? group.ids.map(id => { const item = result.payload.evidence.find(c => c.id === id)!; const original = study.cards.find(c => c.id === id); return <button className="citation" key={id} onClick={() => original ? setSource(original) : setNotice('The original note is no longer in this workspace; this excerpt comes from the saved result snapshot.')}><strong>{item.participant}</strong><span>“{item.excerpt}”</span><ChevronRight size={13}/></button>; }) : <p className="micro">No counterevidence identified. This is not proof of agreement.</p>}</div>)}</div></article>)}</div><aside className="coverage-panel"><span className="eyebrow">EVIDENCE COVERAGE</span><div className="coverage-value">{result.payload.evidence.length - uncoveredCards.length}<span> / {result.payload.evidence.length}</span></div><p>approved excerpts represented</p><div className="coverage-track"><span style={{ width: `${100 * (1 - uncoveredCards.length / result.payload.evidence.length)}%` }}/></div><div className="coverage-divider"/><h3>Still outside the story <span>{uncoveredCards.length}</span></h3><p className="micro">Uncovered evidence deserves a second look. Coverage measures citations, not accuracy.</p>{uncoveredCards.map(c => <div className="uncovered-card" key={c.id}><span>{c.participant}</span><p>“{c.excerpt}”</p></div>)}<div className="review-check"><label><input type="checkbox" checked={result.reviewed} disabled={stale || !!busy} onChange={e => { const checked = e.target.checked; change(s => ({ ...s, result: s.result ? { ...s.result, reviewed: checked } : null })); }}/> I reviewed the citations, interpretations, and uncovered evidence.</label></div><button className="button primary full" disabled={!result.reviewed || stale} onClick={exportCurrent}><ArrowDownToLine size={16}/> Export reviewed report</button></aside></div></> : <div className="empty findings-empty"><span className="big-icon"><MessageSquareQuote size={34}/></span><h2>Every finding needs a trail.</h2><p>Approve evidence first, then compare it with cloud AI.<br/>Supporting voices, disagreements, and missed excerpts will appear here.</p><button className="button primary" onClick={() => setView('review')}>Review evidence <ArrowRight size={16}/></button></div>)}
        <footer className="main-footer"><span><Leaf size={14}/> Made for listening, not jumping to conclusions.</span><span>QuietQuorum · {study.synthetic ? 'Fictional demonstration' : 'Local workspace'}</span></footer>
      </main>
    </div>

    <dialog ref={modal} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === modal.current) close(); }}><div className="modal-content"><button className="modal-close icon-button" aria-label="Close dialog" disabled={!!busy} onClick={close}><X size={21}/></button>
      {dialog === 'payload' && pending && <><span className="eyebrow">YOU DECIDE WHAT LEAVES</span><h2>Review the cloud payload.</h2><p>The research question and these {pending.evidence.length} excerpts will be sent to Google through Firebase AI Logic. Check for identifying details before continuing.</p><div className="payload-facts"><span><ShieldCheck size={15}/> No private identity fields</span><span>{new TextEncoder().encode(JSON.stringify(pending)).length.toLocaleString()} bytes of evidence data</span></div><pre className="payload">{JSON.stringify(pending, null, 2)}</pre>{!configuration.ready && <p className="notice error">Firebase AI setup is incomplete. You can review the payload now; sending requires configuration.</p>}{failure && <p className="notice error" role="alert">{failure}</p>}<div className="modal-actions"><button className="button secondary" disabled={!!busy} onClick={close}>Go back</button><button className="button primary" disabled={!!busy || !online || !configuration.ready} onClick={runSynthesis}>{busy ? <LoaderCircle size={16} className="spin"/> : <Cloud size={16}/>} {busy || 'Send approved payload'}</button></div></>}
      {dialog === 'settings' && <><span className="eyebrow">WORKSPACE SETTINGS</span><h2>Private notes. Deliberate sharing.</h2><label>Study name<input value={study.title} disabled={!!busy} onChange={e => { const value = e.target.value; change(s => ({ ...s, title: value })); }}/></label><div className="settings-section"><LockKeyhole size={20}/><div><h3>Stored in this browser</h3><p>Notes and private participant fields stay in IndexedDB on this device. They are not encrypted by QuietQuorum. Anyone with access to this browser profile may be able to read them.</p></div></div><div className="settings-section"><Sparkles size={20}/><div><h3>On-device extraction</h3><p>Firebase AI Logic uses only the local model for raw notes. If unavailable, create excerpts manually. The app never falls back to the cloud for original notes. First use may download a model.</p></div></div><div className="settings-section"><Cloud size={20}/><div><h3>Cloud synthesis · {configuration.ready ? 'Configured, not yet verified' : 'Setup needed'}</h3><p>{configuration.message}</p><p>Only the question and approved excerpts are sent when you confirm the payload. AI interpretations need human review.</p></div></div><p className="micro">Developer setup: copy .env.example to .env.local and configure Firebase AI Logic with App Check. Private third-party API keys do not belong in the browser.</p><button className="button danger-button" disabled={!!busy} onClick={() => setDialog('new')}><Trash2 size={16}/> Clear study and start fresh</button></>}
      {(dialog === 'new' || dialog === 'demo') && <><span className="eyebrow">REPLACE LOCAL STUDY</span><h2>{dialog === 'demo' ? 'Open the fictional workshop?' : 'Start a fresh study?'}</h2><p>This replaces the current study, notes, cards, and findings on this device. Export a reviewed report first if you need to keep it. Reports do not include private notes.</p><div className="modal-actions"><button className="button secondary" onClick={close}>Keep current study</button><button className="button primary" onClick={() => replaceStudy(dialog === 'demo' ? demoStudy() : emptyStudy())}>{dialog === 'demo' ? 'Replace with example' : 'Clear and start fresh'}</button></div></>}
      {dialog === 'delete' && note && <><h2>Delete this interview?</h2><p>This removes {note.label} and all of its evidence cards. Any existing findings will need to be regenerated.</p><div className="modal-actions"><button className="button secondary" onClick={close}>Keep interview</button><button className="button danger-button" onClick={() => { change(s => ({ ...s, synthetic: false, notes: s.notes.filter(n => n.id !== note.id), cards: s.cards.filter(c => c.noteId !== note.id) })); close(); }}>Delete interview</button></div></>}
      {source && <><span className="eyebrow">SOURCE TRACE · ONLY ON THIS DEVICE</span><h2>{study.notes.find(n => n.id === source.noteId)?.label || 'Original interview'}</h2><p>Original source quote</p><blockquote className="source-quote">{source.quote}</blockquote><p>Full local note</p><div className="full-note">{study.notes.find(n => n.id === source.noteId)?.text || 'This source has been removed.'}</div><p className="micro">The shared excerpt may be edited. A matching citation shows provenance, not that an interpretation is correct.</p></>}
    </div></dialog>
  </div>;
}
