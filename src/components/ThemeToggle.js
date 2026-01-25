import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

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
            className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2 dark:focus:ring-offset-[#1C1C1E]"
            aria-label="Toggle Theme"
        >
            <div className={`absolute transition-all duration-500 rotate-0 scale-100 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'opacity-100'}`}>
                <Sun size={20} className="text-orange-500" />
            </div>
            <div className={`absolute transition-all duration-500 rotate-90 scale-0 opacity-0 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : ''}`}>
                <Moon size={20} className="text-apple-blue" />
            </div>
        </button>
    );
}
