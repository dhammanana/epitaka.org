// ════════════════════════════════════════════
// Ref-dropdown: collapsible multi-ref buttons
// ════════════════════════════════════════════
// Add this block anywhere in book.js after DOMContentLoaded,
// or paste it as-is into the DOMContentLoaded callback.
// No extra imports needed.
import '../css/refbutton.css';

export function initRefDropdowns() {
  document.querySelectorAll('.ref-dropdown').forEach(wrapper => {
    const toggle = wrapper.querySelector('.ref-dropdown__toggle');
    const menu   = wrapper.querySelector('.ref-dropdown__menu');
    if (!toggle || !menu) return;

    function openMenu() {
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu(e) {
      e.stopPropagation();
      menu.classList.contains('open') ? closeMenu() : openMenu();
    }

    toggle.addEventListener('click', toggleMenu);

    // Close on outside click / touch
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) closeMenu();
    });

    // Close on Escape
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeMenu(); toggle.focus(); }
    });

    // Close when a menu item is activated (navigate happens via href)
    menu.querySelectorAll('.ref-dropdown__item').forEach(item => {
      item.addEventListener('click', closeMenu);
    });

    // Keyboard: Arrow keys move focus within the open menu
    menu.addEventListener('keydown', e => {
      const items = [...menu.querySelectorAll('.ref-dropdown__item')];
      const idx   = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1) % items.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
      }
    });
  });
}