import React, { useState } from "react";
import { Download, Copy, Edit, Trash2, ArrowUp, ArrowDown, Upload, Plus, ChevronDown, ChevronRight, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JsonImportModal from "../components/ListJsonImport";

/* ---------------------- Helpers ---------------------- */
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

/* ---------------------- Modal: Key/Value ---------------------- */
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
        <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#2C2C2E]"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Key</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-black transition-all outline-none"
                  placeholder="e.g., username"
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Value</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-black transition-all outline-none"
                  placeholder="Value (leave empty for nested)"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl font-medium bg-apple-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all">Save Field</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------- Recursive Struct Node ---------------------- */
/* ---------------------- Recursive Struct Node ---------------------- */
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
    <div className={`rounded-3xl border border-gray-200 dark:border-[#2C2C2E]/50 p-5 bg-white dark:bg-[#1C1C1E]/50 ${level > 0 ? "ml-6 mt-3 shadow-none" : "shadow-sm border-b-4 border-b-gray-100 dark:border-b-[#2C2C2E]"} text-gray-900 dark:text-gray-100 transition-all`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
        >
          {open ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />}
        </button>

        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase">Struct</span>
        </div>

        <input
          className="ml-1 px-3 py-1.5 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-[#2C2C2E] focus:bg-white dark:focus:bg-[#000000] border border-transparent focus:border-apple-blue transition-all outline-none font-medium"
          value={node.name || defaultName}
          onChange={e => rename(e.target.value)}
          placeholder={defaultName}
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setKvOpen(true)}
            className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Field</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 pl-2">
              {Object.entries(node.fields || {}).map(([k, v]) => (
                <div key={k} className="group flex flex-col sm:flex-row sm:items-start gap-3 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/30 transition-colors">
                  <div className="mt-2 min-w-[120px]">
                    <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-[#2C2C2E] px-2 py-1 rounded">{k}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {typeof v === "object" && v && v.type === "struct" ? (
                      <StructNode
                        node={v}
                        onChange={(sub) => updateSub(k, sub)}
                        defaultName={v.name || `item_${numberToLetters(0)}`}
                        level={level + 1}
                      />
                    ) : (
                      <input
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#000000]/50 border border-gray-200 dark:border-[#2C2C2E] focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all outline-none text-sm"
                        value={String(v)}
                        onChange={e => {
                          const fields = { ...(node.fields || {}) };
                          fields[k] = e.target.value;
                          onChange({ ...node, fields });
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-start sm:mt-1">
                    <button onClick={() => {
                      setEditingKey({ key: k, value: typeof v === "string" ? v : "" });
                      setKvOpen(true);
                    }} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors" title="Edit Key/Type">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const dup = JSON.parse(JSON.stringify(node));
                        dup.name = `${node.name || defaultName}_copy`;
                        onChange(dup, "duplicate");
                      }}
                      className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-500 transition-colors" title="Duplicate Struct"
                    >
                      <Copy size={16} />
                    </button>
                    <button onClick={() => deleteField(k)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete Field">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {Object.keys(node.fields || {}).length === 0 && (
                <div className="text-center py-6 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 dark:border-[#2C2C2E] rounded-2xl">
                  No fields yet. Click "Add Field" to start.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

/* ---------------------- Main Component ---------------------- */
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
  const [newKey, setNewKey] = useState("");          // <-- dictionary key
  const [generated, setGenerated] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState("plain");

  /* ------------ mode toggle ------------ */
  const [isDict, setIsDict] = useState(false);

  /* ------------ CRUD helpers ------------ */
  const addString = () => {
    if (!newEntry.trim()) return;
    setEntries(prev => [...prev, { id: makeId(), type: "string", value: newEntry.trim(), key: newKey.trim() || `key_${prev.length}` }]);
    setNewEntry(""); setNewKey("");
  };

  const addStruct = () => {
    const letter = numberToLetters(entries.filter(e => e.type === "struct").length);
    const name = `item_${letter}`;
    setEntries(prev => [...prev, { id: makeId(), type: "struct", name, fields: {}, key: newKey.trim() || `key_${prev.length}` }]);
    setNewKey("");
  };

  const editString = (id, val) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, value: val } : e));
  };
  const updateStruct = (id, newStruct) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...newStruct } : e));
  };
  const deleteEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));
  const moveUp = (idx) => {
    if (idx === 0) return; const copy = [...entries];[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]; setEntries(copy);
  };
  const moveDown = (idx) => {
    if (idx === entries.length - 1) return; const copy = [...entries];[copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]]; setEntries(copy);
  };

  /* ------------ Import: Plain JSON (list or dict) ------------ */
  const importPlainList = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      const isDictMode = !Array.isArray(parsed);
      setIsDict(isDictMode);

      if (isDictMode) {
        const rebuilt = Object.entries(parsed).map(([k, v]) => {
          if (v && typeof v === "object" && !Array.isArray(v)) {
            const toStruct = (obj, fallbackName) => ({
              type: "struct",
              name: fallbackName,
              fields: Object.fromEntries(Object.entries(obj).map(([kk, vv]) => {
                if (vv && typeof vv === "object" && !Array.isArray(vv)) return [kk, toStruct(vv, kk)];
                return [kk, String(vv)];
              }))
            });
            return { id: makeId(), key: k, ...toStruct(v, k) };
          } else {
            return { id: makeId(), type: "string", key: k, value: String(v) };
          }
        });
        setEntries(rebuilt);
      } else {
        /* old list behaviour */
        let structCount = 0;
        const mapped = parsed.map((v) => {
          if (v && typeof v === "object") {
            const name = `item_${numberToLetters(structCount++)}`;
            const toStruct = (obj, fallbackName) => ({
              type: "struct",
              name: fallbackName,
              fields: Object.fromEntries(Object.entries(obj).map(([k, val], idx) => {
                if (val && typeof val === "object") return [k, toStruct(val, k)];
                return [k, String(val)];
              }))
            });
            return { id: makeId(), ...toStruct(v, name) };
          } else {
            return { id: makeId(), type: "string", value: String(v) };
          }
        });
        setEntries(mapped);
      }
    } catch (e) { alert("Invalid JSON"); }
  };

  /* ------------ Import: Catweb JSON (reverse) ------------ */
  const importCatweb = (raw) => {
    try {
      const scripts = JSON.parse(raw);
      const tables = {}; const inserts = []; const created = new Set(); let mainTable = null;

      scripts.forEach(sc => {
        (sc.content || []).forEach(block => {
          (block.actions || []).forEach(act => {
            const t = act.text || [];
            if (t[0] === "Create table" && t[1]?.value) {
              const tbl = t[1].value; created.add(tbl); if (!tables[tbl]) tables[tbl] = {}; if (!mainTable) mainTable = tbl;
            }
            if (t[0] === "Set entry" && t[1]?.value && t[3]?.value && t[5]) {
              const key = t[1].value; const tbl = t[3].value; const valNode = t[5]; const val = valNode?.value ?? "";
              if (!tables[tbl]) tables[tbl] = {}; tables[tbl][key] = String(val);
            }
            if (t[0] === "Insert" && t[5]?.value) {
              const arrName = t[5].value; if (arrName === mainTable) inserts.push(t[1]?.value ?? "");
            }
          });
        });
      });

      /* decide mode */
      const hasInsert = scripts.some(sc => (sc.content || []).some(b => (b.actions || []).some(a => (a.text || [])[0] === "Insert")));
      setIsDict(!hasInsert);

      const toStructNode = (tblName, obj) => {
        const node = { id: makeId(), type: "struct", name: tblName, fields: {} };
        for (const [k, v] of Object.entries(obj)) {
          if (created.has(v) && tables[v]) node.fields[k] = toStructNode(v, tables[v]);
          else node.fields[k] = String(v);
        }
        return node;
      };

      if (hasInsert) { /* list mode */
        const rebuilt = inserts.map(val => {
          if (created.has(val)) return toStructNode(val, tables[val] || {});
          return { id: makeId(), type: "string", value: String(val) };
        });
        setEntries(rebuilt);
      } else { /* dictionary mode */
        const rebuilt = Object.entries(tables[mainTable] || {}).map(([k, v]) => {
          if (created.has(v)) return { id: makeId(), key: k, ...toStructNode(v, tables[v] || {}) };
          return { id: makeId(), type: "string", key: k, value: String(v) };
        });
        setEntries(rebuilt);
      }
      if (mainTable) setTableName(mainTable);
    } catch (e) { alert("Invalid Catweb JSON"); console.error(e); }
  };

  /* ------------ Generator ------------ */
  const generateJson = () => {
    const usedIds = new Set();
    const randomId = () => { while (true) { const rid = Math.random().toString(36).slice(2, 8); if (!usedIds.has(rid)) { usedIds.add(rid); return rid; } } };

    const actionsAll = [];
    actionsAll.push({ id: "54", text: ["Create table", { value: tableName, t: "string", l: "table" }], globalid: randomId() });

    const createStructTable = (node, fallbackName) => {
      const name = (node.name && node.name.trim()) ? node.name.trim() : (fallbackName || `item_${numberToLetters(0)}`);
      actionsAll.push({ id: "54", text: ["Create table", { value: name, t: "string", l: "table" }], globalid: randomId() });
      for (const [k, v] of Object.entries(node.fields || {})) {
        if (v && typeof v === "object" && v.type === "struct") {
          const childTableName = createStructTable(v, k);
          actionsAll.push({ id: "55", text: ["Set entry", { value: k, t: "string", l: "entry" }, "of", { value: name, t: "string", l: "table" }, "to", { value: childTableName, l: "any", t: "string" }], globalid: randomId() });
        } else {
          actionsAll.push({ id: "55", text: ["Set entry", { value: k, t: "string", l: "entry" }, "of", { value: name, t: "string", l: "table" }, "to", { value: String(v), l: "any", t: "string" }], globalid: randomId() });
        }
      }
      return name;
    };

    const weightedInserts = [];
    entries.forEach((e) => {
      if (e.type === "string") {
        if (isDict) {
          weightedInserts.push({ weight: 1, build: () => [{ id: "55", text: ["Set entry", { value: e.key, t: "string", l: "entry" }, "of", { value: tableName, t: "string", l: "table" }, "to", { value: String(e.value), l: "any", t: "string" }], globalid: randomId() }] });
        } else {
          weightedInserts.push({ weight: 1, build: () => [{ id: "89", text: ["Insert", { value: String(e.value), t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }], globalid: randomId() }] });
        }
      } else if (e.type === "struct") {
        const name = e.name && e.name.trim() ? e.name.trim() : `item_${numberToLetters(0)}`;
        const build = () => {
          const builtName = createStructTable({ ...e, name }, name);
          if (isDict) {
            return [{ id: "55", text: ["Set entry", { value: e.key, t: "string", l: "entry" }, "of", { value: tableName, t: "string", l: "table" }, "to", { value: builtName, l: "any", t: "string" }], globalid: randomId() }];
          } else {
            return [{ id: "89", text: ["Insert", { value: builtName, t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }], globalid: randomId() }];
          }
        };
        weightedInserts.push({ weight: 25, build });
      }
    });

    /* same tiling logic as before */
    const contents2 = [];
    let actionsChunk = [{ ...actionsAll[0] }];
    let weightSum = 0; let blockCount = 0; let x = 0; let y = 0;

    const flushChunk = () => {
      contents2.push({ y: String(y), x: String(x), globalid: randomId(), id: "0", text: ["When Website loaded..."], actions: actionsChunk, width: String(blockWidth) });
      actionsChunk = []; weightSum = 0;
    };

    for (const e of weightedInserts) {
      const w = e.weight;
      if (weightSum + w > insertsPerBlock && actionsChunk.length > 0) {
        flushChunk(); blockCount++; x = blockCount * xStep; if (x > xMax) { x = 0; y += blockHeight; }
      }
      if (actionsChunk.length === 0 && contents2.length === 0) {
        actionsChunk.push({ ...actionsAll[0] });
      }
      const built = e.build();
      actionsChunk.push(...built);
      weightSum += w;
    }
    if (actionsChunk.length > 0) flushChunk();

    const scripts = [{ class: "script", content: contents2, globalid: Math.random().toString(36).slice(2, 8), alias: fileName.replace(/\.json$/, "") }];
    setGenerated(JSON.stringify(scripts, null, 2));
  };

  /* ------------ Export helpers ------------ */
  const copyJson = () => { if (generated) navigator.clipboard.writeText(generated); };
  const downloadJson = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = fileName; a.click();
  };

  /* ------------ Render ------------ */
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white mb-2">List Importer</h1>
          <p className="text-gray-500 dark:text-gray-400">Convert lists and dictionaries into Catweb-ready JSON.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setImportType("plain"); setImportModalOpen(true); }} className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/80 transition-colors flex items-center gap-2 shadow-sm dark:text-white">
            <Upload size={16} /> Import JSON
          </button>
          <button onClick={() => { setImportType("catweb"); setImportModalOpen(true); }} className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/80 transition-colors flex items-center gap-2 shadow-sm dark:text-white">
            <Upload size={16} /> Undo/Import CW
          </button>
        </div>
      </div>

      {/* Config Card */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-[#2C2C2E]">
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Table Name</label>
            <input className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E]/50 border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-medium" value={tableName} onChange={e => setTableName(e.target.value)} placeholder="Main Table Name" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">File Name</label>
            <input className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E]/50 border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-medium" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="File Name (e.g., my_file.json)" />
          </div>
        </div>

        <div className="flex items-center justify-between p-1 bg-gray-100 dark:bg-[#2C2C2E] rounded-2xl w-full sm:w-fit mb-6">
          <button onClick={() => setIsDict(false)} className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-medium transition-all ${!isDict ? "bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>List Mode</button>
          <button onClick={() => setIsDict(true)} className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-medium transition-all ${isDict ? "bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>Dictionary Mode</button>
        </div>

        {/* Advanced Toggle */}
        <div className="border-t border-gray-100 dark:border-[#2C2C2E] pt-4">
          <button onClick={() => setShowAdvanced(v => !v)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-apple-blue transition-colors font-medium">
            <Settings size={16} /> {showAdvanced ? "Hide" : "Show"} Advanced Settings
          </button>
          <AnimatePresence initial={false}>
            {showAdvanced && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid gap-4 md:grid-cols-3 mt-4 pt-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1"><span className="text-xs font-semibold uppercase opacity-70">Inserts / Block</span><input type="number" value={insertsPerBlock} onChange={e => setInsertsPerBlock(+e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] dark:text-white" /></label>
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1"><span className="text-xs font-semibold uppercase opacity-70">X Step</span><input type="number" value={xStep} onChange={e => setXStep(+e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] dark:text-white" /></label>
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1"><span className="text-xs font-semibold uppercase opacity-70">X Max</span><input type="number" value={xMax} onChange={e => setXMax(+e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] dark:text-white" /></label>
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1"><span className="text-xs font-semibold uppercase opacity-70">Block Width</span><input type="number" value={blockWidth} onChange={e => setBlockWidth(+e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] dark:text-white" /></label>
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1"><span className="text-xs font-semibold uppercase opacity-70">Block Height</span><input type="number" value={blockHeight} onChange={e => setBlockHeight(+e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] dark:text-white" /></label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Entry Bar */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4 shadow-lg border border-gray-100 dark:border-[#2C2C2E] flex flex-col sm:flex-row gap-3 items-stretch">
        {isDict && <input className="sm:w-40 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-black dark:text-white transition-all outline-none" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Key" />}
        <input className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-black dark:text-white transition-all outline-none" value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder={isDict ? "Value (string)" : "New entry (string)"} />
        <button onClick={addString} className="px-6 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">Add String</button>
        <button onClick={addStruct} className="px-6 py-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"><Plus size={18} /> Struct</button>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <motion.div layout key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-gray-100 dark:border-[#2C2C2E] shadow-sm hover:shadow-md transition-shadow">
            {entry.type === "string" ? (
              <div className="flex items-center gap-3">
                {isDict && <div className="px-3 py-1 bg-gray-100 dark:bg-[#2C2C2E] rounded-lg font-mono text-sm font-semibold text-gray-600 dark:text-gray-300">{entry.key}</div>}
                <input className="flex-1 px-3 py-2 rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-[#2C2C2E] focus:bg-white dark:focus:bg-black border border-transparent focus:border-apple-blue dark:text-white transition-all outline-none" value={entry.value} onChange={e => editString(entry.id, e.target.value)} />
                <div className="flex items-center gap-1">
                  <button onClick={() => moveUp(idx)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 dark:text-gray-400"><ArrowUp size={16} /></button>
                  <button onClick={() => moveDown(idx)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 dark:text-gray-400"><ArrowDown size={16} /></button>
                  <button onClick={() => deleteEntry(entry.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-50 dark:border-[#2C2C2E]/50">
                  <div className="flex items-center gap-2">
                    {isDict && <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wide">{entry.key}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveUp(idx)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 dark:text-gray-400"><ArrowUp size={16} /></button>
                    <button onClick={() => moveDown(idx)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 dark:text-gray-400"><ArrowDown size={16} /></button>
                    <button onClick={() => deleteEntry(entry.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                <StructNode node={entry} defaultName={entry.name} onChange={(node) => updateStruct(entry.id, node)} />
              </>
            )}
          </motion.div>
        ))}
        {entries.length === 0 && (
          <div className="py-12 text-center text-gray-400 bg-white dark:bg-[#1C1C1E] rounded-3xl border-2 border-dashed border-gray-100 dark:border-[#2C2C2E]">
            Add some strings or structs to get started.
          </div>
        )}
      </div>

      {/* Generate Button Fixed or Sticky? Let's keep it at bottom for now but styled */}
      <div className="sticky bottom-6 z-20 flex justify-center pointer-events-none">
        <button onClick={generateJson} className="pointer-events-auto px-8 py-4 rounded-full bg-apple-blue hover:bg-blue-600 text-white font-bold shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md">
          <Download size={20} /> Generate Catweb JSON
        </button>
      </div>

      {generated && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1C1C1E] text-green-400 rounded-3xl p-6 shadow-2xl border border-[#2C2C2E] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Output Preview</span>
            <div className="flex gap-2">
              <button onClick={copyJson} className="px-4 py-2 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white text-xs font-medium transition-colors flex items-center gap-2"><Copy size={12} /> Copy</button>
              <button onClick={downloadJson} className="px-4 py-2 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white text-xs font-medium transition-colors flex items-center gap-2"><Download size={12} /> Download</button>
            </div>
          </div>
          <pre className="font-mono text-xs overflow-auto max-h-96 custom-scrollbar">{generated}</pre>
        </motion.div>
      )}

      <JsonImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title={importType === "plain" ? "Import Plain JSON" : "Import Catweb JSON"} onImport={(rawJson) => { if (importType === "plain") importPlainList(rawJson); else importCatweb(rawJson); }} />
      <div className="text-center pb-8 pt-4">
        <p className="text-xs text-gray-400 dark:text-gray-600 max-w-lg mx-auto">
          Pro Tip: You can adjust the block size and position in Advanced Settings. If the script appears empty in Catweb, check the top-left corner of the canvas.
        </p>
      </div>
    </div>
  );
}