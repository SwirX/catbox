import { useState, useCallback, useMemo } from "react";
import { Copy, Check, Download, Shield, Info, Zap, Upload, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wordList } from "../constants/wordList";

class CatWebObfuscator {
    constructor() {
        this.symbolMap = {};
        this.usedSymbols = new Set();
        this.globalIds = new Set();
        this.mathFuncs = {};
        this.wordList = wordList.filter(w => w.length > 3);
    }

    generateRandomName() {
        while (true) {
            let name;
            if (this.wordList.length > 0) {
                name = this.wordList[Math.floor(Math.random() * this.wordList.length)];
                if (Math.random() > 0.5) {
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                }
            } else {
                const length = Math.floor(Math.random() * 4) + 5;
                const consonants = "bcdfghjklmnpqrstvwxyz";
                const vowels = "aeiou";
                name = "";
                for (let i = 0; i < length; i++) {
                    if (i % 2 === 0) {
                        name += consonants[Math.floor(Math.random() * consonants.length)];
                    } else {
                        name += vowels[Math.floor(Math.random() * vowels.length)];
                    }
                }
                if (Math.random() > 0.5) {
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                }
            }

            const reserved = ["cat", "web", "roblox", "script", "parent", "parent?", "index", "value"];
            if (!reserved.includes(name.toLowerCase()) && !this.usedSymbols.has(name)) {
                this.usedSymbols.add(name);
                return name;
            }
        }
    }

    getObfuscatedName(originalName) {
        const protected_names = [
            "(parent)", "l!index", "l!value", "messageContent", "messageSenderId", "messageSenderName",
            "Increase", "Decrease", "Multiply", "Divide", "pow", "mod", "round", "floor", "ceil", "pi", "huge",
            "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "deg", "rad", "exp", "log", "log10", "sqrt", "abs"
        ];

        if (protected_names.includes(originalName)) {
            return originalName;
        }

        let prefix = "";
        let actualName = originalName;

        if (originalName.startsWith("l!")) {
            prefix = "l!";
            actualName = originalName.slice(2);
        } else if (originalName.startsWith("o!")) {
            prefix = "o!";
            actualName = originalName.slice(2);
        } else if (originalName.startsWith("{") && originalName.endsWith("}")) {
            const inner = originalName.slice(1, -1);
            return "{" + this.getObfuscatedName(inner) + "}";
        }

        if (!this.symbolMap[actualName]) {
            this.symbolMap[actualName] = this.generateRandomName();
        }

        return prefix + this.symbolMap[actualName];
    }

    generateGlobalId() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        while (true) {
            const length = Math.floor(Math.random() * 3) + 2;
            let gid = "";
            for (let i = 0; i < length; i++) {
                gid += chars[Math.floor(Math.random() * chars.length)];
            }
            if (!this.globalIds.has(gid)) {
                this.globalIds.add(gid);
                return gid;
            }
        }
    }

    processIdentifier(identifier) {
        if (identifier.includes(".")) {
            const parts = identifier.split(".");
            parts[0] = this.getObfuscatedName(parts[0]);
            return parts.join(".");
        }
        return this.getObfuscatedName(identifier);
    }

    obfuscateStringValue(val) {
        val = val.replace(/\[([ol]![a-zA-Z0-9_]+)\}/g, "{$1}");
        return val.replace(/\{([a-zA-Z0-9_!.]+)\}/g, (match, varName) => {
            return "{" + this.processIdentifier(varName) + "}";
        });
    }

    processTuple(tupleList) {
        return tupleList.map(param => {
            const newParam = { ...param };
            const val = param.value;

            if (typeof val === "string") {
                newParam.value = this.obfuscateStringValue(val);
            } else if (Array.isArray(val)) {
                newParam.value = this.processTuple(val);
            }

            return newParam;
        });
    }

    processTextField(textList) {
        return textList.map(item => {
            if (typeof item === "string") {
                let processed = item;
                processed = processed.replace(/\{([a-zA-Z0-9_!]+)\}/g, (match, varName) => {
                    return "{" + this.processIdentifier(varName) + "}";
                });
                processed = processed.replace(/\{([a-zA-Z0-9_!]+\.[a-zA-Z0-9_.]+)\}/g, (match, fullName) => {
                    const parts = fullName.split(".");
                    parts[0] = this.processIdentifier(parts[0]);
                    return "{" + parts.join(".") + "}";
                });
                return processed;
            } else if (typeof item === "object" && item !== null) {
                const newItem = { ...item };
                const val = item.value;
                const t = item.t;
                const l = item.l;

                if (t === "tuple" && Array.isArray(val)) {
                    newItem.value = this.processTuple(val);
                } else if (["variable", "variable?", "table", "function"].includes(l)) {
                    newItem.value = this.getObfuscatedName(val);
                } else if (typeof val === "string") {
                    newItem.value = this.obfuscateStringValue(val);
                }

                return newItem;
            }
            return item;
        });
    }

    obfuscateAction(action) {
        const newAction = { ...action };
        newAction.globalid = this.generateGlobalId();

        if (newAction.text) {
            newAction.text = this.processTextField(newAction.text);
        }

        const mathIds = { "12": "Increase", "13": "Decrease", "14": "Multiply", "15": "Divide" };
        const actionId = String(newAction.id);

        if (mathIds[actionId] && this.mathFuncs[mathIds[actionId]]) {
            const opName = mathIds[actionId];
            const params = newAction.text.filter(item => typeof item === "object");

            if (params.length >= 2) {
                const varParam = params[0];
                const valParam = params[1];
                const targetVar = varParam.value;

                return {
                    id: "87",
                    text: [
                        "Run function",
                        { value: this.mathFuncs[opName], t: "string", l: "function" },
                        {
                            value: [
                                { value: "{" + targetVar + "}", t: "any", l: "any" },
                                { value: valParam.value, t: valParam.t || "any", l: "any" }
                            ],
                            t: "tuple"
                        },
                        "→",
                        { value: targetVar, l: "variable", t: "string" }
                    ],
                    globalid: this.generateGlobalId()
                };
            }
        }

        return newAction;
    }

    generateDummyAction() {
        const length = Math.floor(Math.random() * 16) + 10;
        const consonants = "bcdfghjklmnpqrstvwxyz";
        const vowels = "aeiou";
        let text = "";

        for (let i = 0; i < length; i++) {
            if (i % 2 === 0) {
                text += consonants[Math.floor(Math.random() * consonants.length)];
            } else {
                text += vowels[Math.floor(Math.random() * vowels.length)];
            }
            if (i > 0 && i % 6 === 0 && Math.random() > 0.5) {
                text += " ";
            }
        }

        return {
            id: "124",
            text: [{ value: text.trim(), t: "string", l: "comment" }],
            globalid: this.generateGlobalId()
        };
    }

    splitActions(actions, scriptContent, params = null, isFunction = false) {
        let depth = 0;
        const processedActions = [];
        const safePoints = [0];

        for (const action of actions) {
            processedActions.push(action);
            const actionId = String(action.id);

            if (["18", "19", "20", "21", "22"].includes(actionId)) {
                depth++;
            } else if (actionId === "25") {
                depth--;
            }

            if (depth === 0) {
                safePoints.push(processedActions.length);
                if (Math.random() < 0.1) {
                    processedActions.push(this.generateDummyAction());
                    safePoints.push(processedActions.length);
                }
            }
        }

        const finalActions = [...processedActions];

        if (safePoints.length <= 4 || finalActions.length <= 15) {
            return finalActions;
        }

        const numChunks = Math.min(3, Math.floor(safePoints.length / 4));
        const middlePoints = safePoints.slice(1, -1);
        const splitIndices = [];

        for (let i = 0; i < numChunks && middlePoints.length > 0; i++) {
            const idx = Math.floor(Math.random() * middlePoints.length);
            splitIndices.push(middlePoints[idx]);
            middlePoints.splice(idx, 1);
        }

        splitIndices.sort((a, b) => a - b);

        const chunks = [];
        let lastIdx = 0;

        for (const idx of splitIndices) {
            chunks.push(finalActions.slice(lastIdx, idx));
            lastIdx = idx;
        }
        chunks.push(finalActions.slice(lastIdx));

        let lastFuncName = null;
        const paramOverrides = params || [];
        const paramTuple = paramOverrides.map(p => ({
            value: "{" + (p.value.startsWith("l!") ? p.value : "l!" + p.value) + "}",
            t: "any",
            l: "any"
        }));

        for (let i = chunks.length - 1; i >= 0; i--) {
            const chunk = [...chunks[i]];
            const currentFuncName = this.generateRandomName();
            const funcActions = [...chunk];

            if (lastFuncName) {
                const chainResVar = "l!" + this.generateRandomName();
                const callNext = {
                    id: "87",
                    text: [
                        "Run function",
                        { value: lastFuncName, t: "string", l: "function" },
                        { value: paramTuple, t: "tuple" },
                        "→",
                        { value: chainResVar, l: "variable?", t: "string" }
                    ],
                    globalid: this.generateGlobalId()
                };

                if (isFunction) {
                    const returnNext = {
                        id: "115",
                        text: ["Return", { value: "{" + chainResVar + "}", t: "any", l: "any" }],
                        globalid: this.generateGlobalId()
                    };
                    funcActions.push(callNext);
                    funcActions.push(returnNext);
                } else {
                    funcActions.push(callNext);
                }
            }

            scriptContent.push({
                id: "6",
                text: ["Define function", { value: currentFuncName, t: "string", l: "function" }],
                variable_overrides: paramOverrides,
                actions: funcActions,
                x: String(Math.floor(Math.random() * 6000) + 2000),
                y: String(Math.floor(Math.random() * 6000) + 2000),
                width: String(Math.floor(Math.random() * 300) + 300),
                globalid: this.generateGlobalId()
            });

            lastFuncName = currentFuncName;
        }

        const finalResVar = "l!" + this.generateRandomName();
        const callChain = {
            id: "87",
            text: [
                "Run function",
                { value: lastFuncName, t: "string", l: "function" },
                { value: paramTuple, t: "tuple" },
                "→",
                { value: finalResVar, l: "variable?", t: "string" }
            ],
            globalid: this.generateGlobalId()
        };

        const result = [callChain];

        if (isFunction) {
            result.push({
                id: "115",
                text: ["Return", { value: "{" + finalResVar + "}", t: "any", l: "any" }],
                globalid: this.generateGlobalId()
            });
        }

        return result;
    }

    createMathLibrary(scriptContent) {
        const ops = { "Increase": "12", "Decrease": "13", "Multiply": "14", "Divide": "15" };

        for (const [opName, opId] of Object.entries(ops)) {
            const funcName = this.generateRandomName();
            this.mathFuncs[opName] = funcName;

            const libRes = this.generateRandomName();
            const libA = this.generateRandomName();
            const libB = this.generateRandomName();

            const actions = [
                {
                    id: "11",
                    text: [
                        "Set",
                        { value: libRes, l: "variable", t: "string" },
                        "to",
                        { value: "{l!" + libA + "}", t: "any" }
                    ],
                    globalid: this.generateGlobalId()
                },
                {
                    id: opId,
                    text: [
                        opName,
                        { value: libRes, l: "variable", t: "string" },
                        "by",
                        { value: "{l!" + libB + "}", t: "any" }
                    ],
                    globalid: this.generateGlobalId()
                },
                {
                    id: "115",
                    text: ["Return", { value: "{" + libRes + "}", t: "any" }],
                    globalid: this.generateGlobalId()
                }
            ];

            scriptContent.push({
                id: "6",
                text: ["Define function", { value: funcName, t: "string", l: "function" }],
                variable_overrides: [{ value: libA }, { value: libB }],
                actions: actions,
                x: String(Math.floor(Math.random() * 2000) + 4000),
                y: String(Math.floor(Math.random() * 2000) + 4000),
                width: "600",
                globalid: this.generateGlobalId()
            });
        }
    }

    obfuscateEvent(event, scriptContent) {
        const newEvent = { ...event };
        newEvent.globalid = this.generateGlobalId();

        if (newEvent.text) {
            newEvent.text = this.processTextField(newEvent.text);
        }

        let overrides = [];
        if (newEvent.variable_overrides) {
            newEvent.variable_overrides = newEvent.variable_overrides.map(ov => ({
                ...ov,
                value: this.getObfuscatedName(ov.value)
            }));
            overrides = newEvent.variable_overrides;
        }

        if (newEvent.actions) {
            const newActions = newEvent.actions.map(a => this.obfuscateAction(a));
            const isFunc = String(newEvent.id) === "6";
            newEvent.actions = this.splitActions(newActions, scriptContent, overrides, isFunc);
        }

        return newEvent;
    }

    obfuscateScript(scriptObj) {
        if (scriptObj.class !== "script") {
            return scriptObj;
        }

        const newScript = { ...scriptObj };
        newScript.globalid = this.generateGlobalId();

        if (newScript.content) {
            const newContent = [];
            this.createMathLibrary(newContent);

            for (const event of newScript.content) {
                newContent.push(this.obfuscateEvent(event, newContent));
            }

            newScript.content = newContent;
        }

        return newScript;
    }

    obfuscateElement(element) {
        const newElement = { ...element };
        newElement.globalid = this.generateGlobalId();

        if (newElement.class === "script") {
            return this.obfuscateScript(newElement);
        }

        if (newElement.children) {
            newElement.children = newElement.children.map(child => this.obfuscateElement(child));
        }

        return newElement;
    }

    run(data) {
        if (!Array.isArray(data)) {
            throw new Error("CatWeb JSON root must be an array.");
        }

        return data.map(element => this.obfuscateElement(element));
    }
}

export default function Obfuscator() {
    const [inputJson, setInputJson] = useState("");
    const [outputJson, setOutputJson] = useState("");
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const handleObfuscate = useCallback(() => {
        setIsProcessing(true);
        setError(null);
        setStats(null);

        setTimeout(() => {
            try {
                const data = JSON.parse(inputJson);
                const obfuscator = new CatWebObfuscator();
                const result = obfuscator.run(data);

                setOutputJson(JSON.stringify(result, null, 2));
                setStats({
                    symbolsObfuscated: Object.keys(obfuscator.symbolMap).length,
                    globalIdsGenerated: obfuscator.globalIds.size,
                    mathFunctionsCreated: Object.keys(obfuscator.mathFuncs).length
                });
            } catch (err) {
                setError(err.message);
                setOutputJson("");
            } finally {
                setIsProcessing(false);
            }
        }, 100);
    }, [inputJson]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(outputJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [outputJson]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([outputJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "obfuscated-script.json";
        a.click();
        URL.revokeObjectURL(url);
    }, [outputJson]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setInputJson(event.target?.result || "");
            };
            reader.readAsText(file);
        }
    }, []);

    const inputLineCount = useMemo(() => {
        return inputJson ? inputJson.split("\n").length : 0;
    }, [inputJson]);

    const outputLineCount = useMemo(() => {
        return outputJson ? outputJson.split("\n").length : 0;
    }, [outputJson]);

    return (
        <div className="space-y-12 max-w-7xl mx-auto py-12 px-4">
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-6"
            >
                <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl shadow-2xl shadow-purple-500/30"
                >
                    <Shield size={40} />
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary">
                    Script <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Obfuscator</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary leading-relaxed">
                    Protect your CatWeb scripts with advanced obfuscation. Rename variables, split functions, and add decoy code.
                </p>
            </motion.section>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto p-5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl"
            >
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-purple-500/20 rounded-xl shrink-0">
                        <Info size={20} className="text-purple-400" />
                    </div>
                    <div className="text-sm text-text-secondary space-y-2">
                        <p className="font-semibold text-text-primary">What does this tool do?</p>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary/80">
                            <li>Renames all variables and functions to random words</li>
                            <li>Creates a math library to obfuscate arithmetic operations</li>
                            <li>Splits long code blocks into chained function calls</li>
                            <li>Inserts random dummy comments to confuse readers</li>
                            <li>Regenerates all global IDs for uniqueness</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface rounded-3xl p-6 shadow-xl border border-border flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-3">
                            <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></span>
                            Input Script
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-surface-hover px-2 py-1 rounded-lg text-text-secondary">
                                {inputLineCount} lines
                            </span>
                            <label className="p-2 rounded-xl bg-primary hover:bg-surface-hover transition-all cursor-pointer group">
                                <Upload size={16} className="text-text-secondary group-hover:text-accent transition-colors" />
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    </div>

                    <textarea
                        className="flex-1 w-full p-4 rounded-2xl bg-primary border-2 border-transparent focus:border-purple-500/50 focus:bg-surface text-sm font-mono text-text-primary focus:outline-none transition-all resize-none custom-scrollbar min-h-[450px]"
                        value={inputJson}
                        onChange={(e) => setInputJson(e.target.value)}
                        placeholder='Paste your CatWeb script JSON here...

[
  {
    "class": "script",
    "content": [...]
  }
]'
                        spellCheck={false}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-surface rounded-3xl p-6 shadow-xl border border-border flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-3">
                            <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                            Obfuscated Output
                        </h2>
                        <div className="flex items-center gap-2">
                            {stats && (
                                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-lg">
                                    {stats.symbolsObfuscated} symbols
                                </span>
                            )}
                            <span className="text-xs font-mono bg-surface-hover px-2 py-1 rounded-lg text-text-secondary">
                                {outputLineCount} lines
                            </span>
                            {outputJson && !error && (
                                <>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-xl bg-primary hover:bg-surface-hover transition-all group"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <Check size={16} className="text-green-500" />
                                        ) : (
                                            <Copy size={16} className="text-text-secondary group-hover:text-accent transition-colors" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="p-2 rounded-xl bg-primary hover:bg-surface-hover transition-all group"
                                        title="Download JSON"
                                    >
                                        <Download size={16} className="text-text-secondary group-hover:text-accent transition-colors" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <textarea
                            className={`w-full h-full p-4 rounded-2xl bg-primary border-2 border-transparent text-sm font-mono text-text-primary focus:outline-none transition-all resize-none custom-scrollbar min-h-[450px] ${error ? "border-red-500/50 text-red-400" : "focus:border-green-500/50"
                                }`}
                            value={error ? `Error: ${error}` : outputJson}
                            readOnly
                            placeholder="Obfuscated script will appear here..."
                            spellCheck={false}
                        />

                        <AnimatePresence>
                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-primary/80 backdrop-blur-sm rounded-2xl"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                                        <span className="text-sm font-medium text-text-secondary">Obfuscating...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </section>

            <AnimatePresence>
                {stats && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
                    >
                        <div className="bg-surface rounded-2xl p-5 border border-border text-center">
                            <div className="text-3xl font-bold text-purple-500">{stats.symbolsObfuscated}</div>
                            <div className="text-sm text-text-secondary mt-1">Symbols Renamed</div>
                        </div>
                        <div className="bg-surface rounded-2xl p-5 border border-border text-center">
                            <div className="text-3xl font-bold text-indigo-500">{stats.globalIdsGenerated}</div>
                            <div className="text-sm text-text-secondary mt-1">IDs Generated</div>
                        </div>
                        <div className="bg-surface rounded-2xl p-5 border border-border text-center">
                            <div className="text-3xl font-bold text-green-500">{stats.mathFunctionsCreated}</div>
                            <div className="text-sm text-text-secondary mt-1">Math Functions</div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <section className="flex justify-center pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleObfuscate}
                    disabled={isProcessing || !inputJson.trim()}
                    className="px-12 py-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-purple-500/30"
                >
                    {isProcessing ? (
                        <>
                            <RefreshCw size={24} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Zap size={24} />
                            Obfuscate Script
                        </>
                    )}
                </motion.button>
            </section>
        </div>
    );
}
