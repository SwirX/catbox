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
        <div className="space-y-8">
            <section className="text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    JSON Cleaner
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-slate-600 dark:text-slate-400">
                    Clean and transform your JSON data with ease.
                </p>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Input JSON</h2>
                    <textarea
                        id="input"
                        className="w-full h-96 p-3 border rounded resize-none dark:bg-slate-800 dark:text-white"
                        value={inputJson}
                        onChange={(e) => setInputJson(e.target.value)}
                        placeholder="Enter your JSON here..."
                    ></textarea>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Output JSON</h2>
                    <textarea
                        id="output"
                        className="w-full h-96 p-3 border rounded resize-none dark:bg-slate-800 dark:text-white"
                        value={outputJson}
                        readOnly
                        placeholder="Transformed JSON will appear here..."
                    ></textarea>
                </div>
            </section>

            <section className="space-y-4">
                <button
                    onClick={runTransform}
                    className="px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-400 text-white"
                >
                    Transform JSON
                </button>
            </section>
        </div>
    );
}