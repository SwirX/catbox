import React, { useState, useMemo, useCallback } from "react";

const MACRO_PREFIX = "#!";

export const PREBUILT_MACROS = [];

const MacroReplacePanel = ({
    isOpen,
    onClose,
    scriptData,
    savedMacros,
    onSaveMacro,
    onReplaceMacro,
    highlightedMacros,
    setHighlightedMacros,
    onNavigateToEvent,
}) => {
    const [selectedMacro, setSelectedMacro] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newMacroName, setNewMacroName] = useState("");
    const [selectedFunctionEvent, setSelectedFunctionEvent] = useState(null);

    const macroComments = useMemo(() => {
        if (!scriptData) return [];

        const macros = [];

        scriptData.forEach((event) => {
            event.actions?.forEach((action, actionIdx) => {
                if (action.id === "124") {
                    const commentText = action.text?.[0];
                    if (typeof commentText === "object" && commentText.value?.startsWith(MACRO_PREFIX)) {
                        const macroString = commentText.value.substring(MACRO_PREFIX.length).trim();
                        const parts = macroString.match(/^(\w+)?\s*(.*)$/);

                        if (parts) {
                            const macroName = parts[1] || "";
                            const argsString = parts[2] || "";
                            const args = [...argsString.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);

                            macros.push({
                                eventId: event.globalid,
                                actionIndex: actionIdx,
                                macroName,
                                args,
                                rawText: commentText.value,
                            });
                        }
                    }
                }
            });
        });

        return macros;
    }, [scriptData]);

    const functionEvents = useMemo(() => {
        if (!scriptData) return [];
        return scriptData.filter((event) => event.id === "6");
    }, [scriptData]);

    React.useEffect(() => {
        if (isOpen) {
            setHighlightedMacros(macroComments.map(m => ({
                eventId: m.eventId,
                actionIndex: m.actionIndex,
            })));
        } else {
            setHighlightedMacros([]);
        }
    }, [isOpen, macroComments, setHighlightedMacros]);

    const allMacros = useMemo(() => {
        return [...PREBUILT_MACROS, ...savedMacros];
    }, [savedMacros]);

    const handleReplaceMacro = useCallback((macroComment, selectedMacroDef) => {
        if (!selectedMacroDef) return;

        const sourceEvent = scriptData.find(e => e.globalid === selectedMacroDef.sourceEventId);
        if (!sourceEvent) return;

        let newActions = JSON.parse(JSON.stringify(sourceEvent.actions || []));

        if (selectedMacroDef.paramNames && macroComment.args) {
            newActions = newActions.map(action => {
                const newAction = { ...action };
                newAction.text = action.text.map(seg => {
                    if (typeof seg === "object" && seg.value) {
                        let newValue = seg.value;
                        selectedMacroDef.paramNames.forEach((paramName, idx) => {
                            if (macroComment.args[idx]) {
                                newValue = newValue.replace(
                                    new RegExp(`\\{?${paramName}\\}?`, "g"),
                                    macroComment.args[idx]
                                );
                            }
                        });
                        return { ...seg, value: newValue };
                    }
                    return seg;
                });
                return newAction;
            });
        }

        onReplaceMacro(macroComment, newActions);
    }, [scriptData, onReplaceMacro]);

    const handleSaveMacro = () => {
        if (!selectedFunctionEvent || !newMacroName.trim()) return;

        const paramNames = [];

        if (selectedFunctionEvent.variable_overrides) {
            selectedFunctionEvent.variable_overrides.forEach(override => {
                if (override.name) paramNames.push(override.name);
            });
        }

        onSaveMacro({
            name: newMacroName.trim(),
            sourceEventId: selectedFunctionEvent.globalid,
            paramNames,
            actions: selectedFunctionEvent.actions || [],
        });

        setShowSaveModal(false);
        setNewMacroName("");
        setSelectedFunctionEvent(null);
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    Macro Replace
                </h3>
            </div>

            <p className="text-xs" style={{ color: "var(--secondary)" }}>
                Macro comments use <code className="px-1 py-0.5 rounded bg-black/10">{MACRO_PREFIX}</code> prefix.
                Example: <code className="px-1 py-0.5 rounded bg-black/10">{MACRO_PREFIX} myMacro {"{"}"arg1{"}"} {"{"}"arg2{"}"}</code>
            </p>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
                    Detected Macro Comments ({macroComments.length})
                </span>

                {macroComments.length === 0 ? (
                    <p className="text-xs italic" style={{ color: "var(--secondary)" }}>
                        No macro comments found. Add comments starting with "{MACRO_PREFIX}" to use macros.
                    </p>
                ) : (
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {macroComments.map((macro, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:brightness-95"
                                style={{
                                    backgroundColor: "var(--hover)",
                                    border: selectedMacro === idx ? "2px solid var(--accent)" : "1px solid transparent",
                                }}
                                onClick={() => {
                                    setSelectedMacro(idx);
                                    onNavigateToEvent?.(macro.eventId);
                                }}
                            >
                                <span className="text-xs font-mono truncate" style={{ color: "var(--text)" }}>
                                    {macro.rawText}
                                </span>
                                {selectedMacro === idx && allMacros.length > 0 && (
                                    <select
                                        className="text-xs px-2 py-1 rounded-lg outline-none"
                                        style={{
                                            backgroundColor: "var(--surface)",
                                            color: "var(--text)",
                                            border: "1px solid var(--border)",
                                        }}
                                        onChange={(e) => {
                                            const macroDef = allMacros.find(m => m.name === e.target.value);
                                            if (macroDef) handleReplaceMacro(macro, macroDef);
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select macro...</option>
                                        {allMacros.map((m, i) => (
                                            <option key={i} value={m.name}>{m.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
                    Available Macros ({allMacros.length})
                </span>

                {allMacros.length === 0 ? (
                    <p className="text-xs italic" style={{ color: "var(--secondary)" }}>
                        No macros saved. Right-click a "Define Function" block to save as macro.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {allMacros.map((macro, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{
                                    backgroundColor: "var(--accent)",
                                    color: "#ffffff",
                                }}
                            >
                                {macro.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {functionEvents.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
                        Save Function as Macro
                    </span>
                    <div className="flex items-center gap-2">
                        <select
                            className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                            style={{
                                backgroundColor: "var(--hover)",
                                color: "var(--text)",
                                border: "1px solid var(--border)",
                            }}
                            onChange={(e) => {
                                const event = functionEvents.find(f => f.globalid === e.target.value);
                                if (event) {
                                    setSelectedFunctionEvent(event);
                                    const funcName = event.text?.find(s => typeof s === "object")?.value || "";
                                    setNewMacroName(funcName);
                                    setShowSaveModal(true);
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Select a function...</option>
                            {functionEvents.map((event) => {
                                const name = event.text?.find(s => typeof s === "object")?.value || "Unnamed";
                                return (
                                    <option key={event.globalid} value={event.globalid}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            )}

            {showSaveModal && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--hover)" }}>
                    <input
                        type="text"
                        value={newMacroName}
                        onChange={(e) => setNewMacroName(e.target.value)}
                        placeholder="Macro name..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg outline-none"
                        style={{
                            backgroundColor: "var(--surface)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                        }}
                        autoFocus
                    />
                    <button
                        onClick={handleSaveMacro}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:brightness-110"
                        style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setShowSaveModal(false)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:brightness-110"
                        style={{ backgroundColor: "var(--hover)", color: "var(--text)" }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default MacroReplacePanel;
