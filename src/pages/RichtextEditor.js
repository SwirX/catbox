import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Copy,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Palette,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Eraser,
    Check,
    ChevronDown,
    Droplet
} from 'lucide-react';

// --- Constants ---

const ROBLOX_FONTS = [
    'Arial', 'SourceSans', 'Roboto', 'Merriweather', 'NotoSans', 'ComicNeue',
    'Gotham', 'Arcade', 'Bangers', 'Creepster', 'DenkOne', 'Fondamento',
    'FredokaOne', 'GrenzeGotisch', 'IndieFlower', 'JosefinSans', 'Jura',
    'Kalam', 'LuckiestGuy', 'Nunito', 'PatrickHand', 'PermanentMarker',
    'TitilliumWeb'
];

const FONT_SIZES = [
    { label: 'Tiny', value: '1', px: '10px' },
    { label: 'Small', value: '2', px: '13px' },
    { label: 'Normal', value: '3', px: '16px' },
    { label: 'Medium', value: '4', px: '18px' },
    { label: 'Large', value: '5', px: '24px' },
    { label: 'Huge', value: '6', px: '32px' },
    { label: 'Gigantic', value: '7', px: '48px' },
];

const PRESET_COLORS = [
    '#000000', '#444444', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#FFFFFF',
    '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
    '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

// --- Helper Components ---

const ToolbarButton = ({ isActive, onClick, icon, label, showChevron, className = '', title }) => (
    <button
        onClick={onClick}
        title={title}
        type="button"
        className={`
            flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors border
            ${isActive
                ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-300'
                : 'bg-white border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }
            ${className}
        `}
    >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {label && <span className="truncate max-w-[80px] text-left">{label}</span>}
        {showChevron && <ChevronDown size={14} className={`opacity-50 flex-shrink-0 ${isActive ? 'rotate-180' : ''} transition-transform`} />}
    </button>
);

const Popover = ({ title, className = '', children }) => (
    <div className={`
        absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50
        flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200
        ${className}
    `}>
        {title && (
            <div className="pb-2 mb-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
            </div>
        )}
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {children}
        </div>
    </div>
);

const RichTextEditor = () => {
    const editorRef = useRef(null);
    const containerRef = useRef(null);

    // State
    const [activePopup, setActivePopup] = useState(null);
    const [editorFormats, setEditorFormats] = useState({});
    const [copied, setCopied] = useState(false);

    // Close popups on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (activePopup && containerRef.current && !containerRef.current.contains(e.target)) {
                setActivePopup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePopup]);

    // --- Core Editor Logic ---

    const updateActiveFormats = useCallback(() => {
        if (!document.queryCommandSupported('bold')) return;

        // Native commands
        const formats = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikethrough: document.queryCommandState('strikethrough'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            fontName: document.queryCommandValue('fontName')?.replace(/['"]/g, ''),
            fontSize: document.queryCommandValue('fontSize'),
        };

        // Custom styles via computed style of selection anchor
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
            const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
            if (el) {
                const comp = window.getComputedStyle(el);
                if (comp.opacity !== '1') formats.opacity = comp.opacity;
                if (comp.textShadow !== 'none') formats.textShadow = comp.textShadow;
            }
        }

        setEditorFormats(formats);
    }, []);

    const exec = (cmd, val) => {
        document.execCommand(cmd, false, val);
        editorRef.current?.focus();
        updateActiveFormats();
        setActivePopup(null);
    };

    const applyCustomStyle = (prop, val) => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        let html;
        if (sel.isCollapsed) {
            html = `<span style="${prop}:${val}">&#8203;</span>`;
        } else {
            const range = sel.getRangeAt(0);
            const content = range.extractContents();
            const span = document.createElement('span');
            span.style[prop] = val;
            span.appendChild(content);
            html = span.outerHTML;
        }
        document.execCommand('insertHTML', false, html);
        setActivePopup(null);
        updateActiveFormats();
    };

    // --- HTML to Roblox XML Serializer ---

    const rgbToHex = (rgb) => {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent' || rgb === 'none') return null;
        if (rgb.startsWith('#')) return rgb;
        const res = rgb.match(/\d+/g);
        if (!res || res.length < 3) return null;
        // eslint-disable-next-line
        return '#' + res.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    };

    const collectRuns = (node, parentStyle = {}) => {
        let runs = [];
        if (node.nodeType === 3) { // Text Node
            if (node.textContent) runs.push({ text: node.textContent, style: { ...parentStyle } });
            return runs;
        }
        if (node.nodeType !== 1) return runs; // Skip comments etc

        const style = { ...parentStyle };
        const comp = window.getComputedStyle(node);

        // Extract styles
        if (comp.fontWeight >= 600 || comp.fontWeight === 'bold') style.bold = true;
        if (comp.fontStyle === 'italic') style.italic = true;
        if (comp.textDecorationLine.includes('underline') || node.tagName === 'U') style.underline = true;
        if (comp.textDecorationLine.includes('line-through') || node.tagName === 'S' || node.tagName === 'STRIKE') style.strikethrough = true;

        const color = rgbToHex(comp.color);
        if (color && color !== '#000000' && color !== parentStyle.color) style.color = color;

        const bg = rgbToHex(comp.backgroundColor);
        if (bg && bg !== parentStyle.highlight) style.highlight = bg;

        const font = comp.fontFamily.split(',')[0].replace(/['"]/g, '');
        if (font !== parentStyle.font) style.font = font;

        let size = comp.fontSize ? parseInt(comp.fontSize) : null;
        if (size && size !== parentStyle.size) style.size = size;

        const op = comp.opacity;
        if (op && op !== '1') style.transparency = (1 - parseFloat(op)).toFixed(2);

        if (comp.textShadow && comp.textShadow !== 'none') {
            const match = comp.textShadow.match(/(rgb\([^)]+\)|#[0-9a-fA-F]+)/);
            if (match) style.stroke = rgbToHex(match[0]);
        }

        // Children
        const isBlock = ['DIV', 'P', 'BR', 'LI'].includes(node.tagName);
        if (node.tagName === 'BR') runs.push({ text: '\n', style });

        node.childNodes.forEach(child => runs = runs.concat(collectRuns(child, style)));

        if (isBlock && node.tagName !== 'BR') runs.push({ text: '\n', style });

        return runs;
    };

    const generateMarkup = () => {
        if (!editorRef.current) return '';
        const runs = collectRuns(editorRef.current);

        // Merge runs
        const merged = [];
        if (runs.length) {
            let curr = runs[0];
            for (let i = 1; i < runs.length; i++) {
                if (JSON.stringify(curr.style) === JSON.stringify(runs[i].style)) {
                    curr.text += runs[i].text;
                } else {
                    merged.push(curr);
                    curr = runs[i];
                }
            }
            merged.push(curr);
        }

        // Generate XML
        let out = '';
        merged.forEach(r => {
            let txt = r.text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;')
                .replace(/\u200B/g, ''); // Remove zero-width space

            if (!txt) return;

            const s = r.style;
            if (s.bold) txt = `<b>${txt}</b>`;
            if (s.italic) txt = `<i>${txt}</i>`;
            if (s.underline) txt = `<u>${txt}</u>`;
            if (s.strikethrough) txt = `<s>${txt}</s>`;

            if (s.stroke) txt = `<stroke color="${s.stroke}" thickness="1">${txt}</stroke>`;
            if (s.highlight) txt = `<mark color="${s.highlight}">${txt}</mark>`;

            let attrs = [];
            if (s.size) attrs.push(`size="${s.size}"`);
            if (s.color) attrs.push(`color="${s.color}"`);
            if (s.font) attrs.push(`face="${s.font}"`);
            if (s.transparency) attrs.push(`transparency="${s.transparency}"`);

            if (attrs.length) txt = `<font ${attrs.join(' ')}>${txt}</font>`;

            out += txt;
        });

        return out;
    };

    const handleCopy = () => {
        const robloxMarkup = generateMarkup();
        navigator.clipboard.writeText(robloxMarkup);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Render ---

    // --- Render ---
    return (
        <div className="max-w-6xl mx-auto min-h-screen py-10 px-6 flex flex-col gap-6" ref={containerRef}>
            {/* Title & Copy Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Palette size={24} />
                        </span>
                        Rich Text Editor
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">Create polished formatted text for Roblox UIs.</p>
                </div>

                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all duration-300 transform active:scale-95 border
                        ${copied
                            ? 'bg-green-500 border-green-400 text-white shadow-green-500/30 ring-4 ring-green-500/20'
                            : 'bg-[#1D1D1F] dark:bg-apple-blue border-transparent text-white hover:opacity-90 shadow-2xl'
                        }
                    `}
                >
                    {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={2.5} />}
                    {copied ? 'COPIED!' : 'COPY XML'}
                </button>
            </div>

            {/* Main Editor Card */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-[#2C2C2E] overflow-visible flex flex-col z-20 h-[700px] transition-all">

                {/* Visual Toolbar */}
                <div className="px-3 py-3 border-b border-gray-100 dark:border-[#2C2C2E] bg-gray-50/80 dark:bg-[#2C2C2E]/40 backdrop-blur-xl rounded-t-[2rem] flex flex-wrap gap-1.5 items-center relative select-none z-30">

                    {/* Clear */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#000000]/20 p-1 rounded-2xl border border-gray-200/50 dark:border-[#3A3A3C]">
                        <ToolbarButton icon={<Eraser size={18} />} onClick={() => exec('removeFormat')} title="Clear Formatting" />
                    </div>

                    {/* Font Dropdown */}
                    <div className="relative flex items-center gap-1 bg-white dark:bg-[#000000]/20 p-1 rounded-2xl border border-gray-200/50 dark:border-[#3A3A3C]">
                        <div className="relative">
                            <ToolbarButton
                                label={editorFormats.fontName || 'Font Family'}
                                showChevron
                                onClick={() => setActivePopup(activePopup === 'font' ? null : 'font')}
                                isActive={activePopup === 'font'}
                                className="w-40 justify-between text-left px-3"
                            />
                            {activePopup === 'font' && (
                                <Popover title="Font Family" className="w-56">
                                    {ROBLOX_FONTS.map(font => (
                                        <button
                                            key={font}
                                            className="text-left w-full px-4 py-2.5 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors flex items-center justify-between group"
                                            style={{ fontFamily: font }}
                                            onClick={() => exec('fontName', font)}
                                        >
                                            {font}
                                            {editorFormats.fontName === font && <Check size={14} className="text-apple-blue" />}
                                        </button>
                                    ))}
                                </Popover>
                            )}
                        </div>

                        {/* Size Dropdown */}
                        <div className="w-px h-6 bg-gray-200 dark:bg-[#3A3A3C] mx-1" />

                        <div className="relative">
                            <ToolbarButton
                                label={FONT_SIZES.find(s => s.value == editorFormats.fontSize)?.label || 'Size'}
                                showChevron
                                onClick={() => setActivePopup(activePopup === 'size' ? null : 'size')}
                                isActive={activePopup === 'size'}
                                className="w-28 justify-between text-left px-3"
                            />
                            {activePopup === 'size' && (
                                <Popover title="Font Size" className="w-40">
                                    {FONT_SIZES.map(size => (
                                        <button
                                            key={size.value}
                                            className="flex justify-between items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors group"
                                            onClick={() => exec('fontSize', size.value)}
                                        >
                                            <span className={(editorFormats.fontSize == size.value) ? "font-bold text-apple-blue" : ""}>{size.label}</span>
                                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-[#000000]/40 px-1.5 py-0.5 rounded">{size.px}</span>
                                        </button>
                                    ))}
                                </Popover>
                            )}
                        </div>
                    </div>

                    {/* Base Styles */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#000000]/20 p-1 rounded-2xl border border-gray-200/50 dark:border-[#3A3A3C]">
                        <ToolbarButton icon={<Bold size={18} />} isActive={editorFormats.bold} onClick={() => exec('bold')} title="Bold" />
                        <ToolbarButton icon={<Italic size={18} />} isActive={editorFormats.italic} onClick={() => exec('italic')} title="Italic" />
                        <ToolbarButton icon={<Underline size={18} />} isActive={editorFormats.underline} onClick={() => exec('underline')} title="Underline" />
                        <ToolbarButton icon={<Strikethrough size={18} />} isActive={editorFormats.strikethrough} onClick={() => exec('strikethrough')} title="Strikethrough" />
                    </div>

                    {/* Colors & Highlights */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#000000]/20 p-1 rounded-2xl border border-gray-200/50 dark:border-[#3A3A3C]">
                        <div className="relative">
                            <ToolbarButton
                                icon={<div className="flex flex-col items-center justify-center gap-0.5">
                                    <span className="font-serif font-bold text-lg leading-none">A</span>
                                    <div className="w-4 h-1 rounded-full bg-gradient-to-r from-red-500 to-blue-500"></div>
                                </div>}
                                showChevron
                                onClick={() => setActivePopup(activePopup === 'color' ? null : 'color')}
                                isActive={activePopup === 'color'}
                                title="Text Color"
                                className="px-2"
                            />
                            {activePopup === 'color' && (
                                <Popover title="Text Color" className="w-72">
                                    <div className="grid grid-cols-7 gap-2 p-1">
                                        {PRESET_COLORS.map(c => (
                                            <button
                                                key={c}
                                                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 hover:scale-110 transition-all shadow-sm ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-500"
                                                style={{ backgroundColor: c }}
                                                onClick={() => exec('foreColor', c)}
                                            />
                                        ))}
                                    </div>
                                </Popover>
                            )}
                        </div>

                        <div className="relative">
                            <ToolbarButton
                                icon={<Highlighter size={18} />}
                                showChevron
                                onClick={() => setActivePopup(activePopup === 'highlight' ? null : 'highlight')}
                                isActive={activePopup === 'highlight'}
                                title="Highlight Text"
                            />
                            {activePopup === 'highlight' && (
                                <Popover title="Highlight Color" className="w-72">
                                    <div className="grid grid-cols-7 gap-2 p-1">
                                        {PRESET_COLORS.map(c => (
                                            <button
                                                key={c}
                                                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 hover:scale-110 transition-all shadow-sm"
                                                style={{ backgroundColor: c }}
                                                onClick={() => exec('hiliteColor', c)}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#3A3A3C]">
                                        <button
                                            onClick={() => exec('hiliteColor', 'transparent')}
                                            className="w-full py-2 text-xs font-semibold text-center border border-gray-200 dark:border-[#3A3A3C] rounded-xl hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors text-gray-600 dark:text-gray-300"
                                        >
                                            No Highlight
                                        </button>
                                    </div>
                                </Popover>
                            )}
                        </div>
                    </div>

                    {/* Effects */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#000000]/20 p-1 rounded-2xl border border-gray-200/50 dark:border-[#3A3A3C]">
                        <div className="relative">
                            <ToolbarButton
                                icon={<Droplet size={18} />}
                                showChevron
                                label="Effects"
                                onClick={() => setActivePopup(activePopup === 'advanced' ? null : 'advanced')}
                                isActive={activePopup === 'advanced'}
                                title="Advanced Effects"
                                className="px-3"
                            />
                            {activePopup === 'advanced' && (
                                <Popover title="Text Effects" className="w-72 space-y-5">
                                    <div>
                                        <div className="flex justify-between text-xs mb-3 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                            <span>Transparency</span>
                                            <span>{editorFormats.opacity ? Math.round((1 - parseFloat(editorFormats.opacity)) * 100) : 0}%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="1" step="0.05"
                                            defaultValue={editorFormats.opacity ? (1 - parseFloat(editorFormats.opacity)) : 0}
                                            className="w-full h-2 bg-gray-200 dark:bg-[#3A3A3C] rounded-lg appearance-none cursor-pointer accent-apple-blue"
                                            onChange={(e) => applyCustomStyle('opacity', 1 - parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs mb-3 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Stroke Outline</div>
                                        <div className="grid grid-cols-7 gap-2 mb-3">
                                            {PRESET_COLORS.slice(0, 14).map(c => (
                                                <button
                                                    key={c}
                                                    className="w-6 h-6 rounded-full border border-gray-300 hover:scale-125 transition-transform shadow-sm"
                                                    style={{ borderColor: c, borderWidth: '2px' }}
                                                    onClick={() => applyCustomStyle('textShadow', `-1px -1px 0 ${c}, 1px -1px 0 ${c}, -1px 1px 0 ${c}, 1px 1px 0 ${c}`)}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => applyCustomStyle('textShadow', 'none')}
                                            className="w-full py-2 text-xs font-semibold text-center border border-gray-200 dark:border-[#3A3A3C] rounded-xl hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors text-gray-600 dark:text-gray-300"
                                        >
                                            Remove Stroke
                                        </button>
                                    </div>
                                </Popover>
                            )}
                        </div>
                    </div>

                    {/* Align */}
                    <div className="flex bg-white dark:bg-[#000000]/20 border border-gray-200/50 dark:border-[#3A3A3C] rounded-2xl p-1">
                        <button className={`p-2 rounded-xl transition-all ${editorFormats.justifyLeft ? 'bg-gray-100 dark:bg-[#3A3A3C] text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`} onClick={() => exec('justifyLeft')}><AlignLeft size={18} /></button>
                        <button className={`p-2 rounded-xl transition-all ${editorFormats.justifyCenter ? 'bg-gray-100 dark:bg-[#3A3A3C] text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`} onClick={() => exec('justifyCenter')}><AlignCenter size={18} /></button>
                        <button className={`p-2 rounded-xl transition-all ${editorFormats.justifyRight ? 'bg-gray-100 dark:bg-[#3A3A3C] text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`} onClick={() => exec('justifyRight')}><AlignRight size={18} /></button>
                    </div>

                </div>

                {/* Editor Surface */}
                <div className="relative flex-1 overflow-hidden rounded-b-[2rem]">
                    <div
                        ref={editorRef}
                        contentEditable
                        className="h-full p-8 outline-none prose dark:prose-invert max-w-none w-full overflow-y-auto custom-scrollbar text-lg leading-relaxed text-gray-800 dark:text-gray-200"
                        onInput={updateActiveFormats}
                        onMouseUp={updateActiveFormats}
                        onKeyUp={updateActiveFormats}
                        spellCheck={false}
                        style={{ whiteSpace: 'pre-wrap' }}
                        placeholder="Type here..."
                    />
                    <div className="absolute bottom-4 right-6 pointer-events-none">
                        <span className="bg-gray-100/80 dark:bg-[#1C1C1E]/80 backdrop-blur border border-gray-200 dark:border-[#3A3A3C] px-3 py-1.5 rounded-lg text-xs font-mono text-gray-400 dark:text-gray-500">
                            HTML Mode
                        </span>
                    </div>
                </div>

            </div>

            <div className="text-center pb-8">
                <p className="text-sm text-gray-400 dark:text-gray-600 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-apple-blue"></span>
                    Formatting is visual only. Copying transforms to Roblox XML automatically.
                </p>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3A3A3C; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #48484A; }

                @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default RichTextEditor;