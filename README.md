# Mockups

Tools for creating mockups and design assets.

---

## Mockup PSD Builder

A browser-based tool that reads the **exact dimensions of any image you upload** and automatically builds a layered, ready-to-edit PSD in [Photopea](https://www.photopea.com) — no fixed canvas sizes, no manual setup.

### Layers created

| Layer | Type | Details |
|---|---|---|
| **Editable Elements** | Group | Top-level group for your custom additions |
| **Title** | Text | Playfair Display, 72 pt, centred, positioned near the top |
| **Base Image** | Pixel | Your uploaded image at full resolution (bottom layer) |

### How to use

1. Open `index.html` in a browser (or serve it with any static server).
2. Upload your image (PNG, JPG, WEBP, GIF …).
3. The tool instantly reads the image's **exact pixel dimensions**.
4. Optionally change the placeholder text for the **Title** layer.
5. Click **"Open in Photopea & Build PSD"**.
6. Photopea opens in a new tab; the script runs automatically and saves `mockup.psd` to your **Downloads** folder.

### Local development

```bash
# Any static server works, e.g.:
npx serve .
# then open http://localhost:3000
```

> **Note:** `index.html` uses ES modules (`type="module"`), so it must be served over HTTP/HTTPS — opening the file directly with `file://` will not work due to browser CORS restrictions.

### Files

| File | Purpose |
|---|---|
| `index.html` | Upload UI — drag-and-drop image picker, dimension preview, title input, launch button |
| `photopea-automation.js` | Core module — `readImageDimensions`, `buildScript`, `runInPhotopea` |

### Automation workflow (step-by-step)

1. Open Photopea in a new browser tab.
2. Upload the user-provided image.
3. **Read the width and height** of the uploaded image automatically.
4. Create a new PSD document using the **exact width and height** of the image.
5. Place the uploaded image as the bottom layer named **"Base Image"**.
6. Add a new text layer on top named **"Title"** — Playfair Display, 72 pt, centred.
7. Add a placeholder layer group named **"Editable Elements"**.
8. Save the project as a PSD and export it to Downloads.
