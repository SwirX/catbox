import { useState, useRef, useEffect } from "react";
import { Check, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
    const { theme, setTheme, definedThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

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
                        className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[80vh] flex flex-col rounded-2xl bg-surface border border-border shadow-2xl z-50 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-md">
                            <h3 className="text-sm font-bold text-text-primary">Select Theme</h3>
                            <p className="text-xs text-text-secondary mt-0.5">Choose a visual style</p>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar p-2 grid grid-cols-1 gap-1">
                            {Object.entries(definedThemes).map(([key, themeData]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setTheme(key);
                                        setIsOpen(false);
                                    }}
                                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all border border-transparent ${theme === key
                                            ? "bg-accent/10 border-accent/50 ring-1 ring-accent/20"
                                            : "hover:bg-surface-hover border-transparent"
                                        }`}
                                >
                                    <div className="flex -space-x-1 shrink-0">
                                        <div className="w-6 h-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: themeData.colors.background }} title="Background" />
                                        <div className="w-6 h-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: themeData.colors.surface }} title="Surface" />
                                        <div className="w-6 h-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: themeData.colors.accent }} title="Accent" />
                                    </div>

                                    <div className="flex-1 text-left min-w-0">
                                        <div className={`text-sm font-semibold truncate ${theme === key ? 'text-accent' : 'text-text-primary'}`}>
                                            {themeData.name}
                                        </div>
                                    </div>

                                    {theme === key && (
                                        <div className="text-accent shrink-0 bg-accent/10 p-1 rounded-full">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
