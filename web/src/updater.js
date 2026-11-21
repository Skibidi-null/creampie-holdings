// Android in-app updates: the native side checks/downloads/installs; this shows the HOLO sheet.
import { useState, useEffect } from 'preact/hooks';
import { html, Sheet } from './ui.js';
import { Icon } from './icons.js';
import { feedback } from './fx.js';

const N = () => window.CPNative;
let last = null; const subs = new Set();
window.cpUpdate = (s) => { last = s; subs.forEach((f) => f(s)); };
export const nativeVersion = () => { try { return N() && N().appVersion ? N().appVersion() : null; } catch { return null; } };
export const checkUpdate = () => { try { N().checkUpdate(true); } catch {} };

export function UpdateSheet() {
  const [st, setSt] = useState(last);
  const [open, setOpen] = useState(!!(last && last.state === 'available'));
  useEffect(() => { const f = (s) => { setSt(s); if (s.state !== 'checking') setOpen(true); }; subs.add(f); return () => subs.delete(f); }, []);
  if (!open || !st || !N()) return null;
  const close = () => { if (st.state === 'available') { try { N().updateLater(); } catch {} } setOpen(false); };
  const S = st.state;
  return html`<${Sheet} title=${S === 'uptodate' ? 'Up to date' : 'Update'} onClose=${close}>${(c) => html`
    ${S === 'available' && html`<div class="holo" style="margin-bottom:14px"><div class="in"><div class="content"><span class="label">New version</span><div class="nw-big" style="font-size:34px">v${st.version}</div><div class="hint" style="margin-top:8px">${st.size ? (st.size / 1048576).toFixed(1) + ' MB · ' : ''}your data stays on the phone</div></div></div></div>
      ${st.notes && html`<div class="note" style="margin-bottom:14px;white-space:pre-line">${st.notes}</div>`}
      <div class="btns"><button class="btn" onClick=${c}>Later</button><button class="btn holo" onClick=${() => { feedback('set'); N().downloadUpdate(); setSt({ state: 'downloading', progress: 0 }); }}><${Icon} n="download" size=${17} /> Update now</button></div>`}
    ${S === 'downloading' && html`<div class="label">Downloading</div><div class="bar ok" style="margin:12px 0 6px"><i style=${{ width: Math.round((st.progress || 0) * 100) + '%' }}></i></div><div class="hint mono">${Math.round((st.progress || 0) * 100)}%</div>`}
    ${S === 'permission' && html`<div class="note" style="margin-bottom:12px">Android needs your OK to install updates from Creampie Holdings. Turn on "Allow from this source", then come back.</div><button class="btn holo block" onClick=${() => N().openInstallPermission()}>Open settings</button>`}
    ${S === 'installing' && html`<div class="hint">Installing… the app restarts by itself.</div>`}
    ${S === 'done' && html`<div class="callout good">Updated.</div>`}
    ${S === 'uptodate' && html`<div class="hint">You have the latest version (${st.version}).</div>`}
    ${S === 'failed' && html`<div class="callout bad" style="margin-bottom:12px">${st.message}</div><button class="btn block" onClick=${() => N().checkUpdate(true)}>Try again</button>`}
  `}<//>`;
}
