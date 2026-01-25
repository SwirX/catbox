import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Copy, Check, ExternalLink, Github } from "lucide-react";

// CatWeb documentation content - credits to @sytesn (Discord) / https://github.com/quitism
const DOCS = [
    {
        id: "catui",
        title: "CatUI.md",
        description: "UI JSON Specification - Element structure, properties, styling, and positioning",
        filename: "CatUI.md",
        content: `# CatWeb UI JSON Specification (v2.15.0.3)

## Overview

CatWeb is a Roblox game where players create 2D websites using JSON-based UI definitions. This document covers the UI/visual structure specification. For scripting logic, see the CatDocs reference.

**Current Version:** v2.15.0.3  
**TLD:** \`.rbx\` (CatWeb-specific, not real internet TLD)

---

## Quick Start

### Basic Page Structure

\`\`\`json
[
  {
    "class": "Frame",
    "globalid": "root_frame",
    "size": "{1,0},{1,0}",
    "background_color": "#1a1a1a",
    "children": [
      // All your UI elements go here
    ]
  }
]
\`\`\`

**Critical Rules:**
- Root must be a JSON array
- Only ONE root element per page (typically a Frame)
- All other elements nest inside \`children\`
- **NEVER add comments to JSON** - they break parsing

---

## Core Concepts

### IDs & References

**globalid** (required)
- Internal unique identifier
- Used by scripts for object references (NOT alias)
- Can be any string (letters/numbers/symbols)
- **IMPORTANT:** When JSON is imported, globalids are regenerated
  - Always keep UI + scripts in ONE JSON file
  - Scripts reference objects via globalid internally

**alias** (optional)
- Human-readable name shown in explorer
- Safe to rename without breaking functionality
- Not used by scripts

### UDim2 Format

All position/size properties: \`"{scaleX,offsetX},{scaleY,offsetY}"\`

- **scale**: 0-1 (percentage of parent) - \`0.5\` = 50%
- **offset**: pixels - \`20\` = 20 pixels

**Examples:**
\`\`\`
"{0.5,0},{0.5,0}"    - centered, 50% width/height
"{1,0},{1,0}"        - fills entire parent
"{0.9,-10},{0.8,20}" - 90% width - 10px, 80% height + 20px
\`\`\`

**Best Practice:** Use scale for responsiveness, offset for fine-tuning

### Auto-Sizing

Dynamic sizing modes:
- \`"auto"\` - Both width and height fit content
- \`"auto_x"\` - Width fits content, height uses scale/offset
- \`"auto_y"\` - Height fits content, width uses scale/offset

### Color Format

- Hex with/without \`#\`: \`"#ff0000"\` or \`"ff0000"\`
- RGB auto-converts: \`"255,0,0"\` → \`"#ff0000"\`

### Transparency

String from \`"0"\` (opaque) to \`"1"\` (invisible)

---

## Element Classes

### Frame
Basic container with only common properties.

### ScrollingFrame
Scrollable container with canvas size and scrollbar properties.

### TextLabel
Non-interactive text display with font, alignment, and text properties.

### TextButton
Clickable button with text. Same as TextLabel plus auto_color.

### TextBox
User input field with placeholder and editable properties.

### ImageLabel
Displays images with image_id, transparency, and scale_type.

### Folder
Invisible organizational container (not rendered).

### script
Contains CatWeb scripting logic.

---

## Styling Elements

- **UICorner** - Rounds corners
- **UIStroke** - Adds border/outline
- **UIGradient** - Color gradient
- **UIPadding** - Internal spacing
- **UIListLayout** - Arranges children in list
- **UIGridLayout** - Arranges children in grid
- **UIAspectRatioConstraint** - Maintains aspect ratio
- **UISizeConstraint** - Limits element size
- **UITextSizeConstraint** - Limits text size scaling

---

## Limits & Constraints

- **Element limit:** 100 (free) / 200 (premium)
- **Root elements:** 1 per page
- **Text rendering:** ~16k-32k visible, 200k total
- **Runtime objects:** 1000 max
- **Variable storage:** 5MB total per page

---

For the complete specification, download this file.
`,
    },
    {
        id: "catdocs",
        title: "CatDocs.md",
        description: "Complete Scripting Reference - Events, actions, variables, and automation",
        filename: "CatDocs.md",
        content: `# CatDocs - CatWeb Complete Reference (v2.15.0.3)

## Introduction

**CatWeb** is a Roblox game where players create 2D websites using JSON-based UI and a visual block-based scripting system.

**Current Version:** v2.15.0.3  
**TLD:** \`.rbx\` (CatWeb-specific, not real internet)

---

## Scripting System

### Core Concepts

**Scripts:**
- Element type that contains events and actions
- Can be placed anywhere in UI hierarchy
- Multiple scripts per page allowed
- Share global variables and functions

**Events (Triggers):**
- Start execution when conditions met
- Run in parallel with priority
- Max 30 events per script
- Each event holds max 120 actions

**Actions (Blocks):**
- Execute sequentially within an event
- Total capacity: 3,600 per script
- 16 action types (categories)

**Variables:**
- Dynamic typing
- Three scopes:
  - **Global**: \`{varName}\` - accessible by all scripts/events
  - **Object**: \`{o!varName}\` - accessible within same script
  - **Local**: \`{l!varName}\` - accessible within declaring event only

---

## Events (9 types)

- 🌐 When website loaded
- 👆 When \`<button>\` pressed
- ⌨️ When \`<key>\` pressed
- 🖱️ When mouse enters/leaves \`<object>\`
- 💵 When \`<donation>\` bought
- ⌨️ When \`<input>\` submitted
- 🛜 When message received
- ⚡ Define function \`<function>\`

---

## Action Categories (16 types)

- **Console:** Log, Warn, Error
- **Logic:** If/Else conditions, comparisons
- **Loops:** Repeat times, Repeat forever, Break
- **Looks:** Visibility, text, images, properties, tweens
- **Hierarchy:** Parent, find children/descendants
- **Navigation:** URLs, redirects, query params
- **Math & Variables:** Set, math operations, random
- **Audio:** Play, stop, pause, volume, speed
- **Input:** Mouse/keyboard detection, positions
- **Network:** Broadcast, user info
- **Cookies:** Local storage (requires gamepass)
- **Time:** Unix timestamps, formatting
- **Color:** RGB/HSV/Hex conversions, lerp
- **Strings:** Substring, replace, split, join
- **Tables:** Create, iterate, entries
- **Functions:** Define, call, return

---

## Limits Summary

| Item | Free | Premium |
|------|------|---------|
| Elements | 100 | 200 |
| Sites | 1 | 3 |
| Subdomains | 3 | 5 |
| Pages | 15 | 30 |
| Variables | 5MB | 5MB |
| Actions per Event | 120 | 120 |
| Events per Script | 30 | 30 |

---

For the complete specification with all actions and properties, download this file.
`,
    },
    {
        id: "catscript",
        title: "CatScript.md",
        description: "Script JSON Format - Event/action structure, parameters, and validation",
        filename: "CatScript.md",
        content: `# CatWeb Script JSON Format (v2.15.0.3)

## Overview

This document specifies the JSON structure for CatWeb scripts. For scripting logic and action details, see **CatDocs**. For UI element structure, see the UI JSON Spec.

---

## Root Structure

Scripts use a **mandatory array wrapper**:

\`\`\`json
[
  {
    "class": "script",
    "content": [...],
    "globalid": "script_main",
    "enabled": "true"
  }
]
\`\`\`

**Requirements:**
- Root MUST be an array (not an object)
- Multiple scripts can coexist in the array
- Each script operates independently but shares global variables
- **NEVER add comments to JSON** - they break parsing

---

## Event Block Structure

\`\`\`json
{
  "y": "4695",
  "x": "4703",
  "globalid": "+!",
  "id": "0",
  "text": ["When website loaded..."],
  "actions": [...],
  "width": "350",
  "variable_overrides": []
}
\`\`\`

### Event Properties

| Property | Required | Description |
|----------|----------|-------------|
| y | Yes | Vertical position (string numeric) |
| x | Yes | Horizontal position (string numeric) |
| globalid | Yes | Event unique ID (any string) |
| id | Yes | Event type identifier |
| text | Yes | Event descriptor with parameters |
| actions | Yes | Array of action objects |
| width | Yes | Visual width in editor |

---

## Action Block Structure

\`\`\`json
{
  "id": "18",
  "text": [
    "If ",
    {"value": "var1", "t": "string", "l": "any"},
    " is equal to ",
    {"value": "var2", "t": "string", "l": "any"}
  ],
  "globalid": "rU"
}
\`\`\`

---

## Parameter Types

| Type | Description |
|------|-------------|
| any | Accepts any value |
| string | Converts to string |
| number | Non-numeric → 0 |
| object | Element reference (globalid) |
| variable | Variable name |
| tuple | Max 6 parameters |

---

## Variable Scoping

\`\`\`json
// Global (any script)
{"value": "{globalVar}", "t": "any", "l": "any"}

// Object (same script)  
{"value": "{o!objectVar}", "t": "any", "l": "any"}

// Local (same event)
{"value": "{l!localVar}", "t": "any", "l": "any"}
\`\`\`

---

## Limits

- Actions per event: 120
- Actions per script: 3,600
- Events per script: 30
- Tuple parameters: 6 max
- Runtime objects: 1,000 max

---

For the complete specification with all IDs and examples, download this file.
`,
    },
];

// Full content for downloads - these are the actual file contents
const FULL_DOCS = {
    catui: `/home/swirx/dev/projects/web/catbox/CatWeb-Docs/CatUI.md`,
    catdocs: `/home/swirx/dev/projects/web/catbox/CatWeb-Docs/CatDocs.md`,
    catscript: `/home/swirx/dev/projects/web/catbox/CatWeb-Docs/CatScript.md`,
};

export default function AIDocsPage() {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = async (id, content) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = (filename, content) => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="space-y-12 py-12">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-6 max-w-4xl mx-auto"
            >
                <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-3xl shadow-2xl flex items-center justify-center text-white rotate-[-10deg] hover:rotate-0 transition-transform duration-500">
                        <FileText size={40} />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-text-primary">
                    AI <span className="text-accent">Documentation</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                    CatWeb specification files for AI assistants and developers.
                    <br className="hidden md:block" />
                    Download or copy to use with your favorite AI tools.
                </p>
            </motion.section>

            {/* Attribution Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto"
            >
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <span className="text-lg">📝 These docs were created by</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                @sytesn
                                <span className="text-text-secondary/60">on Discord</span>
                            </span>
                            <a
                                href="https://github.com/quitism"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-full text-sm font-semibold text-text-primary flex items-center gap-2 transition-colors"
                            >
                                <Github size={16} />
                                quitism
                                <ExternalLink size={12} className="text-text-secondary" />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Doc Cards */}
            <motion.section variants={container} initial="hidden" animate="show">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {DOCS.map((doc) => (
                        <motion.div key={doc.id} variants={item}>
                            <div className="group h-full bg-surface rounded-3xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 overflow-hidden">
                                {/* Card Header */}
                                <div className="p-6 border-b border-border">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-accent">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCopy(doc.id, doc.content)}
                                                className="p-2.5 rounded-xl bg-primary hover:bg-accent hover:text-white transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                {copiedId === doc.id ? (
                                                    <Check size={18} className="text-green-500" />
                                                ) : (
                                                    <Copy size={18} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDownload(doc.filename, doc.content)}
                                                className="p-2.5 rounded-xl bg-primary hover:bg-accent hover:text-white transition-colors"
                                                title="Download file"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary mb-2">
                                        {doc.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {doc.description}
                                    </p>
                                </div>

                                {/* Code Preview */}
                                <div className="p-4 bg-primary/50 max-h-[300px] overflow-auto">
                                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                                        {doc.content.slice(0, 800)}
                                        {doc.content.length > 800 && (
                                            <span className="text-accent">... (click copy or download for full content)</span>
                                        )}
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Usage Tips */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="max-w-3xl mx-auto"
            >
                <div className="bg-surface rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        💡 How to Use
                    </h3>
                    <ul className="space-y-3 text-text-secondary">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                            <span>Copy or download the documentation files you need</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                            <span>Paste them into your AI assistant's context or attach as files</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                            <span>Ask the AI to generate CatWeb-compatible JSON based on these specs</span>
                        </li>
                    </ul>
                </div>
            </motion.section>
        </div>
    );
}
