import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KeyValueModal({ isOpen, onClose, onSave, editingField, askName = false }) {
    const [keyName, setKeyName] = useState("");
    const [value, setValue] = useState("");

    useEffect(() => {
        if (editingField) {
            setKeyName(editingField.key);
            setValue(editingField.value);
        } else {
            setKeyName("");
            setValue("");
        }
    }, [editingField, isOpen]);

    const handleSave = () => {
        if (!keyName.trim() && askName) return;
        onSave({ key: keyName, value });
        onClose();
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
                        className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-xl relative"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                    >
                        <h2 className="text-xl font-bold mb-4">
                            {editingField ? "Edit Field" : "Add Field"}
                        </h2>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder={askName ? "Struct/Table Name" : "Key"}
                                className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                                value={keyName}
                                onChange={(e) => setKeyName(e.target.value)}
                                disabled={!!editingField}
                            />
                            {!askName && (
                                <input
                                    type="text"
                                    placeholder="Value (leave empty if struct)"
                                    className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded bg-green-500 hover:bg-green-400 dark:bg-green-600 dark:hover:bg-green-500 text-white"
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
