import { useEffect, useMemo, useState, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

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
        <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-[#071028] dark:to-slate-900 dark:text-slate-900 dark:dark:text-slate-100 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-2xl font-semibold">🎵 Lyra API — URL Builder</h1>
                    <span className="ml-auto dark:bg-slate-800 px-3 py-1 rounded-full text-sm dark:text-slate-300">Base: <code className="ml-2">{BASE}</code></span>
                </div>

                <div className="dark:bg-slate-800/60 border dark:border-slate-700 rounded-2xl p-5 shadow-lg">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Left column - controls */}
                        <div className="col-span-12 lg:col-span-7">
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-sm font-medium dark:text-slate-300">Endpoint &lt;r&gt;</label>
                                    <select
                                        aria-label="Endpoint"
                                        value={endpoint}
                                        onChange={(e) => setEndpoint(e.target.value)}
                                        className="mt-1 w-full rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-2"
                                    >
                                        <option value="getsong">getsong</option>
                                        <option value="rng">rng</option>
                                        <option value="search">search</option>
                                    </select>
                                </div>

                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-sm font-medium dark:text-slate-300">Redirect URL &lt;rr&gt;</label>
                                    <input
                                        aria-label="Redirect URL"
                                        value={rr}
                                        onChange={(e) => setRr(e.target.value)}
                                        placeholder="example: musicplayer.rbx/play"
                                        className="mt-1 w-full rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-2"
                                    />
                                </div>

                                {endpoint === "getsong" && (
                                    <div className="col-span-12">
                                        <label className="block text-sm font-medium dark:text-slate-300">Song ID &lt;id&gt;</label>
                                        <input
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            placeholder="e.g. 123"
                                            className="mt-1 w-full rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-2"
                                        />
                                    </div>
                                )}

                                {endpoint === "search" && (
                                    <>
                                        <div className="col-span-12">
                                            <label className="block text-sm font-medium dark:text-slate-300">Query &lt;q&gt;</label>
                                            <input
                                                value={q}
                                                onChange={(e) => setQ(e.target.value)}
                                                placeholder="e.g. night"
                                                className="mt-1 w-full rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-2"
                                            />
                                        </div>

                                        <div className="col-span-12">
                                            <label className="block text-sm font-medium dark:text-slate-300">Search fields &lt;f&gt; (optional)</label>
                                            <div className="mt-2 flex gap-2 flex-wrap">
                                                {ALL_F.map((key) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => toggleF(key)}
                                                        className={`px-3 py-1 rounded-full text-sm border ${fSet.has(key) ? "bg-indigo-600/30 border-indigo-500" : "dark:bg-slate-900 dark:border-slate-700"}`}
                                                    >
                                                        {key} {" "}
                                                        <span className="text-xs dark:text-slate-400">({key === "t" ? "title" : key === "a" ? "artist" : "genres"})</span>
                                                    </button>
                                                ))}
                                                <div className="text-sm dark:text-slate-400 ml-auto">Selected: <strong className="dark:text-slate-100">{fSet.size === 3 ? "(all)" : Array.from(fSet).join("") || "(none)"}</strong></div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="col-span-12 mt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium dark:text-slate-300">Return fields &lt;rf&gt; (order matters)</label>
                                        <div className="flex gap-2">
                                            <button onClick={resetRf} className="text-sm px-3 py-1 rounded dark:bg-slate-700">All (itagd)</button>
                                            <button onClick={clearRf} className="text-sm px-3 py-1 rounded bg-transparent border dark:border-slate-700">Clear</button>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <DragDropContext onDragEnd={onDragEnd}>
                                            <Droppable droppableId="rf-droppable" direction="horizontal">
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="flex gap-2 flex-wrap"
                                                    >
                                                        {rf.map((k, idx) => {
                                                            const meta = FIELD_META.find((m) => m.k === k);
                                                            return (
                                                                <Draggable key={k} draggableId={k} index={idx}>
                                                                    {(prov) => (
                                                                        <div
                                                                            ref={prov.innerRef}
                                                                            {...prov.draggableProps}
                                                                            {...prov.dragHandleProps}
                                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg dark:bg-slate-900 border dark:border-slate-700"
                                                                        >
                                                                            <span className="font-semibold">{k}</span>
                                                                            <span className="text-xs dark:text-slate-400">{meta?.label}</span>
                                                                            <div className="flex gap-1 ml-2">
                                                                                <button onClick={() => moveRfUp(idx)} className="text-xs">▲</button>
                                                                                <button onClick={() => moveRfDown(idx)} className="text-xs">▼</button>
                                                                            </div>
                                                                            <button onClick={() => removeRf(idx)} className="ml-2 text-xs text-red-400">✕</button>
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
                                        <div className="mt-2 text-xs dark:text-slate-400">Current &lt;rf&gt;: <code className="ml-2">{rf.join("") || "(empty → defaults to itagd)"}</code></div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {FIELD_META.filter(f => !rf.includes(f.k)).map(f => (
                                            <button
                                                key={f.k}
                                                onClick={() => setRf(prev => [...prev, f.k])}
                                                className="px-2 py-1 text-xs rounded dark:bg-slate-700 hover:bg-indigo-600"
                                            >
                                                + {f.label}
                                            </button>
                                        ))}
                                    </div>

                                </div>

                                <div className="col-span-12 mt-4">
                                    <div className="flex gap-2 flex-col sm:flex-row">
                                        <button
                                            onClick={() => copyToClipboard(fullUrl)}
                                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:opacity-95"
                                        >
                                            Copy URL
                                        </button>
                                        <button
                                            onClick={() => {
                                                const qOnly = buildQuery.query || buildQuery.error;
                                                copyToClipboard(qOnly || "");
                                            }}
                                            className="w-full sm:w-auto px-4 py-2 rounded-lg dark:bg-slate-700 border dark:border-slate-600"
                                        >
                                            Copy Query Only
                                        </button>
                                        <div className="ml-auto dark:text-sm dark:text-slate-300 flex items-center gap-2">{status && <span className="text-green-400">{status}</span>}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - preview / url */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="p-4 rounded-lg bg-gradient-to-b dark:from-slate-900/50 to-slate-900/30 border dark:border-slate-700 h-full flex flex-col gap-3">
                                <div>
                                    <label className="dark:text-sm dark:text-slate-300">Generated URL</label>
                                    <div className="mt-2 p-3 dark:bg-slate-900 rounded-lg font-mono text-sm break-all">{fullUrl || <span className="dark:text-slate-500">{buildQuery.error || 'Fill required fields to generate URL'}</span>}</div>
                                </div>

                                <div>
                                    <label className="dark:text-sm dark:text-slate-300">Quick examples</label>
                                    <div className="mt-2 grid gap-2">
                                        <button
                                            onClick={() => {
                                                setEndpoint("getsong"); setId("123"); setRr("example.rbx/use"); setRf(defaultRf);
                                                showStatus("Example loaded");
                                            }}
                                            className="text-sm text-left px-3 py-2 rounded dark:bg-slate-800 border dark:dark:border-slate-700 w-full truncate"
                                        >
                                            Getsong example → `?r=getsong&id=123&rr=example.rbx/use&rf=tag`
                                        </button>

                                        <button
                                            onClick={() => { setEndpoint("rng"); setRr("musicplayer.rbx/play"); setRf(["t", "a"]); showStatus("Example loaded"); }}
                                            className="text-sm text-left px-3 py-2 rounded dark:bg-slate-800 border dark:border-slate-700 w-full truncate"
                                        >
                                            RNG example → `?r=rng&rr=musicplayer.rbx/play&rf=ta`
                                        </button>

                                        <button
                                            onClick={() => { setEndpoint("search"); setQ("night"); setFSet(new Set(["t", "a"])); setRr("example.rbx/use"); setRf(["t", "a", "g", "d", "i"]); showStatus("Example loaded"); }}
                                            className="text-sm text-left px-3 py-2 rounded dark:bg-slate-800 border dark:border-slate-700 w-full truncate"
                                        >
                                            Search example → `?r=search&q=night&f=ta&rr=example.rbx/use&rf=tagd`
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-auto text-xs dark:text-slate-400">
                                    Notes: &lt;r&gt; and &lt;rr&gt; required. If &lt;rf&gt; is empty → defaults to <strong>itagd</strong>. If &lt;f&gt; is empty in search → defaults to all. `§` separates multiple results, `;` separates fields.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm dark:text-slate-500 mt-4">Part of <strong>CatBox</strong> — a CatWeb toolbox. Built with React + Tailwind, drag & drop via <em>@hello-pangea/dnd</em>. Responsive on phones/tablets/desktop.</div>
            </div>
        </div>
    );
}
