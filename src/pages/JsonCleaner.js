import { useState } from "react";
import { Copy, Check, Download, Sparkles, Info } from "lucide-react";

export default function JsonCleaner() {
    const [inputJson, setInputJson] = useState("");
    const [outputJson, setOutputJson] = useState("");
    const [transformStats, setTransformStats] = useState(null);
    const [copied, setCopied] = useState(false);

    const runTransform = () => {
        try {
            const json = JSON.parse(inputJson);
            const transformedJson = JSON.parse(JSON.stringify(json));
            let labelsChanged = 0;
            let typesChanged = 0;

            const transformTextObject = (obj) => {
                if (typeof obj !== "object" || obj === null) return obj;

                // Transform type (t) field
                if (obj.value !== undefined && obj.t !== undefined) {
                    if (!["tuple", "number"].includes(obj.t)) {
                        if (obj.t !== obj.value) {
                            obj.t = obj.value;
                            typesChanged++;
                        }
                    }
                }
                // Transform label (l) field - This preserves variable names for Roblox tag visibility
                if (obj.value !== undefined && (typeof obj.value === "string" || typeof obj.value === "number")) {
                    if (obj.l !== obj.value) {
                        obj.l = obj.value;
                        labelsChanged++;
                    }
                }
                return obj;
            };

            const generateId = (length = 3) => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let result = "";
                for (let i = 0; i < length; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            };

            // Process each script
            transformedJson.forEach((script) => {
                if (script.content && Array.isArray(script.content)) {
                    script.content.forEach((contentItem) => {
                        // Transform variable_overrides (for function definitions)
                        if (contentItem.variable_overrides && Array.isArray(contentItem.variable_overrides)) {
                            contentItem.variable_overrides.forEach((item) => {
                                transformTextObject(item);
                            });
                        }

                        // Transform event text
                        if (contentItem.text && Array.isArray(contentItem.text)) {
                            contentItem.text.forEach((textItem) => {
                                if (typeof textItem === "object" && textItem !== null) {
                                    if (Array.isArray(textItem.value)) {
                                        textItem.value.forEach((nestedItem) => {
                                            transformTextObject(nestedItem);
                                        });
                                    }
                                    transformTextObject(textItem);
                                }
                            });
                        }

                        // Transform actions
                        if (contentItem.actions && Array.isArray(contentItem.actions)) {
                            contentItem.actions.forEach((action) => {
                                if (action.text && Array.isArray(action.text)) {
                                    action.text.forEach((textItem) => {
                                        if (typeof textItem === "object" && textItem !== null) {
                                            if (Array.isArray(textItem.value)) {
                                                textItem.value.forEach((nestedItem) => {
                                                    transformTextObject(nestedItem);
                                                });
                                            }
                                            transformTextObject(textItem);
                                        }
                                    });
                                }
                            });
                        }

                        // NEW: For function definitions (ID 6), add comment actions for each argument
                        // (Placed AFTER transformation to prevent label from being reset due to empty value)
                        if (contentItem.id === "6" && contentItem.variable_overrides && Array.isArray(contentItem.variable_overrides)) {
                            const commentActions = contentItem.variable_overrides.map((override) => ({
                                id: "124",
                                text: [{ value: "", t: "string", l: override.value }],
                                globalid: generateId()
                            }));

                            // Initialize actions array if it doesn't exist, and prepend comments
                            if (!contentItem.actions) contentItem.actions = [];
                            contentItem.actions = [...commentActions, ...contentItem.actions];
                        }
                    });
                }
            });

            setOutputJson(JSON.stringify(transformedJson, null, 2));
            setTransformStats({ labels: labelsChanged, types: typesChanged });
        } catch (err) {
            setOutputJson(`Error: ${err.message}`);
            setTransformStats(null);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(outputJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([outputJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cleaned-script.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-12 max-w-7xl mx-auto py-12 px-4">
            <section className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
                    JSON Cleaner
                </h1>
                <p className="max-w-xl mx-auto text-lg text-text-secondary">
                    Preserve variable names in labels so you can see what was there after Roblox tags them.
                </p>

                {/* Info Box */}
                <div className="max-w-2xl mx-auto mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left">
                    <div className="flex gap-3">
                        <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-text-secondary">
                            <strong className="text-text-primary">Why clean JSON?</strong>
                            <p className="mt-1">
                                When Roblox tags filtered content, the original variable names are hidden.
                                This tool copies your values into the label fields, so you can still see
                                what the original content was (e.g., <code className="px-1 py-0.5 bg-primary rounded text-xs">{"\"l\": \"myVariable\""}</code> instead of <code className="px-1 py-0.5 bg-primary rounded text-xs">{"\"l\": \"variable\""}</code>).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface rounded-3xl p-6 shadow-xl border border-border flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <span className="w-2 h-6 bg-gray-400 rounded-full"></span>
                            Input JSON
                        </h2>
                        <span className="text-xs font-mono bg-surface-hover px-2 py-1 rounded text-text-secondary">Paste raw</span>
                    </div>
                    <textarea
                        id="input"
                        className="flex-1 w-full p-4 rounded-2xl bg-primary border-2 border-transparent focus:border-accent focus:bg-surface text-sm font-mono text-text-primary focus:outline-none transition-all resize-none custom-scrollbar min-h-[400px]"
                        value={inputJson}
                        onChange={(e) => setInputJson(e.target.value)}
                        placeholder="Paste your CatWeb script JSON here..."
                        spellCheck={false}
                    ></textarea>
                </div>

                <div className="bg-surface rounded-3xl p-6 shadow-xl border border-border flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                            Output JSON
                        </h2>
                        <div className="flex items-center gap-2">
                            {transformStats && (
                                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                                    {transformStats.labels + transformStats.types} changes
                                </span>
                            )}
                            {outputJson && !outputJson.startsWith("Error") && (
                                <>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg bg-primary hover:bg-surface-hover transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <Check size={16} className="text-green-500" />
                                        ) : (
                                            <Copy size={16} className="text-text-secondary" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="p-2 rounded-lg bg-primary hover:bg-surface-hover transition-colors"
                                        title="Download JSON"
                                    >
                                        <Download size={16} className="text-text-secondary" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <textarea
                        id="output"
                        className="flex-1 w-full p-4 rounded-2xl bg-primary border-2 border-transparent focus:border-green-500 focus:bg-surface text-sm font-mono text-text-primary focus:outline-none transition-all resize-none custom-scrollbar min-h-[400px]"
                        value={outputJson}
                        readOnly
                        placeholder="Cleaned JSON will appear here..."
                        spellCheck={false}
                    ></textarea>
                </div>
            </section>

            <section className="flex justify-center pt-6">
                <button
                    onClick={runTransform}
                    className="px-10 py-4 rounded-full bg-accent text-white font-bold text-xl shadow-2xl shadow-accent/40 hover:scale-105 hover:bg-accent/90 transition-all active:scale-95 flex items-center gap-3"
                >
                    <Sparkles size={24} />
                    Clean & Transform
                </button>
            </section>
        </div>
    );
}