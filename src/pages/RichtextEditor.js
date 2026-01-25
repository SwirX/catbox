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

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 p-4" ref={containerRef}>
            {/* Title & Copy Action */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        Rich Text Editor
                    </h1>
                </div>

                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg transition-all duration-300 transform active:scale-95
                        ${copied
                            ? 'bg-green-500 text-white shadow-green-500/30 ring-2 ring-green-400'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/50'
                        }
                    `}
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Roblox Rich Text'}
                </button>
            </div>

            {/* Main Editor Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-visible flex flex-col z-20 h-[600px]">

                {/* Visual Toolbar */}
                <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl flex flex-wrap gap-1 items-center relative select-none">

                    {/* Clear */}
                    <ToolbarButton icon={<Eraser size={18} />} onClick={() => exec('removeFormat')} title="Clear Formatting" />
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Font Dropdown */}
                    <div className="relative">
                        <ToolbarButton
                            label={editorFormats.fontName || 'Font Family'}
                            showChevron
                            onClick={() => setActivePopup(activePopup === 'font' ? null : 'font')}
                            isActive={activePopup === 'font'}
                            className="w-36 justify-between"
                        />
                        {activePopup === 'font' && (
                            <Popover title="Font Family" className="w-48">
                                {ROBLOX_FONTS.map(font => (
                                    <button
                                        key={font}
                                        className="text-left w-full px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                        style={{ fontFamily: font }}
                                        onClick={() => exec('fontName', font)}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </Popover>
                        )}
                    </div>

                    {/* Size Dropdown */}
                    <div className="relative">
                        <ToolbarButton
                            label={FONT_SIZES.find(s => s.value == editorFormats.fontSize)?.label || 'Size'}
                            showChevron
                            onClick={() => setActivePopup(activePopup === 'size' ? null : 'size')}
                            isActive={activePopup === 'size'}
                            className="w-24 justify-between"
                        />
                        {activePopup === 'size' && (
                            <Popover title="Font Size" className="w-32">
                                {FONT_SIZES.map(size => (
                                    <button
                                        key={size.value}
                                        className="flex justify-between items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                        onClick={() => exec('fontSize', size.value)}
                                    >
                                        <span>{size.label}</span>
                                        <span className="text-xs text-slate-400">{size.px}</span>
                                    </button>
                                ))}
                            </Popover>
                        )}
                    </div>

                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Base Styles */}
                    <ToolbarButton icon={<Bold size={18} />} isActive={editorFormats.bold} onClick={() => exec('bold')} title="Bold" />
                    <ToolbarButton icon={<Italic size={18} />} isActive={editorFormats.italic} onClick={() => exec('italic')} title="Italic" />
                    <ToolbarButton icon={<Underline size={18} />} isActive={editorFormats.underline} onClick={() => exec('underline')} title="Underline" />
                    <ToolbarButton icon={<Strikethrough size={18} />} isActive={editorFormats.strikethrough} onClick={() => exec('strikethrough')} title="Strikethrough" />

                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Colors & Highlights */}
                    <div className="relative">
                        <ToolbarButton
                            icon={<Palette size={18} />}
                            showChevron
                            onClick={() => setActivePopup(activePopup === 'color' ? null : 'color')}
                            isActive={activePopup === 'color'}
                            title="Text Color"
                        />
                        {activePopup === 'color' && (
                            <Popover title="Text Color" className="w-64">
                                <div className="grid grid-cols-7 gap-1.5">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform shadow-sm"
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
                            <Popover title="Highlight Color" className="w-64">
                                <div className="grid grid-cols-7 gap-1.5">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform shadow-sm"
                                            style={{ backgroundColor: c }}
                                            onClick={() => exec('hiliteColor', c)}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => exec('hiliteColor', 'transparent')}
                                    className="mt-2 w-full py-1.5 text-xs text-center border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    No Highlight
                                </button>
                            </Popover>
                        )}
                    </div>

                    {/* Effects: Stroke & Transparency */}
                    <div className="relative">
                        <ToolbarButton
                            icon={<Droplet size={18} />}
                            showChevron
                            onClick={() => setActivePopup(activePopup === 'advanced' ? null : 'advanced')}
                            isActive={activePopup === 'advanced'}
                            title="Effects"
                        />
                        {activePopup === 'advanced' && (
                            <Popover title="Text Effects" className="w-64 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2 text-slate-600 dark:text-slate-300 font-medium">
                                        <span>Transparency</span>
                                        <span>{editorFormats.opacity ? Math.round((1 - parseFloat(editorFormats.opacity)) * 100) : 0}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        defaultValue={editorFormats.opacity ? (1 - parseFloat(editorFormats.opacity)) : 0}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        onChange={(e) => applyCustomStyle('opacity', 1 - parseFloat(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <div className="text-xs mb-2 text-slate-600 dark:text-slate-300 font-medium">Stroke / Outline</div>
                                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                                        {PRESET_COLORS.slice(0, 14).map(c => (
                                            <button
                                                key={c}
                                                className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform"
                                                style={{ borderColor: c }}
                                                onClick={() => applyCustomStyle('textShadow', `-1px -1px 0 ${c}, 1px -1px 0 ${c}, -1px 1px 0 ${c}, 1px 1px 0 ${c}`)}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => applyCustomStyle('textShadow', 'none')}
                                        className="w-full py-1.5 text-xs text-center border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                        Remove Stroke
                                    </button>
                                </div>
                            </Popover>
                        )}
                    </div>

                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Align */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        <button className={`p-1.5 rounded ${editorFormats.justifyLeft ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} onClick={() => exec('justifyLeft')}><AlignLeft size={16} /></button>
                        <button className={`p-1.5 rounded ${editorFormats.justifyCenter ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} onClick={() => exec('justifyCenter')}><AlignCenter size={16} /></button>
                        <button className={`p-1.5 rounded ${editorFormats.justifyRight ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} onClick={() => exec('justifyRight')}><AlignRight size={16} /></button>
                    </div>

                </div>

                {/* Editor Surface */}
                <div
                    ref={editorRef}
                    contentEditable
                    className="flex-1 p-6 outline-none prose dark:prose-invert max-w-none w-full overflow-y-auto"
                    onInput={updateActiveFormats}
                    onMouseUp={updateActiveFormats}
                    onKeyUp={updateActiveFormats}
                    spellCheck={false}
                    style={{ whiteSpace: 'pre-wrap' }}
                    placeholder="Type here..."
                />
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                Designed for Roblox. Formatting characters are hidden while editing.
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-from-top-2 { from { transform: translateY(-0.5rem); } to { transform: translateY(0); } }
                .animate-in { animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default RichTextEditor;