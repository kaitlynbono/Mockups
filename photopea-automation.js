/**
 * Photopea PSD Automation
 *
 * Generates a Photopea script that:
 *  1. Creates a new document sized to the uploaded image's exact dimensions.
 *  2. Places the image as the bottom layer named "Base Image".
 *  3. Adds a "Title" text layer (Playfair Display, 72 pt, centered).
 *  4. Adds a layer group named "Editable Elements".
 *  5. Saves the document as a PSD and triggers a download.
 *
 * Usage (browser):
 *   import { buildScript, runInPhotopea } from './photopea-automation.js';
 *
 *   const file   = fileInput.files[0];          // File from <input type="file">
 *   const script = await buildScript(file);
 *   runInPhotopea(script);                      // Opens Photopea and runs the script
 */

/**
 * Read an image File and return its natural { width, height } in pixels.
 *
 * @param {File} file
 * @returns {Promise<{width: number, height: number}>}
 */
export function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image — please check the file format."));
    };
    img.src = url;
  });
}

/**
 * Convert a File to a base-64 data URL.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Build the Photopea JavaScript string that creates the layered PSD.
 *
 * @param {File}   file             - The image file uploaded by the user.
 * @param {object} [opts]           - Optional overrides.
 * @param {string} [opts.titleText] - Placeholder text for the Title layer (default: "Your Title Here").
 * @returns {Promise<string>}        The script to send to Photopea via postMessage.
 */
export async function buildScript(file, opts = {}) {
  const { width, height } = await readImageDimensions(file);
  const dataURL = await fileToDataURL(file);
  const titleText = opts.titleText ?? "Your Title Here";

  // Escape user-supplied text so it is safe inside a JS double-quoted string:
  // backslashes must be escaped first, then double quotes.
  const safeTitleText = titleText.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  // Escape the data URL so it is safe to embed in a JS string literal.
  const safeDataURL = dataURL.replace(/\\/g, "\\\\").replace(/`/g, "\\`");

  return `
(async function () {
  // ── 1. Create a new document sized to the uploaded image ──────────────────
  var doc = app.documents.add(${width}, ${height}, 72, "Mockup", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);

  // ── 2. Place the uploaded image as the bottom layer "Base Image" ──────────
  // Load image from data URL into a temporary document, then copy to target
  var tmpDoc = app.open("${safeDataURL}");
  tmpDoc.selection.selectAll();
  tmpDoc.selection.copy();
  tmpDoc.close(SaveOptions.DONOTSAVECHANGES);

  app.activeDocument = doc;
  doc.paste();

  // Rename the pasted layer and move it to the bottom
  var pastedLayer = doc.activeLayer;
  pastedLayer.name = "Base Image";
  pastedLayer.move(doc, ElementPlacement.PLACEATEND);

  // ── 3. Add "Title" text layer ─────────────────────────────────────────────
  var titleLayer = doc.artLayers.add();
  titleLayer.kind = LayerKind.TEXT;
  titleLayer.name = "Title";

  var textItem = titleLayer.textItem;
  textItem.contents        = "${safeTitleText}";
  textItem.font            = "PlayfairDisplay-Regular";
  textItem.size            = new UnitValue(72, "pt");
  textItem.justification   = Justification.CENTER;
  textItem.position        = [
    new UnitValue(${Math.round(width / 2)}, "px"),
    new UnitValue(${Math.round(height * 0.08)}, "px")
  ];

  // ── 4. Add "Editable Elements" layer group ────────────────────────────────
  var group = doc.layerSets.add();
  group.name = "Editable Elements";

  // ── 5. Save as PSD and export to Downloads ────────────────────────────────
  var psdOpts = new PhotoshopSaveOptions();
  psdOpts.embedColorProfile = true;
  psdOpts.alphaChannels     = true;
  psdOpts.layers            = true;

  doc.saveAs(new File("~/Downloads/mockup.psd"), psdOpts, false, Extension.LOWERCASE);

  alert("✅ PSD saved to Downloads/mockup.psd  (${width}×${height} px)");
})();
`;
}

/**
 * Open Photopea in a new tab and run the generated script via postMessage.
 *
 * Photopea listens for { photopea: { script: "..." } } on its window.
 *
 * @param {string} script - The script produced by buildScript().
 */
export function runInPhotopea(script) {
  const photopea = window.open("https://www.photopea.com", "_blank");
  if (!photopea) {
    throw new Error(
      "Pop-up was blocked. Please allow pop-ups for this page and try again."
    );
  }

  // Wait for Photopea to finish loading before sending the script.
  const READY_TIMEOUT_MS = 30_000;
  const POLL_INTERVAL_MS = 500;
  const deadline = Date.now() + READY_TIMEOUT_MS;

  const pollInterval = setInterval(() => {
    photopea.postMessage(
      { photopea: { script } },
      "https://www.photopea.com"
    );

    // Stop polling once the deadline is reached (Photopea will have run it).
    if (Date.now() > deadline) {
      clearInterval(pollInterval);
    }
  }, POLL_INTERVAL_MS);
}
