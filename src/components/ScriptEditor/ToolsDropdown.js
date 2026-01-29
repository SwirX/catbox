import React from "react";
import Icon from "./Icon";
import { STYLING } from "./Constants";

const TOOLS = [
    { id: "multireplace", icon: "search", label: "Find & Replace", shortcut: "Ctrl+F" },
    { id: "macro", icon: "macro", label: "Macro Replace" },
    { id: "deobfuscate", icon: "deobfuscate", label: "De-obfuscator" },
];

export const ToolsDropdown = ({ isOpen, onToggle, activeTool, onToolSelect }) => {
    return (
        <div className="flex items-center gap-1.5">
            {/* Dropdown Toggle Button */}
            <button
                onClick={onToggle}
                className={`
                    group flex items-center gap-1.5 h-9 px-3 rounded-full
                    transition-all duration-200 overflow-hidden
                    hover:brightness-110
                `}
                style={{
                    backgroundColor: isOpen ? "var(--accent)" : "var(--surface)",
                    color: isOpen ? "#ffffff" : "var(--text)",
                    boxShadow: STYLING.shadow,
                }}
                title="Script Tools"
            >
                <Icon name="tools" size={16} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] group-hover:ml-0.5 transition-all duration-200 whitespace-nowrap text-sm font-medium">
                    Tools
                </span>
                <Icon
                    name={isOpen ? "chevronUp" : "chevronDown"}
                    size={12}
                    className="opacity-60"
                />
            </button>

            {/* Tool buttons shown inline when open */}
            {isOpen && TOOLS.map((tool) => (
                <ToolPill
                    key={tool.id}
                    icon={tool.icon}
                    label={tool.label}
                    shortcut={tool.shortcut}
                    isActive={activeTool === tool.id}
                    onClick={() => onToolSelect(tool.id)}
                />
            ))}
        </div>
    );
};

const ToolPill = ({ icon, label, shortcut, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group flex items-center gap-1.5 h-9 px-3 rounded-full
                transition-all duration-200 whitespace-nowrap
                hover:brightness-110
            `}
            style={{
                backgroundColor: isActive ? "var(--accent)" : "var(--surface)",
                color: isActive ? "#ffffff" : "var(--text)",
                boxShadow: STYLING.shadowSm,
            }}
            title={shortcut ? `${label} (${shortcut})` : label}
        >
            <Icon name={icon} size={14} />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

export default ToolsDropdown;
