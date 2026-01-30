import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Home, Layers } from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-accent selection:text-white">
            <SpeedInsights />
            <header className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-border transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="group flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-300">
                                <Layers size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-text-primary group-hover:opacity-80 transition-opacity">
                                Catbox
                            </span>
                        </Link>

                        <nav className="flex items-center gap-2">
                            <Link
                                to="/"
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                                ${location.pathname === "/"
                                        ? "bg-surface text-accent shadow-sm"
                                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                    }`}
                            >
                                <Home size={18} />
                                <span className="hidden sm:inline">Home</span>
                            </Link>

                            <div className="w-px h-6 bg-border mx-2" />

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
