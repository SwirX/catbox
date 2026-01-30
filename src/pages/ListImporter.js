import React, { useState } from "react";
import { Download, Copy, Edit, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

export default function ListImporter() {

  const [tableName, setTableName] = useState("my_table");
  const [fileName, setFileName] = useState("my_file.json");
  const [insertsPerBlock, setInsertsPerBlock] = useState(300);
  const [xStep, setXStep] = useState(500);
  const [xMax, setXMax] = useState(9500);
  const [blockWidth, setBlockWidth] = useState(450);
  const [blockHeight, setBlockHeight] = useState(600);

  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [sortBy, setSortBy] = useState("last");
  const [sortDir, setSortDir] = useState("asc");

  const [generated, setGenerated] = useState(null);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    setEntries([...entries, { id: Date.now().toString(), value: newEntry }]);
    setNewEntry("");
  };

  const editEntry = (id, newVal) => {
    setEntries(entries.map(e => e.id === id ? { ...e, value: newVal } : e));
  };

  const deleteEntry = (id) => setEntries(entries.filter(e => e.id !== id));

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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const copy = Array.from(entries);
    const [removed] = copy.splice(result.source.index, 1);
    copy.splice(result.destination.index, 0, removed);
    setEntries(copy);
  };

  const importPlainList = (raw) => {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        setEntries(arr.map((v, i) => ({ id: `${Date.now()}-${i}`, value: String(v) })));
      }
    } catch (e) {
      alert("Invalid list JSON");
    }
  };

  const importCatweb = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      let values = [];
      parsed.forEach(script => {
        script.content.forEach(block => {
          block.actions.forEach(act => {
            if (act.text && act.text[1]?.value) values.push(act.text[1].value);
          });
        });
      });
      setEntries(values.map((v, i) => ({ id: `${Date.now()}-${i}`, value: String(v) })));
    } catch (e) {
      alert("Invalid Catweb JSON");
    }
  };

  const generateJson = () => {
    const usedIds = new Set();
    const randomId = () => {
      while (true) {
        const rid = Math.random().toString(36).slice(2, 5);
        if (!usedIds.has(rid)) { usedIds.add(rid); return rid; }
      }
    };

    let scripts = [];
    let contents = [];
    let actions = [
      { id: "54", text: ["Create table", { value: tableName, t: "string", l: "table" }], globalid: randomId() }
    ];

    let blockCount = 0, x = 0, y = 0;
    entries.forEach((entry, i) => {
      actions.push({
        id: "89",
        text: ["Insert", { value: entry.value, t: "string", l: "any" }, "at position", { t: "number", l: "number?" }, "of", { value: tableName, t: "string", l: "array" }],
        globalid: randomId()
      });
      if ((i + 1) % insertsPerBlock === 0 || i === entries.length - 1) {
        contents.push({
          y: String(y),
          x: String(x),
          globalid: randomId(),
          id: "0",
          text: ["When Website loaded..."],
          actions,
          width: String(blockWidth)
        });
        actions = [];
        blockCount++;
        x = blockCount * xStep;
        if (x > xMax) {
          x = 0;
          y += blockHeight;
        }
      }
    });

    scripts.push({ class: "script", content: contents, globalid: randomId(), alias: fileName.replace(/\.json$/, "") });
    setGenerated(JSON.stringify(scripts, null, 2));
  };

  const copyJson = () => {
    if (generated) navigator.clipboard.writeText(generated);
  };

  const downloadJson = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const displayedEntries = [...entries].sort((a, b) => {
    if (sortBy === "name") {
      return sortDir === "asc" ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value);
    }
    return sortDir === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">List Importer</h1>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <input className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={tableName} onChange={e => setTableName(e.target.value)} placeholder="Table Name" />
        <input className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="File Name" />
        <input type="number" className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={insertsPerBlock} onChange={e => setInsertsPerBlock(+e.target.value)} placeholder="Inserts Per Block" />
        <input type="number" className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={xStep} onChange={e => setXStep(+e.target.value)} placeholder="X Step" />
        <input type="number" className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={xMax} onChange={e => setXMax(+e.target.value)} placeholder="X Max" />
        <input type="number" className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={blockWidth} onChange={e => setBlockWidth(+e.target.value)} placeholder="Block Width" />
        <input type="number" className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={blockHeight} onChange={e => setBlockHeight(+e.target.value)} placeholder="Block Height" />
      </div>

      <div className="flex gap-2 mb-4">
        <input className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-slate-800" value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="New entry" />
        <button onClick={addEntry} className="px-4 py-2 rounded bg-indigo-600 text-white">Add</button>
      </div>

      <div className="flex gap-2 mb-4">
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800">
          <option value="last">Last Added</option>
          <option value="name">Name</option>
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="px-3 py-2 rounded bg-gray-100 dark:bg-slate-800">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="entries">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 mb-6">
              {displayedEntries.map((entry, idx) => (
                <Draggable key={entry.id} draggableId={entry.id} index={idx}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="flex items-center justify-between px-3 py-2 rounded bg-gray-100 dark:bg-slate-800">
                      <span>{entry.value}</span>
                      <div className="flex gap-2">
                        <button onClick={() => moveUp(idx)}><ArrowUp size={16} /></button>
                        <button onClick={() => moveDown(idx)}><ArrowDown size={16} /></button>
                        <button onClick={() => {
                          const nv = prompt("Edit entry", entry.value);
                          if (nv !== null) editEntry(entry.id, nv);
                        }}><Edit size={16} /></button>
                        <button onClick={() => deleteEntry(entry.id)}><Trash2 size={16} className="text-red-500" /></button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex gap-2 mb-6">
        <button onClick={() => {
          const raw = prompt("Paste plain list JSON");
          if (raw) importPlainList(raw);
        }} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 flex items-center gap-1"><Upload size={16} /> Import List</button>
        <button onClick={() => {
          const raw = prompt("Paste Catweb JSON");
          if (raw) importCatweb(raw);
        }} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 flex items-center gap-1"><Upload size={16} /> Import Catweb</button>
      </div>

      <button onClick={generateJson} className="px-6 py-2 rounded bg-green-600 text-white mb-4">Generate JSON</button>

      {generated && (
        <div className="mb-6">
          <pre className="bg-gray-900 text-green-300 p-4 rounded overflow-x-auto text-xs max-h-64">{generated}</pre>
          <div className="flex gap-2 mt-2">
            <button onClick={copyJson} className="px-4 py-2 rounded bg-indigo-600 text-white flex items-center gap-1"><Copy size={16} /> Copy</button>
            <button onClick={downloadJson} className="px-4 py-2 rounded bg-indigo-600 text-white flex items-center gap-1"><Download size={16} /> Download</button>
          </div>
        </div>
      )}
    </div>
  );
}
