import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Home, Layers } from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-apple-blue selection:text-white">
            <SpeedInsights />
            <header className="sticky top-0 z-50 bg-[#F5F5F7]/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-gray-200 dark:border-[#2C2C2E] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="group flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-apple-blue flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Layers size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity">
                                Catbox
                            </span>
                        </Link>

                        <nav className="flex items-center gap-2">
                            <Link
                                to="/"
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                                ${location.pathname === "/"
                                        ? "bg-white dark:bg-[#2C2C2E] text-apple-blue shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#2C2C2E]/50 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <Home size={18} />
                                <span className="hidden sm:inline">Home</span>
                            </Link>

                            <div className="w-px h-6 bg-gray-300 dark:bg-[#38383A] mx-2" />

                            <ThemeToggle />
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
                {children}
            </main>
        </div>
    );
}