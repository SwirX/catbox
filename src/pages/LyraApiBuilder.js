import { useEffect, useMemo, useState, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";

export default function LyraBuilder() {
    const BASE = "api.lyra.rbx/v1";

    const [endpoint, setEndpoint] = useState("getsong");
    const [rr, setRr] = useState("");
    const [id, setId] = useState("");
    const [q, setQ] = useState("");

    const ALL_F = ["t", "a", "g"];
    const [fSet, setFSet] = useState(new Set(ALL_F));

    const FIELD_META = [
        { k: "i", label: "id" },
        { k: "t", label: "title" },
        { k: "a", label: "artist" },
        { k: "g", label: "genres" },
        { k: "d", label: "decal" },
    ];
    const defaultRf = FIELD_META.map((f) => f.k);
    const [rf, setRf] = useState(defaultRf);

    const [status, setStatus] = useState("");
    const statusTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (statusTimer.current) window.clearTimeout(statusTimer.current);
        };
    }, []);

    function showStatus(msg, clear = true) {
        setStatus(msg);
        if (statusTimer.current) window.clearTimeout(statusTimer.current);
        if (clear) statusTimer.current = window.setTimeout(() => setStatus(""), 1800);
    }

    const buildQuery = useMemo(() => {
        const params = new URLSearchParams();
        params.set("r", endpoint);
        if (!rr.trim()) return { query: "", error: "Missing <rr> (redirect URL)" };
        params.set("rr", rr.trim());

        if (endpoint === "getsong") {
            if (!id.trim()) return { query: "", error: "Missing <id> for getsong" };
            params.set("id", id.trim());
        }

        if (endpoint === "search") {
            if (!q.trim()) return { query: "", error: "Missing <q> for search" };
            params.set("q", q.trim());
            if (fSet.size && fSet.size < ALL_F.length) params.set("f", Array.from(fSet).join(""));
        }

        if (rf.length && rf.join("") !== defaultRf.join("")) params.set("rf", rf.join(""));

        return { query: "?" + params.toString(), error: null };
    }, [endpoint, rr, id, q, fSet, rf]);

    const fullUrl = buildQuery.query ? `${BASE}${buildQuery.query}` : buildQuery.error || "";

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showStatus("Copied ✔");
        } catch (e) {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            showStatus("Copied (fallback) ✔");
        }
    }

    function toggleF(key) {
        setFSet((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    function onDragEnd(result) {
        if (!result.destination) return;
        const newArr = Array.from(rf);
        const [removed] = newArr.splice(result.source.index, 1);
        newArr.splice(result.destination.index, 0, removed);
        setRf(newArr);
    }

    function removeRf(index) {
        const copy = [...rf];
        copy.splice(index, 1);
        setRf(copy);
    }

    function resetRf() {
        setRf(defaultRf);
    }

    function clearRf() {
        setRf([]);
    }

    function moveRfUp(index) {
        if (index === 0) return;
        setRf((prev) => {
            const copy = [...prev];
            [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
            return copy;
        });
    }

    function moveRfDown(index) {
        setRf((prev) => {
            if (index === prev.length - 1) return prev;
            const copy = [...prev];
            [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
            return copy;
        });
    }




    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                    <span className="text-2xl">🎵</span>
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">Lyra API Builder</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Construct complex API URLs visually.</p>
                </div>
                <div className="ml-auto hidden sm:block">
                    <span className="bg-gray-100 dark:bg-[#2C2C2E] px-4 py-2 rounded-full text-xs font-mono font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#3A3A3C]">
                        Base: <span className="text-apple-blue">{BASE}</span>
                    </span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left column - controls */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="md:col-span-7 space-y-6"
                >
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-[#2C2C2E]">
                        <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="w-2 h-6 bg-apple-blue rounded-full"></span>
                            Configuration
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Endpoint (r)</label>
                                    <div className="relative">
                                        <select
                                            aria-label="Endpoint"
                                            value={endpoint}
                                            onChange={(e) => setEndpoint(e.target.value)}
                                            className="w-full appearance-none px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-medium cursor-pointer"
                                        >
                                            <option value="getsong">getsong</option>
                                            <option value="rng">rng</option>
                                            <option value="search">search</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Redirect URL (rr)</label>
                                    <input
                                        aria-label="Redirect URL"
                                        value={rr}
                                        onChange={(e) => setRr(e.target.value)}
                                        placeholder="example: musicplayer.rbx/play"
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            {endpoint === "getsong" && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 overflow-hidden">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Song ID (id)</label>
                                    <input
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder="e.g. 12345678"
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-medium"
                                    />
                                </motion.div>
                            )}

                            {endpoint === "search" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Query (q)</label>
                                        <input
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            placeholder="e.g. dramatic suspense"
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Search Fields (f)</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {ALL_F.map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => toggleF(key)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${fSet.has(key)
                                                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-400"
                                                        : "bg-gray-50 dark:bg-[#2C2C2E] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3A3A3C]"
                                                        }`}
                                                >
                                                    {key.toUpperCase()} <span className="text-xs opacity-60 ml-1 font-normal">({key === "t" ? "title" : key === "a" ? "artist" : "genres"})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-[#2C2C2E]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                                Return Fields (rf)
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={resetRf} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors dark:text-gray-300">Reset</button>
                                <button onClick={clearRf} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">Clear</button>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-[#000000]/20 rounded-2xl p-4 border border-gray-100 dark:border-[#2C2C2E]/50">
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="rf-droppable" direction="horizontal">
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex gap-3 flex-wrap min-h-[50px]"
                                        >
                                            {rf.map((k, idx) => {
                                                const meta = FIELD_META.find((m) => m.k === k);
                                                return (
                                                    <Draggable key={k} draggableId={k} index={idx}>
                                                        {(prov, snapshot) => (
                                                            <div
                                                                ref={prov.innerRef}
                                                                {...prov.draggableProps}
                                                                {...prov.dragHandleProps}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${snapshot.isDragging
                                                                    ? "bg-white dark:bg-[#2C2C2E] shadow-xl scale-110 border-apple-blue z-50"
                                                                    : "bg-white dark:bg-[#2C2C2E] shadow-sm border-gray-200 dark:border-[#3A3A3C] hover:border-gray-300 dark:hover:border-[#505055]"
                                                                    }`}
                                                            >
                                                                <span className="font-bold text-gray-800 dark:text-gray-200">{k.toUpperCase()}</span>
                                                                <span className="text-xs text-gray-400 font-medium">{meta?.label}</span>
                                                                <button onClick={() => removeRf(idx)} className="ml-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                                                    <span className="sr-only">Remove</span>
                                                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" transform="scale(0.5) translate(6,6)" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>

                                                );
                                            })}

                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1.5 self-center mr-2">Available:</span>
                            {FIELD_META.filter(f => !rf.includes(f.k)).map(f => (
                                <button
                                    key={f.k}
                                    onClick={() => setRf(prev => [...prev, f.k])}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-[#2C2C2E] hover:bg-apple-blue hover:text-white dark:hover:bg-apple-blue transition-colors text-gray-600 dark:text-gray-400"
                                >
                                    + {f.label} ({f.k})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => copyToClipboard(fullUrl)}
                            className="flex-1 px-6 py-4 rounded-2xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Copy Full URL</span>
                        </button>
                        <button
                            onClick={() => {
                                const qOnly = buildQuery.query || buildQuery.error;
                                copyToClipboard(qOnly || "");
                            }}
                            className="px-6 py-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border-2 border-gray-100 dark:border-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 font-bold transition-all active:scale-[0.98]"
                        >
                            Query Only
                        </button>
                    </div>
                </motion.div>

                {/* Right column - preview / url */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="md:col-span-5 h-full"
                >
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-[#1C1C1E] rounded-3xl p-6 shadow-2xl border border-[#2C2C2E] overflow-hidden text-gray-300">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generated URL</label>
                                {status && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">{status}</motion.span>}
                            </div>
                            <div className="p-4 bg-[#000000]/50 rounded-2xl font-mono text-sm break-all text-green-400 leading-relaxed border border-[#2C2C2E]/50">
                                {fullUrl || <span className="text-gray-600 italic">{buildQuery.error || 'Configure options to generate...'}</span>}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-[#2C2C2E]">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quick Presets</h3>
                            <div className="grid gap-3">
                                <button
                                    onClick={() => {
                                        setEndpoint("getsong"); setId("12345678"); setRr("music.rbx/play"); setRf(defaultRf);
                                        showStatus("Preset Loaded");
                                    }}
                                    className="group text-left p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E]/50 hover:bg-apple-blue hover:text-white transition-all duration-300"
                                >
                                    <div className="font-bold text-sm mb-1 group-hover:text-white dark:text-gray-200">Basic Song Fetch</div>
                                    <div className="font-mono text-xs text-gray-400 group-hover:text-blue-100/80 truncate opacity-80">?r=getsong&id=...</div>
                                </button>

                                <button
                                    onClick={() => { setEndpoint("rng"); setRr("game.rbx/random"); setRf(["t", "a", "d"]); showStatus("Preset Loaded"); }}
                                    className="group text-left p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E]/50 hover:bg-purple-600 hover:text-white transition-all duration-300"
                                >
                                    <div className="font-bold text-sm mb-1 group-hover:text-white dark:text-gray-200">Random Song (RNG)</div>
                                    <div className="font-mono text-xs text-gray-400 group-hover:text-purple-100/80 truncate opacity-80">?r=rng&rf=tad...</div>
                                </button>

                                <button
                                    onClick={() => { setEndpoint("search"); setQ("epic orchestral"); setFSet(new Set(["t", "g"])); setRr("library.rbx/list"); setRf(["t", "a", "i"]); showStatus("Preset Loaded"); }}
                                    className="group text-left p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E]/50 hover:bg-pink-600 hover:text-white transition-all duration-300"
                                >
                                    <div className="font-bold text-sm mb-1 group-hover:text-white dark:text-gray-200">Advanced Search</div>
                                    <div className="font-mono text-xs text-gray-400 group-hover:text-pink-100/80 truncate opacity-80">?r=search&q=epic...</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
