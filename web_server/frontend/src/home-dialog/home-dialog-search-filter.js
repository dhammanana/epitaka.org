/**
 * home-dialog-search-filter.js
 * Reusable BookFilter component for narrowing search results
 * by Piṭaka (nikaya group) and text layer (category).
 *
 * Usage:
 *   const filter = new BookFilter(hierarchy, { onChange: () => redoSearch() });
 *   filter.mount(document.getElementById('filter-container'));
 *   const active = filter.getActiveBookIds(); // Set<string> | null (null = all)
 */

/* ─────────────────────────────────────────────────────────────
   Constants derived from the hierarchy structure
───────────────────────────────────────────────────────────── */

export const PITAKA_GROUPS = [
  { id: 'sutta',      label: 'Sutta',      match: v => v.nikaya?.includes('Sutta') },
  { id: 'vinaya',     label: 'Vinaya',     match: v => v.nikaya?.includes('Vinaya') },
  { id: 'abhidhamma', label: 'Abhidhamma', match: v => v.nikaya?.includes('Abhidhamma') },
  { id: 'anna',       label: 'Añña',       match: v => v.category === 'Añña' },
];

export const LAYER_GROUPS = [
  { id: 'mula',  label: 'Mūla',      match: v => v.category === 'Mūla' },
  { id: 'attha', label: 'Aṭṭhakathā', match: v => v.category === 'Aṭṭhakathā' },
  { id: 'tika',  label: 'Ṭīkā',      match: v => v.category === 'Ṭīkā' },
];

/* ─────────────────────────────────────────────────────────────
   BookFilter class
───────────────────────────────────────────────────────────── */
export class BookFilter {
  /**
   * @param {object} hierarchy    The full hierarchy dict (book_id → metadata)
   * @param {object} opts
   * @param {Function} opts.onChange  Called whenever the active filter changes
   */
  constructor(hierarchy, { onChange } = {}) {
    this.hierarchy  = hierarchy;
    this.onChange   = onChange || (() => {});

    // Active selections – empty Set means "all selected" (no restriction)
    this._pitakas   = new Set(); // IDs from PITAKA_GROUPS
    this._layers    = new Set(); // IDs from LAYER_GROUPS

    this._el        = null;
  }

  /* ── Public API ──────────────────────────────────────────── */

  /**
   * Returns a Set of book_id strings that pass the current filter,
   * or null if no filter is active (all books allowed).
   */
  getActiveBookIds() {
    const pitakaActive = this._pitakas.size > 0;
    const layerActive  = this._layers.size  > 0;
    if (!pitakaActive && !layerActive) return null; // no filter

    const ids = new Set();
    for (const [book_id, meta] of Object.entries(this.hierarchy)) {
      const passPitaka = !pitakaActive || PITAKA_GROUPS
        .filter(g => this._pitakas.has(g.id))
        .some(g => g.match(meta));
      const passLayer = !layerActive || LAYER_GROUPS
        .filter(g => this._layers.has(g.id))
        .some(g => g.match(meta));
      if (passPitaka && passLayer) ids.add(book_id);
    }
    return ids;
  }

  /**
   * Filter an array of result objects that each have a `book_id` field.
   * Returns a new array with only matching items.
   */
  filterResults(results) {
    const allowed = this.getActiveBookIds();
    if (!allowed) return results;
    return results.filter(r => allowed.has(r.book_id));
  }

  /** Serialize current filter state (for passing to server-side queries) */
  getFilterParams() {
    return {
      pitakas: [...this._pitakas],
      layers:  [...this._layers],
    };
  }

  /** Mount the filter UI into a container element */
  mount(container) {
    this._el = document.createElement('div');
    this._el.className = 'book-filter';
    this._el.innerHTML = this._buildHTML();
    container.appendChild(this._el);
    this._bindEvents();
  }

  /** Remove the filter UI */
  unmount() {
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
  }

  /** Re-render the chips to reflect current state (call after programmatic changes) */
  refresh() {
    if (!this._el) return;
    this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(c => {
      c.classList.toggle('active', this._pitakas.has(c.dataset.id));
    });
    this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(c => {
      c.classList.toggle('active', this._layers.has(c.dataset.id));
    });
    this._updateClearBtn();
  }

  /* ── HTML ────────────────────────────────────────────────── */

  _buildHTML() {
    const pitakaChips = PITAKA_GROUPS.map(g =>
      `<button class="bf-chip" data-group="pitaka" data-id="${g.id}">${g.label}</button>`
    ).join('');

    const layerChips = LAYER_GROUPS.map(g =>
      `<button class="bf-chip" data-group="layer" data-id="${g.id}">${g.label}</button>`
    ).join('');

    return `
      <div class="bf-row">
        <span class="bf-label">Piṭaka</span>
        <div class="bf-chips" id="bf-pitaka-chips">${pitakaChips}</div>
      </div>
      <div class="bf-row">
        <span class="bf-label">Group</span>
        <div class="bf-chips" id="bf-layer-chips">${layerChips}</div>
      </div>
      <button class="bf-clear" id="bf-clear-btn" style="display:none">✕ Clear filters</button>
    `;
  }

  /* ── Events ──────────────────────────────────────────────── */

  _bindEvents() {
    this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(c => {
      c.addEventListener('click', () => this._toggle(this._pitakas, c));
    });
    this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(c => {
      c.addEventListener('click', () => this._toggle(this._layers, c));
    });
    this._el.querySelector('#bf-clear-btn').addEventListener('click', () => {
      this._pitakas.clear();
      this._layers.clear();
      this.refresh();
      this.onChange();
    });
  }

  _toggle(set, chip) {
    const id = chip.dataset.id;
    if (set.has(id)) {
      set.delete(id);
      chip.classList.remove('active');
    } else {
      set.add(id);
      chip.classList.add('active');
    }
    this._updateClearBtn();
    this.onChange();
  }

  _updateClearBtn() {
    const btn = this._el?.querySelector('#bf-clear-btn');
    if (!btn) return;
    const hasFilter = this._pitakas.size > 0 || this._layers.size > 0;
    btn.style.display = hasFilter ? 'inline-flex' : 'none';
  }
}