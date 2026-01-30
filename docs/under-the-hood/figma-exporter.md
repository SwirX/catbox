# Figma Exporter (Under the Hood)

The Figma Exporter uses the Figma REST API to transform design layers into CatWeb UI JSON.

## Technical Details

### 1. API Integration
- Uses the `/v1/files/${fileKey}` endpoint to retrieve the full document tree of a Figma file.
- Requires a Personal Access Token for authentication.

### 2. Recursive Conversion
The tool performs a depth-first traversal of the Figma node tree.
- **Frames/Groups** become `Frame` elements.
- **Text Nodes** become `TextLabel` elements, mapping font size, alignment, and content.
- **Rectangles/Vectors** become `Frame` elements with appropriate background colors and strokes.
- **Images** become `ImageLabel` elements with placeholder IDs.

### 3. Coordinate Systems
The most complex part of the exporter is mapping Figma coordinates to CatWeb's `UDim2` system. It supports two modes:
- **Scale Mode**: Calculates position and size as a percentage of the parent node's dimensions.
- **Roblox Mode**: Normalizes the design to a fixed 1920x1080 viewport. It calculates the scale factor from the design's root frame to the target viewport and uses pixel offsets.

### 4. Property Mapping
- **Colors**: Converts Figma's normalized RGB (0-1) to HEX strings.
- **UICorner**: Maps Figma `cornerRadius` to `UICorner` elements.
- **UIStroke**: Maps Figma stroke properties to `UIStroke` elements.
- **Constraints**: Automatically adds `UIAspectRatioConstraint` to elements to ensure they maintain their design proportions in responsive layouts.
