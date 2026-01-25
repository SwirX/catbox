import React from "react";
import { STYLING } from "./Constants";

const BlockInput = ({ type, value, onChange, label, className = "" }) => {
    const handleChange = (e) => {
        onChange(e.target.value);
    };

    const baseStyle = `
    mx-1 px-2 py-1 text-white border-0 outline-none
    bg-black/20 hover:bg-black/30 focus:bg-black/40
    transition-colors duration-150
  `;

    if (type === "number") {
        return (
            <input
                type="number"
                value={value || ""}
                onChange={handleChange}
                className={`${baseStyle} w-14 text-center ${className}`}
                style={{ borderRadius: "8px" }}
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
                style={{ borderRadius: "8px" }}
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        );
    }

    return (
        <input
            type="text"
            value={value || ""}
            onChange={handleChange}
            className={`${baseStyle} min-w-[50px] max-w-[120px] ${className}`}
            style={{ borderRadius: "8px" }}
            placeholder={label || ""}
        />
    );
};

export default BlockInput;
