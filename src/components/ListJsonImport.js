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
                        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-[#2C2C2E]"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title || "Import JSON"}</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                className="w-full h-80 p-4 rounded-2xl bg-gray-50 dark:bg-[#000000]/30 border-2 border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-[#000000] text-sm font-mono text-gray-900 dark:text-gray-200 focus:outline-none transition-all resize-none custom-scrollbar"
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
                                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-8 py-2.5 rounded-xl font-bold bg-apple-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
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
