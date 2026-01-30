import React, { useState, useEffect, useCallback, useRef } from "react";
import Icon from "./Icon";

const ModifierButton = ({ label, shortLabel, isActive, onClick, title }) => (
    <button
        onClick={onClick}
        className={`
            px-2 py-1 text-xs font-medium rounded-lg transition-all duration-150
            ${isActive
                ? "ring-1"
                : "opacity-60 hover:opacity-100"
            }
        `}
        style={{
            backgroundColor: isActive ? "var(--accent)" : "var(--hover)",
            color: isActive ? "#ffffff" : "var(--text)",
            "--tw-ring-color": "var(--accent)",
        }}
        title={title}
    >
        {shortLabel || label}
    </button>
);

const MultiReplacePanel = ({
    isOpen,
    onClose,
    scriptData,
    onReplaceAll,
    onReplaceSingle,
    searchMatches,
    setSearchMatches,
    currentMatchIndex,
    setCurrentMatchIndex,
    onNavigateToEvent,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [replaceTerm, setReplaceTerm] = useState("");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const buildSearchPattern = useCallback(() => {
        if (!searchTerm) return null;

        try {
            let pattern = searchTerm;

            if (!useRegex) {
                pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            }

            if (wholeWord) {
                pattern = `\\b${pattern}\\b`;
            }

            const flags = caseSensitive ? "g" : "gi";
            return new RegExp(pattern, flags);
        } catch {
            return null;
        }
    }, [searchTerm, caseSensitive, wholeWord, useRegex]);

    const findMatches = useCallback(() => {
        if (!searchTerm || !scriptData) {
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const regex = buildSearchPattern();
        if (!regex) {
            setSearchMatches([]);
            return;
        }

        const matches = [];

        const scanValue = (value, type, eventId, actionIndex, segmentIndex, overrideIndex = null, path = []) => {
            if (typeof value === "string") {
                const segMatches = [...value.matchAll(regex)];
                segMatches.forEach((match) => {
                    matches.push({
                        type,
                        eventId,
                        actionIndex,
                        segmentIndex,
                        overrideIndex,
                        matchIndex: match.index,
                        matchLength: match[0].length,
                        matchText: match[0],
                        groups: match.slice(1),
                        value: value,
                        path
                    });
                });
            } else if (Array.isArray(value)) {
                value.forEach((item, idx) => {
                    if (typeof item === "object" && item !== null) {
                        scanValue(item.value, type, eventId, actionIndex, segmentIndex, overrideIndex, [...path, idx]);
                    }
                });
            }
        };

        scriptData.forEach((event) => {
            event.text?.forEach((seg, segIdx) => {
                if (typeof seg === "object" && seg.value) {
                    scanValue(seg.value, "event", event.globalid, null, segIdx);
                }
            });

            if (event.id === "6" && event.variable_overrides) {
                event.variable_overrides.forEach((override, idx) => {
                    if (override.value) {
                        scanValue(override.value, "override", event.globalid, null, null, idx);
                    }
                });
            }

            event.actions?.forEach((action, actionIdx) => {
                action.text?.forEach((seg, segIdx) => {
                    if (typeof seg === "object" && seg.value) {
                        scanValue(seg.value, "action", event.globalid, actionIdx, segIdx);
                    }
                });
            });
        });

        setSearchMatches(matches);
        if (matches.length > 0 && currentMatchIndex < 0) {
            setCurrentMatchIndex(0);
        } else if (matches.length === 0) {
            setCurrentMatchIndex(-1);
        } else if (currentMatchIndex >= matches.length) {
            setCurrentMatchIndex(matches.length - 1);
        }
    }, [scriptData, searchTerm, buildSearchPattern, setSearchMatches, currentMatchIndex, setCurrentMatchIndex]);

    useEffect(() => {
        findMatches();
    }, [searchTerm, caseSensitive, wholeWord, useRegex, scriptData, findMatches]);

    const processReplaceTerm = (match) => {
        let result = replaceTerm;

        result = result.replace(/@(\d+)/g, (_, num) => {
            const idx = parseInt(num, 10) - 1;
            return match.groups[idx] || "";
        });

        return result;
    };

    const handleReplaceCurrent = () => {
        if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;
        const match = searchMatches[currentMatchIndex];
        const newValue = processReplaceTerm(match);
        onReplaceSingle(match, newValue);

        if (searchMatches.length > 1) {
            setCurrentMatchIndex((prev) =>
                prev >= searchMatches.length - 1 ? 0 : prev
            );
        }
    };

    const handleReplaceAll = () => {
        if (searchMatches.length === 0) return;
        const replacements = searchMatches.map((match) => ({
            ...match,
            replacement: processReplaceTerm(match),
        }));
        onReplaceAll(replacements);
        setSearchMatches([]);
        setCurrentMatchIndex(-1);
    };

    useEffect(() => {
        if (currentMatchIndex >= 0 && currentMatchIndex < searchMatches.length) {
            const match = searchMatches[currentMatchIndex];
            onNavigateToEvent?.(match.eventId);
        }
    }, [currentMatchIndex, searchMatches, onNavigateToEvent]);

    const goToNextMatch = () => {
        if (searchMatches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length);
    };

    const goToPrevMatch = () => {
        if (searchMatches.length === 0) return;
        setCurrentMatchIndex((prev) =>
            prev <= 0 ? searchMatches.length - 1 : prev - 1
        );
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    Find & Replace
                </h3>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Find..."
                        className="w-full px-3 py-2 pr-16 text-sm rounded-xl outline-none transition-all focus:ring-2"
                        style={{
                            backgroundColor: "var(--hover)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--accent)",
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.shiftKey ? goToPrevMatch() : goToNextMatch();
                            }
                        }}
                    />
                    <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "var(--secondary)" }}
                    >
                        {searchMatches.length > 0
                            ? `${currentMatchIndex + 1}/${searchMatches.length}`
                            : searchTerm ? "0" : ""}
                    </span>
                </div>

                <button
                    onClick={goToPrevMatch}
                    disabled={searchMatches.length === 0}
                    className="p-2 rounded-lg transition-colors hover:brightness-110 disabled:opacity-30"
                    style={{ backgroundColor: "var(--hover)", color: "var(--text)" }}
                    title="Previous (Shift+Enter)"
                >
                    <Icon name="arrowLeft" size={14} />
                </button>
                <button
                    onClick={goToNextMatch}
                    disabled={searchMatches.length === 0}
                    className="p-2 rounded-lg transition-colors hover:brightness-110 disabled:opacity-30"
                    style={{ backgroundColor: "var(--hover)", color: "var(--text)" }}
                    title="Next (Enter)"
                >
                    <Icon name="arrowRight" size={14} />
                </button>
            </div>

            <div className="flex items-center gap-1.5">
                <ModifierButton
                    label="Case Sensitive"
                    shortLabel="Aa"
                    isActive={caseSensitive}
                    onClick={() => setCaseSensitive(!caseSensitive)}
                    title="Match Case"
                />
                <ModifierButton
                    label="Whole Word"
                    shortLabel="W"
                    isActive={wholeWord}
                    onClick={() => setWholeWord(!wholeWord)}
                    title="Match Whole Word"
                />
                <ModifierButton
                    label="Regex"
                    shortLabel=".*"
                    isActive={useRegex}
                    onClick={() => setUseRegex(!useRegex)}
                    title="Use Regular Expression"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder="Replace with... (use @1, @2 for regex groups)"
                    className="flex-1 px-3 py-2 text-sm rounded-xl outline-none transition-all focus:ring-2"
                    style={{
                        backgroundColor: "var(--hover)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                        "--tw-ring-color": "var(--accent)",
                    }}
                />
                <button
                    onClick={handleReplaceCurrent}
                    disabled={searchMatches.length === 0}
                    className="px-3 py-2 text-xs font-medium rounded-xl transition-all hover:brightness-110 disabled:opacity-30"
                    style={{
                        backgroundColor: "var(--hover)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                    }}
                >
                    Replace
                </button>
                <button
                    onClick={handleReplaceAll}
                    disabled={searchMatches.length === 0}
                    className="px-3 py-2 text-xs font-medium rounded-xl transition-all hover:brightness-110 disabled:opacity-30"
                    style={{
                        backgroundColor: "var(--accent)",
                        color: "#ffffff",
                    }}
                >
                    Replace All
                </button>
            </div>

            {useRegex && (
                <p className="text-xs" style={{ color: "var(--secondary)" }}>
                    💡 Use <code className="px-1 py-0.5 rounded bg-black/10">@1</code>, <code className="px-1 py-0.5 rounded bg-black/10">@2</code> in replacement to reference capture groups.
                </p>
            )}
        </div>
    );
};

export default MultiReplacePanel;
