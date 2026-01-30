import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Figma, Download, Copy, Check, RefreshCw, Eye, ChevronRight, ChevronDown, AlertCircle, Info } from "lucide-react";

const ROBLOX_WIDTH = 1920;
const ROBLOX_HEIGHT = 1080;

const generateId = () => Math.random().toString(36).substr(2, 6);

const figmaColorToHex = (color) => {
    if (!color) return "#ffffff";
    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const convertNodeToCatWeb = (node, parentSize = { width: 1920, height: 1080 }, parentAbsolutePos = { x: 0, y: 0 }, rootSize = { width: 1920, height: 1080 }, useRobloxMode = false) => {
    if (!node) return null;

    const baseElement = {
        globalid: generateId(),
        alias: node.name || "Element",
        children: [],
    };

    const bounds = node.absoluteBoundingBox || node.absoluteRenderBounds || { x: parentAbsolutePos.x, y: parentAbsolutePos.y, width: 100, height: 100 };

    const absX = bounds.x;
    const absY = bounds.y;
    const width = bounds.width;
    const height = bounds.height;

    const relX = absX - parentAbsolutePos.x;
    const relY = absY - parentAbsolutePos.y;

    if (useRobloxMode) {
        const scaleFactorX = ROBLOX_WIDTH / rootSize.width;
        const scaleFactorY = ROBLOX_HEIGHT / rootSize.height;

        const scaleFactor = Math.min(scaleFactorX, scaleFactorY);

        const offsetX = Math.round(relX * scaleFactor);
        const offsetY = Math.round(relY * scaleFactor);
        const offsetWidth = Math.round(width * scaleFactor);
        const offsetHeight = Math.round(height * scaleFactor);

        baseElement.position = `{0,${offsetX}},{0,${offsetY}}`;
        baseElement.size = `{0,${offsetWidth}},{0,${offsetHeight}}`;
    } else {
        const scaleX = (relX / parentSize.width).toFixed(4);
        const scaleY = (relY / parentSize.height).toFixed(4);
        const sizeScaleX = (width / parentSize.width).toFixed(4);
        const sizeScaleY = (height / parentSize.height).toFixed(4);

        baseElement.position = `{${scaleX},0},{${scaleY},0}`;
        baseElement.size = `{${sizeScaleX},0},{${sizeScaleY},0}`;
    }

    if (width > 0 && height > 0) {
        baseElement.children.push({
            class: "UIAspectRatioConstraint",
            globalid: generateId(),
            ratio: (width / height).toFixed(3),
        });
    }

    if (node.fills && node.fills.length > 0 && node.fills[0].type === "SOLID") {
        baseElement.background_color = figmaColorToHex(node.fills[0].color);
        baseElement.background_transparency = String(1 - (node.fills[0].opacity || 1));
    }

    if (node.cornerRadius && node.cornerRadius > 0) {
        baseElement.children.push({
            class: "UICorner",
            globalid: generateId(),
            radius: `0,${Math.round(node.cornerRadius)}`,
        });
    }

    if (node.strokes && node.strokes.length > 0 && node.strokes[0].type === "SOLID") {
        baseElement.children.push({
            class: "UIStroke",
            globalid: generateId(),
            stroke_color: figmaColorToHex(node.strokes[0].color),
            stroke_thickness: String(node.strokeWeight || 1),
            stroke_transparency: String(1 - (node.strokes[0].opacity || 1)),
        });
    }

    switch (node.type) {
        case "FRAME":
        case "GROUP":
        case "COMPONENT":
        case "INSTANCE":
        case "RECTANGLE":
        case "ELLIPSE":
        case "POLYGON":
        case "STAR":
        case "VECTOR":
            baseElement.class = "Frame";
            break;

        case "TEXT":
            baseElement.class = "TextLabel";
            baseElement.text = node.characters || "";
            baseElement.font = "GothamBold";
            baseElement.font_size = String(Math.round(node.style?.fontSize || 14));
            baseElement.align_x = node.style?.textAlignHorizontal === "CENTER" ? "Center" :
                node.style?.textAlignHorizontal === "RIGHT" ? "Right" : "Left";
            baseElement.align_y = node.style?.textAlignVertical === "CENTER" ? "Center" :
                node.style?.textAlignVertical === "BOTTOM" ? "Bottom" : "Top";
            if (node.fills && node.fills.length > 0 && node.fills[0].type === "SOLID") {
                baseElement.font_color = figmaColorToHex(node.fills[0].color);
                delete baseElement.background_color;
            }
            baseElement.background_transparency = "1";
            break;

        case "IMAGE":
            baseElement.class = "ImageLabel";
            baseElement.image = "rbxassetid://0";
            baseElement.scale_type = "Fit";
            break;

        default:
            baseElement.class = "Frame";
    }

    if (node.children && node.children.length > 0) {
        const nodeSize = {
            width: width,
            height: height,
        };
        const nodeAbsPos = {
            x: absX,
            y: absY,
        };

        node.children.forEach((child) => {
            const convertedChild = convertNodeToCatWeb(child, nodeSize, nodeAbsPos, rootSize, useRobloxMode);
            if (convertedChild) {
                baseElement.children.push(convertedChild);
            }
        });
    }

    return baseElement;
};

const TreeNode = ({ node, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(depth < 2);
    const hasChildren = node.children && node.children.length > 0;

    const getTypeColor = (type) => {
        switch (type) {
            case "FRAME": return "text-blue-400";
            case "TEXT": return "text-green-400";
            case "RECTANGLE": return "text-yellow-400";
            case "IMAGE": return "text-purple-400";
            case "GROUP": return "text-cyan-400";
            case "COMPONENT": return "text-pink-400";
            case "INSTANCE": return "text-orange-400";
            default: return "text-text-secondary";
        }
    };

    return (
        <div className="select-none">
            <div
                className="flex items-center gap-1 py-1 px-2 rounded hover:bg-surface-hover cursor-pointer"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {hasChildren ? (
                    isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                    <span className="w-3.5" />
                )}
                <span className={`text-xs font-mono ${getTypeColor(node.type)}`}>
                    {node.type}
                </span>
                <span className="text-sm text-text-primary truncate ml-2">
                    {node.name}
                </span>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {node.children.map((child, idx) => (
                        <TreeNode key={child.id || idx} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FigmaExporter() {
    const [figmaUrl, setFigmaUrl] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [figmaData, setFigmaData] = useState(null);
    const [catwebJson, setCatwebJson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [useRobloxMode, setUseRobloxMode] = useState(false);

    const extractFileKey = (url) => {
        const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    const fetchFigmaData = useCallback(async () => {
        const fileKey = extractFileKey(figmaUrl);
        if (!fileKey) {
            setError("Invalid Figma URL. Please enter a valid Figma file URL.");
            return;
        }

        if (!accessToken) {
            setError("Please enter your Figma Personal Access Token.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
                headers: {
                    "X-Figma-Token": accessToken,
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Access denied. Check your access token and file permissions.");
                }
                throw new Error(`Figma API error: ${response.status}`);
            }

            const data = await response.json();
            setFigmaData(data);

            const firstPage = data.document?.children?.[0];
            const rootNode = firstPage?.children?.find(c => ["FRAME", "COMPONENT", "INSTANCE", "GROUP"].includes(c.type)) || firstPage;

            if (rootNode) {
                const origin = rootNode.absoluteBoundingBox || rootNode.absoluteRenderBounds || { x: 0, y: 0, width: 1920, height: 1080 };

                const baseSize = {
                    width: origin.width || 1920,
                    height: origin.height || 1080
                };

                const converted = convertNodeToCatWeb(rootNode, baseSize, origin, baseSize, useRobloxMode);
                if (converted) {
                    const catwebOutput = [
                        {
                            class: "Frame",
                            globalid: "root",
                            alias: data.name || "Imported Design",
                            size: "{1,0},{1,0}",
                            position: "{0,0},{0,0}",
                            background_color: "#1a1a1a",
                            children: converted.children && converted.children.length > 0 ? converted.children : [converted],
                        },
                    ];
                    setCatwebJson(catwebOutput);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [figmaUrl, accessToken, useRobloxMode]);

    const handleCopy = async () => {
        if (!catwebJson) return;
        try {
            await navigator.clipboard.writeText(JSON.stringify(catwebJson, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = () => {
        if (!catwebJson) return;
        const blob = new Blob([JSON.stringify(catwebJson, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${figmaData?.name || "figma-export"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 py-12">
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-6 max-w-4xl mx-auto"
            >
                <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 to-fuchsia-600 rounded-3xl shadow-2xl flex items-center justify-center text-white rotate-[-10deg] hover:rotate-0 transition-transform duration-500">
                        <Figma size={40} />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-text-primary">
                    Figma <span className="text-accent">Exporter</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                    Convert your Figma designs to CatWeb-compatible JSON.
                    <br className="hidden md:block" />
                    Import directly into CatWeb with proper structure.
                </p>
            </motion.section>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-6xl mx-auto"
            >
                <div className="bg-surface rounded-3xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Figma File URL
                                </label>
                                <input
                                    type="text"
                                    value={figmaUrl}
                                    onChange={(e) => setFigmaUrl(e.target.value)}
                                    placeholder="https://www.figma.com/design/..."
                                    className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Personal Access Token
                                    <a
                                        href="https://www.figma.com/developers/api#access-tokens"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline ml-2 text-xs"
                                    >
                                        Get token →
                                    </a>
                                </label>
                                <input
                                    type="password"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="figd_..."
                                    className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            onClick={fetchFigmaData}
                            disabled={loading || !figmaUrl || !accessToken}
                            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                        >
                            {loading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <Eye size={18} />
                            )}
                            {loading ? "Fetching..." : "Fetch & Convert"}
                        </button>

                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-primary rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useRobloxMode}
                                        onChange={(e) => setUseRobloxMode(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                                <div>
                                    <span className="text-sm font-medium text-text-primary">Roblox Mode</span>
                                    <p className="text-xs text-text-secondary">Normalize to 1920×1080 with offset coordinates</p>
                                </div>
                            </div>
                            <div className="group relative">
                                <Info size={16} className="text-text-secondary cursor-help" />
                                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-surface border border-border rounded-xl text-xs text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                                    <strong className="text-text-primary">Scale Mode:</strong> Uses percentages for responsive layouts.<br /><br />
                                    <strong className="text-text-primary">Roblox Mode:</strong> Uses pixel offsets normalized to 1920×1080, ideal for CatWeb's fixed viewport.
                                </div>
                            </div>
                        </div>
                    </div>

                    {figmaData && (
                        <div className="grid md:grid-cols-2 divide-x divide-border">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-text-primary">
                                        Figma Structure
                                    </h3>
                                    <span className="text-xs text-text-secondary px-2 py-1 bg-primary rounded-full">
                                        {figmaData.name}
                                    </span>
                                </div>
                                <div className="bg-primary rounded-xl p-4 max-h-[500px] overflow-auto">
                                    {figmaData.document?.children?.map((page, idx) => (
                                        <TreeNode key={page.id || idx} node={page} />
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-text-primary">
                                        CatWeb JSON
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="p-2 rounded-lg bg-primary hover:bg-surface-hover transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <Check size={16} className="text-green-500" />
                                            ) : (
                                                <Copy size={16} />
                                            )}
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="p-2 rounded-lg bg-primary hover:bg-surface-hover transition-colors"
                                            title="Download JSON"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                                <pre className="bg-primary rounded-xl p-4 max-h-[500px] overflow-auto text-xs font-mono text-text-secondary whitespace-pre-wrap">
                                    {catwebJson
                                        ? JSON.stringify(catwebJson, null, 2)
                                        : "No output yet..."}
                                </pre>
                            </div>
                        </div>
                    )}

                    {!figmaData && !loading && (
                        <div className="p-12 text-center">
                            <Figma size={48} className="mx-auto text-text-secondary/30 mb-4" />
                            <p className="text-text-secondary">
                                Enter a Figma URL and your access token to get started
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-surface rounded-2xl border border-border p-5">
                        <h4 className="font-bold text-text-primary mb-2">📐 Size Conversion</h4>
                        <p className="text-sm text-text-secondary">
                            Figma pixel sizes are converted to UDim2 scale values for responsive CatWeb layouts.
                        </p>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5">
                        <h4 className="font-bold text-text-primary mb-2">🎨 Colors & Styles</h4>
                        <p className="text-sm text-text-secondary">
                            Fill colors, strokes, and corner radius are preserved. Gradients may need manual adjustment.
                        </p>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5">
                        <h4 className="font-bold text-text-primary mb-2">🖼️ Images</h4>
                        <p className="text-sm text-text-secondary">
                            Image elements are exported as ImageLabel with placeholder IDs. Replace with Roblox asset IDs.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
