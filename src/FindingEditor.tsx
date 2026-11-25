import { useState } from 'react';
import { roles, type Finding, type Payload } from './domain';

type Props = {
  finding: Finding;
  payload: Payload;
  onSave: (draft: Finding) => void;
  onCancel: () => void;
};

export default function FindingEditor({ finding, payload, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(finding);
  const [error, setError] = useState('');
  function setRole(id: string, role: string) {
    setDraft(current => {
      const next = { ...current };
      for (const key of roles) {
        next[key] = (current[key] ?? []).filter(item => item !== id);
        if (role === key) next[key]!.push(id);
      }
      return next;
    });
    setError('');
  }
  return <form className="finding-editor" onSubmit={event => {
    event.preventDefault();
    try { onSave(draft); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save this correction.'); }
  }}>
    <h2 id="edit-heading">{finding.title ? 'Edit finding' : 'Create finding'}</h2>
    <p>Check the claim against the approved excerpts. Saving a change requires a fresh review before export.</p>
    <label>Finding title<input required maxLength={150} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}/></label>
    <label>Summary<textarea required maxLength={3000} rows={4} value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })}/></label>
    <fieldset><legend>Citations for this finding</legend>
      <p>Choose at least one supporting excerpt. Use counterevidence when an excerpt challenges this specific claim.</p>
      {payload.evidence.map(item => <label className="citation-role" key={item.id}>
        <span><strong>{item.participant}</strong> “{item.excerpt}”</span>
        <select value={roles.find(role => draft[role]?.includes(item.id)) ?? 'unused'}
          onChange={e => setRole(item.id, e.target.value)}>
          <option value="unused">Uncited here</option><option value="support">Supporting</option><option value="conflict">Possible counterevidence</option><option value="neutral">Neutral context</option><option value="uncertain">Uncertain</option>
        </select>
      </label>)}
    </fieldset>
    {error && <p className="notice error" role="alert">{error}</p>}
    <div className="modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" type="submit">Save finding</button></div>
  </form>;
}
