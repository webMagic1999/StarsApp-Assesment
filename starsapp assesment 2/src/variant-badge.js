(function () {

  // Styles live in variant-badge.css — inlined here for console injection
  var BADGE_STYLES = `#variant-name-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  background: rgba(15, 15, 15, 0.78);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 5px 13px;
  border-radius: 30px;
  letter-spacing: 0.5px;
  pointer-events: none;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.28s ease, transform 0.28s ease;
}`;

  // ─── DOM helpers ──────────────────────────────────────────
  function getVariantSelects() {
    return document.querySelector('variant-selects');
  }

  function getImageContainer() {
    return (
      document.querySelector('.product__media-item.is-active') ||
      document.querySelector('.product__media-item') ||
      document.querySelector('.product__media-wrapper')
    );
  }

  // ─── Variant reading ──────────────────────────────────────

  // Reads checked radios synchronously — safe to call immediately on `change`
  // because the browser marks the radio checked before firing the event.
  // Accepts an already-fetched root to avoid a redundant querySelector call.
  function readFromCheckedRadios(root) {
    if (!root) return null;
    var parts = Array.from(root.querySelectorAll('input[type="radio"]:checked'))
      .map(function (el) { return el.value; })
      .filter(Boolean);
    return parts.length ? parts.join(' / ') : null;
  }

  // Prefers the JSON tag Shopify keeps updated with the full variant title.
  // Falls back to checked radios if the tag is absent.
  function getCurrentVariantName() {
    var root = getVariantSelects();
    if (!root) return null;

    var script = root.querySelector('script[data-selected-variant]');
    if (script) {
      try {
        var data = JSON.parse(script.textContent);
        if (data && data.title) return data.title;
      } catch (e) {}
    }

    return readFromCheckedRadios(root);
  }

  // ─── Badge ────────────────────────────────────────────────
  function applyStyles() {
    if (document.getElementById('variant-badge-styles')) return;
    var style = document.createElement('style');
    style.id = 'variant-badge-styles';
    style.textContent = BADGE_STYLES;
    document.head.appendChild(style);
  }

  function injectBadge(container, name) {
    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    var badge = document.createElement('div');
    badge.id = 'variant-name-badge';
    badge.textContent = name;
    container.appendChild(badge);

    // One tick delay lets the browser register opacity:0 before transitioning in
    setTimeout(function () {
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    }, 30);
  }

  function updateBadge(newName) {
    var badge = document.getElementById('variant-name-badge');

    // Badge gone or detached (Shopify replaced the image container)
    if (!badge || !badge.isConnected) {
      var container = getImageContainer();
      if (container) injectBadge(container, newName);
      return;
    }

    if (badge.textContent === newName) return;

    badge.style.opacity = '0';
    badge.style.transform = 'translateY(-6px)';
    setTimeout(function () {
      badge.textContent = newName;
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    }, 280);
  }

  // Watch for two scenarios:
  // 1. Shopify slides to a new image → is-active class moves to a different <li>
  // 2. Shopify replaces the container element entirely → badge gone from DOM
  function watchContainer(container) {
    var parent = container.parentNode;
    if (!parent) return;
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        // Scenario 1: active slide changed
        if (m.attributeName === 'class' &&
            m.target.classList.contains('is-active') &&
            m.target.classList.contains('product__media-item')) {
          var badge = document.getElementById('variant-name-badge');
          var name = badge ? badge.textContent : getCurrentVariantName();
          if (badge) badge.remove();
          if (name) injectBadge(m.target, name);
          return;
        }
        // Scenario 2: container replaced, badge gone
        if (m.type === 'childList' && !document.getElementById('variant-name-badge')) {
          var newContainer = getImageContainer();
          var varName = getCurrentVariantName();
          if (newContainer && varName) injectBadge(newContainer, varName);
          return;
        }
      }
    }).observe(parent, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true });
  }

  // ─── Event listener ───────────────────────────────────────
  // Attached to document so it survives Shopify replacing variant-selects.
  document.addEventListener('change', function (e) {
    if (e.target.type !== 'radio') return;
    var root = getVariantSelects();
    if (!root || !root.contains(e.target)) return;
    var newName = readFromCheckedRadios(root) || e.target.value;
    if (newName) updateBadge(newName);
  });

  // ─── Init ─────────────────────────────────────────────────
  var variantName = getCurrentVariantName();
  if (!variantName) {
    console.warn('[VariantBadge] No variant found. Open a product page first.');
    return;
  }

  var container = getImageContainer();
  if (!container) {
    console.warn('[VariantBadge] Product image container not found.');
    return;
  }

  var existing = document.getElementById('variant-name-badge');
  if (existing) existing.remove();

  applyStyles();
  injectBadge(container, variantName);
  watchContainer(container);
  console.log('[VariantBadge] Active →', variantName);

})();
