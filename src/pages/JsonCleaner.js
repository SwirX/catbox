import { useState } from "react";

export default function JsonCleaner() {
    const [inputJson, setInputJson] = useState("");
    const [outputJson, setOutputJson] = useState("");

    const runTransform = () => {
        try {
            const json = JSON.parse(inputJson);
            const transformedJson = JSON.parse(JSON.stringify(json));

            const transformTextObject = (obj, isNested = false) => {
                if (!isNested && obj.value !== undefined && obj.t !== undefined) {
                    if (!["tuple", "number"].includes(obj.t) &&
                        !(obj.t === "string" && ["function", "table", "array", "separator", "format"].includes(obj.l))) {
                        obj.t = obj.value;
                    }
                }
                if (!isNested && obj.value !== undefined && obj.l !== undefined) {
                    if (!["number?", "array", "table", "function", "separator"].includes(obj.l) && obj.l !== obj.value) {
                        obj.l = obj.value;
                    }
                }
                return obj;
            };

            transformedJson.forEach((script) => {
                if (script.content && Array.isArray(script.content)) {
                    script.content.forEach((contentItem) => {
                        if (contentItem.actions && Array.isArray(contentItem.actions)) {
                            contentItem.actions.forEach((action) => {
                                if (action.text && Array.isArray(action.text)) {
                                    action.text = action.text.map((textItem) => {
                                        if (typeof textItem === "object" && textItem !== null) {
                                            if (Array.isArray(textItem.value)) {
                                                textItem.value = textItem.value.map((nestedItem) => {
                                                    if (typeof nestedItem === "object" && nestedItem !== null) {
                                                        return transformTextObject(nestedItem, true);
                                                    }
                                                    return nestedItem;
                                                });
                                                return textItem;
                                            }
                                            return transformTextObject(textItem);
                                        }
                                        return textItem;
                                    });
                                }
                            });
                        }
                    });
                }
            });

            setOutputJson(JSON.stringify(transformedJson, null, 2));
        } catch (err) {
            setOutputJson(`Error: ${err.message}`);
        }
    };

    return (
        <div className="space-y-12 max-w-7xl mx-auto py-12 px-4">
            <section className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15l2 2 4-4" /></svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
                    JSON Cleaner
                </h1>
                <p className="max-w-xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Recursively transform your JSON structure to be more usable.
                </p>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-[#2C2C2E] flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-6 bg-gray-400 rounded-full"></span>
                            Input JSON
                        </h2>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-[#2C2C2E] px-2 py-1 rounded text-gray-500">Paste raw</span>
                    </div>
                    <textarea
                        id="input"
                        className="flex-1 w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#000000]/30 border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] text-sm font-mono text-gray-900 dark:text-gray-200 focus:outline-none transition-all resize-none custom-scrollbar min-h-[400px]"
                        value={inputJson}
                        onChange={(e) => setInputJson(e.target.value)}
                        placeholder="Paste your nasty JSON here..."
                        spellCheck={false}
                    ></textarea>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-[#2C2C2E] flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                            Output JSON
                        </h2>
                        {outputJson && (
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Transformed</span>
                        )}
                    </div>
                    <textarea
                        id="output"
                        className="flex-1 w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#000000]/30 border-2 border-transparent focus:border-green-500 focus:bg-white dark:focus:bg-[#000000] text-sm font-mono text-gray-900 dark:text-gray-200 focus:outline-none transition-all resize-none custom-scrollbar min-h-[400px]"
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
                    className="px-10 py-4 rounded-full bg-apple-blue text-white font-bold text-xl shadow-2xl shadow-blue-500/40 hover:scale-105 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-3"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                    Run Clean & Transform
                </button>
            </section>
        </div>
    );
}