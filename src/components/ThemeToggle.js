import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        if (theme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", theme);
    }, [theme]);


    const toggle = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggle}
            className="px-3 py-1 border rounded text-sm bg-gray-200 dark:bg-gray-800 dark:text-gray-100"
        >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
    );
}
