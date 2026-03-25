# Variant Badge — Shopify Product Page Script

A lightweight JavaScript snippet that displays the currently selected product variant name as a floating badge over the product image on any Shopify storefront.

---

## What Does It Do?

On a Shopify product page, when a customer selects a variant (e.g. "Red / Large"), a small pill-shaped badge appears over the product image showing that variant name. The badge updates automatically whenever the selection changes.

**Example:**

```
┌──────────────────────────────┐
│  ● Red / Large               │  ← floating badge
│                              │
│     [product image]          │
│                              │
└──────────────────────────────┘
```

---

## How to Use (Console Injection)

This script is designed to be run directly from the browser's **Developer Console** on any Shopify product page.

### Step 1 — Open a Shopify Product Page

Navigate to any Shopify store's product page in Chrome (e.g. `yourstore.myshopify.com/products/some-product`).

### Step 2 — Open Developer Console

Press `F12` or `Ctrl + Shift + J` (Windows) / `Cmd + Option + J` (Mac) to open Chrome DevTools, then click the **Console** tab.

### Step 3 — Paste and Run the Script

Copy the entire contents of `variant-badge.js` and paste it into the console, then press **Enter**.

You should see this confirmation in the console:
```
[VariantBadge] Active → Red / Large
```

The badge will appear immediately over the active product image.

### Step 4 — Change Variants

Click different variant options on the page — the badge will fade out and update with the new variant name automatically.

---

## How It Works

### Variant Detection

The script reads the current variant using two methods, in order of preference:

**Method 1 — JSON tag (primary)**
Shopify keeps a `<script data-selected-variant>` tag inside the `<variant-selects>` element that always holds the full variant title as JSON. This is the most reliable source.

```js
var script = root.querySelector('script[data-selected-variant]');
var data = JSON.parse(script.textContent);
return data.title; // e.g. "Red / Large"
```

**Method 2 — Checked radio buttons (fallback)**
If the JSON tag is not present, the script reads all `checked` radio inputs inside `<variant-selects>` and joins their values.

```js
var parts = Array.from(root.querySelectorAll('input[type="radio"]:checked'))
  .map(el => el.value);
return parts.join(' / '); // e.g. "Red / Large"
```

---

### Badge Injection

The badge is a `<div id="variant-name-badge">` injected directly into the active product image container. It uses `position: absolute` with `top: 14px; left: 14px` to sit in the top-left corner of the image.

```
Image container  (position: relative)
└── #variant-name-badge  (position: absolute, top-left)
```

If the image container has `position: static`, the script temporarily sets it to `relative` so the badge positions correctly.

---

### Smooth Animations

The badge fades in and slides up on appearance, and fades out before updating to a new name:

| State | opacity | transform |
|---|---|---|
| Hidden | `0` | `translateY(-6px)` |
| Visible | `1` | `translateY(0)` |

A **30ms tick delay** on injection ensures the browser registers the initial `opacity: 0` state before transitioning in.
A **280ms fade-out** runs before the text is updated, matching the CSS transition duration.

---

### Staying in Sync — MutationObserver

Shopify dynamically updates the DOM when the user interacts with the product page. The script handles two scenarios using a `MutationObserver`:

| Scenario | What Shopify Does | Script's Response |
|---|---|---|
| User changes image slide | Moves `is-active` class to a new `<li>` | Removes badge from old container, injects on new active one |
| Shopify replaces container | Replaces the image container element entirely | Badge gets detached — re-injects on the new container |

The `change` event listener is attached to `document` (not `variant-selects`) so it survives Shopify replacing the selector element during navigation.

---

## Workflow Diagram

```
Script injected via console
        │
        ▼
getCurrentVariantName()
    ├── Tries script[data-selected-variant] JSON tag  (primary)
    └── Falls back to checked radio values            (fallback)
        │
        ▼
getImageContainer()
    ├── .product__media-item.is-active  (active slide)
    ├── .product__media-item            (first slide)
    └── .product__media-wrapper         (fallback wrapper)
        │
        ▼
applyStyles()  →  injects CSS into <head> (once)
injectBadge()  →  creates #variant-name-badge, fades in
watchContainer()  →  MutationObserver watches for DOM changes
        │
        ▼
User selects a new variant
        │
        ├── document 'change' event fires
        ├── readFromCheckedRadios() gets new name
        └── updateBadge()
                ├── Badge exists & connected  →  fade out → update text → fade in
                └── Badge detached/gone       →  injectBadge() on current container
```

---

## File Structure

```
starsapp assesment 2/
└── src/
    ├── variant-badge.js    # Main script (IIFE — safe to paste in console)
    ├── variant-badge.css   # Reference stylesheet (styles are inlined in .js)
    └── README.md
```

> The CSS in `variant-badge.css` is the same as the `BADGE_STYLES` string inlined inside `variant-badge.js`. The `.css` file is kept separately as a readable reference.

---

## Limitations

- **Product pages only** — The script checks for `<variant-selects>` and a product image container. It will log a warning and exit on non-product pages:
  ```
  [VariantBadge] No variant found. Open a product page first.
  [VariantBadge] Product image container not found.
  ```
- **Default Shopify theme selectors** — Uses `.product__media-item` and `.product__media-wrapper`. Heavily customized themes with different class names may need selector adjustments.
- **Console injection only** — This script is not packaged as a Chrome extension. It must be manually pasted each time (or saved as a browser snippet for convenience).
- **Single-variant products** — Products with only one variant still show a badge with the default variant title.

---

## Saving as a Browser Snippet (Optional)

To avoid pasting the script every time:

1. Open DevTools → **Sources** tab → **Snippets** (in the left panel)
2. Click **+ New snippet**
3. Paste the contents of `variant-badge.js`
4. Name it `variant-badge`
5. Press `Ctrl + Enter` to run it on any product page
