# JSON Cleaner (Under the Hood)

The JSON Cleaner is a utility designed to help CatWeb developers preserve the visibility of their code after it passes through Roblox's text filtering system.

## The Filtering Problem
Roblox filters strings at runtime. In CatWeb, script parameters like variable names or function names are stored in the `value` field of JSON objects. If a variable name is filtered, it becomes `####`, making it impossible to debug or understand the script.

## The Bypass Strategy
Roblox typically filters the `value` of a property but often leaves the `label` (`l`) field untouched, as it is intended for editor UI rather than display.

### How the Tool Works:
1. **Value Mirroring**: It iterates through all action and event parameters in the JSON. For every object with a `value`, it copies that value into the `l` (label) and `t` (type) fields if they are string or number types.
2. **Comment Injection**: For function definitions (Action ID 6), the cleaner automatically prepends "comment" actions (ID 124) for each argument. It places the argument name in the comment's label.
3. **Result**: If the original value is filtered, the developer can still look at the JSON properties in the editor or raw file and see the original intent in the `l` field.
