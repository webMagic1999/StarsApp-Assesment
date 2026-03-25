// ISOLATED world — chrome APIs yahan available hain

const html = document.documentElement;

const notifyBackground = (isShopify) => {
  chrome.runtime.sendMessage(
    { type: isShopify ? 'SHOPIFY_YES' : 'SHOPIFY_NO' },
    () => void chrome.runtime.lastError
  );
};

const readAndNotify = () => {
  const val = html.dataset.sdResult;
  if (val === undefined) return false;
  notifyBackground(val === '1');
  return true;
};

// Icon switching ke liye — MutationObserver se background ko notify karo
if (!readAndNotify()) {
  const observer = new MutationObserver(() => {
    if (readAndNotify()) observer.disconnect();
  });
  observer.observe(html, {
    attributes: true,
    attributeFilter: ['data-sd-result']
  });
}

// Popup direct query kar sakta hai — seedha DOM attribute return karo
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SD_QUERY') {
    sendResponse({ result: html.dataset.sdResult });
  }
  return true;
});
