import { useState } from 'react';
import { reportHtml } from './report';
import { reviewedReport, type Study } from './domain';

export default function ReportPreview({ study, beforeDownload }: { study: Study; beforeDownload: () => Promise<void> }) {
  const [date] = useState(() => new Date().toISOString());
  const [format, setFormat] = useState<'html' | 'json'>('html');
  const report = reviewedReport(study, date);
  const content = format === 'html' ? reportHtml(report) : JSON.stringify(report, null, 2);
  const [error, setError] = useState('');
  async function download() {
    try { await beforeDownload(); } catch (e) { setError(e instanceof Error ? e.message : 'Check the current workspace before exporting.'); return; }
    const blob = new Blob([content], { type: format === 'html' ? 'text/html;charset=utf-8' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quietquorum-reviewed-report.' + format;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="report-preview"><h2>Preview reviewed report</h2>
    <p>Check the project title, question, findings and excerpts for identifying details. The download contains the content shown below.</p>
    <label>Report format<select value={format} onChange={e => setFormat(e.target.value as typeof format)}><option value="html">Printable HTML</option><option value="json">JSON data</option></select></label>
    {format === 'html' ? <iframe title="Exact report preview" sandbox="" srcDoc={content}/> : <pre className="payload">{content}</pre>}
    {format === 'html' && <p>For a PDF, open the downloaded HTML file and choose Print → Save as PDF.</p>}
    {error && <p role="alert" className="notice error">{error}</p>}
    <button className="button primary" onClick={download}>Download {format.toUpperCase()}</button></section>;
}
