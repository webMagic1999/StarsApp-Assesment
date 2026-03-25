# Shopify Detector — Chrome Extension

A Chrome extension that automatically detects whether the current website is built on Shopify. It gives real-time feedback through a toolbar icon, an in-page banner, and a popup interface — no manual action needed.

---

## What Does It Do?

Every time a webpage loads, the extension checks for `window.Shopify` — a JavaScript object that Shopify automatically injects on every storefront. If found, a banner appears at the top of the page and the toolbar icon turns active (green).

**Detection method:**
```js
typeof window.Shopify !== 'undefined'
```

Since some stores load this object asynchronously, the extension retries once after **1.5 seconds** if the first check returns nothing.

---

## Features

- Runs automatically on every webpage — no clicks needed
- Shows a fixed header banner: **"Built with Shopify"** on Shopify sites
- Banner slides in smoothly and can be dismissed with the × button
- Toolbar icon switches from grey to green when Shopify is detected
- Popup shows live detection status: `Scanning...` / `Shopify Store` / `Not a Shopify Store`
- Popup updates automatically as you navigate between pages
- Session-based storage — all data clears when you close the browser

---

## Local Installation in Chrome

> No build step required. Load directly from the source folder.

### Step 1 — Open Extensions Page

Open Google Chrome and navigate to:
```
chrome://extensions
```
Or go to: **Menu (⋮) → More Tools → Extensions**

### Step 2 — Enable Developer Mode

In the **top-right corner** of the Extensions page, toggle **Developer mode** to **ON**.

> This unlocks the ability to load extensions from your local machine.

### Step 3 — Load Unpacked Extension

Click the **"Load unpacked"** button that appears on the top-left.

### Step 4 — Select the Folder

In the file picker that opens, navigate to and select this folder:

```
StarsApp/starsapp assesment/
```

> Important: Select the folder that contains `manifest.json` directly inside it — not the parent `StarsApp/` folder.

### Step 5 — Pin to Toolbar

- Click the **puzzle piece icon (🧩)** in the Chrome toolbar
- Click the **pin icon** next to **Shopify Detector**

The extension is now active on all websites.

---

## How to Use

Just browse normally — the extension runs in the background automatically.

| Action | Result |
|---|---|
| Open a Shopify store | Green banner slides in at top of page |
| Open any non-Shopify site | Nothing visible happens |
| Click **×** on the banner | Banner slides away for that tab |
| Click the extension icon | Popup opens showing detection result |
| Navigate to a new page | Popup and icon update automatically |

---

## Workflow & Architecture

The extension is split into four scripts that work together:

```
Page loads
    │
    ├── content.js  (MAIN world)
    │       Reads window.Shopify directly from the page
    │       Sets data-sd-result = "1" or "0" on <html>
    │       Injects and animates the banner if Shopify detected
    │       Retries after 1500ms for async-loaded stores
    │
    └── bridge.js  (ISOLATED world)
            Watches data-sd-result via MutationObserver
            Sends SHOPIFY_YES / SHOPIFY_NO to background
                    │
                    └── background.js  (Service Worker)
                            Switches toolbar icon per tab (grey ↔ green)
                            Stores result in chrome.storage.session
                            Cleans up storage on tab close / navigation
                                    │
                                    └── popup.js
                                            Queries background via SD_QUERY message
                                            Polls every 600ms (max 12 seconds)
                                            Updates popup UI with detection result
```

### Why Two Content Scripts?

Chrome Manifest V3 enforces a strict security boundary between the page context and the extension context:

| Script | World | Can Access |
|---|---|---|
| `content.js` | `MAIN` | `window.Shopify`, page JS globals |
| `bridge.js` | `ISOLATED` | `chrome.runtime`, all extension APIs |

A single script cannot access both. `content.js` reads the Shopify object, then communicates via a DOM attribute. `bridge.js` reads that attribute and relays the result to the extension — this is the standard Manifest V3 pattern.

---

## File Structure

```
starsapp assesment/
├── manifest.json        # Extension config (Manifest V3)
├── content.js           # Detection logic + banner injection (MAIN world)
├── content.css          # In-page banner styles
├── bridge.js            # Chrome API bridge (ISOLATED world)
├── background.js        # Service worker — icon switching + session storage
├── popup/
│   ├── popup.html       # Popup markup
│   ├── popup.js         # Popup logic — polls for live detection result
│   └── popup.css        # Popup styles (dark theme, green accent)
├── icons/
│   ├── icon16.png          # Default toolbar icon (grey)
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon16_active.png   # Active toolbar icon (green, shown on Shopify stores)
│   ├── icon48_active.png
│   └── icon128_active.png
└── README.md
```

---

## Permissions

| Permission | Why It's Needed |
|---|---|
| `activeTab` | Access the current tab's ID for targeted icon updates |
| `storage` | Save detection result per tab using session storage |
| `<all_urls>` | Run content scripts on any website |

---

## Known Limitations

- **Headless Shopify (Hydrogen)** — Custom headless storefronts may not expose `window.Shopify`, causing a false negative.
- **`chrome://` pages** — Extensions cannot run on Chrome's internal pages (new tab, settings, etc.) — this is a browser restriction.
- **Incognito mode** — Extension does not run in incognito unless manually enabled at `chrome://extensions`.

---

## Privacy

This extension does not collect, transmit, or store any personal data. All detection runs entirely in your local browser. No network requests are made by the extension itself.

---

## Tech Stack

- **Manifest Version:** 3 (Chrome's latest standard)
- **Background:** Service Worker (non-persistent, event-driven)
- **Storage:** `chrome.storage.session` (auto-cleared on browser close)
- **Messaging:** `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`
- **UI:** Vanilla HTML, CSS, JavaScript — no frameworks or build tools

---

## Built By

**mgour** — Assessment project for StarsApp
