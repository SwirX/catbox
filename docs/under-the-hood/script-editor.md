# Script Editor (Under the Hood)

The Script Editor is a sophisticated visual programming environment for CatWeb, built using React.

## System Architecture

### 1. Canvas & State
- The editor maintains a complex state of "scripts", each containing a list of "events", which in turn contain a list of "actions".
- The `Canvas` component handles the 2D workspace, using `react-draggable` for block movement.

### 2. Block Lifecycle
- **Creation**: Blocks are dragged from the `BlockPalette` and dropped onto the `Canvas`.
- **Editing**: Parameters (strings, numbers, variable names) are edited inline within each block.
- **ID Generation**: Every new block is assigned a unique 2-character ID using a custom `generateId` function to ensure consistency.

### 3. Special Tools
- **Multi-Replace**: Scans the entire script's text parameters for specific strings and performs bulk replacements.
- **Macro System**: Allows users to save sequences of actions as macros and re-apply them to different events.
- **De-Obfuscator**: Helps rename obfuscated variable names across the whole script by identifying all occurrences of a symbol.

### 4. Serialization
When exporting, the editor performs a transformation process:
- It converts the internal React state into the strict CatWeb JSON format.
- It ensures that nested structures like tuples are correctly formatted.
- It preserves metadata like block positions (`x`, `y`) and widths.
- The final output is a valid JSON array ready for import into the CatWeb Roblox game.
