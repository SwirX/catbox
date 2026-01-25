import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const initialJson = [
  {
    "enabled": "true",
    "running": "false",
    "class": "script",
    "globalid": "[j",
    "content": [
      {
        "y": "4691",
        "variable_overrides": [
          {
            "value": "table"
          }
        ],
        "x": "4843",
        "globalid": "AK",
        "id": "6",
        "text": [
          "Shuffle Function: ",
          {
            "value": "shuffle",
            "l": "function",
            "t": "string"
          }
        ],
        "actions": [
          {
            "id": "59",
            "text": [
              "Get length of",
              {
                "value": "l!table",
                "l": "array",
                "t": "string"
              },
              "→",
              {
                "value": "l!table_length",
                "l": "variable",
                "t": "string"
              }
            ],
            "globalid": "6p"
          },
          {
            "id": "11",
            "text": [
              "Set",
              {
                "value": "idx",
                "t": "string",
                "l": "variable"
              },
              "to",
              {
                "value": "{l!table_length}",
                "t": "string",
                "l": "any"
              }
            ],
            "globalid": "-6"
          },
          {
            "id": "23",
            "text": ["Repeat forever"],
            "globalid": "Ge"
          },
          {
            "id": "21",
            "text": [
              "If",
              {
                "value": "{idx}",
                "t": "string",
                "l": "any"
              },
              "is lower than",
              {
                "value": "1",
                "t": "string",
                "l": "any"
              }
            ],
            "globalid": "!0"
          },
          {
            "id": "24",
            "text": ["Break"],
            "globalid": "D|"
          },
          {
            "id": "25",
            "text": ["end"],
            "globalid": "| "
          },
          {
            "id": "56",
            "text": [
              "Get entry",
              {
                "value": "{idx}",
                "l": "entry",
                "t": "string"
              },
              "of",
              {
                "value": "l!table",
                "l": "table",
                "t": "string"
              },
              "→",
              {
                "value": "nrml_entry",
                "t": "string",
                "l": "variable"
              }
            ],
            "globalid": "hr"
          },
          {
            "id": "27",
            "text": [
              "Set",
              {
                "value": "rng",
                "t": "string",
                "l": "var"
              },
              "to random",
              {
                "value": "1",
                "t": "number",
                "l": "n"
              },
              "-",
              {
                "value": "{idx}",
                "t": "number",
                "l": "n"
              }
            ],
            "globalid": "=$"
          },
          {
            "id": "56",
            "text": [
              "Get entry",
              {
                "value": "{rng}",
                "t": "string",
                "l": "entry"
              },
              "of",
              {
                "value": "l!table",
                "l": "table",
                "t": "string"
              },
              "→",
              {
                "value": "rng_entry",
                "t": "string",
                "l": "variable"
              }
            ],
            "globalid": "&,"
          },
          {
            "id": "55",
            "text": [
              "Set entry",
              {
                "value": "{idx}",
                "t": "string",
                "l": "entry"
              },
              "of",
              {
                "value": "l!table",
                "t": "string",
                "l": "table"
              },
              "to",
              {
                "value": "{rng_entry}",
                "t": "string",
                "l": "any"
              }
            ],
            "globalid": "r)"
          },
          {
            "id": "55",
            "text": [
              "Set entry",
              {
                "value": "{rng}",
                "t": "string",
                "l": "entry"
              },
              "of",
              {
                "value": "l!table",
                "t": "string",
                "l": "table"
              },
              "to",
              {
                "value": "{nrml_entry}",
                "t": "string",
                "l": "any"
              }
            ],
            "globalid": "F "
          },
          {
            "id": "13",
            "text": [
              "Decrease",
              {
                "value": "idx",
                "t": "string",
                "l": "variable"
              },
              "by",
              {
                "value": "1",
                "t": "number"
              }
            ],
            "globalid": "e6"
          },
          {
            "id": "25",
            "text": ["end"],
            "globalid": "R'"
          },
          {
            "id": "115",
            "text": [
              "Return",
              {
                "value": "{l!table}",
                "t": "string",
                "l": "any"
              }
            ],
            "globalid": "Lf"
          }
        ],
        "width": "553"
      },
      {
        "y": "4689",
        "x": "5433",
        "globalid": "#&",
        "id": "0",
        "text": ["This is just an example"],
        "actions": [
          {
            "id": "54",
            "text": [
              "Create table",
              {
                "value": "example_table",
                "t": "string",
                "l": "table"
              }
            ],
            "globalid": "~L"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "0",
                "l": "any",
                "t": "string"
              },
              "at position",
              {
                "t": "number",
                "l": "number?"
              },
              "of",
              {
                "value": "example_table",
                "l": "array",
                "t": "string"
              }
            ],
            "globalid": ":S"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "1",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": "4^"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "3",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": "oN"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "4",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": "I5"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "5",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": "Gw"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "6",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": "Df"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "7",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": "9a"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "8",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "t": "number",
                "l": "number?"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": ":l"
          },
          {
            "id": "89",
            "text": [
              "Insert",
              {
                "value": "9",
                "t": "string",
                "l": "any"
              },
              "at position",
              {
                "l": "number?",
                "t": "number"
              },
              "of",
              {
                "value": "example_table",
                "t": "string",
                "l": "array"
              }
            ],
            "globalid": ">G"
          },
          {
            "id": "87",
            "text": [
              "Run function",
              {
                "value": "shuffle",
                "t": "string",
                "l": "function"
              },
              {
                "value": [
                  {
                    "value": "{example_table}",
                    "t": "string",
                    "l": "any"
                  }
                ],
                "t": "tuple"
              },
              "→",
              {
                "value": "shuffled",
                "t": "string",
                "l": "variable?"
              }
            ],
            "globalid": "Nj"
          },
          {
            "id": "0",
            "text": ["Log", { "value": "{shuffled}", "t": "any" }],
            "globalid": "Bj"
          }
        ],
        "width": "507"
      }
    ],
    "alias": "shuffle"
  }
];

// Block definitions
const eventTypes = {
  "0": { text: ["When website loaded..."] },
  "1": { text: ["When", { value: "", l: "button", t: "object" }, "pressed..."] },
  "2": { text: ["When", { value: "", t: "key" }, "pressed..."] },
  "3": { text: ["When mouse enters", { value: "", t: "object" }, "..."] },
  "5": { text: ["When mouse leaves", { value: "", t: "object" }, "..."] },
  "6": { text: ["Shuffle Function: ", { value: "", l: "function", t: "string" }] },
  "7": { text: ["When", { value: "", l: "donation", t: "object" }, "bought..."] },
  "8": { text: ["When", { value: "", l: "input", t: "object" }, "submitted..."] },
  "9": { text: ["When message received..."] },
  "10": { text: ["When", { value: "", t: "object" }, "changed..."] }
};

const actionTypes = {
  "0": { text: ["Log", { value: "", t: "any" }] },
  "11": { text: ["Set", { value: "", l: "variable", t: "string" }, "to", { value: "", l: "any", t: "string" }] },
  "13": { text: ["Decrease", { value: "", l: "variable", t: "string" }, "by", { value: "1", t: "number" }] },
  "21": { text: ["If", { value: "", l: "any", t: "string" }, "is lower than", { value: "", l: "any", t: "string" }] },
  "23": { text: ["Repeat forever"] },
  "24": { text: ["Break"] },
  "25": { text: ["end"] },
  "27": { text: ["Set", { value: "", l: "var", t: "string" }, "to random", { value: "1", l: "n", t: "number" }, "-", { value: "", l: "n", t: "number" }] },
  "54": { text: ["Create table", { value: "", l: "table", t: "string" }] },
  "55": { text: ["Set entry", { value: "", l: "entry", t: "string" }, "of", { value: "", l: "table", t: "string" }, "to", { value: "", l: "any", t: "string" }] },
  "56": { text: ["Get entry", { value: "", l: "entry", t: "string" }, "of", { value: "", l: "table", t: "string" }, "→", { value: "", l: "variable", t: "string" }] },
  "87": { text: ["Run function", { value: "", l: "function", t: "string" }, { value: [], t: "tuple" }, "→", { value: "", l: "variable?", t: "string" }] },
  "89": { text: ["Insert", { value: "", l: "any", t: "string" }, "at position", { t: "number", l: "number?" }, "of", { value: "", l: "array", t: "string" }] },
  "115": { text: ["Return", { value: "", l: "any", t: "string" }] }
};

const openerIds = new Set(["21", "23"]);

function buildTree(actions) {
  const tree = [];
  const stack = [tree];
  let index = 0;
  while (index < actions.length) {
    const action = actions[index];
    const currentList = stack[stack.length - 1];
    if (openerIds.has(action.id)) {
      const node = {
        type: "scope",
        opener: action,
        inner: [],
        startIndex: index,
      };
      currentList.push(node);
      stack.push(node.inner);
      index++;
    } else if (action.id === "25") {
      const node = stack[stack.length - 2][stack[stack.length - 2].length - 1];
      node.endIndex = index;
      stack.pop();
      index++;
    } else {
      currentList.push({
        type: "action",
        action,
        startIndex: index,
        endIndex: index,
      });
      index++;
    }
  }
  return tree;
}

export default function CatWebVisualizer() {
  const [data, setData] = useState(initialJson);
  const [selectedScriptIndex] = useState(0);
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const draggingRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const canvasOffset = useRef({ x: 0, y: 0 });
  const canvasDragging = useRef(false);
  const dragActionRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  const centerViewportOnFirstBlock = useCallback(() => {
    if (data[selectedScriptIndex].content.length > 0) {
      const firstBlock = data[selectedScriptIndex].content[0];
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      canvasOffset.current = {
        x: -firstBlock.x + viewportWidth / 2,
        y: -firstBlock.y + viewportHeight / 2
      };
      canvasRef.current.style.transform = `translate(${canvasOffset.current.x}px, ${canvasOffset.current.y}px)`;
      gridRef.current.style.transform = `translate(${canvasOffset.current.x}px, ${canvasOffset.current.y}px)`;
    }
  }, [data, selectedScriptIndex]);

  useEffect(() => {
    // Normalize x, y, width to numbers
    const normalized = JSON.parse(JSON.stringify(data), (k, v) => {
      if ((k === "x" || k === "y" || k === "width") && typeof v === "string" && !isNaN(Number(v))) {
        return Number(v);
      }
      return v;
    });
    if (JSON.stringify(normalized) !== JSON.stringify(data)) {
      setData(normalized);
    }
    centerViewportOnFirstBlock();
  }, [data, centerViewportOnFirstBlock]);

  const script = data[selectedScriptIndex];

  const onPointerMove = useCallback((e) => {
    if (draggingRef.current) {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      const newX = Math.round(clientX - offsetRef.current.x);
      const newY = Math.round(clientY - offsetRef.current.y);
      setData(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        next[selectedScriptIndex].content[draggingRef.current.idx].x = Math.max(0, Math.min(10000 - 320, newX));
        next[selectedScriptIndex].content[draggingRef.current.idx].y = Math.max(0, Math.min(10000 - 400, newY));
        return next;
      });
    } else if (canvasDragging.current) {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      const dx = (clientX - lastPositionRef.current.x) * 1.2; // Increased sensitivity
      const dy = (clientY - lastPositionRef.current.y) * 1.2;
      lastPositionRef.current = { x: clientX, y: clientY };
      const newX = Math.max(-10000 + window.innerWidth, Math.min(0, canvasOffset.current.x + dx));
      const newY = Math.max(-10000 + window.innerHeight, Math.min(0, canvasOffset.current.y + dy));
      canvasOffset.current = { x: newX, y: newY };
      canvasRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      gridRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  }, [selectedScriptIndex]);

  const stopPointerDrag = useCallback((e) => {
    if (canvasDragging.current) {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      const dx = (clientX - lastPositionRef.current.x) * 1.2;
      const dy = (clientY - lastPositionRef.current.y) * 1.2;
      canvasOffset.current = {
        x: Math.max(-10000 + window.innerWidth, Math.min(0, canvasOffset.current.x + dx)),
        y: Math.max(-10000 + window.innerHeight, Math.min(0, canvasOffset.current.y + dy))
      };
      canvasDragging.current = false;
      canvasRef.current.style.cursor = 'grab';
      gridRef.current.style.cursor = 'grab';
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopPointerDrag);
      return;
    }
    if (draggingRef.current) {
      draggingRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopPointerDrag);
    }
  }, [onPointerMove]);

  const startDragBlock = useCallback((e, eventBlockIndex) => {
    e.stopPropagation();
    const block = script.content[eventBlockIndex];
    draggingRef.current = { idx: eventBlockIndex };
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    offsetRef.current = { x: clientX - (block.x || 0), y: clientY - (block.y || 0) };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopPointerDrag);
  }, [script, onPointerMove, stopPointerDrag]);

  const startCanvasDrag = useCallback((e) => {
    if (!draggingRef.current && e.button === 0) {
      canvasDragging.current = true;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      lastPositionRef.current = { x: clientX, y: clientY };
      offsetRef.current = { x: clientX, y: clientY };
      canvasRef.current.style.cursor = 'grabbing';
      gridRef.current.style.cursor = 'grabbing';
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopPointerDrag);
    }
  }, [onPointerMove, stopPointerDrag]);

  const onActionDragStart = useCallback((e, eventBlockIndex, actionIndex) => {
    dragActionRef.current = { eventBlockIndex, actionIndex };
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onActionDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onActionDrop = useCallback((e, eventBlockIndex, actionIndex) => {
    e.preventDefault();
    if (!dragActionRef.current) return;
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const list = next[selectedScriptIndex].content[eventBlockIndex].actions;
      if (dragActionRef.current.eventBlockIndex === eventBlockIndex) {
        const [item] = list.splice(dragActionRef.current.actionIndex, 1);
        list.splice(actionIndex, 0, item);
      } else {
        const srcList = next[selectedScriptIndex].content[dragActionRef.current.eventBlockIndex].actions;
        const [item] = srcList.splice(dragActionRef.current.actionIndex, 1);
        list.splice(actionIndex, 0, item);
      }
      return next;
    });
    dragActionRef.current = null;
  }, [selectedScriptIndex]);

  const onAddAction = useCallback((eventBlockIndex) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const list = next[selectedScriptIndex].content[eventBlockIndex].actions;
      list.push({ id: "new", text: ["New Action"], globalid: Math.random().toString(36).slice(2, 9) });
      return next;
    });
  }, [selectedScriptIndex]);

  const onEditValue = useCallback((eventBlockIndex, actionIndex, textSegmentIndex, newValue) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const seg = next[selectedScriptIndex].content[eventBlockIndex].actions[actionIndex].text[textSegmentIndex];
      if (typeof seg === "object") {
        seg.value = newValue;
      } else {
        next[selectedScriptIndex].content[eventBlockIndex].actions[actionIndex].text[textSegmentIndex] = newValue;
      }
      return next;
    });
  }, [selectedScriptIndex]);

  const escapeHtml = useCallback((str) => {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }, []);

  const exportJson = useCallback(() => {
    const pretty = JSON.stringify(data, null, 2);
    const win = window.open("about:blank", "_blank");
    if (win) {
      win.document.write(`<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace; background: #1e293b; color: #e2e8f0; padding: 20px;">${escapeHtml(pretty)}</pre>`);
      win.document.title = "Exported CatWeb JSON";
    }
  }, [data, escapeHtml]);

  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            setData(json);
            centerViewportOnFirstBlock();
          } catch (err) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [centerViewportOnFirstBlock]);

  /* --- Render Actions (Recursive) --- */
  const renderList = useCallback((list, eventIndex, actions) => {
    let elements = [];
    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      const blockData = node.type === "action" ? node.action : node.opener;
      const actionIndex = node.startIndex;
      const template = actionTypes[blockData.id] || { text: blockData.text };

      if (blockData.id !== "25") {
        elements.push(
          <motion.div
            key={blockData.globalid || actionIndex}
            draggable
            onDragStart={(e) => onActionDragStart(e, eventIndex, actionIndex)}
            onDragOver={onActionDragOver}
            onDrop={(e) => onActionDrop(e, eventIndex, actionIndex)}
            whileHover={{ scale: 1.01 }}
            className="bg-gray-50 dark:bg-[#2C2C2E]/50 rounded-xl p-3 text-sm border border-gray-100 dark:border-[#3A3A3C] shadow-sm mb-2 group relative transition-colors hover:border-apple-blue/50 dark:hover:border-apple-blue/50"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.pageX, y: e.pageY, type: 'action', eventIndex, actionIndex });
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 font-medium text-gray-800 dark:text-gray-200">
                <div className="leading-relaxed">
                  {template.text.map((seg, si) => {
                    const dataSeg = blockData.text[si];
                    const val = typeof seg === "object" && dataSeg ? dataSeg.value : seg;

                    // Static text
                    if (typeof seg === "string") return <span key={si} className="mr-1 opacity-90">{val}</span>;

                    // Input/Variable
                    return (
                      <input
                        key={si}
                        className="inline-block mx-1 bg-white dark:bg-[#1C1C1E] px-2 py-1 rounded-lg text-xs min-w-[60px] max-w-[120px] border border-gray-200 dark:border-[#505055] focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 outline-none transition-all text-center font-mono text-apple-blue font-bold shadow-inner"
                        value={blockData.text[si]?.value || ""}
                        onChange={(e) => onEditValue(eventIndex, actionIndex, si, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking input
                      />
                    );
                  })}
                </div>
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-300 dark:text-gray-600 select-none">#{actionIndex}</div>
            </div>
          </motion.div>
        );
      }

      if (node.type === "scope") {
        elements.push(
          <div key={`inner-${i}`} className="pl-4 ml-2 border-l-2 border-dashed border-gray-200 dark:border-[#3A3A3C] my-1">
            {renderList(node.inner, eventIndex, actions)}
          </div>
        );
      }
    }
    return elements;
  }, [onActionDragStart, onActionDragOver, onActionDrop, onEditValue]);

  const renderActions = useCallback((actions, eventIndex) => {
    const tree = buildTree(actions);
    return renderList(tree, eventIndex, actions);
  }, [renderList]);


  /* --- Context Menu Logic Unchanged --- */
  const handleDelete = useCallback((type, eventIndex, actionIndex) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (type === 'event') {
        next[selectedScriptIndex].content.splice(eventIndex, 1);
      } else if (type === 'action') {
        next[selectedScriptIndex].content[eventIndex].actions.splice(actionIndex, 1);
      }
      return next;
    });
    setContextMenu(null);
  }, [selectedScriptIndex]);

  const handleDuplicate = useCallback((type, eventIndex, actionIndex) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (type === 'event') {
        const original = next[selectedScriptIndex].content[eventIndex];
        const duplicate = { ...original, globalid: Math.random().toString(36).slice(2, 9), x: original.x + 20, y: original.y + 20 };
        duplicate.actions = duplicate.actions.map(a => ({ ...a, globalid: Math.random().toString(36).slice(2, 9) }));
        next[selectedScriptIndex].content.push(duplicate);
      } else if (type === 'action') {
        const original = next[selectedScriptIndex].content[eventIndex].actions[actionIndex];
        const duplicate = { ...original, globalid: Math.random().toString(36).slice(2, 9) };
        next[selectedScriptIndex].content[eventIndex].actions.push(duplicate);
      }
      return next;
    });
    setContextMenu(null);
  }, [selectedScriptIndex]);

  const handleContextMenu = useCallback((e, type, eventIndex, actionIndex) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, type, eventIndex, actionIndex });
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  /* --- Main UI Render --- */
  return (
    <div className="h-[calc(100vh-64px)] bg-[#F5F5F7] dark:bg-[#000000] flex flex-col relative overflow-hidden font-sans">

      {/* Floating Toolbar Header */}
      <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none flex justify-between items-start">
        <motion.div
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border border-white/20 dark:border-[#2C2C2E] shadow-2xl rounded-3xl p-5 flex flex-col gap-1 min-w-[300px]"
        >
          <h1 className="text-xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Visual Script Editor
          </h1>
          <p className="text-xs font-medium text-gray-400 font-mono tracking-wide ml-5 uppercase">
            {script.alias || script.globalid}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="pointer-events-auto flex items-center gap-2 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md rounded-full padding p-2 shadow-2xl border border-white/20 dark:border-[#2C2C2E]"
        >
          <button
            onClick={() => setData(JSON.parse(JSON.stringify(initialJson)))}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
            title="Reset Workspace"
          >
            Reset
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-[#3A3A3C]"></div>
          <button
            onClick={importJson}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
          >
            Import
          </button>
          <button
            onClick={exportJson}
            className="px-6 py-2.5 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Export JSON
          </button>
        </motion.div>
      </div>

      <main className="flex-1 relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" ref={gridRef}>
        {/* Infinite Grid Background */}
        <div
          className="absolute inset-0 bg-[size:40px_40px] opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #808080 1px, transparent 1px)',
            transform: `translate(${canvasOffset.current.x}px, ${canvasOffset.current.y}px)`
          }}
        />

        {/* Canvas Layer */}
        <div
          ref={canvasRef}
          className="absolute top-0 left-0 w-[10000px] h-[10000px] bg-transparent transform-gpu"
          style={{ transform: `translate(${canvasOffset.current.x}px, ${canvasOffset.current.y}px)` }}
          onPointerDown={startCanvasDrag}
          onPointerUp={() => {
            canvasRef.current.style.cursor = 'grab';
          }}
        >
          {script.content.map((blk, bi) => {
            const left = blk.x ?? 100;
            const top = blk.y ?? 100;
            const template = eventTypes[blk.id] || { text: blk.text };

            return (
              <motion.div
                key={blk.globalid || bi}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                layout
                className="absolute shadow-2xl rounded-3xl border border-white/60 dark:border-[#2C2C2E] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/5 w-[360px]" // Fixed width slightly larger
                style={{ left, top, width: Math.max(360, parseInt(blk.width) || 360) }}
                onContextMenu={(e) => handleContextMenu(e, 'event', bi)}
              >
                {/* Block Header */}
                <div
                  onPointerDown={(e) => startDragBlock(e, bi)}
                  className={`
                    cursor-grab active:cursor-grabbing select-none p-4 
                    bg-gradient-to-r from-gray-50 to-white dark:from-[#2C2C2E] dark:to-[#1C1C1E]
                    border-b border-gray-100 dark:border-[#2C2C2E]
                    flex items-center justify-between
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                            w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg
                            ${bi === 0 ? "bg-gradient-to-tr from-green-400 to-emerald-600" : "bg-gradient-to-tr from-apple-blue to-purple-600"}
                        `}>
                      <span className="text-lg font-bold">{bi + 1}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Event Block</span>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                        {Array.isArray(template.text) ? template.text.map((t, ti) => {
                          const blkText = Array.isArray(blk.text) ? blk.text[ti] : blk.text;
                          const val = typeof t === 'string' ? t : (blkText && typeof blkText === 'object' ? blkText.value : t.value);
                          return <span key={ti} className="mr-1">{val}</span>;
                        }) : blk.text}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Content */}
                <div className="p-4 space-y-3 min-h-[100px] bg-white/50 dark:bg-[#000000]/20">
                  <div className="space-y-2">
                    {blk.actions && blk.actions.length > 0 ? (
                      renderActions(blk.actions, bi)
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs italic border-2 border-dashed border-gray-200 dark:border-[#2C2C2E] rounded-xl">
                        Drag actions here or add new ones
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onAddAction(bi)}
                      className="flex-1 py-3 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] text-apple-blue font-bold text-xs uppercase tracking-wider hover:bg-apple-blue hover:text-white transition-all shadow-sm active:scale-[0.98]"
                    >
                      + Add Action
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-white dark:bg-[#1C1C1E] shadow-2xl rounded-2xl p-1.5 min-w-[160px] border border-gray-100 dark:border-[#2C2C2E]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleDuplicate(contextMenu.type, contextMenu.eventIndex, contextMenu.actionIndex)}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              Duplicate
            </button>
            <div className="h-px bg-gray-100 dark:bg-[#2C2C2E] my-1"></div>
            <button
              onClick={() => handleDelete(contextMenu.type, contextMenu.eventIndex, contextMenu.actionIndex)}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors flex items-center gap-2"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Hint */}
      <div className="absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center">
        <div className="bg-black/80 text-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium shadow-xl">
          Right-click blocks to edit • Drag empty space to pan
        </div>
      </div>
    </div>
  );
}


