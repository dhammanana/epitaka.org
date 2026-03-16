/**
 * libs/local-state.js
 * Tiny typed wrapper around localStorage for persisting dialog state.
 *
 * Usage:
 *   import { LocalState } from './libs/local-state.js';
 *   const state = new LocalState('myKey', { count: 0, name: '' });
 *   state.set('count', 1);
 *   console.log(state.get('count'));  // 1
 */

export class LocalState {
  /**
   * @param {string} storageKey   - localStorage key
   * @param {object} defaults     - shape + default values
   */
  constructor(storageKey, defaults) {
    this._key      = storageKey;
    this._defaults = defaults;
    this._data     = this._load();
  }

  get(field) {
    return this._data[field];
  }

  set(field, value) {
    this._data[field] = value;
    this._save();
  }

  /** Merge an object of {field: value} in one write. */
  patch(obj) {
    Object.assign(this._data, obj);
    this._save();
  }

  /** Return a plain copy of the current state. */
  snapshot() {
    return { ...this._data };
  }

  // ── private ──────────────────────────────────────────────────

  _load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return { ...this._defaults };
      return { ...this._defaults, ...JSON.parse(raw) };
    } catch {
      return { ...this._defaults };
    }
  }

  _save() {
    try {
      localStorage.setItem(this._key, JSON.stringify(this._data));
    } catch { /* quota / private-mode – ignore */ }
  }
}