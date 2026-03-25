document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return showScanning();

    checkTab(tab.id);

    // Live update — har 600ms mein check karo jab tak result na aaye
    const timer = setInterval(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([t]) => {
        if (!t?.id) return;
        checkTab(t.id, () => clearInterval(timer));
      });
    }, 600);

    // 12 seconds baad band karo
    setTimeout(() => clearInterval(timer), 12000);
  });
});

const checkTab = (tabId, onResult) => {
  chrome.tabs.sendMessage(tabId, { type: 'SD_QUERY' }, (response) => {
    if (chrome.runtime.lastError) return; // page load ho rahi hai

    const val = response?.result;
    if (val === '1') { showDetected();  onResult?.(); }
    else if (val === '0') { showNotFound(); onResult?.(); }
    else showScanning();
  });
};

const showDetected = () => {
  const wrap = document.getElementById('popup-wrap');
  wrap.classList.remove('state-not-found');
  wrap.classList.add('state-detected');
  document.getElementById('status-title').textContent = 'Shopify Store';
  document.getElementById('status-sub').textContent   = 'This website is built with Shopify.';
};

const showNotFound = () => {
  const wrap = document.getElementById('popup-wrap');
  wrap.classList.remove('state-detected');
  wrap.classList.add('state-not-found');
  document.getElementById('status-title').textContent = 'Not a Shopify Store';
  document.getElementById('status-sub').textContent   = 'No Shopify detected on this page.';
};

const showScanning = () => {
  const wrap = document.getElementById('popup-wrap');
  wrap.classList.remove('state-detected', 'state-not-found');
  document.getElementById('status-title').textContent = 'Scanning...';
  document.getElementById('status-sub').textContent   = 'Waiting for page to finish loading.';
};
