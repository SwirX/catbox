import React from "react";
import { ICONS, STYLING } from "./Constants";

export const Icon = ({ name, size = 18, className = "", style = {} }) => {
    const path = ICONS[name];
    if (!path) return null;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d={path} />
        </svg>
    );
};

export const PillButton = ({ icon, label, onClick, variant = "default", className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`
        group flex items-center gap-0 h-9 px-3 rounded-full
        transition-all duration-200 overflow-hidden
        hover:brightness-110
        ${className}
      `}
            style={{
                backgroundColor: "var(--surface)",
                color: "var(--text)",
                boxShadow: STYLING.shadow,
            }}
            title={label}
        >
            <Icon name={icon} size={16} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-200 whitespace-nowrap text-sm font-medium">
                {label}
            </span>
        </button>
    );
};

export const IconPill = ({ icon, onClick, title, className = "" }) => (
    <button
        onClick={onClick}
        className={`
      flex items-center justify-center w-9 h-9 rounded-full
      hover:brightness-110 transition-all duration-150
      ${className}
    `}
        style={{
            backgroundColor: "var(--surface)",
            color: "var(--text)",
            boxShadow: STYLING.shadowSm,
        }}
        title={title}
    >
        <Icon name={icon} size={16} />
    </button>
);

export const CircleButton = ({ icon, onClick, title, danger = false, className = "" }) => (
    <button
        onClick={onClick}
        className={`
      flex items-center justify-center rounded-full
      transition-all duration-150 flex-shrink-0
      ${danger ? "bg-red-500/20 hover:bg-red-500/40 text-red-400" : "bg-white/10 hover:bg-white/20 text-white/80"}
      ${className}
    `}
        style={{ width: "24px", height: "24px" }}
        title={title}
    >
        <Icon name={icon} size={12} />
    </button>
);

export default Icon;
