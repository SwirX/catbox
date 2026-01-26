export const CANVAS_SIZE = 10000;
export const GRID_SIZE = 40;

export const STYLING = {
    borderRadius: "16px",
    borderRadiusSm: "12px",
    borderRadiusLg: "24px",
    borderRadiusPill: "9999px",
    shadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
    shadowSm: "0 2px 8px rgba(0, 0, 0, 0.15)",
};

export const COLORS = {
    events: "#ffb703",
    console: "#6c757d",
    logic: "#00bbf9",
    loops: "#00f5d4",
    looks: "#9b5de5",
    variables: "#fb5607",
    math: "#f15bb5",
    functions: "#f72585",
    tables: "#4361ee",
    strings: "#4cc9f0",
    hierarchy: "#8338ec",
    navigation: "#06d6a0",
    audio: "#ff006e",
    network: "#3a86ff",
    cookies: "#d4a373",
    time: "#ffd166",
    input: "#fee440",
    color: "#e63946",
};

// SVG icon paths
export const ICONS = {
    events: "M13 10V3L4 14h7v7l9-11h-7z",
    logic: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    loops: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    variables: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    math: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    looks: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    tables: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    functions: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    console: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    hierarchy: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
    navigation: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    audio: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
    network: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    cookies: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
    time: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    input: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
    strings: "M4 6h16M4 12h16m-7 6h7",
    color: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    duplicate: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
    zoomIn: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7",
    zoomOut: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7",
    center: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    fullscreen: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
    minimize: "M9 9V4.5M9 9H4.5M9 9L3.5 3.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5",
    reset: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    import: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    export: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
};

// Event IDs matching CatWeb spec v2.15.0.3
export const EVENT_TYPES = {
    "0": { id: "0", text: ["When website loaded..."], color: COLORS.events },
    "1": { id: "1", text: ["When", { type: "object", label: "button" }, "pressed..."], color: COLORS.events },
    "2": { id: "2", text: ["When", { type: "key", label: "key" }, "pressed..."], color: COLORS.events },
    "3": { id: "3", text: ["When mouse enters", { type: "object", label: "object" }, "..."], color: COLORS.events },
    "5": { id: "5", text: ["When mouse leaves", { type: "object", label: "object" }, "..."], color: COLORS.events },
    "6": { id: "6", text: ["Define function", { type: "string", label: "function" }], color: COLORS.functions, hasOverrides: true },
    "7": { id: "7", text: ["When", { type: "object", label: "donation" }, "bought..."], color: COLORS.events },
    "8": { id: "8", text: ["When", { type: "object", label: "input" }, "submitted..."], color: COLORS.events },
    "9": { id: "9", text: ["When message received..."], color: COLORS.network },
    "10": { id: "10", text: ["When", { type: "object", label: "object" }, "changed..."], color: COLORS.events },
};

// Action IDs matching CatWeb spec v2.15.0.3
export const ACTION_TYPES = {
    // ===== Console =====
    "0": { id: "0", text: ["Log", { type: "any", label: "any" }], category: "Console", color: COLORS.console },
    "1": { id: "1", text: ["Warn", { type: "any", label: "any" }], category: "Console", color: COLORS.console },
    "2": { id: "2", text: ["Error", { type: "any", label: "any" }], category: "Console", color: COLORS.console },
    "124": { id: "124", text: [{ type: "string", label: "comment" }], category: "Console", color: COLORS.console },

    // ===== Logic =====
    "3": { id: "3", text: ["Wait", { type: "number", label: "number" }, "seconds"], category: "Logic", color: COLORS.logic },
    "18": { id: "18", text: ["If", { type: "any", label: "any" }, "is equal to", { type: "any", label: "any" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "19": { id: "19", text: ["If", { type: "any", label: "any" }, "is not equal to", { type: "any", label: "any" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "20": { id: "20", text: ["If", { type: "any", label: "any" }, "is greater than", { type: "any", label: "any" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "21": { id: "21", text: ["If", { type: "any", label: "any" }, "is lower than", { type: "any", label: "any" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "26": { id: "26", text: ["If", { type: "string", label: "string" }, "contains", { type: "string", label: "string" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "29": { id: "29", text: ["If", { type: "string", label: "string" }, "doesn't contain", { type: "string", label: "string" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "30": { id: "30", text: ["If", { type: "string", label: "variable" }, "exists"], category: "Logic", color: COLORS.logic, shape: "opener" },
    "32": { id: "32", text: ["If", { type: "string", label: "variable" }, "doesn't exist"], category: "Logic", color: COLORS.logic, shape: "opener" },
    "33": { id: "33", text: ["If", { type: "string", label: "variable" }, "AND", { type: "string", label: "variable" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "34": { id: "34", text: ["If", { type: "string", label: "variable" }, "OR", { type: "string", label: "variable" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "35": { id: "35", text: ["If", { type: "string", label: "variable" }, "NOR", { type: "string", label: "variable" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "36": { id: "36", text: ["If", { type: "string", label: "variable" }, "XOR", { type: "string", label: "variable" }], category: "Logic", color: COLORS.logic, shape: "opener" },
    "112": { id: "112", text: ["else"], category: "Logic", color: COLORS.logic, shape: "else" },
    "25": { id: "25", text: ["end"], category: "Logic", color: COLORS.logic, shape: "closer" },

    // ===== Loops =====
    "22": { id: "22", text: ["Repeat", { type: "number", label: "number" }, "times"], category: "Loops", color: COLORS.loops, shape: "opener" },
    "23": { id: "23", text: ["Repeat forever"], category: "Loops", color: COLORS.loops, shape: "opener" },
    "24": { id: "24", text: ["Break"], category: "Loops", color: COLORS.loops },

    // ===== Looks =====
    "4": { id: "4", text: ["Make", { type: "object", label: "object" }, "invisible"], category: "Looks", color: COLORS.looks },
    "5": { id: "5", text: ["Make", { type: "object", label: "object" }, "visible"], category: "Looks", color: COLORS.looks },
    "10": { id: "10", text: ["Set", { type: "object", label: "object" }, "text to", { type: "string", label: "string" }], category: "Looks", color: COLORS.looks },
    "16": { id: "16", text: ["Set", { type: "object", label: "object" }, "image to", { type: "string", label: "id" }], category: "Looks", color: COLORS.looks },
    "17": { id: "17", text: ["Set", { type: "object", label: "object" }, "image to avatar of", { type: "string", label: "userid" }, { type: "string", label: "resolution?" }], category: "Looks", color: COLORS.looks },
    "31": { id: "31", text: ["Set", { type: "string", label: "property" }, "of", { type: "object", label: "object" }, "to", { type: "any", label: "any" }], category: "Looks", color: COLORS.looks },
    "39": { id: "39", text: ["Get", { type: "string", label: "property" }, "of", { type: "object", label: "object" }, "→", { type: "string", label: "variable" }], category: "Looks", color: COLORS.looks },
    "40": { id: "40", text: ["Get text from", { type: "object", label: "input" }, "→", { type: "string", label: "variable" }], category: "Looks", color: COLORS.looks },
    "88": { id: "88", text: ["Tween", { type: "string", label: "property" }, "of", { type: "object", label: "object" }, "to", { type: "any", label: "any" }, "-", { type: "number", label: "time" }, { type: "string", label: "style" }, { type: "string", label: "direction" }], category: "Looks", color: COLORS.looks },
    "90": { id: "90", text: ["Duplicate", { type: "object", label: "object" }, "→", { type: "string", label: "variable" }], category: "Looks", color: COLORS.looks },
    "91": { id: "91", text: ["Delete", { type: "object", label: "object" }], category: "Looks", color: COLORS.looks },
    "116": { id: "116", text: ["If dark theme enabled"], category: "Looks", color: COLORS.looks, shape: "opener" },

    // ===== Hierarchy =====
    "41": { id: "41", text: ["Parent", { type: "object", label: "object" }, "under", { type: "object", label: "object" }], category: "Hierarchy", color: COLORS.hierarchy },
    "42": { id: "42", text: ["Get parent of", { type: "object", label: "object" }, "→", { type: "string", label: "variable" }], category: "Hierarchy", color: COLORS.hierarchy },
    "43": { id: "43", text: ["Find ancestor named", { type: "string", label: "string" }, "in", { type: "object", label: "object" }, "→", { type: "string", label: "variable" }], category: "Hierarchy", color: COLORS.hierarchy },
    "44": { id: "44", text: ["Find child named", { type: "string", label: "string" }, "in", { type: "object", label: "object" }, "→", { type: "string", label: "variable" }], category: "Hierarchy", color: COLORS.hierarchy },
    "45": { id: "45", text: ["Find descendant named", { type: "string", label: "string" }, "in", { type: "object", label: "object" }, "→", { type: "string", label: "variable" }], category: "Hierarchy", color: COLORS.hierarchy },
    "46": { id: "46", text: ["Get children of", { type: "object", label: "object" }, "→", { type: "string", label: "table" }], category: "Hierarchy", color: COLORS.hierarchy },
    "47": { id: "47", text: ["Get descendants of", { type: "object", label: "object" }, "→", { type: "string", label: "table" }], category: "Hierarchy", color: COLORS.hierarchy },
    "48": { id: "48", text: ["If", { type: "object", label: "object" }, "is ancestor of", { type: "object", label: "object" }], category: "Hierarchy", color: COLORS.hierarchy, shape: "opener" },
    "49": { id: "49", text: ["If", { type: "object", label: "object" }, "is child of", { type: "object", label: "object" }], category: "Hierarchy", color: COLORS.hierarchy, shape: "opener" },
    "50": { id: "50", text: ["If", { type: "object", label: "object" }, "is descendant of", { type: "object", label: "object" }], category: "Hierarchy", color: COLORS.hierarchy, shape: "opener" },

    // ===== Navigation =====
    "51": { id: "51", text: ["Get URL →", { type: "string", label: "variable" }], category: "Navigation", color: COLORS.navigation },
    "52": { id: "52", text: ["Redirect to", { type: "string", label: "string" }], category: "Navigation", color: COLORS.navigation },
    "53": { id: "53", text: ["Get query string parameter", { type: "string", label: "string" }, "→", { type: "string", label: "variable" }], category: "Navigation", color: COLORS.navigation },

    // ===== Variables =====
    "11": { id: "11", text: ["Set variable", { type: "string", label: "variable" }, "to", { type: "any", label: "any" }], category: "Variables", color: COLORS.variables },
    "12": { id: "12", text: ["Increase", { type: "string", label: "variable" }, "by", { type: "number", label: "number" }], category: "Variables", color: COLORS.variables },
    "13": { id: "13", text: ["Subtract", { type: "string", label: "variable" }, "by", { type: "number", label: "number" }], category: "Variables", color: COLORS.variables },
    "14": { id: "14", text: ["Multiply", { type: "string", label: "variable" }, "by", { type: "number", label: "number" }], category: "Variables", color: COLORS.variables },
    "15": { id: "15", text: ["Divide", { type: "string", label: "variable" }, "by", { type: "number", label: "number" }], category: "Variables", color: COLORS.variables },
    "28": { id: "28", text: ["Delete", { type: "string", label: "variable" }], category: "Variables", color: COLORS.variables },

    // ===== Math =====
    "27": { id: "27", text: ["Set", { type: "string", label: "var" }, "to random", { type: "number", label: "n" }, "-", { type: "number", label: "n" }], category: "Math", color: COLORS.math },
    "37": { id: "37", text: ["Raise", { type: "string", label: "variable" }, "to the power of", { type: "number", label: "number" }], category: "Math", color: COLORS.math },
    "38": { id: "38", text: [{ type: "string", label: "variable" }, "modulo", { type: "number", label: "number" }], category: "Math", color: COLORS.math },
    "92": { id: "92", text: ["Round", { type: "string", label: "variable" }], category: "Math", color: COLORS.math },
    "93": { id: "93", text: ["Floor", { type: "string", label: "variable" }], category: "Math", color: COLORS.math },
    "94": { id: "94", text: ["Ceil", { type: "string", label: "variable" }], category: "Math", color: COLORS.math },
    "114": { id: "114", text: ["Run math function", { type: "string", label: "function" }, { type: "tuple", label: "tuple" }, "→", { type: "string", label: "variable" }], category: "Math", color: COLORS.math },

    // ===== Audio =====
    "60": { id: "60", text: ["Play audio", { type: "string", label: "id" }, "→", { type: "string", label: "variable?" }], category: "Audio", color: COLORS.audio },
    "61": { id: "61", text: ["Play looped audio", { type: "string", label: "id" }, "→", { type: "string", label: "variable?" }], category: "Audio", color: COLORS.audio },
    "62": { id: "62", text: ["Set volume of", { type: "string", label: "variable" }, "to", { type: "number", label: "number" }], category: "Audio", color: COLORS.audio },
    "63": { id: "63", text: ["Set speed of", { type: "string", label: "variable" }, "to", { type: "number", label: "number" }], category: "Audio", color: COLORS.audio },
    "64": { id: "64", text: ["Set", { type: "string", label: "property" }, "of", { type: "string", label: "variable" }, "to", { type: "any", label: "any" }], category: "Audio", color: COLORS.audio },
    "65": { id: "65", text: ["Get", { type: "string", label: "property" }, "of", { type: "string", label: "variable" }, "→", { type: "string", label: "variable" }], category: "Audio", color: COLORS.audio },
    "66": { id: "66", text: ["Stop audio", { type: "string", label: "variable" }], category: "Audio", color: COLORS.audio },
    "67": { id: "67", text: ["Pause audio", { type: "string", label: "variable" }], category: "Audio", color: COLORS.audio },
    "68": { id: "68", text: ["Resume audio", { type: "string", label: "variable" }], category: "Audio", color: COLORS.audio },
    "69": { id: "69", text: ["Stop all audio"], category: "Audio", color: COLORS.audio },

    // ===== Input =====
    "70": { id: "70", text: ["If left mouse button down"], category: "Input", color: COLORS.input, shape: "opener" },
    "71": { id: "71", text: ["If middle mouse button down"], category: "Input", color: COLORS.input, shape: "opener" },
    "72": { id: "72", text: ["If right mouse button down"], category: "Input", color: COLORS.input, shape: "opener" },
    "73": { id: "73", text: ["If", { type: "key", label: "key" }, "down"], category: "Input", color: COLORS.input, shape: "opener" },
    "74": { id: "74", text: ["Get viewport size →", { type: "string", label: "x" }, { type: "string", label: "y" }], category: "Input", color: COLORS.input },
    "75": { id: "75", text: ["Get cursor position →", { type: "string", label: "x" }, { type: "string", label: "y" }], category: "Input", color: COLORS.input },

    // ===== Network =====
    "76": { id: "76", text: ["Broadcast", { type: "string", label: "message" }, "across page"], category: "Network", color: COLORS.network },
    "77": { id: "77", text: ["Broadcast", { type: "string", label: "message" }, "across site"], category: "Network", color: COLORS.network },
    "78": { id: "78", text: ["Get local username →", { type: "string", label: "variable" }], category: "Network", color: COLORS.network },
    "79": { id: "79", text: ["Get local display name →", { type: "string", label: "variable" }], category: "Network", color: COLORS.network },
    "80": { id: "80", text: ["Get local user ID →", { type: "string", label: "variable" }], category: "Network", color: COLORS.network },

    // ===== Cookies =====
    "81": { id: "81", text: ["Set", { type: "string", label: "cookie" }, "to", { type: "any", label: "any" }], category: "Cookies", color: COLORS.cookies },
    "82": { id: "82", text: ["Increase", { type: "string", label: "cookie" }, "by", { type: "number", label: "number" }], category: "Cookies", color: COLORS.cookies },
    "83": { id: "83", text: ["Delete", { type: "string", label: "cookie" }], category: "Cookies", color: COLORS.cookies },
    "84": { id: "84", text: ["Get cookie", { type: "string", label: "cookie" }, "→", { type: "string", label: "variable" }], category: "Cookies", color: COLORS.cookies },

    // ===== Time =====
    "95": { id: "95", text: ["Get unix timestamp →", { type: "string", label: "variable" }], category: "Time", color: COLORS.time },
    "96": { id: "96", text: ["Get server unix timestamp →", { type: "string", label: "variable" }], category: "Time", color: COLORS.time },
    "97": { id: "97", text: ["Get tick →", { type: "string", label: "variable" }], category: "Time", color: COLORS.time },
    "98": { id: "98", text: ["Get timezone →", { type: "string", label: "variable" }], category: "Time", color: COLORS.time },
    "99": { id: "99", text: ["Format current date/time", { type: "string", label: "format" }, "→", { type: "string", label: "variable" }], category: "Time", color: COLORS.time },
    "100": { id: "100", text: ["Format from unix", { type: "number", label: "number" }, { type: "string", label: "format" }, "→", { type: "string", label: "variable" }], category: "Time", color: COLORS.time },

    // ===== Color =====
    "101": { id: "101", text: ["Convert", { type: "string", label: "hex" }, "to RGB →", { type: "string", label: "variable" }], category: "Color", color: COLORS.color },
    "102": { id: "102", text: ["Convert", { type: "string", label: "hex" }, "to HSV →", { type: "string", label: "variable" }], category: "Color", color: COLORS.color },
    "103": { id: "103", text: ["Convert", { type: "string", label: "RGB" }, "to hex →", { type: "string", label: "variable" }], category: "Color", color: COLORS.color },
    "104": { id: "104", text: ["Convert", { type: "string", label: "HSV" }, "to hex →", { type: "string", label: "variable" }], category: "Color", color: COLORS.color },
    "105": { id: "105", text: ["Lerp", { type: "string", label: "hex" }, "to", { type: "string", label: "hex" }, "by", { type: "number", label: "alpha" }, "→", { type: "string", label: "variable" }], category: "Color", color: COLORS.color },

    // ===== Strings =====
    "106": { id: "106", text: ["Sub", { type: "string", label: "variable" }, { type: "number", label: "start" }, "-", { type: "number", label: "end" }], category: "Strings", color: COLORS.strings },
    "107": { id: "107", text: ["Replace", { type: "string", label: "string" }, "in", { type: "string", label: "variable" }, "by", { type: "string", label: "string" }], category: "Strings", color: COLORS.strings },
    "108": { id: "108", text: ["Get length of", { type: "string", label: "string" }, "→", { type: "string", label: "variable" }], category: "Strings", color: COLORS.strings },
    "109": { id: "109", text: ["Split string", { type: "string", label: "string" }, { type: "string", label: "separator" }, "→", { type: "string", label: "table" }], category: "Strings", color: COLORS.strings },
    "110": { id: "110", text: ["Lower", { type: "string", label: "string" }, "→", { type: "string", label: "variable" }], category: "Strings", color: COLORS.strings },
    "111": { id: "111", text: ["Upper", { type: "string", label: "string" }, "→", { type: "string", label: "variable" }], category: "Strings", color: COLORS.strings },
    "117": { id: "117", text: ["Concatenate", { type: "string", label: "string" }, "with", { type: "string", label: "string" }, "→", { type: "string", label: "variable" }], category: "Strings", color: COLORS.strings },

    // ===== Tables =====
    "54": { id: "54", text: ["Create table", { type: "string", label: "table" }], category: "Tables", color: COLORS.tables },
    "55": { id: "55", text: ["Set entry", { type: "string", label: "entry" }, "of", { type: "string", label: "table" }, "to", { type: "any", label: "any" }], category: "Tables", color: COLORS.tables },
    "56": { id: "56", text: ["Get entry", { type: "string", label: "entry" }, "of", { type: "string", label: "table" }, "→", { type: "string", label: "variable" }], category: "Tables", color: COLORS.tables },
    "57": { id: "57", text: ["Delete entry", { type: "string", label: "entry" }, "of", { type: "string", label: "table" }], category: "Tables", color: COLORS.tables },
    "58": { id: "58", text: ["Set entry", { type: "string", label: "entry" }, "of", { type: "string", label: "table" }, "to", { type: "object", label: "object" }], category: "Tables", color: COLORS.tables },
    "59": { id: "59", text: ["Get length of", { type: "string", label: "table" }, "→", { type: "string", label: "variable" }], category: "Tables", color: COLORS.tables },
    "85": { id: "85", text: ["Insert", { type: "any", label: "any" }, "at position", { type: "number", label: "number?" }, "of", { type: "string", label: "array" }], category: "Tables", color: COLORS.tables },
    "86": { id: "86", text: ["Remove entry at position", { type: "number", label: "number?" }, "of", { type: "string", label: "array" }], category: "Tables", color: COLORS.tables },
    "89": { id: "89", text: ["Insert", { type: "any", label: "any" }, "into", { type: "string", label: "array" }], category: "Tables", color: COLORS.tables },
    "113": { id: "113", text: ["Iterate through", { type: "string", label: "table" }, "({l!index},{l!value})"], category: "Tables", color: COLORS.tables, shape: "opener" },
    "118": { id: "118", text: ["Join", { type: "string", label: "array" }, "using", { type: "string", label: "string" }, "→", { type: "string", label: "variable" }], category: "Tables", color: COLORS.tables },

    // ===== Functions =====
    "87": { id: "87", text: ["Run function", { type: "string", label: "function" }, { type: "tuple", label: "tuple" }, "→", { type: "string", label: "variable?" }], category: "Functions", color: COLORS.functions },
    "115": { id: "115", text: ["Return", { type: "any", label: "any" }], category: "Functions", color: COLORS.functions },
    "119": { id: "119", text: ["Run function in background", { type: "string", label: "function" }, { type: "tuple", label: "tuple" }], category: "Functions", color: COLORS.functions },
};

export const CATEGORIES = [
    { id: "Events", color: COLORS.events, icon: "events" },
    { id: "Console", color: COLORS.console, icon: "console" },
    { id: "Logic", color: COLORS.logic, icon: "logic" },
    { id: "Loops", color: COLORS.loops, icon: "loops" },
    { id: "Variables", color: COLORS.variables, icon: "variables" },
    { id: "Math", color: COLORS.math, icon: "math" },
    { id: "Looks", color: COLORS.looks, icon: "looks" },
    { id: "Hierarchy", color: COLORS.hierarchy, icon: "hierarchy" },
    { id: "Navigation", color: COLORS.navigation, icon: "navigation" },
    { id: "Audio", color: COLORS.audio, icon: "audio" },
    { id: "Input", color: COLORS.input, icon: "input" },
    { id: "Network", color: COLORS.network, icon: "network" },
    { id: "Cookies", color: COLORS.cookies, icon: "cookies" },
    { id: "Time", color: COLORS.time, icon: "time" },
    { id: "Color", color: COLORS.color, icon: "color" },
    { id: "Strings", color: COLORS.strings, icon: "strings" },
    { id: "Tables", color: COLORS.tables, icon: "tables" },
    { id: "Functions", color: COLORS.functions, icon: "functions" },
];
