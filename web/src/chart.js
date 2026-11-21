// Interactive charts on TradingView Lightweight Charts (Apache-2.0, v5.2.1, self-hosted lwc.js).
// Pinch zoom, pan, crosshair with values, double-tap reset. Modes: Line, Area, Candles,
// Heikin-Ashi, Liquidity (volume profile + POC; crypto adds live order-book walls) and Heatmap
// (crypto: order book over time sampled while open; others: volume heat).
// Indicators: MA20/50/200, EMA21, VWAP, Bollinger, RSI, MACD, ATR. Drawings: horizontal lines and
// trend lines, saved per asset. Alert lines can be dragged to change the alert.
import { useEffect, useRef, useState } from 'preact/hooks';
import { html } from './ui.js';
import { get, set } from './store.js';
import { sma, ema, rsi, macd, bollinger, atr, vwap, heikinAshi, volumeProfile } from './ta.js';
import { isCrypto, orderBook, useCandles, level, health, ageTxt } from './data.js';
import { Icon } from './icons.js';
import { feedback } from './fx.js';
import { fmtPrice } from './assets.js';

// ---------- loader ----------
let lwcP = null;
export function loadLWC() {
  if (window.LightweightCharts) return Promise.resolve(window.LightweightCharts);
  if (!lwcP) lwcP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'lwc.js'; s.onload = () => res(window.LightweightCharts); s.onerror = () => { lwcP = null; rej(new Error('chart library failed to load')); }; document.head.appendChild(s); });
  return lwcP;
}

export const MODES = [['line', 'Line'], ['area', 'Area'], ['candles', 'Candles'], ['heikin', 'Heikin'], ['liquidity', 'Liquidity'], ['heatmap', 'Heatmap']];
export const INDS = [['ma20', 'MA20'], ['ma50', 'MA50'], ['ma200', 'MA200'], ['ema21', 'EMA21'], ['vwap', 'VWAP'], ['bb', 'Bollinger'], ['rsi', 'RSI'], ['macd', 'MACD'], ['atr', 'ATR'], ['vol', 'Volume']];
const C = { up: '#3CFFB4', down: '#FF5C8A', mag: '#FF3CC8', cyan: '#00D2FF', violet: '#7A5CFF', gold: '#FFE36E', text: '#6E7190', grid: 'rgba(255,255,255,0.045)' };
const IND_COL = { ma20: '#00D2FF', ma50: '#7A5CFF', ma200: '#FF3CC8', ema21: '#FFE36E', vwap: '#9DF6FF', bb: 'rgba(167,148,255,0.7)' };

export const chartPrefs = (sym) => ({ mode: 'area', ind: ['vol'], lines: [], trends: [], ...((get().chart || {})[sym] || {}) });
export function saveChartPrefs(sym, ch) { set((s) => ({ ...s, chart: { ...(s.chart || {}), [sym]: { ...chartPrefs(sym), ...ch } } })); }

const tzShift = () => -new Date().getTimezoneOffset() * 60;

// ---------- series primitives (drawn inside the chart, follow zoom/pan) ----------
class Overlay {
  constructor(draw) { this.drawFn = draw; this.view = { zOrder: () => 'bottom', renderer: () => ({ draw: () => {}, drawBackground: (t) => t.useMediaCoordinateSpace((sc) => this.drawFn(sc, this)) }) }; }
  attached(p) { this.chart = p.chart; this.series = p.series; this.req = p.requestUpdate; }
  detached() { this.chart = null; }
  updateAllViews() {}
  paneViews() { return [this.view]; }
  update() { this.req && this.req(); }
}

// volume profile on the left + POC line + value area
function profileDraw(getVP) {
  return ({ context: ctx, mediaSize }, o) => {
    const vp = getVP(); if (!vp || !o.series) return;
    const w = mediaSize.width * 0.28;
    for (let k = 0; k < vp.vol.length; k++) {
      const p0 = vp.lo + k * vp.step, p1 = p0 + vp.step;
      const y0 = o.series.priceToCoordinate(p1), y1 = o.series.priceToCoordinate(p0); if (y0 == null || y1 == null) continue;
      const len = (vp.vol[k] / vp.max) * w; const inVA = p1 > vp.vaLo && p0 < vp.vaHi;
      const upLen = vp.vol[k] ? (vp.up[k] / vp.vol[k]) * len : 0;
      ctx.fillStyle = inVA ? 'rgba(122,92,255,0.34)' : 'rgba(122,92,255,0.16)';
      ctx.fillRect(0, y0 + 0.5, len, Math.max(1, y1 - y0 - 1));
      ctx.fillStyle = inVA ? 'rgba(60,255,180,0.16)' : 'rgba(60,255,180,0.07)';
      ctx.fillRect(0, y0 + 0.5, upLen, Math.max(1, y1 - y0 - 1));
    }
    const py = o.series.priceToCoordinate(vp.poc);
    if (py != null) {
      ctx.strokeStyle = 'rgba(167,148,255,0.9)'; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(mediaSize.width, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#A794FF'; ctx.font = '9.5px JetBrains Mono, monospace'; ctx.fillText('POC  most traded price', 6, py - 4);
    }
  };
}
// order-book walls on the right edge (crypto)
function wallsDraw(getBook, getPrice) {
  return ({ context: ctx, mediaSize }, o) => {
    const b = getBook(); const px = getPrice(); if (!b || !o.series || !px) return;
    const range = 0.02; const N = 24; const step = (px * range * 2) / N;
    const buckets = new Array(N).fill(0);
    for (const [p, s] of b.bids) { const k = Math.floor((p - (px - px * range)) / step); if (k >= 0 && k < N) buckets[k] += s * p; }
    for (const [p, s] of b.asks) { const k = Math.floor((p - (px - px * range)) / step); if (k >= 0 && k < N) buckets[k] += s * p; }
    const max = Math.max(...buckets, 1); const w = mediaSize.width * 0.3; const right = mediaSize.width - 4;
    let bigBid = -1, bigAsk = -1;
    for (let k = 0; k < N; k++) { const mid = px - px * range + (k + 0.5) * step; if (mid < px) { if (bigBid < 0 || buckets[k] > buckets[bigBid]) bigBid = k; } else if (bigAsk < 0 || buckets[k] > buckets[bigAsk]) bigAsk = k; }
    for (let k = 0; k < N; k++) {
      const p0 = px - px * range + k * step, p1 = p0 + step; const mid = (p0 + p1) / 2;
      const y0 = o.series.priceToCoordinate(p1), y1 = o.series.priceToCoordinate(p0); if (y0 == null || y1 == null) continue;
      const len = (buckets[k] / max) * w; const bid = mid < px;
      ctx.fillStyle = bid ? `rgba(60,255,180,${k === bigBid ? 0.75 : 0.35})` : `rgba(255,92,138,${k === bigAsk ? 0.75 : 0.35})`;
      ctx.fillRect(right - len, y0 + 1, len, Math.max(1, y1 - y0 - 2));
      if (k === bigBid || k === bigAsk) { ctx.fillStyle = bid ? C.up : C.down; ctx.font = '9.5px JetBrains Mono, monospace'; ctx.textAlign = 'right'; ctx.fillText(bid ? 'BUY WALL' : 'SELL WALL', right - len - 6, (y0 + y1) / 2 + 3); ctx.textAlign = 'left'; }
    }
  };
}
// order book heatmap over time (crypto) or volume heat (others)
function heatDraw(getSnaps, getBars) {
  return ({ context: ctx, mediaSize }, o) => {
    if (!o.series || !o.chart) return;
    const ts = o.chart.timeScale(); const snaps = getSnaps();
    if (snaps && snaps.length) {
      const bars = getBars(); if (!bars.length) return;
      const toX = (t) => { // interpolate time to x via bar logical index
        let i = bars.findIndex((b) => b.time > t); if (i < 0) i = bars.length; const a = bars[i - 1] || bars[0], b = bars[i] || bars.at(-1);
        const frac = b.time > a.time ? (t - a.time) / (b.time - a.time) : 0; return ts.logicalToCoordinate(Math.max(0, i - 1) + Math.min(1, Math.max(0, frac)));
      };
      let max = 0; for (const s of snaps) for (const v of s.cells.values()) max = Math.max(max, v);
      for (let j = 0; j < snaps.length; j++) {
        const s = snaps[j]; const x0 = toX(s.t), x1 = j + 1 < snaps.length ? toX(snaps[j + 1].t) : mediaSize.width; if (x0 == null || x1 == null) continue;
        for (const [pk, v] of s.cells) {
          const p0 = pk * s.step, y0 = o.series.priceToCoordinate(p0 + s.step), y1 = o.series.priceToCoordinate(p0); if (y0 == null || y1 == null) continue;
          const k = Math.pow(v / max, 0.45);
          ctx.fillStyle = `hsla(${280 - k * 230}, 100%, ${45 + k * 15}%, ${0.08 + k * 0.6})`;
          ctx.fillRect(x0, y0, Math.max(1, x1 - x0 + 0.5), Math.max(1, y1 - y0));
        }
      }
      return;
    }
    const bars = getBars(); if (!bars.length) return;
    const vs = bars.map((b) => b.volume || 0); const sorted = [...vs].sort((a, b) => a - b); const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
    const bw = Math.max(1, ts.options().barSpacing || 6);
    for (let i = 0; i < bars.length; i++) {
      const x = ts.logicalToCoordinate(i); if (x == null || x < -bw || x > mediaSize.width + bw) continue;
      const k = Math.min(1, vs[i] / p95); if (!k) continue;
      ctx.fillStyle = `hsla(${280 - k * 230}, 100%, 55%, ${0.05 + k * 0.32})`;
      ctx.fillRect(x - bw / 2, 0, bw, mediaSize.height);
    }
  };
}

// ---------- the chart component ----------
// props: sym, tf, mode, ind (array), alerts (array of alerts for this sym), onAlertMove(id, field, price),
// draw ('hline'|'trend'|null), onDrawn(), height, livePrice, compact
export function Chart({ sym, tf = '3M', mode = 'area', ind = ['vol'], alerts = [], onAlertMove, draw = null, onDrawn, height = 300, livePrice, lines = [], trends = [], onLines, plan }) {
  const box = useRef(); const st = useRef({});
  const { bars, err } = useCandles(sym, tf);
  const [ready, setReady] = useState(false);
  const [legend, setLegend] = useState(null);
  const [libErr, setLibErr] = useState(null);
  const [book, setBook] = useState(null);
  const crypto = isCrypto(sym);
  const intraday = tf === '1D' || tf === '5D' || tf === '1M';

  // create chart once
  useEffect(() => {
    let dead = false;
    loadLWC().then((L) => {
      if (dead || !box.current) return;
      const ch = L.createChart(box.current, {
        height, autoSize: true,
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: C.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, attributionLogo: false, panes: { separatorColor: 'rgba(255,255,255,0.08)', separatorHoverColor: 'rgba(0,210,255,0.2)' } },
        grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
        rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.12 } },
        timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false, rightOffset: 4, minBarSpacing: 0.5 },
        crosshair: { mode: 0, vertLine: { color: 'rgba(157,246,255,0.5)', style: 3, labelBackgroundColor: '#1B1830' }, horzLine: { color: 'rgba(157,246,255,0.5)', style: 3, labelBackgroundColor: '#1B1830' } },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
        handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
        kineticScroll: { touch: true, mouse: false },
      });
      st.current = { L, ch, series: [], pl: [], ov: [] };
      setReady(true);
    }).catch((e) => setLibErr(e.message));
    return () => { dead = true; const s = st.current; if (s.ch) { try { s.ch.remove(); } catch {} } st.current = {}; };
  }, []);

  // crypto order book polling for liquidity / heatmap
  const snaps = useRef([]);
  useEffect(() => {
    if (!crypto || (mode !== 'liquidity' && mode !== 'heatmap')) { setBook(null); return; }
    let alive = true, t;
    const loop = async () => {
      try {
        const b = await orderBook(sym); if (!alive) return; setBook(b);
        if (mode === 'heatmap') {
          const px = b.bids[0] ? b.bids[0][0] : null;
          if (px) { const step = px * 0.0015; const cells = new Map(); for (const [p, s] of [...b.bids, ...b.asks]) { if (Math.abs(p - px) / px > 0.03) continue; const k = Math.floor(p / step); cells.set(k, (cells.get(k) || 0) + s * p); }
            snaps.current = [...snaps.current.filter((x) => Date.now() / 1000 - x.t < 6 * 3600), { t: Math.floor(Date.now() / 1000) + tzShift(), step, cells }].slice(-900); }
        }
      } catch {}
      if (alive) t = setTimeout(loop, mode === 'heatmap' ? 4000 : 6000);
    };
    loop();
    return () => { alive = false; clearTimeout(t); };
  }, [sym, mode, crypto]);

  // (re)build series when data / mode / indicators change
  useEffect(() => {
    const s = st.current; if (!ready || !s.ch || !bars) return;
    const { L, ch } = s;
    for (const x of s.series) { try { ch.removeSeries(x); } catch {} }
    s.series = []; s.pl = []; s.ov = [];
    // remove extra panes
    try { const panes = ch.panes(); for (let i = panes.length - 1; i > 0; i--) ch.removePane(i); } catch {}
    if (!bars.length) return;
    const shift = intraday ? tzShift() : 0;
    const B = bars.map((b) => ({ ...b, time: b.time + shift }));
    s.bars = B;
    const closes = B.map((b) => b.close);
    const first = closes[0], lastC = closes.at(-1); const upTrend = lastC >= first;
    const pf = { type: 'price', precision: lastC < 1 ? 6 : lastC < 20 ? 4 : 2, minMove: lastC < 1 ? 0.000001 : lastC < 20 ? 0.0001 : 0.01 };
    let main;
    const candleOpts = { upColor: C.up, downColor: C.down, borderUpColor: C.up, borderDownColor: C.down, wickUpColor: 'rgba(60,255,180,0.7)', wickDownColor: 'rgba(255,92,138,0.7)', priceFormat: pf };
    if (mode === 'line') { main = ch.addSeries(L.LineSeries, { color: upTrend ? C.cyan : C.down, lineWidth: 2, priceFormat: pf, lastPriceAnimation: 1 }); main.setData(B.map((b) => ({ time: b.time, value: b.close }))); }
    else if (mode === 'area') { main = ch.addSeries(L.AreaSeries, { lineColor: upTrend ? C.cyan : C.down, topColor: upTrend ? 'rgba(122,92,255,0.38)' : 'rgba(255,92,138,0.3)', bottomColor: 'rgba(122,92,255,0)', lineWidth: 2, priceFormat: pf, lastPriceAnimation: 1 }); main.setData(B.map((b) => ({ time: b.time, value: b.close }))); }
    else if (mode === 'heikin') { main = ch.addSeries(L.CandlestickSeries, candleOpts); main.setData(heikinAshi(B)); }
    else { main = ch.addSeries(L.CandlestickSeries, candleOpts); main.setData(B.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }))); }
    s.main = main; s.series.push(main);
    // overlays
    if (mode === 'liquidity') {
      const vp = volumeProfile(B, 44); s.vp = vp;
      const o = new Overlay(profileDraw(() => st.current.vp)); main.attachPrimitive(o); s.ov.push(o);
      if (crypto) { const w = new Overlay(wallsDraw(() => st.current.book, () => st.current.bars && st.current.bars.at(-1).close)); main.attachPrimitive(w); s.ov.push(w); s.walls = w; }
    }
    if (mode === 'heatmap') { const o = new Overlay(heatDraw(() => (crypto ? snaps.current : null), () => st.current.bars || [])); main.attachPrimitive(o); s.ov.push(o); s.heat = o; }
    // volume
    const hasVol = B.some((b) => b.volume > 0);
    if (ind.includes('vol') && hasVol) {
      const v = ch.addSeries(L.HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'vol', lastValueVisible: false, priceLineVisible: false });
      v.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      v.setData(B.map((b) => ({ time: b.time, value: b.volume, color: b.close >= b.open ? 'rgba(60,255,180,0.22)' : 'rgba(255,92,138,0.22)' })));
      s.series.push(v);
    }
    const line = (vals, color, opts = {}, pane = 0) => { const x = ch.addSeries(L.LineSeries, { color, lineWidth: 1.4, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false, ...opts }, pane); x.setData(B.map((b, i) => (vals[i] == null ? { time: b.time } : { time: b.time, value: vals[i] }))); s.series.push(x); return x; };
    if (ind.includes('ma20')) line(sma(closes, 20), IND_COL.ma20);
    if (ind.includes('ma50')) line(sma(closes, 50), IND_COL.ma50);
    if (ind.includes('ma200')) line(sma(closes, 200), IND_COL.ma200, { lineStyle: 2 });
    if (ind.includes('ema21')) line(ema(closes, 21), IND_COL.ema21);
    if (ind.includes('vwap') && hasVol) line(vwap(B, intraday), IND_COL.vwap, { lineStyle: 1 });
    if (ind.includes('bb')) { const bb = bollinger(closes); line(bb.up, IND_COL.bb); line(bb.lo, IND_COL.bb); line(bb.mid, 'rgba(167,148,255,0.35)', { lineStyle: 2 }); }
    let pane = 1;
    if (ind.includes('rsi')) { const r = line(rsi(closes), C.gold, { lineWidth: 1.5, lastValueVisible: true }, pane); r.createPriceLine({ price: 70, color: 'rgba(255,92,138,0.5)', lineStyle: 2, lineWidth: 1, axisLabelVisible: false }); r.createPriceLine({ price: 30, color: 'rgba(60,255,180,0.5)', lineStyle: 2, lineWidth: 1, axisLabelVisible: false }); pane++; }
    if (ind.includes('macd')) { const m = macd(closes); const h = ch.addSeries(L.HistogramSeries, { lastValueVisible: false, priceLineVisible: false }, pane); h.setData(B.map((b, i) => (m.hist[i] == null ? { time: b.time } : { time: b.time, value: m.hist[i], color: m.hist[i] >= 0 ? 'rgba(60,255,180,0.5)' : 'rgba(255,92,138,0.5)' }))); s.series.push(h); line(m.line, C.cyan, {}, pane); line(m.signal, C.mag, {}, pane); pane++; }
    if (ind.includes('atr')) { line(atr(B), '#A794FF', { lastValueVisible: true }, pane); pane++; }
    try { const panes = ch.panes(); for (let i = 1; i < panes.length; i++) panes[i].setHeight(70); } catch {}
    // drawings: trend lines
    for (const t of trends) { if (t.tf && t.tf !== tf) continue; const x = ch.addSeries(L.LineSeries, { color: C.gold, lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }); const pts = [{ time: t.t1, value: t.p1 }, { time: t.t2, value: t.p2 }].sort((a, b) => a.time - b.time); if (pts[0].time !== pts[1].time) { x.setData(pts); s.series.push(x); } else ch.removeSeries(x); }
    ch.timeScale().fitContent();
    s.lineKey = null; // force price lines redraw
    drawLines();
  }, [ready, bars, mode, ind.join(), trends.length, tf]);

  // price lines: alerts, drawings, trade plan, live price
  const drawLines = () => {
    const s = st.current; if (!s.main) return;
    for (const p of s.pl) { try { s.main.removePriceLine(p.line); } catch {} }
    s.pl = [];
    const add = (price, opts, meta) => { if (price == null || !Number.isFinite(price)) return; const line = s.main.createPriceLine({ price, lineWidth: 1, axisLabelVisible: true, ...opts }); s.pl.push({ line, price, ...meta }); };
    for (const al of alerts) {
      if (!al.on) continue;
      const col = { above: C.up, below: C.down, enter: C.cyan, leave: C.cyan, move: C.mag }[al.kind]; if (!col || al.kind === 'move') continue;
      add(al.a, { color: col, lineStyle: 2, title: al.kind === 'above' ? 'ABOVE' : al.kind === 'below' ? 'BELOW' : 'RANGE' }, { drag: { id: al.id, field: 'a' } });
      if (al.kind === 'enter' || al.kind === 'leave') add(al.b, { color: col, lineStyle: 2, title: 'RANGE' }, { drag: { id: al.id, field: 'b' } });
    }
    lines.forEach((p, i) => add(p, { color: C.gold, lineStyle: 0, title: '' }, { drawn: i }));
    if (plan && plan.side === 'long') { add(plan.stop, { color: 'rgba(255,92,138,0.8)', lineStyle: 1, title: 'STOP' }); add(plan.target, { color: 'rgba(60,255,180,0.8)', lineStyle: 1, title: 'TARGET' }); }
  };
  useEffect(() => { drawLines(); }, [ready, bars, alerts.map((a) => `${a.id}${a.a}${a.b}${a.on}`).join(), lines.join(), plan && plan.stop]);

  // live price: update the last bar
  useEffect(() => {
    const s = st.current; if (!s.main || !s.bars || !s.bars.length || livePrice == null) return;
    const b = s.bars.at(-1); if (Math.abs(livePrice - b.close) / b.close > 0.15) return;
    const nb = { ...b, close: livePrice, high: Math.max(b.high, livePrice), low: Math.min(b.low, livePrice) }; s.bars[s.bars.length - 1] = nb;
    try { if (mode === 'line' || mode === 'area') s.main.update({ time: nb.time, value: livePrice }); else if (mode !== 'heikin') s.main.update({ time: nb.time, open: nb.open, high: nb.high, low: nb.low, close: nb.close }); } catch {}
  }, [livePrice]);
  useEffect(() => { const s = st.current; s.book = book; if (s.walls) s.walls.update(); if (s.heat) s.heat.update(); }, [book]);

  // crosshair legend
  useEffect(() => {
    const s = st.current; if (!ready || !s.ch) return;
    const f = (p) => {
      if (!p || !p.time || !s.bars) { setLegend(null); return; }
      const b = s.bars.find((x) => x.time === p.time); if (!b) { setLegend(null); return; }
      const i = s.bars.indexOf(b); const pv = i > 0 ? s.bars[i - 1].close : b.open;
      setLegend({ b, chg: ((b.close - pv) / pv) * 100, price: p.point && s.main ? s.main.coordinateToPrice(p.point.y) : null });
    };
    s.ch.subscribeCrosshairMove(f);
    return () => { try { s.ch.unsubscribeCrosshairMove(f); } catch {} };
  }, [ready]);

  // taps: drawing tools
  useEffect(() => {
    const s = st.current; if (!ready || !s.ch) return;
    const pend = { p: null };
    const f = (p) => {
      if (!draw || !p.point || !s.main) return;
      const price = s.main.coordinateToPrice(p.point.y); if (price == null) return;
      if (draw === 'hline') { feedback('set'); onLines && onLines({ lines: [...lines, +price.toPrecision(6)] }); onDrawn && onDrawn(); }
      else if (draw === 'trend' && p.time) {
        if (!pend.p) { pend.p = { t: p.time, v: price }; feedback('tap'); }
        else { feedback('set'); onLines && onLines({ trends: [...trends, { t1: pend.p.t, p1: pend.p.v, t2: p.time, p2: price, tf }] }); pend.p = null; onDrawn && onDrawn(); }
      }
    };
    s.ch.subscribeClick(f);
    return () => { try { s.ch.unsubscribeClick(f); } catch {} };
  }, [ready, draw, lines.length, trends.length, tf]);

  // drag alert lines; double-tap to reset zoom
  useEffect(() => {
    const el = box.current; const s = st.current; if (!ready || !el) return;
    let drag = null, lastTap = 0;
    const yOf = (e) => { const r = el.getBoundingClientRect(); const pt = e.touches ? e.touches[0] : e; return { y: pt.clientY - r.top, x: pt.clientX - r.left }; };
    const down = (e) => {
      const now = Date.now(); if (now - lastTap < 300 && (!e.touches || e.touches.length === 1)) { s.ch && s.ch.timeScale().fitContent(); s.ch && s.ch.priceScale('right').applyOptions({ autoScale: true }); lastTap = 0; return; } lastTap = now;
      if (!s.main || (e.touches && e.touches.length > 1)) return;
      const { y } = yOf(e);
      const hit = s.pl.filter((p) => p.drag).map((p) => ({ p, d: Math.abs(s.main.priceToCoordinate(p.price) - y) })).sort((a, b) => a.d - b.d)[0];
      if (hit && hit.d < 16) { drag = hit.p; e.stopPropagation(); if (e.cancelable) e.preventDefault(); s.ch.applyOptions({ handleScroll: false, handleScale: false }); feedback('tap'); }
    };
    const move = (e) => { if (!drag) return; e.stopPropagation(); if (e.cancelable) e.preventDefault(); const pr = s.main.coordinateToPrice(yOf(e).y); if (pr != null) { drag.price = pr; drag.line.applyOptions({ price: pr }); } };
    const up = () => { if (!drag) return; const d = drag; drag = null; s.ch.applyOptions({ handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false }, handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true } }); feedback('set'); onAlertMove && onAlertMove(d.drag.id, d.drag.field, +d.price.toPrecision(6)); };
    el.addEventListener('touchstart', down, { capture: true, passive: false }); el.addEventListener('mousedown', down, true);
    window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('mousemove', move);
    window.addEventListener('touchend', up); window.addEventListener('mouseup', up);
    return () => { el.removeEventListener('touchstart', down, { capture: true }); el.removeEventListener('mousedown', down, true); window.removeEventListener('touchmove', move); window.removeEventListener('mousemove', move); window.removeEventListener('touchend', up); window.removeEventListener('mouseup', up); };
  }, [ready, onAlertMove]);

  const src = crypto ? 'coinbase' : 'cnbc';
  const lv = level(src, 10 * 60e3);
  const L = legend && legend.b;
  return html`<div class="lwc" style=${{ height: height + 'px' }}>
    <div ref=${box} style=${{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}></div>
    <div class="legend2">${L ? html`<span>O <b>${fmtPrice(L.open, sym)}</b></span><span>H <b>${fmtPrice(L.high, sym)}</b></span><span>L <b>${fmtPrice(L.low, sym)}</b></span><span>C <b>${fmtPrice(L.close, sym)}</b></span><span class=${L.close >= L.open ? 'up' : 'down'}>${legend.chg >= 0 ? '+' : ''}${legend.chg.toFixed(2)}%</span>${L.volume ? html`<span>Vol <b>${fmtVol(L.volume)}</b></span>` : ''}`
      : html`<span><i style=${{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', marginRight: '5px', background: lv === 'ok' ? 'var(--up)' : lv === 'bad' ? 'var(--down)' : 'var(--warn)' }}></i>${crypto ? 'Coinbase' : 'CNBC'}${health[src] && health[src].at ? ' · ' + ageTxt(health[src].at) : ''}</span>${draw ? html`<span class="gold">${draw === 'hline' ? 'Tap the chart to place a line' : 'Tap two points for a trend line'}</span>` : ''}`}</div>
    <div class="hintline">pinch · drag · double-tap to reset</div>
    ${(!bars || !ready) && !libErr && html`<div class="loading"><div class="shimmer"></div></div>`}
    ${(libErr || (bars && !bars.length)) && html`<div class="loading">${libErr || (err ? 'Chart data unavailable right now' : 'No price history for this range')}</div>`}
  </div>`;
}
const fmtVol = (v) => (v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : v.toFixed(2));

// ---------- market depth (crypto): cumulative bids/asks within ±2% ----------
export function Depth({ sym }) {
  const [b, setB] = useState(null);
  useEffect(() => { let ok = true, t; const loop = async () => { try { const x = await orderBook(sym); ok && setB(x); } catch {} if (ok) t = setTimeout(loop, 5000); }; loop(); return () => { ok = false; clearTimeout(t); }; }, [sym]);
  if (!b || !b.bids.length || !b.asks.length) return html`<div class="hint" style="height:120px;display:grid;place-items:center">${b ? 'Order book unavailable' : 'Loading order book…'}</div>`;
  const mid = (b.bids[0][0] + b.asks[0][0]) / 2, lo = mid * 0.98, hi = mid * 1.02;
  const bids = b.bids.filter((x) => x[0] >= lo), asks = b.asks.filter((x) => x[0] <= hi);
  let cb = 0; const cbids = bids.map(([p, s]) => [p, (cb += s * p)]); let ca = 0; const casks = asks.map(([p, s]) => [p, (ca += s * p)]);
  const max = Math.max(cb, ca, 1); const W = 340, H = 110;
  const X = (p) => ((p - lo) / (hi - lo)) * W, Y = (v) => H - (v / max) * (H - 6);
  const bp = cbids.map(([p, v]) => `${X(p).toFixed(1)},${Y(v).toFixed(1)}`).join(' '), ap = casks.map(([p, v]) => `${X(p).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const spread = ((b.asks[0][0] - b.bids[0][0]) / mid) * 100;
  return html`<div>
    <svg viewBox=${`0 0 ${W} ${H}`} class="chart" style="height:110px" preserveAspectRatio="none">
      <defs><linearGradient id="dpb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3CFFB4" stop-opacity=".45"/><stop offset="1" stop-color="#3CFFB4" stop-opacity="0"/></linearGradient><linearGradient id="dpa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5C8A" stop-opacity=".45"/><stop offset="1" stop-color="#FF5C8A" stop-opacity="0"/></linearGradient></defs>
      <polygon points=${`${X(cbids[0][0])},${H} ${bp} ${X(cbids.at(-1)[0])},${H}`} fill="url(#dpb)" /><polyline points=${bp} fill="none" stroke="#3CFFB4" stroke-width="1.4" vector-effect="non-scaling-stroke" />
      <polygon points=${`${X(casks[0][0])},${H} ${ap} ${X(casks.at(-1)[0])},${H}`} fill="url(#dpa)" /><polyline points=${ap} fill="none" stroke="#FF5C8A" stroke-width="1.4" vector-effect="non-scaling-stroke" />
      <line x1=${X(mid)} x2=${X(mid)} y1="0" y2=${H} stroke="rgba(255,255,255,.25)" stroke-dasharray="2 3" />
    </svg>
    <div class="depthbar"><span class="up">Buyers ${Math.round((cb / (cb + ca)) * 100)}%</span><span class="mute">spread ${spread.toFixed(3)}%</span><span class="down">Sellers ${Math.round((ca / (cb + ca)) * 100)}%</span></div>
  </div>`;
}

// ---------- full chart card with mode switch, timeframe, indicators, drawing ----------
export function ChartCard({ sym, livePrice, alerts = [], onAlertMove, plan, height = 300, tfs = ['1D', '5D', '1M', '3M', '1Y', '5Y', 'MAX'], defTf = '3M' }) {
  const prefs = chartPrefs(sym);
  const [mode, setMode] = useState(prefs.mode);
  const [tf, setTf] = useState(prefs.tf || defTf);
  const [ind, setInd] = useState(prefs.ind);
  const [draw, setDraw] = useState(null);
  const [lines, setLines] = useState(prefs.lines || []);
  const [trends, setTrends] = useState(prefs.trends || []);
  const save = (ch) => saveChartPrefs(sym, ch);
  const toggle = (k) => { const n = ind.includes(k) ? ind.filter((x) => x !== k) : [...ind, k]; setInd(n); save({ ind: n }); feedback('tap'); };
  const paneH = height + (ind.includes('rsi') ? 70 : 0) + (ind.includes('macd') ? 70 : 0) + (ind.includes('atr') ? 70 : 0);
  return html`<div class="card chartbox">
    <div class="seg small modes">${MODES.map(([k, n]) => html`<button class=${mode === k ? 'on' : ''} onClick=${() => { setMode(k); save({ mode: k }); feedback('tap'); }}>${n}</button>`)}</div>
    <${Chart} sym=${sym} tf=${tf} mode=${mode} ind=${ind} alerts=${alerts} onAlertMove=${onAlertMove} draw=${draw} onDrawn=${() => setDraw(null)} height=${paneH} livePrice=${livePrice} lines=${lines} trends=${trends} plan=${plan}
      onLines=${(ch) => { if (ch.lines) setLines(ch.lines); if (ch.trends) setTrends(ch.trends); save(ch); }} />
    <div class="seg mono small" style="margin-top:10px">${tfs.map((k) => html`<button class=${tf === k ? 'on' : ''} onClick=${() => { setTf(k); save({ tf: k }); feedback('tap'); }}>${k}</button>`)}</div>
    <div class="tools">
      ${INDS.map(([k, n]) => html`<button class=${`chip ind ${ind.includes(k) ? 'on' : ''}`} onClick=${() => toggle(k)}>${ind.includes(k) ? '' : '+ '}${n}</button>`)}
      <button class=${`chip ${draw === 'hline' ? 'on' : ''}`} onClick=${() => setDraw(draw === 'hline' ? null : 'hline')}>+ Line</button>
      <button class=${`chip ${draw === 'trend' ? 'on' : ''}`} onClick=${() => setDraw(draw === 'trend' ? null : 'trend')}>+ Trend</button>
      ${(lines.length > 0 || trends.length > 0) && html`<button class="chip" onClick=${() => { setLines([]); setTrends([]); save({ lines: [], trends: [] }); }}>Clear drawings</button>`}
    </div>
    ${mode === 'liquidity' && html`<div class="hint" style="margin-top:8px">Left: volume traded at each price in this range (purple = the busiest 70%).${isCrypto(sym) ? ' Right: live buy and sell orders waiting in the Coinbase order book.' : ' Live order books are only free for crypto.'}</div>`}
    ${mode === 'heatmap' && html`<div class="hint" style="margin-top:8px">${isCrypto(sym) ? 'Order book liquidity over time, sampled every 4 seconds while this screen is open (brighter = more orders). Use the 1D view.' : 'Brighter columns = heavier trading volume. Live order books are only free for crypto.'}</div>`}
  </div>`;
}

// ---------- generic interactive line/area chart for any series [[ms, value], ...] ----------
export function SeriesChart({ data, height = 220, fmt = (v) => v.toFixed(2), color = '#00D2FF', area = true, baseline = null, extra = [] }) {
  const box = useRef(); const st = useRef({});
  const [ready, setReady] = useState(false);
  const [tip, setTip] = useState(null);
  useEffect(() => {
    let dead = false;
    loadLWC().then((L) => {
      if (dead || !box.current) return;
      const ch = L.createChart(box.current, { height, autoSize: true, layout: { background: { type: 'solid', color: 'transparent' }, textColor: C.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, attributionLogo: false },
        grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } }, rightPriceScale: { borderVisible: false }, timeScale: { borderVisible: false },
        crosshair: { mode: 0, vertLine: { color: 'rgba(157,246,255,0.5)', style: 3, labelBackgroundColor: '#1B1830' }, horzLine: { color: 'rgba(157,246,255,0.5)', style: 3, labelBackgroundColor: '#1B1830' } },
        handleScroll: { horzTouchDrag: true, vertTouchDrag: false }, handleScale: { pinch: true } });
      st.current = { L, ch }; setReady(true);
      ch.subscribeCrosshairMove((p) => { const s = st.current; if (!p || !p.time || !s.main) { setTip(null); return; } const d = p.seriesData.get(s.main); setTip(d ? { t: p.time, v: d.value } : null); });
    });
    return () => { dead = true; try { st.current.ch && st.current.ch.remove(); } catch {} };
  }, []);
  useEffect(() => {
    const s = st.current; if (!ready || !s.ch || !data) return;
    // same series with only a new last value (live tick): update in place, keep the user's zoom
    const sig = `${data.length}|${data[0] && data[0][0]}|${extra.length}|${baseline}`;
    if (s.sig === sig && s.main && data.length) { const [t, v] = data.at(-1); if (v != null && Number.isFinite(v)) { try { s.main.update({ time: Math.floor(t / 1000), value: v }); } catch {} } return; }
    s.sig = sig;
    for (const x of s.all || []) { try { s.ch.removeSeries(x); } catch {} }
    s.all = [];
    const pts = []; for (const [t, v] of data) { const tt = Math.floor(t / 1000); if (v != null && Number.isFinite(v) && (!pts.length || tt > pts.at(-1).time)) pts.push({ time: tt, value: v }); }
    const opts = { priceFormat: { type: 'custom', formatter: fmt }, lastPriceAnimation: 1 };
    s.main = area ? s.ch.addSeries(s.L.AreaSeries, { lineColor: color, topColor: 'rgba(122,92,255,0.35)', bottomColor: 'rgba(122,92,255,0)', lineWidth: 2, ...opts }) : s.ch.addSeries(s.L.LineSeries, { color, lineWidth: 2, ...opts });
    s.main.setData(pts); s.all.push(s.main);
    if (baseline != null) s.main.createPriceLine({ price: baseline, color: 'rgba(255,255,255,0.3)', lineStyle: 2, lineWidth: 1, axisLabelVisible: false });
    for (const e of extra) { const x = s.ch.addSeries(s.L.LineSeries, { color: e.color, lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false, priceFormat: { type: 'custom', formatter: fmt } }); const ep = []; for (const [t, v] of e.data) { const tt = Math.floor(t / 1000); if (v != null && (!ep.length || tt > ep.at(-1).time)) ep.push({ time: tt, value: v }); } x.setData(ep); s.all.push(x); }
    s.ch.timeScale().fitContent();
  }, [ready, data, extra.length]);
  return html`<div class="lwc" style=${{ height: height + 'px' }}><div ref=${box} style="position:absolute;top:0;right:0;bottom:0;left:0"></div>
    <div class="legend2">${tip ? html`<span><b>${fmt(tip.v)}</b> · ${new Date(tip.t * 1000).toLocaleDateString()}</span>` : ''}${extra.map((e) => html`<span style=${{ color: e.color }}>— ${e.name}</span>`)}</div>
    <div class="hintline">pinch · drag · double-tap to reset</div>
    ${!ready && html`<div class="loading"><div class="shimmer"></div></div>`}</div>`;
}
