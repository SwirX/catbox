# List Importer (Under the Hood)

The List Importer is designed to convert standard JSON data (arrays or objects) into a format compatible with CatWeb's block-based scripting system.

## How it Works

### 1. Data Transformation
- **List Mode**: Takes a JSON array and iterates through each element.
- **Dictionary Mode**: Takes a JSON object and iterates through key-value pairs.
- **Nested Structs**: If a value is another object, it recursively processes it, creating a separate CatWeb table for each nested level.

### 2. Block Generation
For each entry, the tool generates specific CatWeb action blocks:
- `Create table` (ID 54): Initializes the main table or nested tables.
- `Insert` (ID 89): Used in List Mode to push values into an array.
- `Set entry` (ID 55): Used in Dictionary Mode to map keys to values.

### 3. Canvas Tiling Logic
Since CatWeb scripts are visual, blocks must be positioned on a 2D canvas. The importer uses a "tiling" algorithm:
- It groups a set number of actions (configurable via `Inserts Per Block`) into a single "When Website loaded" event block.
- Each block is assigned `x` and `y` coordinates.
- When `x` exceeds `X Max`, it resets `x` to 0 and increments `y` by `Block Height`, creating a grid-like layout in the CatWeb editor.

### 4. Global ID Management
Every block in CatWeb requires a unique `globalid`. The importer generates random alphanumeric strings for each block to ensure they don't collide when imported into CatWeb.
