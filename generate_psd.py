"""
generate_psd.py - Generate a PSD file from a PNG image.

Creates a PSD with two layers:
  - Layer 1 (bottom): The input PNG image
  - Layer 2 (top): A fully transparent layer of the same dimensions
"""

import argparse
import os
import sys

import numpy as np
from PIL import Image
from pytoshop.enums import ColorMode, Compression
from pytoshop.user import nested_layers


def load_png(path: str) -> Image.Image:
    """Load and validate a PNG file."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    try:
        img = Image.open(path)
    except Exception as exc:
        raise ValueError(f"Could not open image '{path}': {exc}") from exc
    if img.format and img.format.upper() != "PNG":
        raise ValueError(
            f"Expected a PNG file, got '{img.format}' format: {path}"
        )
    return img.convert("RGBA")


def image_to_layer(img: Image.Image, name: str) -> nested_layers.Layer:
    """Convert a PIL RGBA image to a pytoshop nested layer."""
    data = np.array(img)
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    a = data[:, :, 3]
    return nested_layers.Image(
        name=name,
        visible=True,
        channels={
            -1: a,
            0: r,
            1: g,
            2: b,
        },
    )


def make_transparent_layer(width: int, height: int, name: str) -> nested_layers.Layer:
    """Create a fully transparent layer of the given dimensions."""
    zeros = np.zeros((height, width), dtype=np.uint8)
    return nested_layers.Image(
        name=name,
        visible=True,
        channels={
            -1: zeros,
            0: zeros,
            1: zeros,
            2: zeros,
        },
    )


def generate_psd(input_path: str, output_path: str) -> None:
    """Generate a PSD file from the given PNG."""
    img = load_png(input_path)
    width, height = img.size

    base_layer = image_to_layer(img, name="Base Image")
    transparent_layer = make_transparent_layer(width, height, name="Transparent Layer")

    psd = nested_layers.nested_layers_to_psd(
        [transparent_layer, base_layer], ColorMode.rgb, compression=Compression.raw
    )

    with open(output_path, "wb") as f:
        psd.write(f)

    print(f"PSD saved to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a PSD file from a PNG image with a transparent layer on top."
    )
    parser.add_argument("input", help="Path to the input PNG file")
    parser.add_argument(
        "--output",
        "-o",
        help="Path for the output PSD file (default: same name as input with .psd extension)",
    )
    args = parser.parse_args()

    input_path = args.input
    if args.output:
        output_path = args.output
    else:
        base, _ = os.path.splitext(input_path)
        output_path = base + ".psd"

    try:
        generate_psd(input_path, output_path)
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
