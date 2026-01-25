import ToolCard from "../components/ToolCard";
import { Code, FileJson, ImageIcon, Send, WholeWordIcon, Type, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-16 py-12">
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-6 max-w-4xl mx-auto"
            >
                <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-accent to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center text-white rotate-[-10deg] hover:rotate-0 transition-transform duration-500">
                        <Layers size={40} />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-text-primary">
                    Welcome to <span className="text-accent">Catbox</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                    Premium tools for your Catweb workflow. <br className="hidden md:block" />Designed for speed, built for creators.
                </p>
            </motion.section>

            <motion.section
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">All Tools</h2>
                    {/* Optional: Add filter or view options here */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <motion.div variants={item}>
                        <ToolCard
                            icon={<ImageIcon size={24} />}
                            title="Image to RichText"
                            description="Advanced RLE Image Exporter. Convert images to optimized HEX-encoded text for Roblox."
                            path="/image-exporter-v3"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <ToolCard
                            icon={<WholeWordIcon size={24} />}
                            title="List Importer"
                            description="Create & export lists to valid Catweb JSON with high precision."
                            path="/list-importer"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <ToolCard
                            icon={<Code size={24} />}
                            title="Script Visualizer"
                            description="Visually edit and understand Catweb scripts with a drag-and-drop interface."
                            path="/script-editor"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <ToolCard
                            icon={<Type size={24} />}
                            title="Rich Text Editor"
                            description="Create and export Roblox-compatible rich text formatted perfectly (XML)."
                            path="/rich-text-editor"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <ToolCard
                            icon={<FileJson size={24} />}
                            title="JSON Cleaner"
                            description="Clean, minify, and transform JSON data structure for game use."
                            path="/json-cleaner"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <ToolCard
                            icon={<Send size={24} />}
                            title="Lyra API Builder"
                            description="Interactive URL builder for The Lyra API. Construct requests visually."
                            path="/lyra-api-builder"
                        />
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}