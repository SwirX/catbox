import useEffect from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewJsonModal({ isOpen, onClose, jsonContent }) {
    useEffect(() => {
        if (isOpen && jsonContent) {
            navigator.clipboard.writeText(jsonContent).catch(() => { });
        }
    }, [isOpen, jsonContent]);

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
                        className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl shadow-xl relative"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                    >
                        <h2 className="text-xl font-bold mb-4">Generated JSON</h2>
                        <textarea
                            className="w-full h-72 p-3 border rounded resize-none dark:bg-gray-800 dark:text-white"
                            value={jsonContent}
                            readOnly
                        ></textarea>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            JSON copied to clipboard automatically!
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
