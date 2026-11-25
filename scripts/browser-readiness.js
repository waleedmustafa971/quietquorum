// Synthetic UI regression. Replaces only the dedicated preview workspace.
async () => {
  if (location.origin !== 'http://127.0.0.1:4175') throw Error('Use the isolated release preview on port 4175.');
  const checks = [];
  const pause = () => new Promise(r => setTimeout(r,120));
  const buttons = (root=document) => [...root.querySelectorAll('button')];
  const btn = (name, root=document) => buttons(root).find(b=>b.textContent.trim()===name || b.getAttribute('aria-label')===name);
  const click = async (name,root=document) => {const b=btn(name,root);if (!b || b.disabled) throw Error('Unavailable: '+name);b.click();await pause();};
  const check = (pass,message) => {if (!pass) throw Error(message);checks.push(message);};
  const set = async (el,value) => {
    if (!el) throw Error('Missing input');
    const proto = Object.getPrototypeOf(el);
    Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);
    el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));
    await pause();
  };
  const modal = () => document.querySelector('dialog[open]');
  await click('Open example study');await click('Replace with example');
  await click('Try the example');await click('Approve example excerpts');
  await click('Review cloud payload');
  const payload=JSON.parse(document.querySelector('.payload').textContent);
  check(payload.evidence.length===15 && !JSON.stringify(payload).includes('privateContact'),'Exact approved example packet');
  await click('Go back');await click('View example findings');
  const first=()=>document.querySelector('.finding');
  check(first().querySelector('.support h4').textContent.endsWith('4'),'Repeated statements count once');
  check(btn('Export reviewed report').disabled,'Unreviewed export blocked');
  await click('Edit finding',first());
  await set(modal().querySelector('input'),'Discard this draft');await click('Cancel');
  check(!first().textContent.includes('Discard this draft'),'Cancel preserves finding');
  for(const box of document.querySelectorAll('.finding-actions input')) {box.click();await pause();}
  document.querySelector('.review-check input').click();await pause();
  await click('Edit finding',first());
  await set(modal().querySelector('input'),'Saturday access and weekday alternatives');
  const role=[...modal().querySelectorAll('select')].find(el=>el.value==='conflict');
  await set(role,'uncertain');await click('Save finding');
  check(btn('Export reviewed report').disabled && !first().querySelector('input').checked,'Edit invalidates individual and report review');
  check(first().querySelector('.uncertain h4').textContent.endsWith('1'),'Reclassification updates participant counts');
  await click('Create finding');
  await set(modal().querySelector('input'),'A weekday option');
  await set(modal().querySelector('textarea'),'One participant describes another time.');
  await click('Save finding');
  check(modal().querySelector('[role=alert]').textContent.includes('supporting'),'Manual finding needs real support');
  await set(modal().querySelectorAll('select')[10],'support');await click('Save finding');
  check(document.querySelectorAll('.finding').length===4,'Manual creation');
  await click('Remove finding',document.querySelectorAll('.finding')[3]);await click('Confirm removal');
  check(document.querySelectorAll('.finding').length===3 && document.querySelector('.finding-tools').textContent.includes('Removed'),'Removal retains local revision history');
  for(const box of document.querySelectorAll('.finding-actions input:not(:checked)')) {box.click();await pause();}
  document.querySelector('.review-check input').click();await pause();
  await click('Export reviewed report');
  const frame=modal().querySelector('iframe');
  check(frame.srcdoc.includes('Executive summary') && frame.srcdoc.includes('Saturday access and weekday alternatives') && !frame.srcdoc.includes('@example.invalid'),'HTML report uses reviewed content');
  const native=URL.createObjectURL, nativeClick=HTMLAnchorElement.prototype.click;
  let blob;
  URL.createObjectURL=b=>{blob=b;return native.call(URL,b);};
  HTMLAnchorElement.prototype.click=function(){};
  try {
    await click('Download HTML');check(await blob.text()===frame.srcdoc,'Exact HTML preview matches download bytes');
    await set(modal().querySelector('select'),'json');
    await click('Download JSON');check(await blob.text()===modal().querySelector('pre').textContent,'Exact JSON preview matches download bytes');
    const report=JSON.parse(await blob.text());
    check(!('history' in report) && report.evidence.length===15 && report.findings[0].author.includes('researcher edited'),'Export retains provenance and excludes local history');
  } finally {URL.createObjectURL=native;HTMLAnchorElement.prototype.click=nativeClick;}
  await click('Close dialog');
  await click('01Capture notes');
  await set(document.querySelector('.participant-picker select'),'P02');
  check(document.querySelector('.overview-stat strong').textContent==='05','Linking a repeat interview reduces unique count');
  await click('03Explore findings');
  check(btn('Export reviewed report').disabled && document.querySelector('.notice.error').textContent.includes('previous snapshot'),'Identity changes block stale export');
  await click('Start a new manual analysis');await click('Start manual finding');
  await set(modal().querySelector('input'),'Offline review');await set(modal().querySelector('textarea'),'Prepared from approved excerpts.');
  await set(modal().querySelector('select'),'support');await click('Save finding');
  check(first().textContent.includes('Researcher-created'),'New manual analysis works with an approved snapshot');
  await pause();
  return {checks,passed:checks.length};
}
