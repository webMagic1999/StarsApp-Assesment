(function () {
  if (window.__sdRan) return;
  window.__sdRan = true;

  // MAIN world mein run hota hai — window.Shopify directly accessible hai
  function check() {
    return typeof window.Shopify !== 'undefined';
  }

  if (check()) {
    run(true);
    return;
  }

  // Kuch stores Shopify object async load karti hain — ek baar retry
  setTimeout(() => run(check()), 1500);

  function run(isShopify) {
    console.log('[ShopifyDetector] isShopify:', isShopify);

    // DOM attribute set karo — bridge.js MutationObserver se pick karega
    // CustomEvent timing-unreliable tha (bridge listener pehle ready nahi hota)
    document.documentElement.dataset.sdResult = isShopify ? '1' : '0';

    if (isShopify) showBanner();
  }

  function showBanner() {
    if (document.getElementById('sd-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'sd-banner';
    banner.innerHTML = `
      <div class="sd-inner">
        <div class="sd-left">
          ${shopifyBagSVG()}
          <span class="sd-label">Built with Shopify</span>
        </div>
        <div class="sd-right">
          <span class="sd-credit">detected by ShopifyDetector</span>
          <button class="sd-close" aria-label="Close banner">&#x2715;</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentElement('afterbegin', banner);

    banner.querySelector('.sd-close').addEventListener('click', () => {
      banner.classList.add('sd-banner--closing');
      banner.addEventListener('animationend', () => banner.remove(), { once: true });
    });
  }

  function shopifyBagSVG() {
    return `
      <svg class="sd-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
          d="M16.5 7.5C16.5 5.01 14.49 3 12 3C9.51 3 7.5 5.01 7.5 7.5H4.5L3 21H21L19.5 7.5H16.5Z"
          stroke="#96bf48"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 7.5C9 9.16 10.34 10.5 12 10.5C13.66 10.5 15 9.16 15 7.5"
          stroke="#96bf48"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    `;
  }
})();
