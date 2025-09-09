import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImportModal({ isOpen, onClose, onImport, autoPaste }) {
    const [jsonText, setJsonText] = useState("");

    useEffect(() => {
        if (autoPaste && navigator.clipboard) {
            navigator.clipboard.readText().then((text) => {
                setJsonText(text);
            }).catch(() => { });
        }
    }, [isOpen, autoPaste]);

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonText);
            onImport(parsed);
            onClose();
        } catch (err) {
            alert("Invalid JSON. Make sure it’s the correct Catweb song JSON.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
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
                        <h2 className="text-xl font-bold mb-4">Import Songs JSON</h2>
                        <textarea
                            className="w-full h-64 p-3 border rounded resize-none dark:bg-gray-800 dark:text-white"
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-400 text-white"
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
