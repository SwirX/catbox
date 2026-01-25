import React, { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, Image as ImageIcon, Trash } from "lucide-react";

export default function ImageRichTextExporterHEXRLEV2() {
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);

    const [fileName, setFileName] = useState("output_all.txt");
    const [glyph, setGlyph] = useState("█");
    const [scalePercent, setScalePercent] = useState(25);
    const [aspect, setAspect] = useState(0.5);
    const [richText, setRichText] = useState(true);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [imageSrc, setImageSrc] = useState(null);
    const [origSize, setOrigSize] = useState({ w: 0, h: 0 });
    const [generated, setGenerated] = useState("");
    const [warning, setWarning] = useState("");
    const [numTextboxes, setNumTextboxes] = useState(1);



    function ensureHex(s) {
        if (!s) return null;
        let x = s.trim();
        if (!x) return null;
        if (x[0] !== "#") x = "#" + x;
        if (x.length === 4) x = "#" + x[1] + x[1] + x[2] + x[2] + x[3] + x[3];
        if (x.length !== 7) return null;
        return x.toLowerCase();
    }

    function onFilePicked(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageSrc(e.target.result);
            const img = new Image();
            img.onload = () => setOrigSize({ w: img.width, h: img.height });
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function onDrop(e) {
        e.preventDefault();
        const f = e.dataTransfer?.files?.[0];
        if (f) onFilePicked(f);
    }

    function onPickClick() {
        fileInputRef.current?.click();
    }


    function generate() {
        setWarning("");
        if (!imageSrc) return alert("No image loaded");

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const scale = Math.max(0.0001, Number(scalePercent) / 100);
            const newW = Math.max(1, Math.round(img.width * scale));
            const newH = Math.max(1, Math.round(img.height * scale));
            const renderedH = Math.max(1, Math.round(newH * Number(aspect)));

            const canvas = canvasRef.current || document.createElement("canvas");
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext("2d");

            const bg = ensureHex(bgColor) || "#ffffff";
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, newW, newH);
            ctx.drawImage(img, 0, 0, newW, newH);

            const rows = [];
            for (let y = 0; y < renderedH; y++) {
                const mappedY = Math.min(newH - 1, Math.max(0, Math.round(y / Number(aspect))));
                let rowParts = [];
                let lastHex = "";
                let runLength = 0;

                for (let x = 0; x < newW; x++) {
                    const p = ctx.getImageData(x, mappedY, 1, 1).data;
                    const r = p[0], g = p[1], b = p[2];
                    const hex = `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

                    if (hex === lastHex) {
                        runLength++;
                    } else {
                        if (lastHex) {
                            rowParts.push(runLength > 1 ? `${lastHex}x${runLength}` : lastHex);
                        }
                        lastHex = hex;
                        runLength = 1;
                    }
                }
                if (lastHex) rowParts.push(runLength > 1 ? `${lastHex}x${runLength}` : lastHex);

                rows.push(rowParts.join("."));
            }

            const numSplits = Math.max(1, Number(numTextboxes));
            const rowsPerSplit = Math.ceil(rows.length / numSplits);

            const chunks = [];
            for (let i = 0; i < rows.length; i += rowsPerSplit) {
                const section = rows.slice(i, i + rowsPerSplit);
                const rowCount = section.length.toString().padStart(2, "0");
                chunks.push(rowCount + ":" + section.join("|"));
            }

            const totalRows = rows.length.toString();
            const finalText = `${totalRows}?${chunks.join(";")}`;

            setGenerated(finalText);

            if (finalText.length > 16382) {
                setWarning("Output exceeds 16k chars — may not fit a single Roblox TextLabel.");
            }

            canvasRef.current = canvas;
        };

        img.onerror = (err) => {
            console.error(err);
            alert("Failed to load image");
        };

        img.src = imageSrc;
    }

    function copyToClipboard() {
        if (!generated) return;
        navigator.clipboard.writeText(generated).then(() => alert("Copied"), () => alert("Copy failed"));
    }

    function downloadTxt() {
        if (!generated) return;
        const blob = new Blob([generated], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "output.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    const info = useMemo(() => {
        if (!imageSrc) return null;
        return { orig: origSize };
    }, [imageSrc, origSize]);

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <ImageIcon size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">Image to RichText</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Convert images to HEX-encoded RichText for Roblox.</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Controls & Input */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="lg:col-span-5 space-y-6"
                >
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-[#2C2C2E]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                Configuration
                            </h2>
                            {info && info.orig.w > 0 && (
                                <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold font-mono">
                                    Original: {info.orig.w}×{info.orig.h}
                                </span>
                            )}
                        </div>

                        <div
                            onClick={onPickClick}
                            onDrop={onDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={`
                                group relative w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                                ${imageSrc
                                    ? "border-cyan-500 bg-cyan-50/10 dark:border-cyan-500/50"
                                    : "border-gray-200 dark:border-[#3A3A3C] hover:border-cyan-400 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]"
                                }
                            `}
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFilePicked(e.target.files?.[0])} />

                            {imageSrc ? (
                                <>
                                    <div className="absolute inset-0 z-0">
                                        <img src={imageSrc} className="w-full h-full object-cover blur-sm opacity-50" alt="Preview Background" />
                                    </div>
                                    <img src={imageSrc} className="relative z-10 max-h-36 max-w-[80%] object-contain rounded-lg shadow-lg" alt="Preview" />
                                    <div className="absolute top-2 right-2 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setImageSrc(null); setGenerated(""); setOrigSize({ w: 0, h: 0 }); }}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-2 p-4">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto text-gray-400 group-hover:text-cyan-500 transition-colors">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="font-bold text-gray-600 dark:text-gray-300">Click to upload image</p>
                                    <p className="text-xs text-gray-400">or drop file here</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Scale (%)</label>
                                    <input
                                        type="number"
                                        value={scalePercent}
                                        onChange={(e) => setScalePercent(Math.max(1, Number(e.target.value)))}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-bold text-center"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Aspect Ratio</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={aspect}
                                        onChange={(e) => setAspect(Math.max(0.01, Number(e.target.value)))}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Glyph Char</label>
                                    <input
                                        value={glyph}
                                        onChange={(e) => setGlyph(e.target.value.slice(0, 1) || "█")}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-bold text-center font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Splits</label>
                                    <input
                                        type="number"
                                        value={numTextboxes}
                                        min={1}
                                        onChange={(e) => setNumTextboxes(Math.max(1, Number(e.target.value)))}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-[#000000] dark:text-white transition-all outline-none font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Background Fill</label>
                                <div className="flex items-center gap-2 p-2 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E] border border-transparent">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent"
                                    />
                                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300 uppercase">{bgColor}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2E]">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">RichText Wrappers</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={richText} onChange={(e) => setRichText(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={generate}
                            className="w-full mt-6 py-4 rounded-2xl bg-[#1D1D1F] dark:bg-white text-white dark:text-black font-extrabold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <span className="text-cyan-400 dark:text-cyan-600"><ImageIcon size={20} /></span>
                            Generate Output
                        </button>
                    </div>
                </motion.div>

                {/* Right Column: Output */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-7 flex flex-col gap-6"
                >
                    <div className="flex-1 bg-white dark:bg-[#1C1C1E] rounded-3xl p-1 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-[#2C2C2E] flex flex-col relative overflow-hidden h-[500px]">
                        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white dark:from-[#1C1C1E] to-transparent z-10 pointer-events-none" />
                        <div className="bg-[#1C1C1E] rounded-[1.4rem] w-full h-full p-6 overflow-auto custom-scrollbar font-mono text-xs leading-relaxed break-all relative group">
                            {generated ? (
                                <div className="text-green-400 selection:bg-green-500/30 selection:text-green-200">
                                    {generated}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-500 gap-3 opacity-50">
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <p className="text-sm font-medium">Output will appear here...</p>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
                            {warning && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl text-xs font-bold pointer-events-auto">
                                    ⚠️  {warning}
                                </motion.div>
                            )}
                            {generated && (
                                <span className="bg-[#000000]/60 backdrop-blur-md text-gray-400 px-3 py-1 rounded-lg text-xs font-mono pointer-events-auto">
                                    Length: {generated.length.toLocaleString()} chars
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-[#2C2C2E]">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Output Filename</label>
                            <div className="mt-2 flex gap-2">
                                <input
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="flex-1 min-w-0 bg-transparent py-2 border-b-2 border-gray-100 dark:border-[#3A3A3C] focus:border-cyan-500 outline-none text-gray-800 dark:text-gray-200 font-medium transition-colors"
                                />
                                <span className="text-gray-400 py-2">.txt</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={copyToClipboard}
                                disabled={!generated}
                                className="flex-1 rounded-3xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Copy size={20} /> Copy
                            </button>
                            <button
                                onClick={downloadTxt}
                                disabled={!generated}
                                className="flex-1 rounded-3xl bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3A3A3C] disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-bold border border-gray-200 dark:border-[#3A3A3C] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Download size={20} /> Download
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
