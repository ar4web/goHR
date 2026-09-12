// Browser APIs jsdom lacks but the shell touches on every page.
window.matchMedia =
  window.matchMedia ||
  (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => 'blob:stub';
  window.URL.revokeObjectURL = () => {};
}

if (typeof window.requestAnimationFrame === 'undefined') {
  window.requestAnimationFrame = cb => setTimeout(cb, 0);
}
