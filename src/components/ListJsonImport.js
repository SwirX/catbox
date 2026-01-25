import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function JsonImportModal({ isOpen, onClose, onImport, title }) {
    const [rawJson, setRawJson] = useState("");

    useEffect(() => {
        if (isOpen) setRawJson("");
    }, [isOpen]);

    const handleImport = () => {
        try {
            onImport(rawJson);
            onClose();
        } catch {
            alert("Invalid JSON");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-surface rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-border"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-text-primary">{title || "Import JSON"}</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-hover transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                className="w-full h-80 p-4 rounded-2xl bg-primary border-2 border-transparent focus:border-accent focus:bg-surface text-sm font-mono text-text-primary focus:outline-none transition-all resize-none custom-scrollbar"
                                value={rawJson}
                                onChange={(e) => setRawJson(e.target.value)}
                                placeholder="Paste your JSON here..."
                                spellCheck={false}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md">
                                {rawJson.length} chars
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-8 py-2.5 rounded-xl font-bold bg-accent text-white hover:bg-accent/80 shadow-lg shadow-accent/30 transition-all active:scale-95"
                            >
                                Import Data
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
