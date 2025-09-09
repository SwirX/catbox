import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash } from "lucide-react";
import KeyValueModal from "./KeyValueModal";

function indexToLetters(index) {
    let result = "";
    while (index >= 0) {
        result = String.fromCharCode((index % 26) + 97) + result;
        index = Math.floor(index / 26) - 1;
    }
    return result;
}

export default function StructRenderer({ struct, structName, onChange, structIndex }) {
    const [expanded, setExpanded] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const handleAddField = (field) => {
        const newStruct = { ...struct };
        if (field.value === "") {
            newStruct[field.key || `item_${indexToLetters(Object.keys(newStruct).length)}`] = {};
        } else {
            newStruct[field.key] = field.value;
        }
        onChange(newStruct);
    };

    const handleDeleteField = (key) => {
        const newStruct = { ...struct };
        delete newStruct[key];
        onChange(newStruct);
    };

    return (
        <div className="ml-4 border-l pl-2">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setExpanded(!expanded)}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <span className="font-bold text-indigo-500">
                    {structName || `item_${indexToLetters(structIndex)}`}
                </span>
                <button
                    onClick={() => setModalOpen(true)}
                    className="ml-auto p-1 rounded bg-green-500 text-white"
                >
                    <Plus size={14} />
                </button>
            </div>

            {expanded && (
                <div className="space-y-2">
                    {Object.entries(struct).map(([k, v], idx) => (
                        <div key={k} className="flex items-start gap-2">
                            <span className="font-mono">{k}:</span>
                            {typeof v === "object" ? (
                                <StructRenderer
                                    struct={v}
                                    structName={k}
                                    structIndex={idx}
                                    onChange={(newSub) =>
                                        onChange({ ...struct, [k]: newSub })
                                    }
                                />
                            ) : (
                                <span>{v}</span>
                            )}
                            <button
                                onClick={() => handleDeleteField(k)}
                                className="ml-auto p-1 rounded bg-red-500 text-white"
                            >
                                <Trash size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <KeyValueModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleAddField}
            />
        </div>
    );
}
