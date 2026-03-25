# Shopify Detector — Chrome Extension

A lightweight Chrome extension that detects whether a website is built with Shopify and displays a banner at the top of the page.

---

## How It Works

Every time a webpage loads, the extension checks for the `window.Shopify` JavaScript object — a global object that Shopify injects on every storefront. If found, a banner appears at the top of the page. If not, nothing happens.

**Detection method:** `typeof window.Shopify !== 'undefined'`

Since some stores load this object asynchronously, the extension retries once after 1.5 seconds if the first check returns nothing.

---

## Features

- Automatically runs on every webpage — no manual action needed
- Shows a fixed header banner on Shopify sites: **"Built with Shopify"**
- Banner slides in smoothly and can be dismissed with the × button
- Extension icon changes based on detection result (grey → green)
- Popup shows live detection status: Shopify Store / Not a Shopify Store / Scanning...
- Popup updates in real-time as you navigate between pages

---

## Installation

> No build step required. Load directly from the source folder.

**Step 1** — Open Chrome and go to:
```
chrome://extensions
```

**Step 2** — Enable **Developer mode** (toggle in the top-right corner)

**Step 3** — Click **"Load unpacked"**

**Step 4** — Select the `shopify-detector` folder

**Step 5** — Pin the extension to your toolbar:
- Click the puzzle piece icon (🧩) in the Chrome toolbar
- Click the pin icon next to **Shopify Detector**

The extension is now active on all websites.

---

## Usage

Just browse normally. The extension runs automatically.

| Scenario | What happens |
|---|---|
| Open a Shopify store | Green banner appears at top of page |
| Open any other site | Nothing happens |
| Click × on banner | Banner slides away for that tab |
| Click extension icon | Popup shows detection result |
| Navigate to a new page | Popup updates automatically |

---

## File Structure

```
shopify-detector/
├── manifest.json        # Extension config (MV3)
├── content.js           # Detection logic + banner injection (MAIN world)
├── content.css          # Banner styles
├── bridge.js            # Chrome API bridge (ISOLATED world)
├── background.js        # Service worker — icon switching + storage
├── popup/
│   ├── popup.html       # Popup markup
│   ├── popup.js         # Popup logic — reads live detection result
│   └── popup.css        # Popup styles
├── icons/
│   ├── icon16.png       # Default toolbar icon (grey)
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon16_active.png   # Active toolbar icon (green)
│   ├── icon48_active.png
│   └── icon128_active.png
└── README.md
```

---

## Architecture

```
Page loads
    │
    ├── content.js (MAIN world)
    │       Checks window.Shopify directly
    │       Sets data-sd-result on <html>
    │       Injects banner if detected
    │
    └── bridge.js (ISOLATED world)
            Watches data-sd-result via MutationObserver
            Sends SHOPIFY_YES / SHOPIFY_NO to background
                    │
                    └── background.js (Service Worker)
                            Switches toolbar icon per tab
                            Stores result in chrome.storage.session
                                    │
                                    └── popup.js
                                            Reads from storage
                                            Live updates via onChanged
```

**Why two content scripts?**
Chrome content scripts run in an isolated JavaScript context — they cannot access `window.Shopify` set by the page's own scripts. Running `content.js` in `"world": "MAIN"` gives it direct access to the page's JavaScript. But `chrome.*` APIs are only available in the isolated world, so `bridge.js` handles that side.

---

## Known Limitations

- **Headless Shopify (Hydrogen)** — Custom headless storefronts built with Shopify Hydrogen may not expose `window.Shopify`, causing a false negative.
- **`chrome://` pages** — Extension cannot run on Chrome's internal pages (new tab, settings, etc.) — expected browser restriction.
- **Private/Incognito** — Extension does not run in incognito mode unless manually enabled in `chrome://extensions`.

---

## Privacy

This extension does not collect, transmit, or store any personal data. All detection runs locally in your browser. No network requests are made by the extension itself.

---

## Built By

**mgour** — [github.com/mgour](https://github.com/mgour)
