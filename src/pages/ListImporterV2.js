import React, { useState } from "react";
import { Download, Copy, Edit, Trash2, ArrowUp, ArrowDown, Upload, Plus, ChevronDown, ChevronRight, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JsonImportModal from "../components/ListJsonImport";

const numberToLetters = (n) => {
  let s = "";
  n = n + 1;
  while (n > 0) {
    n--;
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
};

const makeId = () => Math.random().toString(36).slice(2, 9);

function KeyValueModal({ isOpen, onClose, onSave, initial = { key: "", value: "" }, title = "Add Field" }) {
  const [keyName, setKeyName] = useState(initial.key || "");
  const [value, setValue] = useState(initial.value || "");

  React.useEffect(() => {
    setKeyName(initial.key || "");
    setValue(initial.value || "");
  }, [isOpen, initial.key, initial.value]);

  const handleSave = () => {
    if (!keyName.trim()) return;
    onSave({ key: keyName.trim(), value });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl"
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-slate-800"
                placeholder="Key"
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
              />
              <input
                className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-slate-800"
                placeholder="Value (leave empty to create a nested struct)"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded bg-green-600 text-white">Save</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StructNode({ node, onChange, defaultName, level = 0 }) {
  const [open, setOpen] = useState(true);
  const [kvOpen, setKvOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  const rename = (newName) => onChange({ ...node, name: newName });

  const deleteField = (key) => {
    const fields = { ...(node.fields || {}) };
    delete fields[key];
    onChange({ ...node, fields });
  };

  const updateSub = (key, subNode) => {
    const fields = { ...(node.fields || {}) };
    fields[key] = subNode;
    onChange({ ...node, fields });
  };

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-800 ${level > 0 ? "ml-4" : ""} text-gray-900 dark:text-gray-100`}>
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="text-indigo-500 font-semibold">Struct</span>
        <input
          className="ml-2 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-sm"
          value={node.name || defaultName}
          onChange={e => rename(e.target.value)}
          placeholder={defaultName}
        />
        <button onClick={() => setKvOpen(true)} className="ml-auto px-2 py-1 rounded bg-green-600 text-white text-xs flex items-center gap-1">
          <Plus size={14} /> Add field
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {Object.entries(node.fields || {}).map(([k, v]) => (
            <div key={k} className="flex items-start gap-2">
              <span className="font-mono text-xs mt-2">{k}:</span>
              {typeof v === "object" && v && v.type === "struct" ? (
                <StructNode
                  node={v}
                  onChange={(sub) => updateSub(k, sub)}
                  defaultName={v.name || `item_${numberToLetters(0)}`}
                  level={level + 1}
                />
              ) : (
                <input
                  className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
                  value={String(v)}
                  onChange={e => {
                    const fields = { ...(node.fields || {}) };
                    fields[k] = e.target.value;
                    onChange({ ...node, fields });
                  }}
                />
              )}
              <button onClick={() => {
                setEditingKey({ key: k, value: typeof v === "string" ? v : "" });
                setKvOpen(true);
              }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700">
                <Edit size={16} />
              </button>
              <button
                onClick={() => {
                  const dup = JSON.parse(JSON.stringify(node));
                  dup.name = `${node.name || defaultName}_copy`;
                  onChange(dup, "duplicate");
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                <Copy size={16} />
              </button>
              <button onClick={() => deleteField(k)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700">
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      <KeyValueModal
        isOpen={kvOpen}
        onClose={() => { setKvOpen(false); setEditingKey(null); }}
        title={editingKey ? "Edit Field" : "Add Field"}
        initial={editingKey || { key: "", value: "" }}
        onSave={({ key, value }) => {
          const fields = { ...(node.fields || {}) };
          if (editingKey && editingKey.key !== key) {
            const oldVal = fields[editingKey.key];
            delete fields[editingKey.key];
            fields[key] = oldVal;
          }
          if (value === "") {
            fields[key] = {
              type: "struct",
              name: key || `item_${numberToLetters(Object.keys(fields).length)}`,
              fields: (typeof fields[key] === "object" && fields[key]?.type === "struct") ? fields[key].fields : {}
            };
          } else {
            fields[key] = value;
          }
          onChange({ ...node, fields });
        }}
      />
    </div>
  );
}

export default function ListImporter() {
  const [tableName, setTableName] = useState("my_table");
  const [fileName, setFileName] = useState("my_file.json");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [insertsPerBlock, setInsertsPerBlock] = useState(300);
  const [xStep, setXStep] = useState(500);
  const [xMax, setXMax] = useState(9500);
  const [blockWidth, setBlockWidth] = useState(450);
  const [blockHeight, setBlockHeight] = useState(600);

  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [generated, setGenerated] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState("plain");

  const addString = () => {
    if (!newEntry.trim()) return;
    setEntries(prev => [...prev, { id: makeId(), type: "string", value: newEntry.trim() }]);
    setNewEntry("");
  };

  const addStruct = () => {
    const letter = numberToLetters(entries.filter(e => e.type === "struct").length);
    const name = `item_${letter}`;
    setEntries(prev => [...prev, { id: makeId(), type: "struct", name, fields: {} }]);
  };

  const editString = (id, val) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, value: val } : e));
  };

  const updateStruct = (id, newStruct) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...newStruct } : e));
  };

  const deleteEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));
  const moveUp = (idx) => {
    if (idx === 0) return;
    const copy = [...entries];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    setEntries(copy);
  };
  const moveDown = (idx) => {
    if (idx === entries.length - 1) return;
    const copy = [...entries];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    setEntries(copy);
  };

  const importPlainList = (raw) => {
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error("Not an array");
      let structCount = 0;
      const mapped = arr.map((v) => {
        if (v && typeof v === "object") {
          const name = `item_${numberToLetters(structCount++)}`;
          const toStruct = (obj, fallbackName) => ({
            type: "struct",
            name: fallbackName,
            fields: Object.fromEntries(Object.entries(obj).map(([k, val], idx) => {
              if (val && typeof val === "object") {
                return [k, toStruct(val, k)];
              }
              return [k, String(val)];
            }))
          });
          return { id: makeId(), ...toStruct(v, name) };
        } else {
          return { id: makeId(), type: "string", value: String(v) };
        }
      });
      setEntries(mapped);
    } catch (e) {
      alert("Invalid list JSON");
    }
  };

  const importCatweb = (raw) => {
    try {
      const scripts = JSON.parse(raw);

      const tables = {};
      const inserts = [];
      const created = new Set();
      let mainTable = null;

      scripts.forEach(sc => {
        (sc.content || []).forEach(block => {
          (block.actions || []).forEach(act => {
            const t = act.text || [];

            if (t[0] === "Create table" && t[1]?.value) {
              const tbl = t[1].value;
              created.add(tbl);
              if (!tables[tbl]) tables[tbl] = {};
              if (!mainTable) mainTable = tbl;
            }

            if (t[0] === "Set entry" && t[1]?.value && t[3]?.value && t[5]) {
              const key = t[1].value;
              const tbl = t[3].value;
              const valNode = t[5];
              const val = valNode?.value ?? "";
              if (!tables[tbl]) tables[tbl] = {};
              tables[tbl][key] = String(val);
            }

            if (t[0] === "Insert" && t[5]?.value) {
              const arrName = t[5].value;
              if (arrName === mainTable) {
                const valNode = t[1];
                const val = valNode?.value ?? "";
                inserts.push(val);
              }
            }
          });
        });
      });

      const toStructNode = (tblName, obj) => {
        const node = { id: makeId(), type: "struct", name: tblName, fields: {} };
        for (const [k, v] of Object.entries(obj)) {
          if (created.has(v) && tables[v]) {
            node.fields[k] = toStructNode(v, tables[v]);
          } else {
            node.fields[k] = String(v);
          }
        }
        return node;
      };

      const rebuilt = inserts.map(val => {
        if (created.has(val)) {
          const rawObj = tables[val] || {};
          return toStructNode(val, rawObj);
        } else {
          return { id: makeId(), type: "string", value: String(val) };
        }
      });

      setEntries(rebuilt);
      if (mainTable) setTableName(mainTable);
    } catch (e) {
      alert("Invalid Catweb JSON");
      console.log(e);
    }
  };

  const generateJson = () => {
    const usedIds = new Set();
    const randomId = () => {
      while (true) {
        const rid = Math.random().toString(36).slice(2, 8);
        if (!usedIds.has(rid)) { usedIds.add(rid); return rid; }
      }
    };

    const actionsAll = [];

    actionsAll.push({
      id: "54",
      text: ["Create table", { value: tableName, t: "string", l: "table" }],
      globalid: randomId()
    });

    const createStructTable = (node, fallbackName) => {
      const name = (node.name && node.name.trim()) ? node.name.trim() : (fallbackName || `item_${numberToLetters(0)}`);
      actionsAll.push({
        id: "54",
        text: ["Create table", { value: name, t: "string", l: "table" }],
        globalid: randomId()
      });

      for (const [k, v] of Object.entries(node.fields || {})) {
        if (v && typeof v === "object" && v.type === "struct") {
          const childTableName = createStructTable(v, k);
          actionsAll.push({
            id: "55",
            text: ["Set entry", { value: k, t: "string", l: "entry" }, "of", { value: name, t: "string", l: "table" }, "to", { value: childTableName, l: "any", t: "string" }],
            globalid: randomId()
          });
        } else {
          actionsAll.push({
            id: "55",
            text: ["Set entry", { value: k, t: "string", l: "entry" }, "of", { value: name, t: "string", l: "table" }, "to", { value: String(v), l: "any", t: "string" }],
            globalid: randomId()
          });
        }
      }

      return name;
    };

    const weightedInserts = [];
    let autoStructCounter = 0;

    entries.forEach((e, i) => {
      if (e.type === "string") {
        weightedInserts.push({
          weight: 1,
          build: () => ([
            {
              id: "89",
              text: ["Insert", { value: String(e.value), t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }],
              globalid: randomId()
            }
          ])
        });
      } else if (e.type === "struct") {
        let name = e.name && e.name.trim() ? e.name.trim() : `item_${numberToLetters(autoStructCounter++)}`;
        const build = () => {
          const actualName = createStructTable({ ...e, name }, name);
          return [
            {
              id: "89",
              text: ["Insert", { value: actualName, t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }],
              globalid: randomId()
            }
          ];
        };
        weightedInserts.push({ weight: 25, build });
      }
    });

    const contents = [];
    let actionsChunk = [];
    let weightSum = 0;
    const pushChunk = (x, y) => {
      if (actionsChunk.length === 0) return;
      contents.push({
        y: String(y),
        x: String(x),
        globalid: randomId(),
        id: "0",
        text: ["When Website loaded..."],
        actions: actionsChunk,
        width: String(blockWidth)
      });
      actionsChunk = [];
      weightSum = 0;
    };

    let blockCount = 0, x = 0, y = 0;
    actionsChunk.push(actionsAll[0]);
    for (let i = 0; i < weightedInserts.length; i++) {
      const { weight,  } = weightedInserts[i];
      if (weightSum + weight > insertsPerBlock) {
        pushChunk(x, y);
        blockCount++;
        x = blockCount * xStep;
        if (x > xMax) { x = 0; y += blockHeight; }
      }

    }

    const contents2 = [];
    actionsChunk = [{ ...actionsAll[0] }];
    weightSum = 0;
    blockCount = 0; x = 0; y = 0;

    const buildStructActions = (node, fallbackName) => {
      const name = (node.name && node.name.trim()) ? node.name.trim() : (fallbackName || `item_${numberToLetters(0)}`);
      const acc = [];
      acc.push({
        id: "54",
        text: ["Create table", { value: name, t: "string", l: "table" }],
        globalid: randomId()
      });
      for (const [k, v] of Object.entries(node.fields || {})) {
        if (v && typeof v === "object" && v.type === "struct") {
          const child = buildStructActions(v, k);
          acc.push(...child.actions);
          acc.push({
            id: "55",
            text: ["Set entry", { value: k, t: "string", l: "entry" }, "of", { value: name, t: "string", l: "table" }, "to", { value: child.name, l: "any", t: "string" }],
            globalid: randomId()
          });
        } else {
          acc.push({
            id: "55",
            text: ["Set entry", { value: k, t: "string", l: "entry" }, "of", { value: name, t: "string", l: "table" }, "to", { value: String(v), l: "any", t: "string" }],
            globalid: randomId()
          });
        }
      }
      return { name, actions: acc };
    };

    const flushChunk = () => {
      contents2.push({
        y: String(y),
        x: String(x),
        globalid: randomId(),
        id: "0",
        text: ["When Website loaded..."],
        actions: actionsChunk,
        width: String(blockWidth)
      });
      actionsChunk = [];
      weightSum = 0;
    };

    for (const e of entries) {
      const weight = (e.type === "struct") ? 25 : 1;
      if (weightSum + weight > insertsPerBlock && actionsChunk.length > 0) {
        flushChunk();
        blockCount++;
        x = blockCount * xStep;
        if (x > xMax) { x = 0; y += blockHeight; }
      }
      if (actionsChunk.length === 0 && contents2.length === 0) {
        actionsChunk.push({
          id: "54",
          text: ["Create table", { value: tableName, t: "string", l: "table" }],
          globalid: randomId()
        });
      }

      if (e.type === "string") {
        actionsChunk.push({
          id: "89",
          text: ["Insert", { value: String(e.value), t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }],
          globalid: randomId()
        });
      } else {
        const name = e.name && e.name.trim() ? e.name.trim() : `item_${numberToLetters(0)}`;
        const built = buildStructActions({ ...e, name }, name);
        actionsChunk.push(...built.actions);
        actionsChunk.push({
          id: "89",
          text: ["Insert", { value: built.name, t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }],
          globalid: randomId()
        });
      }
      weightSum += weight;
    }

    if (actionsChunk.length > 0) flushChunk();

    const scripts = [
      {
        class: "script",
        content: contents2,
        globalid: Math.random().toString(36).slice(2, 8),
        alias: fileName.replace(/\.json$/, "")
      }
    ];

    setGenerated(JSON.stringify(scripts, null, 2));
  };

  const copyJson = () => { if (generated) navigator.clipboard.writeText(generated); };
  const downloadJson = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">List Importer</h1>

      <div className="grid gap-4 md:grid-cols-2 mb-2">
        <input className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          value={tableName} onChange={e => setTableName(e.target.value)} placeholder="Main Table Name" />
        <input className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          value={fileName} onChange={e => setFileName(e.target.value)} placeholder="File Name (e.g., my_file.json)" />
      </div>

      <div className="mb-6">
        <button onClick={() => setShowAdvanced(v => !v)} className="flex items-center gap-2 dark:text-sm px-3 py-2 rounded bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-gray-100">
          <Settings size={16} /> {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>
        <AnimatePresence initial={false}>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid gap-4 md:grid-cols-3 mt-3">
                <label className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-40">Inserts Per Block</span>
                  <input type="number" value={insertsPerBlock} onChange={e => setInsertsPerBlock(+e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" />
                </label>
                <label className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-40">X Step</span>
                  <input type="number" value={xStep} onChange={e => setXStep(+e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" />
                </label>
                <label className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-40">X Max</span>
                  <input type="number" value={xMax} onChange={e => setXMax(+e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" />
                </label>
                <label className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-40">Block Width</span>
                  <input type="number" value={blockWidth} onChange={e => setBlockWidth(+e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" />
                </label>
                <label className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-40">Block Height</span>
                  <input type="number" value={blockHeight} onChange={e => setBlockHeight(+e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 mb-4">
        <input className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="New entry (string)" />
        <button onClick={addString} className="px-4 py-2 rounded bg-indigo-600 text-white">Add String</button>
        <button onClick={addStruct} className="px-4 py-2 rounded bg-purple-600 text-white flex items-center gap-1"><Plus size={16} /> Add Struct</button>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="p-3 rounded bg-gray-100 dark:bg-slate-800">
            {entry.type === "string" ? (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
                  value={entry.value}
                  onChange={e => editString(entry.id, e.target.value)}
                />
                <button onClick={() => moveUp(idx)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"><ArrowUp size={16} /></button>
                <button onClick={() => moveDown(idx)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"><ArrowDown size={16} /></button>
                <button onClick={() => deleteEntry(entry.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"><Trash2 size={16} className="text-red-500" /></button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* <span className="dark:text-sm text-indigo-400">Struct Name:</span>
                    <input
                      className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
                      value={entry.name}
                      onChange={e => updateStruct(entry.id, { ...entry, name: e.target.value })}
                    /> */}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveUp(idx)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"><ArrowUp size={16} /></button>
                    <button onClick={() => moveDown(idx)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"><ArrowDown size={16} /></button>
                    <button onClick={() => deleteEntry(entry.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"><Trash2 size={16} className="text-red-500" /></button>
                  </div>
                </div>
                <StructNode
                  node={entry}
                  defaultName={entry.name}
                  onChange={(node) => updateStruct(entry.id, node)}
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 text-gray-900 dark:text-gray-100">
        <button
          onClick={() => { setImportType("plain"); setImportModalOpen(true); }}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 flex items-center gap-1"
        >
          <Upload size={16} /> Import JSON
        </button>

        <button
          onClick={() => { setImportType("catweb"); setImportModalOpen(true,); }}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 flex items-center gap-1"
        >
          <Upload size={16} /> Import Catweb
        </button>

      </div>

      <button onClick={generateJson} className="px-6 py-2 rounded bg-green-600 text-white mb-4">Generate Catweb JSON</button>

      {generated && (
        <div className="mb-6">
          <pre className="dark:bg-gray-900 dark:text-green-300 text-gray-900 p-4 rounded overflow-x-auto text-xs max-h-64">{generated}</pre>
          <div className="flex gap-2 mt-2">
            <button onClick={copyJson} className="px-4 py-2 rounded bg-indigo-600 text-white flex items-center gap-1"><Copy size={16} /> Copy</button>
            <button onClick={downloadJson} className="px-4 py-2 rounded bg-indigo-600 text-white flex items-center gap-1"><Download size={16} /> Download</button>
          </div>
        </div>
      )}
      <JsonImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title={importType === "plain" ? "Import Plain JSON" : "Import Catweb JSON"}
        onImport={(rawJson) => {
          if (importType === "plain") importPlainList(rawJson);
          else importCatweb(rawJson);
        }}
      />
      <div className="p-3 text-xs text-slate-500 dark:text-slate-300">Notes: Don't panic if the script seems empty in catweb, it's probably in the top left corner of the script canvas (You can change that in the advanced options) PS: if you break anything revert back to the default settings</div>
    </div>
  );
}
