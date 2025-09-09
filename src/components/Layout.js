import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Home } from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function Layout({ children }) {
    const location = useLocation();
    <SpeedInsights />
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
            <header className="sticky top-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-2xl font-bold">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                                Catbox
                            </span>
                        </Link>

                        <nav className="flex items-center gap-4">
                            <Link
                                to="/"
                                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition
                  ${location.pathname === "/" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                            >
                                <Home size={16} />
                                Home
                            </Link>
                            <ThemeToggle />
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}