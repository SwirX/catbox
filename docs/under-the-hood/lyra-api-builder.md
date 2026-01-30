# Lyra API Builder (Under the Hood)

The Lyra API Builder is a visual interface for constructing query strings for the Lyra music and data API.

## Core Logic

### 1. Parameter Mapping
The tool maps UI inputs to specific URL query parameters:
- `r`: The requested endpoint (e.g., `getsong`, `search`, `rng`).
- `rr`: The redirect URL, used by Lyra to send the response back to your CatWeb site.
- `id`: Specific identifier for the `getsong` endpoint.
- `q`: Search query for the `search` endpoint.

### 2. Search Filters (f)
When using the `search` endpoint, the tool allows selecting specific fields to search through (title, artist, genres). These are concatenated into a single string (e.g., `tag`) and passed to the `f` parameter.

### 3. Return Fields (rf)
This is one of the most powerful features. It allows the user to specify exactly which fields they want in the response and in what order.
- The UI uses a drag-and-drop interface to reorder fields.
- The selected field keys are joined into a single string (e.g., `tiad` for title, id, artist, decal) and passed to the `rf` parameter.

### 4. URL Construction
Using the `useMemo` hook, the tool reacts to any change in state by building a new `URLSearchParams` object. This ensures the preview URL is always up-to-date with the user's selections.
