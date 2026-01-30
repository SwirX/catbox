# Rich Text Editor (Under the Hood)

The Rich Text Editor is a WYSIWYG (What You See Is What You Get) editor that produces Roblox-compatible RichText XML.

## Technical Implementation

### 1. Editor Surface
- Uses a `contentEditable` div for the main writing area.
- Employs `document.execCommand` for standard text formatting operations like bolding, italics, and alignment.

### 2. Styling Engine
- Standard styles (Bold, Italic, Color) use native browser commands.
- Advanced effects (Transparency, Stroke/Outline) are applied by wrapping selection in `<span>` tags with specific CSS properties.

### 3. XML Conversion (The "Magic")
The core of the tool is the `collectRuns` and `generateMarkup` functions:
- **Tree Walking**: It recursively traverses the DOM of the editor content.
- **Style Extraction**: For each text node, it uses `window.getComputedStyle` to determine the effective formatting.
- **Mapping**: It maps CSS properties to Roblox XML tags:
    - `font-weight: bold` -> `<b>`
    - `color: #hex` -> `<font color="#hex">`
    - `font-family` -> `<font face="...">`
    - `text-shadow` -> `<stroke color="...">`
    - `background-color` -> `<mark color="...">`
- **Optimization**: The generator merges adjacent text fragments that share identical styles into a single tag to minimize the final string length.

### 4. Character Escaping
To ensure the generated XML is valid and won't break the Roblox parser, the tool automatically escapes special XML characters:
- `&` -> `&amp;`
- `<` -> `&lt;`
- `>` -> `&gt;`
- `"` -> `&quot;`
- `'` -> `&apos;`
