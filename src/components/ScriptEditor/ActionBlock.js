import React, { memo } from "react";
import BlockInput from "./BlockInput";
import { CircleButton } from "./Icon";
import { ACTION_TYPES, STYLING } from "./Constants";

const ActionBlock = memo(({ action, onUpdate, onDelete, onDuplicate, onContextMenu, onDragStart, index }) => {
    const def = ACTION_TYPES[action.id] || { text: ["Unknown"], color: "#333" };

    const handleValueChange = (segmentIndex, newValue) => {
        const newText = [...action.text];
        const segment = newText[segmentIndex];
        newText[segmentIndex] = {
            value: newValue,
            t: segment.t,
            l: segment.l
        };
        onUpdate({ ...action, text: newText });
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, action, "action");
    };

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 my-1 text-white text-xs font-medium
        select-none cursor-grab active:cursor-grabbing transition-all hover:brightness-110"
            style={{
                backgroundColor: def.color,
                borderRadius: STYLING.borderRadiusSm,
            }}
            draggable
            onDragStart={(e) => onDragStart(e, index, action)}
            onContextMenu={handleRightClick}
        >
            <div className="flex items-center flex-1 min-w-0 flex-wrap">
                {action.text.map((segment, i) => {
                    if (typeof segment === "string") {
                        return <span key={i} className="mr-1 whitespace-nowrap">{segment}</span>;
                    } else {
                        return (
                            <BlockInput
                                key={i}
                                type={segment.t}
                                label={segment.l}
                                value={segment.value || ""}
                                onChange={(val) => handleValueChange(i, val)}
                            />
                        );
                    }
                })}
            </div>

            <div className="flex gap-1 ml-1 flex-shrink-0">
                <CircleButton
                    icon="duplicate"
                    title="Duplicate"
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="w-5 h-5"
                />
                <CircleButton
                    icon="delete"
                    title="Delete"
                    danger
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="w-5 h-5"
                />
            </div>
        </div>
    );
});

export default ActionBlock;
