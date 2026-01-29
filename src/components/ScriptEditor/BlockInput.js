import React from "react";

const BlockInput = ({
    type,
    value,
    onChange,
    label,
    className = "",
    isHighlighted = false,
    isNeonHighlighted = false,
}) => {
    const handleChange = (e) => {
        onChange(e.target.value);
    };

    const baseStyle = `
    mx-1 px-2 py-1 text-white border-0 outline-none
    bg-black/20 hover:bg-black/30 focus:bg-black/40
    transition-colors duration-150
  `;

    // Highlight styles
    const highlightStyle = isNeonHighlighted
        ? {
            borderRadius: "8px",
            boxShadow: "0 0 10px #00ff88, 0 0 20px #00ff88, inset 0 0 10px rgba(0, 255, 136, 0.3)",
            outline: "2px solid #00ff88",
            backgroundColor: "rgba(0, 255, 136, 0.3)",
        }
        : isHighlighted
            ? {
                borderRadius: "8px",
                boxShadow: "0 0 8px rgba(0, 255, 136, 0.5)",
                outline: "1px solid rgba(0, 255, 136, 0.6)",
            }
            : { borderRadius: "8px" };

    if (type === "number") {
        return (
            <input
                type="text"
                value={value || ""}
                onChange={handleChange}
                className={`${baseStyle} w-14 text-center ${className}`}
                style={highlightStyle}
                placeholder="0"
            />
        );
    }

    if (type === "boolean") {
        return (
            <select
                value={value || "true"}
                onChange={handleChange}
                className={`${baseStyle} ${className}`}
                style={highlightStyle}
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        );
    }

    if (type === "tuple" && Array.isArray(value)) {
        return (
            <div className="flex items-center gap-1 mx-1 px-1 bg-black/10 rounded-lg">
                <span className="text-[10px] opacity-50 px-0.5">(</span>
                {value.map((item, idx) => (
                    <React.Fragment key={idx}>
                        <BlockInput
                            type={item.t}
                            label={item.l}
                            value={item.value}
                            onChange={(newVal) => {
                                const newValue = [...value];
                                newValue[idx] = { ...item, value: newVal };
                                onChange(newValue);
                            }}
                        />
                        {idx < value.length - 1 && <span className="opacity-30">,</span>}
                    </React.Fragment>
                ))}
                <span className="text-[10px] opacity-50 px-0.5">)</span>
            </div>
        );
    }

    return (
        <input
            type="text"
            value={value || ""}
            onChange={handleChange}
            className={`${baseStyle} min-w-[50px] max-w-[120px] ${className}`}
            style={highlightStyle}
            placeholder={label || ""}
        />
    );
};

export default BlockInput;
