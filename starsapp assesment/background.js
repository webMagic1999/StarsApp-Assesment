const ICONS_DEFAULT = {
  16: 'icons/icon16.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png'
};

const ICONS_ACTIVE = {
  16: 'icons/icon16_active.png',
  48: 'icons/icon48_active.png',
  128: 'icons/icon128_active.png'
};

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  const isShopify = msg.type === 'SHOPIFY_YES';

  chrome.action.setIcon({ tabId, path: isShopify ? ICONS_ACTIVE : ICONS_DEFAULT });

  // Popup ke liye result store karo
  chrome.storage.session.set({ [`sd_${tabId}`]: isShopify });
});

// Naya page load hote hi icon reset karo aur storage clear karo
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'loading') {
    chrome.action.setIcon({ tabId, path: ICONS_DEFAULT });
    chrome.storage.session.remove(`sd_${tabId}`);
  }
});

// Tab band hone pe cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`sd_${tabId}`);
});
