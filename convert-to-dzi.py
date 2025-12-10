#!/usr/bin/env python3
"""
Convert an image to DZI (Deep Zoom Image) format for OpenSeadragon.
This script creates the .dzi XML file and tile images.
"""

import os
import sys
import math
from pathlib import Path
from PIL import Image

def create_dzi_tiles(image_path, output_dir, tile_size=256, overlap=0):
    """
    Convert an image to DZI format.
    
    Args:
        image_path: Path to the source image
        output_dir: Directory to save DZI files
        tile_size: Size of each tile (default 256)
        overlap: Overlap between tiles (default 1)
        preserve_alpha: If True, use PNG format to preserve transparency (default True)
    """
    # Open the image
    img = Image.open(image_path)
    
    # Convert RGBA to RGB with background color for JPEG tiles
    if img.mode == 'RGBA':
        print("Converting RGBA to RGB with background color #1a1a18...")
        # Use dark background color #1a1a18 (RGB: 26, 26, 24)
        background_color = (26, 26, 24)
        rgb_img = Image.new('RGB', img.size, background_color)
        rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img = rgb_img
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    width, height = img.size
    print(f"Image size: {width}x{height}")
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Calculate number of levels (zoom levels)
    # OpenSeadragon expects levels from 0 (lowest) to N (highest)
    # where level N is full resolution
    max_dimension = max(width, height)
    # Calculate the maximum level needed (full resolution)
    num_levels = int(math.ceil(math.log2(max_dimension / tile_size))) + 1
    
    # Add a few extra levels to ensure we have enough
    # This prevents OpenSeadragon from trying to access non-existent levels
    num_levels = max(num_levels, int(math.ceil(math.log2(max_dimension))) + 1)
    
    print(f"Creating {num_levels} zoom levels...")
    
    # Create tiles for each level
    for level in range(num_levels):
        # Calculate dimensions for this level
        # Level 0 is the smallest, level N is full resolution
        scale = 2 ** (num_levels - 1 - level)
        level_width = int(math.ceil(width / scale))
        level_height = int(math.ceil(height / scale))
        
        # Skip if level dimensions are too small
        if level_width < 1 or level_height < 1:
            print(f"Skipping level {level}: dimensions too small")
            continue
        
        # Resize image for this level
        if level == num_levels - 1:
            # Top level (full resolution)
            level_img = img
        else:
            # Use LANCZOS resampling for best quality, especially for edges
            # LANCZOS is best for downscaling and preserves edges well
            level_img = img.resize((level_width, level_height), Image.Resampling.LANCZOS)
        
        # Create level directory
        level_dir = output_path / str(level)
        level_dir.mkdir(exist_ok=True)
        
        # Create tiles
        tiles_x = int(math.ceil(level_width / tile_size))
        tiles_y = int(math.ceil(level_height / tile_size))
        
        print(f"Level {level}: {level_width}x{level_height} ({tiles_x}x{tiles_y} tiles)")
        
        for ty in range(tiles_y):
            for tx in range(tiles_x):
                # Calculate tile coordinates
                x = tx * tile_size
                y = ty * tile_size
                
                # Crop tile (with overlap if needed)
                tile = level_img.crop((
                    max(0, x - overlap),
                    max(0, y - overlap),
                    min(level_width, x + tile_size + overlap),
                    min(level_height, y + tile_size + overlap)
                ))
                
                # Save tile as JPEG
                tile_path = level_dir / f"{tx}_{ty}.jpg"
                # Use high quality JPEG for better edges
                tile.save(tile_path, "JPEG", quality=95)
    
    # Create DZI XML file - using JPEG format
    dzi_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<Image xmlns="http://schemas.microsoft.com/deepzoom/2008" 
       TileSize="{tile_size}" 
       Overlap="{overlap}" 
       Format="jpg">
  <Size Width="{width}" Height="{height}"/>
</Image>'''
    
    dzi_path = output_path.parent / f"{output_path.name}.dzi"
    with open(dzi_path, 'w') as f:
        f.write(dzi_content)
    
    print(f"\nDZI conversion complete!")
    print(f"DZI file: {dzi_path}")
    print(f"Tiles directory: {output_path}")
    
    return dzi_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert-to-dzi.py <image_path> [output_dir]")
        print("Example: python convert-to-dzi.py public/images/32000w_mask.png public/images/32000w_mask_files")
        sys.exit(1)
    
    image_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else f"{os.path.splitext(image_path)[0]}_files"
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)
    
    try:
        create_dzi_tiles(image_path, output_dir)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

