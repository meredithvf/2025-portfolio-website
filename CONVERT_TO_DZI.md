# Converting Image to DZI Format

DZI (Deep Zoom Image) is a tiled image format optimized for smooth zooming. OpenSeadragon works best with DZI format.

## Option 1: Using VIPS (Recommended - Fastest)

1. Install VIPS via Homebrew:

   ```bash
   brew install vips
   ```

2. Run the conversion script:

   ```bash
   ./convert-to-dzi.sh
   ```

   Or manually:

   ```bash
   vips dzsave public/images/32000w_mask.png public/images/32000w_mask_files --layout dz --suffix .dzi[compression=0]
   ```

   This will create:

   - `public/images/32000w_mask_files.dzi` (XML descriptor)
   - `public/images/32000w_mask_files/` (directory with tile images)

   You may need to rename the `.dzi` file to match what the code expects.

## Option 2: Using Python (Alternative)

If you have Python installed, you can use the `openseadragon` Python package or `dzi-tools`:

```bash
pip install dzi-tools
dzi-tools convert public/images/32000w_mask.png public/images/32000w_mask.dzi
```

## Option 3: Online Converter

You can use online tools like:

- https://openseadragon.github.io/example-images/
- Or search for "DZI converter online"

## File Structure

After conversion, you should have:

```
public/images/
  ├── 32000w_mask.dzi          (XML descriptor file)
  └── 32000w_mask_files/       (Directory with tiles)
      ├── 0/
      │   ├── 0_0.jpg (or .png)
      │   └── ...
      ├── 1/
      └── ...
```

The code expects the DZI file at `/images/32000w_mask.dzi` and will automatically find the `_files` directory.
