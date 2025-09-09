import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BulkEditModal({ isOpen, onClose, songs, onBulkUpdate }) {
    const [selectedArtist, setSelectedArtist] = useState("");
    const [newDecal, setNewDecal] = useState("");
    const [newArtist, setNewArtist] = useState("");

    const artists = [...new Set(songs.map(s => s.artist).filter(Boolean))];

    const handleApply = () => {
        if (!selectedArtist) return;

        onBulkUpdate(selectedArtist, { decal: newDecal, artist: newArtist });
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
                        <h2 className="text-xl font-bold mb-4">Bulk Edit Songs</h2>

                        <div className="space-y-3">
                            <select
                                value={selectedArtist}
                                onChange={(e) => setSelectedArtist(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500"
                            >
                                <option value="">Select Artist</option>
                                {artists.map(artist => (
                                    <option key={artist} value={artist}>
                                        {artist}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="New Decal (optional)"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                value={newDecal}
                                onChange={(e) => setNewDecal(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Edit Name (optional)"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                value={newArtist}
                                onChange={(e) => setNewArtist(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-400 text-white"
                            >
                                Apply
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
