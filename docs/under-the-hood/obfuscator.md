# Script Obfuscator (Under the Hood)

The Script Obfuscator is a security tool for CatWeb scripts that makes the logic difficult for humans to read while remaining perfectly functional for the CatWeb interpreter.

## Obfuscation Techniques

### 1. Symbol Renaming
- Maintains a `symbolMap` of all variable and function names.
- Replaces every identifier with a random word from a curated 1,500-word list.
- Identifiers starting with `l!` (local) or `o!` (object) are renamed while preserving their scope prefix.
- Protected keywords (like `math` functions or built-in event variables) are ignored to prevent breaking scripts.

### 2. Math Operation Chaining
- Instead of using standard math blocks (Increase, Decrease, etc.), the obfuscator creates a "math library" of custom functions.
- These functions perform the arithmetic and return the result.
- The original math blocks are replaced with `Run function` calls, making it harder to track numerical logic.

### 3. Function Splitting & Chaining
- Long sequences of actions are split into smaller chunks.
- Each chunk is moved into its own custom function.
- The functions are then chained together: the end of one function calls the next one in the sequence.
- This obscures the linear flow of the program.

### 4. Decoy Injection
- The tool randomly inserts "dummy" actions (Action ID 124 - Comments).
- These comments are filled with gibberish strings to distract and confuse anyone attempting to reverse-engineer the script.

### 5. ID Regeneration
- All `globalid` properties for every block and element are regenerated using random alphanumeric strings, breaking any assumptions about the original creation order or structure.
