import { Link } from "react-router-dom";

export default function ToolCard({ icon, title, description, path }) {
    return (
        <Link
            to={path}
            className="group relative flex flex-col p-6 h-full bg-surface rounded-3xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1 block"
        >
            <div className="mb-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary text-text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                    {icon}
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors mb-2">
                    {title}
                </h3>
                <p className="text-base text-text-secondary leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center text-accent font-medium text-sm opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Open Tool &rarr;
            </div>
        </Link>
    );
}