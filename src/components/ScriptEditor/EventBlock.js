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
}) => {
    const def = EVENT_TYPES[event.id] || { text: ["Unknown Event"], color: "#333" };

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
                    />
                </div>
            );
            if (shape === "opener" || shape === "else") indent++;
            return el;
        });
    };

    return (
        <div
            className="absolute flex flex-col w-max min-w-[220px] select-none transition-transform duration-75"
            style={{
                left: x,
                top: y,
                borderRadius: STYLING.borderRadius,
                boxShadow: isDragging ? STYLING.shadow : STYLING.shadowSm,
                transform: isDragging ? "scale(1.02)" : "scale(1)",
                zIndex: isDragging ? 100 : 1,
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
                    {event.text.map((seg, i) =>
                        typeof seg === "string" ? (
                            <span key={i} className="mr-1 whitespace-nowrap">{seg}</span>
                        ) : (
                            <BlockInput
                                key={i}
                                type={seg.t}
                                label={seg.l}
                                value={seg.value || ""}
                                onChange={(val) => handleValueChange(i, val)}
                            />
                        )
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
