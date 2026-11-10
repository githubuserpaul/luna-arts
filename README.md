# Luna — website

Luna's shop for handmade clay charms and canvas art.

**Everything on the site can be changed by Luna herself** from a simple editor on her phone or laptop: prices, products, photos, every piece of text, reviews, FAQ, and her WhatsApp and Instagram. No code.

How it works:

```
Luna edits in Pages CMS  →  saved to GitHub  →  site updates by itself (1–2 min)
                                   ↓
                     big phone photos get shrunk automatically
```

- **Part 1:** one-time setup (Paul, about 20 minutes)
- **Part 2:** Luna's guide (how to update the shop)
- **Part 3:** editing by hand in VS Code

---

## Part 1 — One-time setup

### Step 1. Put the project on GitHub

The easiest way, since you already use VS Code:

1. Make a free GitHub account if you don't have one: <https://github.com/signup>
2. Open the `luna-website` folder in VS Code.
3. Click the **Source Control** icon (left bar), then **Publish to GitHub**.
4. Choose **Publish to GitHub public repository**. Name it e.g. `luna`.

> Uploading through the GitHub website by drag-and-drop can skip the hidden `.pages.yml` file and `.github` folder, which the editor and photo-shrinker need. VS Code (or GitHub Desktop: <https://desktop.github.com/>) includes them.

### Step 2. Put it online (pick one)

**GitHub Pages** (free, simplest)
1. On GitHub, open the repository → **Settings → Pages**.
2. Under **Branch**, pick `main` and `/ (root)` → **Save**.
3. After 1–2 minutes your link appears there, e.g. `https://yourname.github.io/luna/`.

**or Netlify** (free, if you prefer a `.netlify.app` link)
1. Go to <https://app.netlify.com> → **Add new project → Import an existing project → GitHub** → pick the repository.
2. Leave the build settings empty and **Deploy**. Make sure the site is set to **public**.

Either way, **every saved change goes live automatically on the same link**.

Then, in `index.html`, put your real link into the two `og:` lines near the top so WhatsApp shows the preview picture:
```html
<meta property="og:image" content="https://YOUR-LINK/assets/img/og-image.jpg">
<meta property="og:url" content="https://YOUR-LINK/">
```

### Step 3. Connect the editor (Pages CMS) and invite Luna

1. Go to <https://app.pagescms.org> → **Sign in with GitHub**.
2. When asked, **install the Pages CMS GitHub App** and give it access to the `luna` repository.
3. Open the repository. Pages CMS reads `.pages.yml` and shows the editor with: *Products & prices, Page text & photos, Reviews, FAQ, WhatsApp & Instagram*.
4. Invite Luna as a **collaborator by email**. She doesn't need a GitHub account; she signs in with the email link.

Docs if you get stuck: <https://pagescms.org/docs/quick-start/>

### Step 4. Check the photo-shrinker can save

On GitHub: **Settings → Actions → General → Workflow permissions → Read and write permissions → Save**.
(Usually not needed, but it's the first thing to check if photos aren't being shrunk.)

---

## Part 2 — Luna's guide

Open **<https://app.pagescms.org>**, sign in with your email, and open the **luna** site. After you press **Save**, the website updates in 1–2 minutes. Refresh the site to see it.

### Change a price
**Products & prices → Prices (₹)** → change the number → **Save**.
- This changes every product in that category, and the price boxes at the top of the page.
- Empty box = the site shows **"On request"**.
- One product with a different price? Open it and fill in **Special price**.

### Add a new product
**Products & prices → Products → Add**, then fill in:
- **Name**, e.g. *Cat face keychain*
- **Category**: Keychain / Phone charm / Bag charm / Canvas art
- **Photo**: upload from your phone or computer
- **Short line**, e.g. *A sleepy calico cat for your keys.*
- **Hanging charm**: on for keychains and charms, off for canvases
- **Save**

The order in the list is the order on the website.

### Change or remove a product
Open it in the list → change anything → **Save**. To remove it, use the delete option on that item, then **Save**.

### Change any text
**Page text & photos** has every sentence on the page, labelled by where it appears: *Top · big headline*, *About · your story*, and so on.
- In *About · your story*, leave an empty line between paragraphs.
- *Top · word to colour blue* must be a word that's in the headline.

### Reviews and FAQ
**Reviews → Add**: what they said, their name, what they bought, and an optional photo of their piece.
**FAQ → Add**: a question and its answer. Remember to fill in the payment and delivery answers.

### WhatsApp and Instagram
**WhatsApp & Instagram**: the number with country code (e.g. 919494293902) and the username without the @.

### Photo tips
- Daylight, near a window, on a plain light background (white paper works).
- Fill most of the frame with the piece. **Square photos** look best.
- Don't worry about big files: photos are shrunk, turned the right way up, and have their hidden location data removed automatically after you save.
- Use JPG, PNG or WEBP. iPhone users: if a photo won't upload, set **Settings → Camera → Formats → Most Compatible**.

---

## Part 3 — Editing by hand in VS Code

All content lives in the `content` folder:

| File | What's in it |
|---|---|
| `content/shop.json` | Prices per category and all products |
| `content/page.json` | Every sentence and the hero/About photos |
| `content/reviews.json` | Reviews |
| `content/faq.json` | FAQ |
| `content/contact.json` | WhatsApp number and Instagram username |

Photos go in `assets/images/`.

**Preview:** install the **Live Server** extension (<https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer>), right-click `index.html` → **Open with Live Server**.
Double-clicking `index.html` won't show products any more, because the page now loads its content from those files.

**Publishing your edits:** in VS Code, **Source Control → write a short message → Commit → Sync**. It goes live by itself.

> If Luna edited in Pages CMS since your last sync, press **Sync / Pull** first so you're working on her latest changes.

---

## What's where

```
luna-website/
├── index.html                  page layout (the text inside is only a fallback; real text is in content/page.json)
├── content/                    ★ everything Luna edits (see Part 3)
├── assets/
│   ├── images/                 all photos (products, reviews, hero, About)
│   ├── css/style.css           colours, fonts, layout
│   ├── js/main.js              page logic (reads the content files)
│   └── img/                    favicon, share picture, paper grain texture
├── .pages.yml                  the editor's settings: which fields Luna sees and their labels
└── .github/                    the automatic photo-shrinker
```

### Changing colours
In `assets/css/style.css`, the brand colours are at the top: `--navy: #132345;` and `--sky: #93AFD0;`.

### Adding a new category (e.g. Earrings)
This is a developer job, in two places:
1. `assets/js/main.js` → the `CATEGORIES` list at the top: add `{ id: "earrings", label: "Earrings", tag: "Earrings" }`.
2. `.pages.yml` → add a price field `earrings` under **prices**, and an option under the product **category** list.

---

## If something breaks

- **Shop shows "couldn't load":** a typo in one of the `content/*.json` files (usually after editing by hand). Press **F12 → Console** to see which file. Pages CMS always saves valid files.
- **New photo is huge or sideways:** check the **Actions** tab on GitHub. The "Optimize photos" run should be green. If it's red, see Part 1, Step 4.
- **Changes don't appear:** wait 2 minutes, then hard refresh (**Ctrl + Shift + R**). On GitHub, the **Actions** or **Deployments** tab shows when it's live.

## Built-in details

- Works on phones, tablets and desktops.
- Each "Ask to buy" opens WhatsApp with the piece's name and price already typed.
- The charms on the hero string sway and pause when off screen. Product charms swing from their keyring on hover, or on tap on phones. All of it respects the "reduce motion" setting.
- Keyboard and screen-reader friendly: real buttons, alt text, visible focus outlines, and colours that meet WCAG AA contrast.
