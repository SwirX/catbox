import { Link } from "react-router-dom";

export default function ToolCard({ icon, title, description, path }) {
    return (
        <Link
            to={path}
            className="group block p-6 bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    );
}