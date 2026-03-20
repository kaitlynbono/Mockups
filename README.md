# Mockups

Tools for creating mockups and design assets.

---

## 🎨 PSD File Generator (`generate_psd.py`)

A Python script that takes a PNG image and produces a layered PSD (Photoshop Document) file with:

- **Layer 1 (bottom)** – The input PNG image
- **Layer 2 (top)** – A fully transparent layer of the same dimensions

### Install dependencies

```bash
pip install -r requirements.txt
```

### Usage

```bash
# Output defaults to the same name as the input with a .psd extension
python generate_psd.py input.png
# → input.psd

# Specify a custom output path with --output / -o
python generate_psd.py input.png --output my_mockup.psd
# → my_mockup.psd
```

---

## 🕐 Digital World Clock (`clock/index.html`)

A single-file web app that displays a live digital clock for multiple time zones:

| City / Region | Time Zone |
|---------------|-----------|
| UTC           | Coordinated Universal Time |
| New York      | US Eastern (EST/EDT) |
| Los Angeles   | US Pacific (PST/PDT) |
| London        | GMT / BST |
| Dubai         | Gulf Standard Time (GST) |
| India         | India Standard Time (IST) |
| Tokyo         | Japan Standard Time (JST) |
| Sydney        | AEST / AEDT |

### How to open

Simply open `clock/index.html` in any modern browser — no server or install required.

```bash
# macOS
open clock/index.html

# Windows
start clock/index.html

# Linux
xdg-open clock/index.html
```
