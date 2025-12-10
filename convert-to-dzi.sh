#!/bin/bash

# Script to convert image to DZI (Deep Zoom Image) format for OpenSeadragon
# This requires VIPS (libvips) to be installed

# Check if vips is installed
if ! command -v vips &> /dev/null; then
    echo "VIPS is not installed. Installing via Homebrew..."
    brew install vips
fi

# Input and output paths
INPUT_IMAGE="public/images/32000w_mask.png"
OUTPUT_DIR="public/images/32000w_mask_files"
OUTPUT_DZI="public/images/32000w_mask.dzi"

# Convert to DZI format using VIPS
# VIPS creates the DZI file and tiles directory
# The output will be: 32000w_mask_files.dzi and 32000w_mask_files/ directory
echo "Converting $INPUT_IMAGE to DZI format..."
vips dzsave "$INPUT_IMAGE" "${OUTPUT_DIR}" --layout dz --suffix .dzi[compression=0]

# VIPS creates files with _files suffix, so we need to rename
# The actual output will be: 32000w_mask_files.dzi and 32000w_mask_files/
if [ -f "${OUTPUT_DIR}.dzi" ]; then
    # If it created the file directly
    mv "${OUTPUT_DIR}.dzi" "$OUTPUT_DZI"
    echo "DZI file created at: $OUTPUT_DZI"
elif [ -d "${OUTPUT_DIR}" ]; then
    # VIPS might have created the directory structure
    # Look for the .dzi file in the parent directory
    DZI_FILE=$(find public/images -name "*32000w_mask*.dzi" | head -1)
    if [ -n "$DZI_FILE" ]; then
        mv "$DZI_FILE" "$OUTPUT_DZI"
        echo "DZI file created at: $OUTPUT_DZI"
    else
        echo "Warning: DZI file not found. VIPS may have created it with a different name."
        echo "Please check public/images/ for .dzi files"
    fi
fi

echo "Conversion complete!"
echo "Files created:"
echo "  - $OUTPUT_DZI"
echo "  - $OUTPUT_DIR/ (tiles directory)"

