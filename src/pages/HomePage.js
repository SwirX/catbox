import ToolCard from "../components/ToolCard";
import { FileJson, ImageIcon, Send, WholeWordIcon } from "lucide-react";

export default function HomePage() {
    return (
        <div className="space-y-12">
            <section className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Welcome to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        Catbox
                    </span>
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-slate-600 dark:text-slate-400">
                    Your unified toolbox for everything Catweb. More tools coming soon!
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">All Tools</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ToolCard
                        icon={<WholeWordIcon size={24} />}
                        title="List Importer"
                        description="Create & export lists to valid Catweb JSON."
                        path="/list-importer"
                    />
                    <ToolCard
                        icon={<Send size={24} />}
                        title="Lyra Api Builder"
                        description="Interactive URL builder for The Lyra API"
                        path="/lyra-api-builder"
                    />
                    <ToolCard
                        icon={<ImageIcon size={24} />}
                        title="Image Exporter"
                        description="An Image Exporter"
                        path="/image-exporter"
                    />
                    <ToolCard
                        icon={<ImageIcon size={24} />}
                        title="Image Exporter V3"
                        description="An Image Exporter (RLE)"
                        path="/image-exporter-v3"
                    />
                    <ToolCard
                        icon={<FileJson size={24} />}
                        title="JSON Cleaner"
                        description="Clean and transform JSON data"
                        path="/json-cleaner"
                    />
                </div>
            </section>
        </div>
    );
}