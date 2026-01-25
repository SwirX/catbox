import { useState, useRef, useEffect } from "react";
import { Check, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
    const { theme, setTheme, definedThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const activeThemeObj = definedThemes[theme] || definedThemes['apple_light'];

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={toggleOpen}
                className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border hover:bg-surface-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-[#1C1C1E]"
                aria-label="Change Theme"
            >
                <div className="text-text-primary transition-transform duration-300 group-hover:scale-110">
                    {activeThemeObj.type === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 p-2 rounded-2xl bg-surface border border-border shadow-xl z-50 backdrop-blur-xl"
                    >
                        <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                            Select Theme
                        </div>
                        <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {Object.entries(definedThemes).map(([key, themeData]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setTheme(key);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${theme === key
                                        ? "bg-accent text-white"
                                        : "text-text-primary hover:bg-surface-hover"
                                        }`}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                        style={{ backgroundColor: themeData.colors.background }}
                                    />
                                    <span className="flex-1 text-left">{themeData.name}</span>
                                    {theme === key && <Check size={16} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
