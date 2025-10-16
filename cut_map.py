import os
import math
import argparse
from PIL import Image

def parse_hex_color(s: str):
    """Parse '#RRGGBB' or 'RRGGBB' into (r,g,b)."""
    s = s.strip()
    if s.startswith("#"):
        s = s[1:]
    if len(s) not in (6,):
        raise ValueError("Цвет должен быть в формате RRGGBB или #RRGGBB")
    r = int(s[0:2], 16)
    g = int(s[2:4], 16)
    b = int(s[4:6], 16)
    return (r, g, b)

def make_tiles(input_path: str, output_dir: str, tile_size: int = 512,
               out_format: str = "png", pad_bg: str | None = None,
               overwrite: bool = True):
    img = Image.open(input_path)
    img_w, img_h = img.size
    print(f"Input image: {input_path} ({img_w}×{img_h}), mode={img.mode}")
    x_tiles = math.ceil(img_w / tile_size)
    y_tiles = math.ceil(img_h / tile_size)
    print(f"Tile size: {tile_size}. Will produce {x_tiles} × {y_tiles} = {x_tiles * y_tiles} tiles")

    # Decide target mode & background for padding
    has_alpha = img.mode in ("RGBA", "LA") or ("transparency" in img.info)
    if out_format.lower() in ("jpg", "jpeg"):
        # JPEG has no alpha -> use RGB
        target_mode = "RGB"
    else:
        target_mode = "RGBA" if has_alpha else "RGB"

    if pad_bg is None:
        # default: transparent for RGBA, black for RGB
        if target_mode == "RGBA":
            pad_color = (0, 0, 0, 0)
        else:
            pad_color = (0, 0, 0)
    else:
        # user provided hex color
        rgb = parse_hex_color(pad_bg)
        if target_mode == "RGBA":
            pad_color = (rgb[0], rgb[1], rgb[2], 255)
        else:
            pad_color = rgb

    ext = out_format.lower()
    if ext == "jpeg":
        ext = "jpg"

    total = x_tiles * y_tiles
    count = 0
    for tx in range(x_tiles):
        # make dir for this x
        dir_x = os.path.join(output_dir, str(tx))
        os.makedirs(dir_x, exist_ok=True)
        for ty in range(y_tiles):
            left = tx * tile_size
            upper = ty * tile_size
            right = min(left + tile_size, img_w)
            lower = min(upper + tile_size, img_h)
            box = (left, upper, right, lower)
            tile = img.crop(box)

            # pad to full tile_size if needed
            if tile.size != (tile_size, tile_size):
                # create background and paste tile at 0,0
                if target_mode == "RGBA":
                    canvas = Image.new("RGBA", (tile_size, tile_size), pad_color)
                else:
                    canvas = Image.new("RGB", (tile_size, tile_size), pad_color)
                # convert tile to target mode if needed
                if tile.mode != canvas.mode:
                    tile = tile.convert(canvas.mode)
                canvas.paste(tile, (0, 0))
                tile = canvas
            else:
                if tile.mode != target_mode:
                    tile = tile.convert(target_mode)

            out_path = os.path.join(dir_x, f"{ty}.{ext}")
            if not overwrite and os.path.exists(out_path):
                # skip if exists
                pass
            else:
                # save with sensible params
                save_kwargs = {}
                if ext in ("jpg", "jpeg"):
                    save_kwargs["quality"] = 90
                if ext == "webp":
                    save_kwargs["quality"] = 90
                tile.save(out_path, **save_kwargs)

            count += 1
            if count % 50 == 0 or count == total:
                print(f"Saved {count}/{total} tiles")

    print("Done.")
    print(f"Tiles saved to: {os.path.abspath(output_dir)}")
    print(f"Tile layout: x in [0..{x_tiles-1}], y in [0..{y_tiles-1}]")
    print("Tile URL example: /tiles/{x}/{y}.")


def main():
    p = argparse.ArgumentParser(description="Make tiles (tiles/x/y.png) from a single image")
    p.add_argument("input", help="Input image path (e.g. map.png)")
    p.add_argument("--output-dir", default="tiles", help="Output directory (default: tiles)")
    p.add_argument("--tile-size", type=int, default=512, help="Tile size in pixels (default 512)")
    p.add_argument("--format", default="png", choices=["png", "webp", "jpg", "jpeg"],
                   help="Output image format (png/webp/jpg)")
    p.add_argument("--pad-bg", default=None,
                   help="Padding background color as hex RRGGBB (default: transparent for PNG, black for JPG)")
    p.add_argument("--no-overwrite", dest="no_overwrite", action="store_true", help="Do not overwrite existing tiles")
    args = p.parse_args()

    make_tiles(args.input, args.output_dir, tile_size=args.tile_size,
               out_format=args.format, pad_bg=args.pad_bg,
               overwrite=not args.no_overwrite)

if __name__ == "__main__":
    main()
