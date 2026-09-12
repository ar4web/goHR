# Forms

Base input styling lives in `src/scss/v4/_forms.scss` (`.form-control`,
labels, help text, validation states, switches, steppers, tag inputs).
Advanced controls live in `src/v4/form-controls.js` and auto-init on DOM
ready via data attributes — no external dependencies:

- **Date range** picker, **rich-text** editor (`.rt-toolbar`), and
  **multi-select**, plus star ratings and tag pills.

Validation is visual + native: use `required`, `type="email"`, `minlength`,
etc., pair every input with a `<label>`, and mark invalid fields with the
error state classes from `_forms.scss`. Demo pages: `form.html`,
`form_validation.html`, `form_wizards.html`.

As with everything else: labels and placeholders are bilingual (`data-i18n`),
and layouts use logical properties so Arabic mirrors correctly.
