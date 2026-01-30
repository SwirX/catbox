# Image Exporter V3 (Under the Hood)

The Image Exporter converts standard images into Roblox-compatible RichText strings, allowing for "drawing" images using text labels.

## The Process

### 1. Image Pre-processing
- The image is loaded into an HTML5 Canvas.
- It is resized according to the `Scale` setting.
- An `Aspect Ratio` adjustment is applied. This is necessary because text characters in Roblox (like the `█` glyph) are typically taller than they are wide, so images would appear stretched vertically without compensation.

### 2. HEX Encoding
- The tool iterates through every pixel of the processed image.
- Pixel color data (RGB) is converted into a 6-character hexadecimal string.

### 3. RLE Compression
To reduce the length of the output string (which is critical due to Roblox's character limits), the tool uses **Run-Length Encoding**:
- If multiple consecutive pixels have the exact same color, it represents them as `HEXxCount` (e.g., `ffffffx5` instead of `ffffff.ffffff.ffffff.ffffff.ffffff`).

### 4. Structure & Splitting
- Pixels in a row are joined by `.`.
- Rows are joined by `|`.
- If the image is large, it can be split into multiple chunks (textboxes) separated by `;`.
- The final format is: `TotalRows?RowCount:Data;RowCount:Data...`

### 5. Rendering in CatWeb
When imported into CatWeb, a corresponding script parses this string and uses the `<font color="#HEX">█</font>` tag for each pixel to recreate the image.
