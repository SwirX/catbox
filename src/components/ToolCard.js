import { Link } from "react-router-dom";

export default function ToolCard({ icon, title, description, path }) {
    return (
        <Link
            to={path}
            className="group relative flex flex-col p-6 h-full bg-white dark:bg-[#1C1C1E] rounded-3xl border border-gray-100 dark:border-[#2C2C2E] hover:border-apple-blue/50 dark:hover:border-apple-blue/50 transition-all duration-300 hover:shadow-2xl hover:shadow-apple-blue/10 hover:-translate-y-1 block"
        >
            <div className="mb-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-apple-base dark:text-white group-hover:bg-apple-blue group-hover:text-white transition-colors duration-300 shadow-sm">
                    {icon}
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-gray-100 group-hover:text-apple-blue transition-colors mb-2">
                    {title}
                </h3>
                <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center text-apple-blue font-medium text-sm opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Open Tool &rarr;
            </div>
        </Link>
    );
}