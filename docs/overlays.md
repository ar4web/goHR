# Overlays

Three modules, one import each:

- **Modals** — `src/v4/modal.js`: `showModal({ title, body, actions, size,
  onClose })`, `closeModal()`, `isModalOpen()`. Sizes via `size: 'md'`
  (default) et al.
- **Toasts** — `src/v4/toast.js`: `showToast(message, opts)`.
- **Menus + panels** — `src/v4/menus.js`: `openMenu(trigger, items)` for
  dropdown menus, `openPanel(trigger, content, opts)` for slide-out panels,
  `closeMenu()`, plus `DEFAULT_CARD_MENU` for card headers.

Overlays render into a shared layer with focus handling and Escape-to-close.
Keep overlay copy bilingual like everything else; keep bodies scrollable
(`.modal-events-list` shows the pattern) so small phones don't clip actions.
