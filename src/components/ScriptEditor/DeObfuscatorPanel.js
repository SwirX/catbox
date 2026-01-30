import React, { useState, useMemo, useCallback } from "react";
import Icon from "./Icon";

const DeObfuscatorPanel = ({
    isOpen,
    onClose,
    scriptData,
    onRenameAll,
    clickableNames,
    setClickableNames,
    onNavigateToEvent,
    highlightedOccurrence,
    setHighlightedOccurrence,
}) => {
    const [selectedName, setSelectedName] = useState(null);
    const [newName, setNewName] = useState("");
    const [filter, setFilter] = useState("all");

    const getParentFunctionName = useCallback((eventId) => {
        if (!scriptData) return "Global";

        const eventIndex = scriptData.findIndex(e => e.globalid === eventId);
        if (eventIndex === -1) return "Global";

        const event = scriptData[eventIndex];

        if (event.id === "6") {
            const funcSeg = event.text?.find(s => typeof s === "object" && s.l === "function");
            return funcSeg?.value || "Function";
        }

        for (let i = eventIndex - 1; i >= 0; i--) {
            const prevEvent = scriptData[i];
            if (prevEvent.id === "6") {
                const funcSeg = prevEvent.text?.find(s => typeof s === "object" && s.l === "function");
                return funcSeg?.value || "Function";
            }
        }

        return "Global";
    }, [scriptData]);

    const allNames = useMemo(() => {
        if (!scriptData) return [];

        const namesMap = new Map();

        const addOccurrence = (name, type, occ) => {
            if (!name) return;
            if (!namesMap.has(name)) {
                namesMap.set(name, {
                    name,
                    type,
                    occurrences: [],
                });
            }
            const exists = namesMap.get(name).occurrences.some(o =>
                o.type === occ.type &&
                o.eventId === occ.eventId &&
                o.actionIndex === occ.actionIndex &&
                o.segmentIndex === occ.segmentIndex &&
                o.matchIndex === occ.matchIndex
            );
            if (!exists) {
                namesMap.get(name).occurrences.push(occ);
            }
        };

        const variableTypes = ["variable", "string"];
        const functionTypes = ["function"];

        scriptData.forEach((event, eventBlockIndex) => {
            event.text?.forEach((seg, segIdx) => {
                if (typeof seg === "object" && seg.value) {
                    if (event.id === "6" && seg.l === "function") {
                        addOccurrence(seg.value, "function", {
                            type: "event",
                            eventId: event.globalid,
                            segmentIndex: segIdx,
                            blockIndex: eventBlockIndex,
                        });
                    } else if (variableTypes.includes(seg.l)) {
                        addOccurrence(seg.value, "variable", {
                            type: "event",
                            eventId: event.globalid,
                            segmentIndex: segIdx,
                            blockIndex: eventBlockIndex,
                        });
                    }

                    const refRegex = /\{([^}]+)\}/g;
                    let match;
                    while ((match = refRegex.exec(seg.value)) !== null) {
                        addOccurrence(match[1], "variable", {
                            type: "event",
                            eventId: event.globalid,
                            segmentIndex: segIdx,
                            blockIndex: eventBlockIndex,
                            isReference: true,
                            matchIndex: match.index,
                            matchLength: match[0].length
                        });
                    }
                }
            });

            if (event.id === "6" && event.variable_overrides) {
                event.variable_overrides.forEach((override, overrideIdx) => {
                    if (override.value) {
                        addOccurrence(override.value, "variable", {
                            type: "override",
                            eventId: event.globalid,
                            overrideIndex: overrideIdx,
                            blockIndex: eventBlockIndex,
                        });
                    }
                });
            }

            event.actions?.forEach((action, actionIdx) => {
                action.text?.forEach((seg, segIdx) => {
                    if (typeof seg === "object" && seg.value) {
                        const isFunction = functionTypes.includes(seg.l);
                        const isVariable = variableTypes.includes(seg.l);

                        if (isFunction || isVariable) {
                            addOccurrence(seg.value, isFunction ? "function" : "variable", {
                                type: "action",
                                eventId: event.globalid,
                                actionIndex: actionIdx,
                                segmentIndex: segIdx,
                                blockIndex: eventBlockIndex,
                            });
                        }

                        const refRegex = /\{([^}]+)\}/g;
                        let match;
                        while ((match = refRegex.exec(seg.value)) !== null) {
                            addOccurrence(match[1], "variable", {
                                type: "action",
                                eventId: event.globalid,
                                actionIndex: actionIdx,
                                segmentIndex: segIdx,
                                blockIndex: eventBlockIndex,
                                isReference: true,
                                matchIndex: match.index,
                                matchLength: match[0].length
                            });
                        }
                    }
                });
            });
        });

        return Array.from(namesMap.values()).sort((a, b) =>
            b.occurrences.length - a.occurrences.length
        );
    }, [scriptData]);

    const filteredNames = useMemo(() => {
        if (filter === "all") return allNames;
        return allNames.filter(n => n.type === (filter === "variables" ? "variable" : "function"));
    }, [allNames, filter]);

    React.useEffect(() => {
        if (isOpen && selectedName) {
            const clickables = selectedName.occurrences.map(occ => ({
                ...occ,
                name: selectedName.name,
                isHighlighted: true,
            }));
            setClickableNames(clickables);
        } else if (isOpen) {
            const clickables = [];
            allNames.forEach(nameData => {
                nameData.occurrences.forEach(occ => {
                    clickables.push({
                        ...occ,
                        name: nameData.name,
                    });
                });
            });
            setClickableNames(clickables);
        } else {
            setClickableNames([]);
            setSelectedName(null);
            setNewName("");
            setHighlightedOccurrence?.(null);
        }
    }, [isOpen, allNames, selectedName, setClickableNames, setHighlightedOccurrence]);

    const handleSelectName = useCallback((nameData) => {
        setSelectedName(nameData);
        setNewName(nameData.name);
        setHighlightedOccurrence?.(null);
    }, [setHighlightedOccurrence]);

    const handleRename = useCallback(() => {
        if (!selectedName || !newName.trim() || newName === selectedName.name) return;

        onRenameAll(selectedName.name, newName.trim());

        setSelectedName(prev => prev ? { ...prev, name: newName.trim() } : null);
    }, [selectedName, newName, onRenameAll]);

    const handleNavigateToOccurrence = useCallback((occurrence, idx) => {
        onNavigateToEvent?.(occurrence.eventId);
        setHighlightedOccurrence?.({
            ...occurrence,
            occurrenceIndex: idx,
        });
    }, [onNavigateToEvent, setHighlightedOccurrence]);

    if (!isOpen) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    De-obfuscator
                </h3>
            </div>

            <div className="flex items-center gap-1">
                {["all", "variables", "functions"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${filter === f ? "ring-1" : "opacity-60 hover:opacity-100"
                            }`}
                        style={{
                            backgroundColor: filter === f ? "var(--accent)" : "var(--hover)",
                            color: filter === f ? "#ffffff" : "var(--text)",
                            "--tw-ring-color": "var(--accent)",
                        }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
                    Identifiers ({filteredNames.length})
                </span>

                {filteredNames.length === 0 ? (
                    <p className="text-xs italic" style={{ color: "var(--secondary)" }}>
                        No {filter === "all" ? "identifiers" : filter} found in the script.
                    </p>
                ) : (
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                        {filteredNames.map((nameData, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:brightness-95"
                                style={{
                                    backgroundColor: selectedName?.name === nameData.name
                                        ? "var(--accent)"
                                        : "var(--hover)",
                                    color: selectedName?.name === nameData.name
                                        ? "#ffffff"
                                        : "var(--text)",
                                }}
                                onClick={() => handleSelectName(nameData)}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                                        style={{
                                            backgroundColor: nameData.type === "function"
                                                ? "#f72585"
                                                : "#fb5607",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {nameData.type === "function" ? "fn" : "var"}
                                    </span>
                                    <span className="text-xs font-mono truncate">
                                        {nameData.name}
                                    </span>
                                </div>
                                <span className="text-[10px] opacity-60">
                                    {nameData.occurrences.length}×
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedName && (
                <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--hover)" }}>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New name..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg outline-none focus:ring-2"
                            style={{
                                backgroundColor: "var(--surface)",
                                color: "var(--text)",
                                border: "1px solid var(--border)",
                                "--tw-ring-color": "var(--accent)",
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        />
                        <button
                            onClick={handleRename}
                            disabled={!newName.trim() || newName === selectedName.name}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:brightness-110 disabled:opacity-30"
                            style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
                        >
                            Rename All
                        </button>
                    </div>

                    <span className="text-xs font-medium" style={{ color: "var(--secondary)" }}>
                        Occurrences ({selectedName.occurrences.length})
                    </span>
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {selectedName.occurrences.map((occ, idx) => {
                            const parentFunc = getParentFunctionName(occ.eventId);
                            const isCurrentHighlight = highlightedOccurrence?.eventId === occ.eventId &&
                                highlightedOccurrence?.actionIndex === occ.actionIndex &&
                                highlightedOccurrence?.segmentIndex === occ.segmentIndex;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleNavigateToOccurrence(occ, idx)}
                                    className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-all hover:brightness-95 text-left"
                                    style={{
                                        backgroundColor: isCurrentHighlight ? "#00ff88" : "var(--surface)",
                                        color: isCurrentHighlight ? "#000000" : "var(--text)",
                                        boxShadow: isCurrentHighlight ? "0 0 10px #00ff88" : "none",
                                    }}
                                >
                                    <Icon name="arrowRight" size={10} />
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium truncate">
                                                Block #{occ.blockIndex + 1} • {
                                                    occ.type === "action" ? `Action ${occ.actionIndex + 1}` :
                                                        occ.type === "override" ? `Arg ${occ.overrideIndex + 1}` : "Event"
                                                }
                                            </span>
                                            {occ.isReference && (
                                                <span
                                                    className="px-1 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider"
                                                    style={{
                                                        backgroundColor: "rgba(0, 255, 136, 0.2)",
                                                        color: isCurrentHighlight ? "#000" : "#00ff88",
                                                        border: "1px solid rgba(0, 255, 136, 0.3)"
                                                    }}
                                                >
                                                    Ref
                                                </span>
                                            )}
                                        </div>
                                        <span className="opacity-60 text-[10px] truncate">
                                            in {parentFunc}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeObfuscatorPanel;
