import React, { useRef, useState, useMemo } from "react";
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
        <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-semibold">Image → RichText Exporter</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Convert images to RichText (HEX+RLE).</p>
                    <div className="ml-auto flex items-center gap-2">
                        <button onClick={() => { setImageSrc(null); setGenerated(""); setOrigSize({ w: 0, h: 0 }); setWarning(""); }} className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-800">Reset</button>
                    </div>
                </header>

                <main className="grid grid-cols-12 gap-6">
                    <section className="col-span-12 lg:col-span-5 space-y-4">
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <label className="block text-sm font-medium mb-2">Source Image</label>
                            <div
                                onDrop={onDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded p-4 text-center cursor-pointer"
                                onClick={onPickClick}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFilePicked(e.target.files?.[0])} />
                                <div className="flex flex-col items-center gap-2">
                                    <ImageIcon />
                                    <div className="text-sm">Click or drop an image here</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">PNG/JPG with transparency supported (background compositing available)</div>
                                </div>
                            </div>

                            {info && info.orig.w > 0 && (
                                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Original: {info.orig.w} × {info.orig.h}</div>
                            )}

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <label className="text-xs">Scale %</label>
                                <input type="number" value={scalePercent} onChange={(e) => setScalePercent(Math.max(1, Number(e.target.value)))} className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-900" />

                                <label className="text-xs">Aspect (height multiplier)</label>
                                <input type="number" step="0.1" value={aspect} onChange={(e) => setAspect(Math.max(0.01, Number(e.target.value)))} className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-900" />

                                <label className="text-xs">Glyph</label>
                                <input value={glyph} onChange={(e) => setGlyph(e.target.value.slice(0, 1) || "█")} className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-900" />

                                <label className="text-xs">RichText</label>
                                <div>
                                    <label className="inline-flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={richText} onChange={(e) => setRichText(e.target.checked)} />
                                        <span className="text-xs">Wrap glyph in &lt;font color="#RRGGBB"&gt;</span>
                                    </label>
                                </div>

                                <label className="text-xs">Background color</label>
                                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-9 rounded border" />

                                <label className="text-xs"># of Textboxes</label>
                                <input
                                    type="number"
                                    value={numTextboxes}
                                    min={1}
                                    onChange={(e) => setNumTextboxes(Math.max(1, Number(e.target.value)))}
                                    className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-900"
                                />


                                <label className="text-xs">Output filename</label>
                                <input value={fileName} onChange={(e) => setFileName(e.target.value)} className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-900" />
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button onClick={generate} className="px-3 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><ImageIcon size={16} /> Generate</button>
                                <button onClick={() => { setGenerated(""); setWarning(""); }} className="px-3 py-2 border rounded">Clear output</button>
                                <div className="ml-auto text-xs text-slate-500 dark:text-slate-300">{generated ? `Chars: ${generated.length}` : ''}</div>
                            </div>

                            {warning && <div className="mt-3 text-xs text-yellow-500">{warning}</div>}
                        </div>

                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <label className="block text-sm font-medium mb-2">Preview Image</label>
                            {imageSrc ? (
                                <img src={imageSrc} alt="preview" className="w-full max-h-64 object-contain rounded" />
                            ) : (
                                <div className="text-sm text-slate-500">No image loaded</div>
                            )}
                        </div>
                    </section>

                    <aside className="col-span-12 lg:col-span-7 space-y-4">
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <label className="block text-sm font-medium mb-2">Generated Text Preview</label>
                            <div className="max-h-[60vh] overflow-auto bg-gray-900 text-white p-3 rounded text-xs font-mono whitespace-pre-wrap break-words">
                                {generated || <span className="text-slate-400">No output yet — click Generate to build the text output.</span>}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button onClick={copyToClipboard} className="px-3 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><Copy size={16} /> Copy</button>
                                <button onClick={downloadTxt} className="px-3 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><Download size={16} /> Download</button>
                                <button onClick={() => { setImageSrc(null); setGenerated(""); setOrigSize({ w: 0, h: 0 }); }} className="px-3 py-2 border rounded flex items-center gap-2"><Trash size={14} /> Reset</button>
                                <div className="ml-auto text-xs text-slate-500 dark:text-slate-300">Preview lines: {generated ? generated.split('\n').length - 1 : 0}</div>
                            </div>
                        </div>

                        <div className="p-3 text-xs text-slate-500 dark:text-slate-300">Notes: This runs fully in the browser using a hidden canvas. For large images & high scales this can be memory intensive — reduce scale% or crop images if needed. This tool was translated from <a href="https://github.com/quitism"><u>quitism</u></a>'s python script</div>
                    </aside>
                </main>
            </div>
        </div>
    );
}
