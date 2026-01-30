import React from "react";
import BlockInput from "./BlockInput";
import ActionBlock from "./ActionBlock";
import { CircleButton } from "./Icon";
import { EVENT_TYPES, COLORS, ACTION_TYPES, STYLING } from "./Constants";

const EventBlock = ({
    event,
    onUpdate,
    x,
    y,
    onDragStart,
    onActionDrop,
    onActionUpdate,
    onActionDelete,
    onActionDuplicate,
    onContextMenu,
    onDelete,
    onDuplicate,
    isDragging,
    highlightedInputs = [],
    neonHighlight = null,
}) => {
    const def = EVENT_TYPES[event.id] || { text: ["Unknown Event"], color: "#333" };

    const eventHighlights = highlightedInputs.filter(h => h.type === "event");
    const overrideHighlights = highlightedInputs.filter(h => h.type === "override");
    const hasNeonEventHighlight = neonHighlight && neonHighlight.type === "event";
    const hasNeonOverrideHighlight = neonHighlight && neonHighlight.type === "override";

    const handleValueChange = (segmentIndex, newValue) => {
        const newText = [...event.text];
        const segment = newText[segmentIndex];
        newText[segmentIndex] = {
            value: newValue,
            t: segment.t,
            l: segment.l
        };
        onUpdate({ ...event, text: newText });
    };

    const handleOverrideChange = (overrideIndex, newValue) => {
        const newOverrides = [...(event.variable_overrides || [])];
        newOverrides[overrideIndex] = {
            ...newOverrides[overrideIndex],
            value: newValue
        };
        onUpdate({ ...event, variable_overrides: newOverrides });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const data = e.dataTransfer.getData("action");
        if (data) {
            const actionData = JSON.parse(data);
            onActionDrop(event.globalid, actionData);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, event, "event");
    };

    const handleMouseDown = (e) => {
        if (e.button === 0) {
            e.stopPropagation();
            onDragStart(event.globalid, x, y, e.clientX, e.clientY);
        }
    };

    const renderActions = () => {
        if (!event.actions) return null;
        let indent = 0;
        return event.actions.map((action, idx) => {
            const typeDef = ACTION_TYPES[action.id];
            const shape = typeDef?.shape;
            if (shape === "closer" || shape === "else") indent = Math.max(0, indent - 1);

            const actionHighlights = highlightedInputs.filter(h => h.type === "action" && h.actionIndex === idx);
            const hasNeonActionHighlight = neonHighlight && neonHighlight.type === "action" && neonHighlight.actionIndex === idx;

            const el = (
                <div key={action.globalid || idx} style={{ marginLeft: `${indent * 12}px` }}>
                    <ActionBlock
                        index={idx}
                        action={action}
                        onUpdate={(u) => onActionUpdate(event.globalid, idx, u)}
                        onDelete={() => onActionDelete(event.globalid, idx)}
                        onDuplicate={() => onActionDuplicate(event.globalid, idx)}
                        onContextMenu={(e, item, type) => onContextMenu(e, item, type, event.globalid, idx)}
                        onDragStart={(e, i, a) => {
                            e.dataTransfer.setData("dragType", "action_move");
                            e.dataTransfer.setData("sourceEventId", event.globalid);
                            e.dataTransfer.setData("actionIndex", String(i));
                            e.stopPropagation();
                        }}
                        highlightedInputs={actionHighlights}
                        neonHighlight={hasNeonActionHighlight ? neonHighlight : null}
                    />
                </div>
            );
            if (shape === "opener" || shape === "else") indent++;
            return el;
        });
    };

    const hasAnyHighlight = highlightedInputs.length > 0;

    return (
        <div
            className="absolute flex flex-col w-max min-w-[220px] select-none transition-transform duration-75"
            style={{
                left: x,
                top: y,
                borderRadius: STYLING.borderRadius,
                boxShadow: hasAnyHighlight
                    ? "0 0 15px rgba(0, 255, 136, 0.5), " + STYLING.shadow
                    : isDragging ? STYLING.shadow : STYLING.shadowSm,
                transform: isDragging ? "scale(1.02)" : "scale(1)",
                zIndex: isDragging ? 100 : 1,
                outline: hasAnyHighlight ? "2px solid rgba(0, 255, 136, 0.5)" : "none",
            }}
            onContextMenu={handleRightClick}
        >
            <div
                className="flex items-center gap-2 px-3 py-2.5 text-white font-semibold text-sm cursor-grab active:cursor-grabbing"
                style={{
                    backgroundColor: def.color || COLORS.events,
                    borderRadius: `${STYLING.borderRadius} ${STYLING.borderRadius} 0 0`,
                }}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {event.text.map((seg, i) => {
                        const isHighlighted = eventHighlights.some(h => h.segmentIndex === i);
                        const isNeonHighlighted = hasNeonEventHighlight && neonHighlight.segmentIndex === i;

                        return typeof seg === "string" ? (
                            <span key={i} className="mr-1 whitespace-nowrap">{seg}</span>
                        ) : (
                            <BlockInput
                                key={i}
                                type={seg.t}
                                label={seg.l}
                                value={seg.value || ""}
                                onChange={(val) => handleValueChange(i, val)}
                                isHighlighted={isHighlighted}
                                isNeonHighlighted={isNeonHighlighted}
                            />
                        );
                    })}

                    {event.id === "6" && event.variable_overrides && event.variable_overrides.length > 0 && (
                        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
                            <span className="text-[10px] opacity-70 uppercase font-bold">Args:</span>
                            {event.variable_overrides.map((override, idx) => {
                                const isHighlighted = overrideHighlights.some(h => h.overrideIndex === idx);
                                const isNeonHighlighted = hasNeonOverrideHighlight && neonHighlight.overrideIndex === idx;

                                return (
                                    <BlockInput
                                        key={idx}
                                        type="string"
                                        label="arg"
                                        value={override.value || ""}
                                        onChange={(val) => handleOverrideChange(idx, val)}
                                        isHighlighted={isHighlighted}
                                        isNeonHighlighted={isNeonHighlighted}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex gap-1 ml-2 flex-shrink-0">
                    <CircleButton
                        icon="duplicate"
                        title="Duplicate"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(event.globalid); }}
                    />
                    <CircleButton
                        icon="delete"
                        title="Delete"
                        danger
                        onClick={(e) => { e.stopPropagation(); onDelete(event.globalid); }}
                    />
                </div>
            </div>

            <div
                className="p-2 flex flex-col min-h-[40px]"
                style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: `0 0 ${STYLING.borderRadius} ${STYLING.borderRadius}`,
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {renderActions()}
                {(!event.actions || event.actions.length === 0) && (
                    <div className="text-center py-3 text-xs italic opacity-30" style={{ color: "var(--secondary)" }}>
                        Drag actions here
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventBlock;
