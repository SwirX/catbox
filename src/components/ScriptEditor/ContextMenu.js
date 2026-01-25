import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const ContextMenu = ({ x, y, options, onClose }) => {
    const menuRef = useRef(null);
    const [submenuOpen, setSubmenuOpen] = useState(null);
    const [menuPos, setMenuPos] = useState({ x, y });

    useEffect(() => {
        // Adjust position to stay within viewport
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            let newX = x;
            let newY = y;
            if (x + rect.width > window.innerWidth) {
                newX = window.innerWidth - rect.width - 10;
            }
            if (y + rect.height > window.innerHeight) {
                newY = window.innerHeight - rect.height - 10;
            }
            setMenuPos({ x: newX, y: newY });
        }
    }, [x, y]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[180px] py-1.5 rounded-xl shadow-2xl border"
            style={{
                left: menuPos.x,
                top: menuPos.y,
                backgroundColor: "#1C1C1E",
                borderColor: "#38383A",
            }}
        >
            {options.map((option, i) => (
                <div key={i} className="relative">
                    {option.submenu ? (
                        <div
                            className="relative"
                            onMouseEnter={() => setSubmenuOpen(i)}
                            onMouseLeave={() => setSubmenuOpen(null)}
                        >
                            <button
                                className={`
                  w-full px-3 py-2 text-left text-sm font-medium flex items-center gap-2
                  transition-colors duration-150 hover:bg-white/10
                  ${option.danger ? "text-red-400" : "text-white"}`}
                            >
                                {option.icon && <Icon name={option.icon} size={14} className="opacity-60" />}
                                <span className="flex-1">{option.label}</span>
                                <span className="text-xs opacity-40">▶</span>
                            </button>

                            {submenuOpen === i && (
                                <div
                                    className="absolute left-full top-0 ml-1 min-w-[220px] max-h-[300px] overflow-y-auto py-1.5 rounded-xl shadow-2xl border"
                                    style={{
                                        backgroundColor: "#1C1C1E",
                                        borderColor: "#38383A",
                                    }}
                                >
                                    {option.submenu.map((sub, j) => (
                                        <button
                                            key={j}
                                            onClick={() => {
                                                sub.onClick();
                                                onClose();
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs font-medium flex items-center gap-2
                        transition-colors duration-150 hover:bg-white/10 text-white"
                                        >
                                            {sub.category && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10">
                                                    {sub.category}
                                                </span>
                                            )}
                                            <span className="truncate">{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                if (option.onClick) option.onClick();
                                onClose();
                            }}
                            disabled={option.disabled}
                            className={`
                w-full px-3 py-2 text-left text-sm font-medium flex items-center gap-2
                transition-colors duration-150
                ${option.danger ? "text-red-400 hover:bg-red-500/20" : "text-white hover:bg-white/10"}
                ${option.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {option.icon && <Icon name={option.icon} size={14} className="opacity-60" />}
                            {option.label}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ContextMenu;
