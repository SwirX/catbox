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
                    className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-gray-900 dark:text-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg shadow-xl relative"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                    >
                        <h2 className="text-xl font-bold mb-4">{title || "Import JSON"}</h2>
                        <textarea
                            className="w-full h-64 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500"
                            value={rawJson}
                            onChange={(e) => setRawJson(e.target.value)}
                            placeholder="Paste your JSON here..."
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-4 py-2 rounded bg-green-500 hover:bg-green-400 dark:bg-green-600 dark:hover:bg-green-500 text-white"
                            >
                                Import
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
