import React, { useRef } from "react";
import { CATEGORIES, ACTION_TYPES, EVENT_TYPES } from "./Constants";
import Icon from "./Icon";

const BlockPalette = ({ onDragStart, onDeleteDrop }) => {
    const scrollContainerRef = useRef(null);
    const sectionRefs = useRef({});

    const scrollToSection = (catId) => {
        const el = sectionRefs.current[catId];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const getCategoryItems = (catId) => {
        if (catId === "Events") {
            return Object.values(EVENT_TYPES).map((i) => ({ ...i, isEvent: true }));
        }
        return Object.values(ACTION_TYPES)
            .filter((a) => a.category === catId)
            .map((i) => ({ ...i, isEvent: false }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData("eventId");
        if (eventId && onDeleteDrop) {
            onDeleteDrop(eventId, "event");
        }
    };

    return (
        <div
            className="flex flex-row h-full"
            style={{
                width: "300px",
                backgroundColor: "var(--surface, #1C1C1E)",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                className="w-12 flex flex-col items-center py-3 gap-2 border-r overflow-y-auto"
                style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderColor: "var(--border, #38383A)",
                }}
            >
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => scrollToSection(cat.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: cat.color }}
                        title={cat.id}
                    >
                        <Icon name={cat.icon} size={16} className="text-white" />
                    </button>
                ))}
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-4"
                style={{ scrollBehavior: "smooth" }}
            >
                {CATEGORIES.map((cat) => {
                    const items = getCategoryItems(cat.id);
                    return (
                        <div
                            key={cat.id}
                            ref={(el) => (sectionRefs.current[cat.id] = el)}
                            className="scroll-mt-3"
                        >
                            <div
                                className="flex items-center gap-2 mb-2 px-1 sticky top-0 py-1.5 z-10"
                                style={{ backgroundColor: "var(--surface, #1C1C1E)" }}
                            >
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: cat.color }}
                                >
                                    <Icon name={cat.icon} size={12} className="text-white" />
                                </div>
                                <span className="text-xs font-bold" style={{ color: cat.color }}>
                                    {cat.id}
                                </span>
                                <span className="text-[10px] ml-auto" style={{ color: "var(--secondary, #86868B)" }}>
                                    {items.length}
                                </span>
                            </div>

                            <div className="space-y-1">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, item)}
                                        className={`
                      px-2.5 py-1.5 text-[11px] text-white font-medium cursor-grab active:cursor-grabbing
                      transition-all hover:brightness-110 hover:translate-x-0.5
                      ${item.isEvent ? "py-2 border-l-2" : ""}
                    `}
                                        style={{
                                            backgroundColor: item.color,
                                            borderRadius: "10px",
                                            borderLeftColor: item.isEvent ? "rgba(255,255,255,0.4)" : undefined,
                                        }}
                                    >
                                        {item.text.map((seg, i) =>
                                            typeof seg === "string" ? (
                                                <span key={i} className="mr-0.5">{seg}</span>
                                            ) : (
                                                <span
                                                    key={i}
                                                    className="bg-black/20 px-1 py-0.5 rounded text-[9px] mx-0.5"
                                                >
                                                    {seg.l}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BlockPalette;
