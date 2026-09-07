(function () {
  var STORAGE_KEY = 'fina_green_feedback';
  var mouseX = -1, mouseY = -1;
  document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });

  function sectionLabel(el) {
    var scope = (el && el.closest('section, nav, footer, .hero')) || document.body;
    var eyebrow = scope.querySelector('.eyebrow');
    if (eyebrow) return eyebrow.textContent.trim().replace(/\s+/g, ' ');
    var heading = scope.querySelector('h1, h2, h3');
    if (heading) return heading.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (scope.tagName === 'FOOTER') return 'Footer';
    if (scope.tagName === 'NAV') return 'Nav';
    return (scope.className && scope.className.split(' ')[0]) || 'Page';
  }

  function getSaved() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  }
  function setSaved(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent =
      '#fb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:var(--font-sans,sans-serif)}' +
      '#fb-card{background:var(--bg,#fff);color:var(--ink,#000);border-radius:var(--radius,16px);box-shadow:var(--shadow-card,0 20px 40px rgba(0,0,0,.2));padding:20px;width:380px;max-width:90vw}' +
      '#fb-card h3{margin:0 0 4px;font-family:var(--font-display,inherit);font-size:16px}' +
      '#fb-section{font-size:12px;color:var(--text-2,#666);margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em}' +
      '#fb-text{width:100%;min-height:100px;padding:10px;border-radius:8px;border:1px solid var(--hairline,#ddd);font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box}' +
      '#fb-actions{display:flex;gap:8px;margin-top:12px;justify-content:flex-end}' +
      '#fb-actions button{border:none;border-radius:999px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit}' +
      '#fb-cancel{background:transparent;color:var(--text-2,#666)}' +
      '#fb-save{background:var(--accent,#E6FE9F);color:#000}' +
      '#fb-pill{position:fixed;bottom:20px;right:20px;background:var(--ink,#000);color:#fff;padding:10px 16px;border-radius:999px;font-size:13px;font-family:var(--font-sans,sans-serif);cursor:pointer;z-index:99998;box-shadow:0 4px 16px rgba(0,0,0,.25);display:none}';
    document.head.appendChild(s);
  }

  function closeModal() {
    var el = document.getElementById('fb-overlay');
    if (el) el.remove();
  }

  function openModal() {
    if (document.getElementById('fb-overlay')) return;
    var target = document.elementFromPoint(mouseX, mouseY);
    var label = sectionLabel(target);

    var overlay = document.createElement('div');
    overlay.id = 'fb-overlay';
    overlay.innerHTML =
      '<div id="fb-card">' +
      '<h3>Feedback</h3>' +
      '<div id="fb-section">' + label.replace(/</g, '&lt;') + '</div>' +
      '<textarea id="fb-text" placeholder="Your feedback…"></textarea>' +
      '<div id="fb-actions">' +
      '<button id="fb-cancel">Cancel</button>' +
      '<button id="fb-save">Copy</button>' +
      '</div></div>';
    document.body.appendChild(overlay);

    var textarea = overlay.querySelector('#fb-text');
    textarea.focus();

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    overlay.querySelector('#fb-cancel').addEventListener('click', closeModal);

    overlay.querySelector('#fb-save').addEventListener('click', function () {
      var text = textarea.value.trim();
      closeModal();
      if (!text) return;
      var entry = '[' + label + ']\n' + text;
      var saved = getSaved();
      saved.push(entry);
      setSaved(saved);
      if (navigator.clipboard) navigator.clipboard.writeText(entry).catch(function () {});
      updatePill();
    });
  }

  var pillEl;
  function updatePill() {
    var n = getSaved().length;
    if (n > 0) {
      pillEl.style.display = 'block';
      pillEl.textContent = 'Copy all feedback (' + n + ')';
    } else {
      pillEl.style.display = 'none';
    }
  }

  function initPill() {
    pillEl = document.createElement('div');
    pillEl.id = 'fb-pill';
    document.body.appendChild(pillEl);
    pillEl.addEventListener('click', function () {
      var saved = getSaved();
      if (!saved.length) return;
      var all = saved.join('\n\n');
      if (navigator.clipboard) navigator.clipboard.writeText(all).catch(function () {});
      pillEl.textContent = 'Copied ✓';
      setSaved([]);
      setTimeout(updatePill, 900);
    });
    updatePill();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'f' && e.key !== 'F') return;
    var active = document.activeElement;
    var tag = active && active.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable)) return;
    if (document.getElementById('fb-overlay')) return;
    e.preventDefault();
    openModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  injectStyles();
  initPill();
})();
