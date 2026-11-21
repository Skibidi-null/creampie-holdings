// Small polyfills so older Android System WebView versions (Chrome 69+) can run the app.
/* eslint-disable no-extend-native */
const at = function (n) { n = Math.trunc(n) || 0; if (n < 0) n += this.length; return n < 0 || n >= this.length ? undefined : this[n]; };
for (const C of [Array, String]) if (!C.prototype.at) Object.defineProperty(C.prototype, 'at', { value: at, writable: true, configurable: true });
for (const T of ['Int8Array', 'Uint8Array', 'Float32Array', 'Float64Array']) if (self[T] && !self[T].prototype.at) Object.defineProperty(self[T].prototype, 'at', { value: at, writable: true, configurable: true });
if (!Object.fromEntries) Object.fromEntries = (it) => { const o = {}; for (const [k, v] of it) o[k] = v; return o; };
if (!globalThis.queueMicrotask) globalThis.queueMicrotask = (f) => Promise.resolve().then(f);
