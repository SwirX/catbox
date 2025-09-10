import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Copy,
    Download,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Palette,
    Text,
    Highlighter,
    Droplet,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';

// Roblox supported fonts
const robloxFonts = [
    'Arial', 'SourceSans', 'Roboto', 'Merriweather', 'NotoSans', 'ComicNeue',
    'Gotham', 'Arcade', 'Bangers', 'Creepster', 'DenkOne', 'Fondamento',
    'FredokaOne', 'GrenzeGotisch', 'IndieFlower', 'JosefinSans', 'Jura',
    'Kalam', 'LuckiestGuy', 'Nunito', 'PatrickHand', 'PermanentMarker',
    'TitilliumWeb'
];

const cloneStyleObj = (obj) => JSON.parse(JSON.stringify(obj));

const emptyStyle = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    color: null,
    font: null,
    size: null,
    highlight: null,
    transparency: null,
    stroke: null
};

const styleEquals = (a, b) => {
    if (!a || !b) return false;
    return (
        a.bold === b.bold &&
        a.italic === b.italic &&
        a.underline === b.underline &&
        a.strikethrough === b.strikethrough &&
        (a.color || '') === (b.color || '') &&
        (a.font || '') === (b.font || '') &&
        (a.size || '') === (b.size || '') &&
        (a.highlight || '') === (b.highlight || '') &&
        (a.transparency || '') === (b.transparency || '') &&
        (a.stroke || '') === (b.stroke || '')
    );
};

// Produce Roblox tags for a style object and text
const wrapTextWithStyle = (text, style) => {
    if (!text) return '';

    let open = '';
    let close = '';

    // order: stroke/mark/font(size/color/face/transparency) then inline tags (b,i,u,s)
    if (style.stroke) {
        open += `<stroke color="${style.stroke}" thickness="1" joins="miter">`;
        close = `</stroke>` + close;
    }
    if (style.highlight) {
        open += `<mark color="${style.highlight}">`;
        close = `</mark>` + close;
    }
    // font properties
    if (style.color) {
        open += `<font color="${style.color}">`;
        close = `</font>` + close;
    }
    if (style.size) {
        open += `<font size="${style.size}">`;
        close = `</font>` + close;
    }
    if (style.font) {
        // Roblox uses family/face naming depending on implementation; we use 'face' to be safe
        open += `<font face="${style.font}">`;
        close = `</font>` + close;
    }
    if (style.transparency !== null && style.transparency !== undefined) {
        // Roblox transparency is 0..1. We store it as transparency directly (0 means opaque)
        if (style.transparency !== 0) {
            open += `<font transparency="${style.transparency}">`;
            close = `</font>` + close;
        }
    }

    // inline formatting tags (these can nest, but we will ensure we don't double-wrap same)
    if (style.bold) {
        open += `<b>`;
        close = `</b>` + close;
    }
    if (style.italic) {
        open += `<i>`;
        close = `</i>` + close;
    }
    if (style.underline) {
        open += `<u>`;
        close = `</u>` + close;
    }
    if (style.strikethrough) {
        open += `<s>`;
        close = `</s>` + close;
    }

    // escape angle brackets & ampersands
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return open + escaped + close;
};

const RichTextEditor = () => {
    const [robloxMarkup, setRobloxMarkup] = useState('');
    const [alignment, setAlignment] = useState('left');

    // activeStyles reflects the style that is uniformly applied to the current selection or caret
    const [activeStyles, setActiveStyles] = useState(cloneStyleObj(emptyStyle));
    // currentFormats are styles set for **future typing** when there's no selection
    const [currentFormats, setCurrentFormats] = useState({});

    const editorRef = useRef(null);

    // ---- DOM helpers ----
    const getComputedStyleObjForElement = (el) => {
        const s = {
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            color: null,
            font: null,
            size: null,
            highlight: null,
            transparency: null,
            stroke: null
        };

        if (!el || el.nodeType !== Node.ELEMENT_NODE) return s;

        const tag = el.tagName?.toLowerCase();
        if (tag === 'b' || tag === 'strong') s.bold = true;
        if (tag === 'i' || tag === 'em') s.italic = true;
        if (tag === 'u') s.underline = true;
        if (tag === 's') s.strikethrough = true;

        const style = window.getComputedStyle ? window.getComputedStyle(el) : el.style;
        if (style) {
            if (style.color && style.color !== 'rgba(0, 0, 0, 0)' && style.color !== 'transparent') s.color = style.color;
            if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') s.highlight = style.backgroundColor;
            if (style.fontFamily) s.font = style.fontFamily.replace(/['"]/g, '').split(',')[0];
            // fontSize may be like "16px"
            if (style.fontSize) {
                const m = style.fontSize.match(/(\d+)/);
                if (m) s.size = parseInt(m[1], 10);
            }
            if (style.opacity && style.opacity !== '1') {
                s.transparency = +(1 - parseFloat(style.opacity)).toFixed(2);
            }
            if (style.textShadow) {
                const m = style.textShadow.match(/(#[0-9a-fA-F]+|rgb\([^)]+\))/);
                if (m) s.stroke = m[1];
            }
        }

        // Walk up to catch semantic tags that do not have computed style (e.g., <b>, <i>)
        let p = el.parentElement;
        while (p && p !== editorRef.current) {
            const tagp = p.tagName?.toLowerCase();
            if (tagp === 'b' || tagp === 'strong') s.bold = true;
            if (tagp === 'i' || tagp === 'em') s.italic = true;
            if (tagp === 'u') s.underline = true;
            if (tagp === 's') s.strikethrough = true;
            p = p.parentElement;
        }

        return s;
    };

    // Given a Range, compute the intersection style that applies to **all** text inside the range
    const computeIntersectionStyleForRange = (range) => {
        const styles = [];
        // Collect text nodes inside the range
        const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                try {
                    const nodeRange = document.createRange();
                    nodeRange.selectNodeContents(node);
                    if (range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) return NodeFilter.FILTER_REJECT;
                    if (range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0) return NodeFilter.FILTER_REJECT;
                } catch (e) {
                    // fallback accept
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let node = walker.nextNode();
        if (!node) {
            // if selection collapsed, check caret container element
            const el = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
            styles.push(getComputedStyleObjForElement(el));
        } else {
            while (node) {
                const el = node.parentElement;
                styles.push(getComputedStyleObjForElement(el));
                node = walker.nextNode();
            }
        }

        if (styles.length === 0) return cloneStyleObj(emptyStyle);

        // Intersection: a style is active only if present in all nodes
        const base = cloneStyleObj(styles[0]);
        for (let i = 1; i < styles.length; i++) {
            const s = styles[i];
            if (!s.bold) base.bold = false;
            if (!s.italic) base.italic = false;
            if (!s.underline) base.underline = false;
            if (!s.strikethrough) base.strikethrough = false;
            if ((s.color || '') !== (base.color || '')) base.color = null;
            if ((s.font || '') !== (base.font || '')) base.font = null;
            if ((s.size || '') !== (base.size || '')) base.size = null;
            if ((s.highlight || '') !== (base.highlight || '')) base.highlight = null;
            if ((s.transparency || '') !== (base.transparency || '')) base.transparency = null;
            if ((s.stroke || '') !== (base.stroke || '')) base.stroke = null;
        }
        return base;
    };

    // update activeStyles based on selection/caret
    const updateActiveStyles = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) {
            setActiveStyles(cloneStyleObj(emptyStyle));
            return;
        }
        const range = sel.getRangeAt(0);
        const s = computeIntersectionStyleForRange(range);
        setActiveStyles(s);
    }, []);

    useEffect(() => {
        const onSelection = () => updateActiveStyles();
        document.addEventListener('selectionchange', onSelection);
        return () => document.removeEventListener('selectionchange', onSelection);
    }, [updateActiveStyles]);

    // ---- applying / removing formatting ----
    // check whether selection is already fully inside same-format ancestor for simple toggles
    const selectionHasAncestorTag = (range, tagNames) => {
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        while (node && node !== editorRef.current) {
            const tag = node.tagName?.toLowerCase();
            if (tag && tagNames.includes(tag)) return true;
            node = node.parentElement;
        }
        return false;
    };

    const removeFormatting = useCallback((format) => {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) {
            // No selection: remove from currentFormats for future typing
            setCurrentFormats((prev) => {
                const copy = { ...prev };
                delete copy[format];
                return copy;
            });
            setTimeout(updateActiveStyles, 0);
            return;
        }

        const range = sel.getRangeAt(0);
        const editor = editorRef.current;
        if (!editor) return;

        // If selection is collapsed, only update currentFormats
        if (range.collapsed) {
            setCurrentFormats((prev) => {
                const copy = { ...prev };
                delete copy[format];
                return copy;
            });
            setTimeout(updateActiveStyles, 0);
            return;
        }

        // For selected text: process all nodes in the range
        const walker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                },
            }
        );

        const nodesToProcess = [];
        let node = walker.nextNode();
        while (node) {
            nodesToProcess.push(node);
            node = walker.nextNode();
        }

        // Process each node to remove the specific format
        nodesToProcess.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement; // Process the parent element
            }
            if (node === editor) return;

            const tag = node.tagName?.toLowerCase();
            let shouldUnwrap = false;
            let newStyles = {};

            // Check if node matches the format to remove
            switch (format) {
                case 'bold':
                    shouldUnwrap = tag === 'b' || tag === 'strong';
                    break;
                case 'italic':
                    shouldUnwrap = tag === 'i' || tag === 'em';
                    break;
                case 'underline':
                    shouldUnwrap = tag === 'u';
                    break;
                case 'strikethrough':
                    shouldUnwrap = tag === 's';
                    break;
                case 'color':
                    if (tag === 'span' && node.style.color) {
                        shouldUnwrap = true;
                        newStyles = { ...node.style, color: '' };
                    }
                    break;
                case 'font':
                    if (tag === 'span' && node.style.fontFamily) {
                        shouldUnwrap = true;
                        newStyles = { ...node.style, fontFamily: '' };
                    }
                    break;
                case 'size':
                    if (tag === 'span' && node.style.fontSize) {
                        shouldUnwrap = true;
                        newStyles = { ...node.style, fontSize: '' };
                    }
                    break;
                case 'highlight':
                    if (tag === 'span' && node.style.backgroundColor) {
                        shouldUnwrap = true;
                        newStyles = { ...node.style, backgroundColor: '' };
                    }
                    break;
                case 'transparency':
                    if (tag === 'span' && node.style.opacity && node.style.opacity !== '1') {
                        shouldUnwrap = true;
                        newStyles = { ...node.style, opacity: '' };
                    }
                    break;
                case 'stroke':
                    if (tag === 'span' && node.style.textShadow) {
                        shouldUnwrap = true;
                        newStyles = { ...node.style, textShadow: '' };
                    }
                    break;
            }

            if (shouldUnwrap) {
                // Split the node if selection partially covers it
                const parent = node.parentNode;
                let startOffset = 0;
                let endOffset = node.textContent.length;

                if (node.contains(range.startContainer)) {
                    startOffset = range.startOffset;
                    if (range.startContainer.nodeType === Node.TEXT_NODE) {
                        startOffset = Array.from(node.childNodes)
                            .filter((n) => n.nodeType === Node.TEXT_NODE)
                            .indexOf(range.startContainer);
                    }
                }
                if (node.contains(range.endContainer)) {
                    endOffset = range.endOffset;
                    if (range.endContainer.nodeType === Node.TEXT_NODE) {
                        endOffset = Array.from(node.childNodes)
                            .filter((n) => n.nodeType === Node.TEXT_NODE)
                            .indexOf(range.endContainer) + 1;
                    }
                }

                // Unwrap or modify node
                if (format in ['bold', 'italic', 'underline', 'strikethrough']) {
                    // Unwrap semantic tags
                    const contents = document.createDocumentFragment();
                    while (node.firstChild) contents.appendChild(node.firstChild);
                    parent.replaceChild(contents, node);
                } else {
                    // For style-based formats, create a new span with remaining styles
                    const newSpan = document.createElement('span');
                    Object.assign(newSpan.style, newStyles);
                    while (node.firstChild) newSpan.appendChild(node.firstChild);
                    parent.replaceChild(newSpan, node);
                    // Remove span if it has no styles
                    if (!newSpan.style.cssText) {
                        const contents = document.createDocumentFragment();
                        while (newSpan.firstChild) contents.appendChild(newSpan.firstChild);
                        parent.replaceChild(contents, newSpan);
                    }
                }
            }
        });

        // Normalize DOM and update
        editor.normalize();
        setTimeout(() => {
            serializeEditorToRoblox();
            updateActiveStyles();
        }, 0);
    }, [updateActiveStyles]);

    // Apply formatting to selection or set typing format
    const applyFormatting = useCallback((format, value = null) => {
        const editor = editorRef.current;
        if (!editor) return;
        const sel = window.getSelection();
        if (!sel) return;

        // If selection collapsed => set typing format (for next typed characters)
        if (sel.isCollapsed) {
            // If user toggles same format off, remove it from currentFormats
            setCurrentFormats((prev) => {
                const exists = prev.hasOwnProperty(format);
                if (exists) {
                    const copy = { ...prev };
                    delete copy[format];
                    return copy;
                } else {
                    return { ...prev, [format]: value === undefined ? true : value };
                }
            });
            // reflect updated active styles (typing)
            setTimeout(updateActiveStyles, 0);
            return;
        }

        // There is a selection: ensure we don't nest same-format (if selection already inside same tag, ignore)
        const range = sel.getRangeAt(0);

        // For inline tags (bold/italic/underline/strikethrough) prevent double-wrapping: if entire selection already within a same element, do nothing
        if (['bold', 'italic', 'underline', 'strikethrough'].includes(format)) {
            const tagNames = format === 'bold' ? ['b', 'strong'] :
                format === 'italic' ? ['i', 'em'] :
                    format === 'underline' ? ['u'] :
                        ['s'];
            if (selectionHasAncestorTag(range, tagNames)) {
                // user wants to toggle off -> remove formatting
                removeFormatting(format);
                return;
            }
        } else {
            // for style spans (color/font/size/highlight/opacity/stroke), if the selection is entirely inside an element with identical style,
            // treat as toggle -> remove; otherwise apply.
            const current = computeIntersectionStyleForRange(range);
            let alreadySame = false;
            switch (format) {
                case 'color':
                    alreadySame = current.color && value && current.color === value;
                    break;
                case 'font':
                    alreadySame = current.font && value && current.font === value;
                    break;
                case 'size':
                    alreadySame = current.size && value && Number(current.size) === Number(value);
                    break;
                case 'highlight':
                    alreadySame = current.highlight && value && current.highlight === value;
                    break;
                case 'transparency':
                    alreadySame = current.transparency !== null && value !== undefined && Number(current.transparency) === Number(value);
                    break;
                case 'stroke':
                    alreadySame = current.stroke && value && current.stroke === value;
                    break;
                default:
                    alreadySame = false;
            }
            if (alreadySame) {
                removeFormatting(format);
                return;
            }
        }

        // Create wrapper element according to format
        let wrapper;
        switch (format) {
            case 'bold':
                wrapper = document.createElement('strong');
                break;
            case 'italic':
                wrapper = document.createElement('em');
                break;
            case 'underline':
                wrapper = document.createElement('u');
                break;
            case 'strikethrough':
                wrapper = document.createElement('s');
                break;
            case 'color':
                wrapper = document.createElement('span');
                wrapper.style.color = value;
                break;
            case 'size':
                wrapper = document.createElement('span');
                wrapper.style.fontSize = `${value}px`;
                break;
            case 'font':
                wrapper = document.createElement('span');
                wrapper.style.fontFamily = `'${value}', sans-serif`;
                break;
            case 'highlight':
                wrapper = document.createElement('span');
                wrapper.style.backgroundColor = value;
                break;
            case 'transparency':
                wrapper = document.createElement('span');
                // value is opacity 0..1 -> set element opacity to 1 - transparency (we want opacity style)
                wrapper.style.opacity = `${1 - Number(value)}`;
                break;
            case 'stroke':
                wrapper = document.createElement('span');
                wrapper.style.textShadow = `-1px -1px 0 ${value}, 1px -1px 0 ${value}, -1px 1px 0 ${value}, 1px 1px 0 ${value}`;
                break;
            default:
                return;
        }

        // Try surroundContents (works if selection is contained within same parent)
        try {
            range.surroundContents(wrapper);
        } catch (err) {
            // fallback: extract contents and insert wrapped
            const frag = range.extractContents();
            wrapper.appendChild(frag);
            range.insertNode(wrapper);
        }

        // After wrapping, normalize DOM (merge text nodes) and update exports
        editor.normalize();
        setTimeout(() => {
            serializeEditorToRoblox();
            updateActiveStyles();
        }, 0);
    }, [removeFormatting, updateActiveStyles]);

    // ---- typing-time formatting: intercept keydown to insert formatted characters if currentFormats exist ----
    const handleKeyDown = useCallback((e) => {
        if (!editorRef.current) return;
        if (Object.keys(currentFormats).length === 0) return;

        // Let modifier combos pass
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);

        // If user pressed a normal printable character, intercept and insert wrapped char(s)
        if (e.key.length === 1 || e.key === 'Enter') {
            e.preventDefault();

            // Build nested wrappers according to currentFormats in deterministic order
            const formatEntries = Object.entries(currentFormats);
            let outer = null;
            let current = null;

            // create nested elements
            for (let [format, value] of formatEntries) {
                let el;
                switch (format) {
                    case 'bold': el = document.createElement('strong'); break;
                    case 'italic': el = document.createElement('em'); break;
                    case 'underline': el = document.createElement('u'); break;
                    case 'strikethrough': el = document.createElement('s'); break;
                    case 'color': el = document.createElement('span'); el.style.color = value; break;
                    case 'font': el = document.createElement('span'); el.style.fontFamily = `'${value}', sans-serif`; break;
                    case 'size': el = document.createElement('span'); el.style.fontSize = `${value}px`; break;
                    case 'highlight': el = document.createElement('span'); el.style.backgroundColor = value; break;
                    case 'transparency': el = document.createElement('span'); el.style.opacity = `${1 - Number(value)}`; break;
                    case 'stroke': el = document.createElement('span'); el.style.textShadow = `-1px -1px 0 ${value}, 1px -1px 0 ${value}, -1px 1px 0 ${value}, 1px 1px 0 ${value}`; break;
                    default: el = document.createElement('span'); break;
                }
                if (!outer) outer = el;
                if (current) {
                    current.appendChild(el);
                    current = el;
                } else {
                    current = el;
                }
            }

            // If Enter => insert a <br> inside the innermost wrapper
            if (e.key === 'Enter') {
                const br = document.createElement('br');
                if (current) {
                    current.appendChild(br);
                } else {
                    range.insertNode(br);
                }
                // Move caret after the br
                const newRange = document.createRange();
                if (br.nextSibling) {
                    newRange.setStart(br.nextSibling, 0);
                } else {
                    // put after br by inserting an empty text node
                    const tn = document.createTextNode('');
                    br.parentNode.insertBefore(tn, br.nextSibling);
                    newRange.setStart(tn, 0);
                }
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            } else {
                // Insert the character text node inside the innermost wrapper
                const textNode = document.createTextNode(e.key);
                if (current) {
                    current.appendChild(textNode);
                    range.insertNode(outer || textNode);
                } else {
                    range.insertNode(textNode);
                }

                // Move cursor after inserted character
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }

            // Do not clear currentFormats to persist user-selected styles
            setTimeout(() => {
                serializeEditorToRoblox();
                updateActiveStyles();
            }, 0);
        }
    }, [currentFormats, updateActiveStyles]);

    // ---- serialization: DOM -> runs -> merge -> Roblox markup ----
    // Walk DOM and collect text runs each annotated with computed style from ancestry
    const collectRunsFromNode = (node, inheritedStyle) => {
        const runs = [];
        if (!node) return runs;

        if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.nodeValue;
            if (txt && txt.length > 0) {
                runs.push({ text: txt, style: inheritedStyle });
            }
            return runs;
        }

        // determine this node's style overlay
        let localStyle = cloneStyleObj(inheritedStyle || emptyStyle);

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            const computed = window.getComputedStyle ? window.getComputedStyle(node) : node.style;

            // semantic tags
            if (tag === 'b' || tag === 'strong') localStyle.bold = true;
            if (tag === 'i' || tag === 'em') localStyle.italic = true;
            if (tag === 'u') localStyle.underline = true;
            if (tag === 's') localStyle.strikethrough = true;

            // inline style overlay
            if (node.style) {
                if (node.style.color) localStyle.color = node.style.color;
                if (node.style.backgroundColor) localStyle.highlight = node.style.backgroundColor;
                if (node.style.fontFamily) localStyle.font = node.style.fontFamily.replace(/['"]/g, '').split(',')[0];
                if (node.style.fontSize) {
                    const m = node.style.fontSize.match(/(\d+)/);
                    if (m) localStyle.size = parseInt(m[1], 10);
                }
                if (node.style.opacity && node.style.opacity !== '1') localStyle.transparency = +(1 - parseFloat(node.style.opacity)).toFixed(2);
                if (node.style.textShadow) {
                    const m = node.style.textShadow.match(/(#[0-9a-fA-F]+|rgb\([^)]+\))/);
                    if (m) localStyle.stroke = m[1];
                }
            } else if (computed) {
                // fallback to computed style if necessary
                if (computed.color && computed.color !== 'rgba(0, 0, 0, 0)') localStyle.color = computed.color;
                if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') localStyle.highlight = computed.backgroundColor;
            }
        }

        // Recurse children
        let child = node.firstChild;
        while (child) {
            runs.push(...collectRunsFromNode(child, localStyle));
            child = child.nextSibling;
        }

        // If element had no children but a <br> we want to preserve newline
        if (node.nodeName === 'BR') {
            runs.push({ text: '\n', style: localStyle });
        }

        return runs;
    };

    // Merge adjacent runs with identical style
    const mergeRuns = (runs) => {
        if (!runs || runs.length === 0) return [];
        const merged = [];
        let last = { ...runs[0] };
        for (let i = 1; i < runs.length; i++) {
            if (styleEquals(last.style, runs[i].style)) {
                last.text += runs[i].text;
            } else {
                merged.push(last);
                last = { ...runs[i] };
            }
        }
        merged.push(last);
        return merged;
    };

    // Convert merged runs into Roblox markup string
    const runsToRoblox = (runs) => {
        let out = '';
        for (const run of runs) {
            // convert any internal newlines to \n (Roblox accepts newline characters)
            // but keep them as raw newlines; we preserve them
            out += wrapTextWithStyle(run.text, run.style || emptyStyle);
        }
        // Clean up: collapse multiple trailing newlines (Roblox will handle standard newlines)
        return out.replace(/\r/g, '');
    };

    // Public serializer: reads editor DOM and sets robloxMarkup
    const serializeEditorToRoblox = () => {
        const editor = editorRef.current;
        if (!editor) {
            setRobloxMarkup('');
            return;
        }
        // Collect runs starting from editor
        const runs = collectRunsFromNode(editor, cloneStyleObj(emptyStyle));
        const merged = mergeRuns(runs);
        const markup = runsToRoblox(merged);
        setRobloxMarkup(markup);
    };

    // called on input to update markup (non-blocking)
    const handleInput = useCallback(() => {
        // normalize DOM then serialize
        if (editorRef.current) editorRef.current.normalize();
        serializeEditorToRoblox();
        // update toolbar
        setTimeout(updateActiveStyles, 0);
    }, [updateActiveStyles]);

    // copy/export
    const copyToClipboard = useCallback(() => {
        if (!robloxMarkup) return;
        navigator.clipboard.writeText(robloxMarkup);
        alert('Roblox rich text markup copied to clipboard!');
    }, [robloxMarkup]);

    const exportAsFile = useCallback(() => {
        const blob = new Blob([robloxMarkup], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roblox-richtext-export.txt';
        a.click();
        URL.revokeObjectURL(url);
    }, [robloxMarkup]);

    // Color & size helpers
    const handleColorPick = useCallback(
        (type) => {
            if (activeStyles[type] || currentFormats[type]) {
                removeFormatting(type);
            } else {
                const defaultColor = type === 'highlight' ? '#FFFF00' : '#FF0000';
                const color = prompt(`Enter color (hex or name):`, defaultColor);
                if (color) applyFormatting(type, color);
            }
        },
        [applyFormatting, removeFormatting, activeStyles, currentFormats]
    );

    const handleTransparency = useCallback(() => {
        if (activeStyles.transparency || currentFormats.transparency) {
            removeFormatting('transparency');
        } else {
            const transparency = prompt('Enter opacity (0 to 1):', '0.5');
            if (transparency && /^(0(\.\d+)?|1(\.0+)?)$/.test(transparency)) {
                applyFormatting('transparency', transparency);
            } else if (transparency) {
                alert('Please enter a valid opacity between 0 and 1.');
            }
        }
    }, [applyFormatting, removeFormatting, activeStyles, currentFormats]);

    const handleFontSize = useCallback(() => {
        if (activeStyles.size || currentFormats.size) {
            removeFormatting('size');
        } else {
            const size = prompt('Enter font size (8-72):', '16');
            if (size && /^\d+$/.test(size) && size >= 8 && size <= 72) {
                applyFormatting('size', size);
            } else if (size) {
                alert('Please enter a valid font size between 8 and 72.');
            }
        }
    }, [applyFormatting, removeFormatting, activeStyles, currentFormats]);

    // initialize serialization when component mounts/changes
    useEffect(() => {
        serializeEditorToRoblox();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    Roblox Rich Text Editor
                </h1>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => {
                            if (activeStyles.bold || currentFormats.bold) {
                                removeFormatting('bold');
                            } else {
                                applyFormatting('bold');
                            }
                        }}
                        className={`p-2 rounded-lg transition ${activeStyles.bold || currentFormats.bold
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title="Bold (Click to toggle)"
                    >
                        <Bold size={20} />
                    </button>

                    <button
                        onClick={() => {
                            if (activeStyles.italic || currentFormats.italic) {
                                removeFormatting('italic');
                            } else {
                                applyFormatting('italic');
                            }
                        }}
                        className={`p-2 rounded-lg transition ${activeStyles.italic || currentFormats.italic
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title="Italic (Click to toggle)"
                    >
                        <Italic size={20} />
                    </button>

                    <button
                        onClick={() => {
                            if (activeStyles.underline || currentFormats.underline) {
                                removeFormatting('underline');
                            } else {
                                applyFormatting('underline');
                            }
                        }}
                        className={`p-2 rounded-lg transition ${activeStyles.underline || currentFormats.underline
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title="Underline (Click to toggle)"
                    >
                        <Underline size={20} />
                    </button>

                    <button
                        onClick={() => {
                            if (activeStyles.strikethrough || currentFormats.strikethrough) {
                                removeFormatting('strikethrough');
                            } else {
                                applyFormatting('strikethrough');
                            }
                        }}
                        className={`p-2 rounded-lg transition ${activeStyles.strikethrough || currentFormats.strikethrough
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title="Strikethrough (Click to toggle)"
                    >
                        <Strikethrough size={20} />
                    </button>

                    <button
                        onClick={() => handleColorPick('color')}
                        className={`p-2 rounded-lg transition relative ${activeStyles.color || currentFormats.color
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title={`Text Color${activeStyles.color || currentFormats.color ? ` (${activeStyles.color || currentFormats.color})` : ''}`}
                    >
                        <Palette size={20} />
                        {(activeStyles.color || currentFormats.color) && (
                            <div
                                className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                                style={{ backgroundColor: activeStyles.color || currentFormats.color }}
                            />
                        )}
                    </button>

                    <button
                        onClick={() => handleColorPick('highlight')}
                        className={`p-2 rounded-lg transition relative ${activeStyles.highlight || currentFormats.highlight
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title={`Highlight${activeStyles.highlight || currentFormats.highlight ? ` (${activeStyles.highlight || currentFormats.highlight})` : ''}`}
                    >
                        <Highlighter size={20} />
                        {(activeStyles.highlight || currentFormats.highlight) && (
                            <div
                                className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                                style={{ backgroundColor: activeStyles.highlight || currentFormats.highlight }}
                            />
                        )}
                    </button>

                    <button
                        onClick={handleTransparency}
                        className={`p-2 rounded-lg transition ${activeStyles.transparency || currentFormats.transparency
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title={`Transparency${activeStyles.transparency || currentFormats.transparency ? ` (${Math.round((activeStyles.transparency || currentFormats.transparency) * 100)}%)` : ''}`}
                    >
                        <Droplet size={20} />
                    </button>

                    <button
                        onClick={() => handleColorPick('stroke')}
                        className={`p-2 rounded-lg transition relative ${activeStyles.stroke || currentFormats.stroke
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title={`Text Outline${activeStyles.stroke || currentFormats.stroke ? ` (${activeStyles.stroke || currentFormats.stroke})` : ''}`}
                    >
                        <Text size={20} />
                        {(activeStyles.stroke || currentFormats.stroke) && (
                            <div
                                className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                                style={{ backgroundColor: activeStyles.stroke || currentFormats.stroke }}
                            />
                        )}
                    </button>

                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                if ((activeStyles.font || currentFormats.font) === e.target.value) {
                                    removeFormatting('font');
                                } else {
                                    applyFormatting('font', e.target.value);
                                }
                            }
                        }}
                        className={`p-2 rounded-lg transition ${activeStyles.font || currentFormats.font
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                            }`}
                        value=""
                    >
                        <option value="" disabled>
                            {activeStyles.font || currentFormats.font || 'Font Family'}
                        </option>
                        {robloxFonts.map((font) => (
                            <option key={font} value={font}>
                                {font}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleFontSize}
                        className={`px-3 py-2 rounded-lg transition text-sm ${activeStyles.size || currentFormats.size
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                            }`}
                        title={`Font Size${activeStyles.size || currentFormats.size ? ` (${activeStyles.size || currentFormats.size}px)` : ''}`}
                    >
                        {activeStyles.size || currentFormats.size ? `${activeStyles.size || currentFormats.size}px` : 'Size'}
                    </button>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setAlignment('left')}
                            className={`p-2 rounded-lg ${alignment === 'left' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'} transition`}
                            title="Align Left"
                        >
                            <AlignLeft size={20} />
                        </button>
                        <button
                            onClick={() => setAlignment('center')}
                            className={`p-2 rounded-lg ${alignment === 'center' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'} transition`}
                            title="Align Center"
                        >
                            <AlignCenter size={20} />
                        </button>
                        <button
                            onClick={() => setAlignment('right')}
                            className={`p-2 rounded-lg ${alignment === 'right' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'} transition`}
                            title="Align Right"
                        >
                            <AlignRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Active Styles Display */}
                {(Object.values(activeStyles).some(Boolean) || Object.keys(currentFormats).length > 0) && (
                    <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                        <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                            Active Styles {Object.keys(currentFormats).length > 0 && <span className="text-xs">(Next typing will use these formats)</span>}:
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {(activeStyles.bold || currentFormats.bold) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Bold</span>}
                            {(activeStyles.italic || currentFormats.italic) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Italic</span>}
                            {(activeStyles.underline || currentFormats.underline) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Underline</span>}
                            {(activeStyles.strikethrough || currentFormats.strikethrough) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Strikethrough</span>}
                            {(activeStyles.color || currentFormats.color) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Color: {activeStyles.color || currentFormats.color}</span>}
                            {(activeStyles.font || currentFormats.font) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Font: {activeStyles.font || currentFormats.font}</span>}
                            {(activeStyles.size || currentFormats.size) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Size: {activeStyles.size || currentFormats.size}px</span>}
                            {(activeStyles.highlight || currentFormats.highlight) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Highlight: {activeStyles.highlight || currentFormats.highlight}</span>}
                            {(activeStyles.transparency || currentFormats.transparency) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Opacity: {Math.round((activeStyles.transparency || currentFormats.transparency) * 100)}%</span>}
                            {(activeStyles.stroke || currentFormats.stroke) && <span className="px-2 py-1 bg-indigo-600 text-white rounded">Stroke: {activeStyles.stroke || currentFormats.stroke}</span>}
                        </div>
                    </div>
                )}

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    className="w-full min-h-64 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-auto"
                    style={{ textAlign: alignment, whiteSpace: 'pre-wrap' }}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your text here..."
                    suppressContentEditableWarning={true}
                />

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!robloxMarkup}
                    >
                        <Copy size={16} /> Copy Roblox Rich Text
                    </button>
                    <button
                        onClick={exportAsFile}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!robloxMarkup}
                    >
                        <Download size={16} /> Export Rich Text
                    </button>
                </div>

                {/* Roblox Markup Preview */}
                {robloxMarkup && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
                            Roblox Rich Text Markup:
                        </h3>
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm overflow-x-auto">
                            <pre className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                                {robloxMarkup}
                            </pre>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Copy this text and paste it into your Roblox TextLabel.Text property (with RichText enabled).
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Usage Tips:
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• <strong>With Selection:</strong> Select text and click formatting buttons to apply styles</li>
                    <li>• <strong>Without Selection:</strong> Click formatting buttons to set styles for next typing</li>
                    <li>• <strong>Toggle Formatting:</strong> Click Bold, Italic, Underline, or Strikethrough again to remove (it won't remove already-applied text unless you select it and remove)</li>
                    <li>• <strong>Same-format nesting:</strong> Applying Bold to text already bold won't nest it — toggle will remove when appropriate.</li>
                    <li>• <strong>Roblox Setup:</strong> Enable 'RichText' property on your TextLabel/TextButton in Roblox Studio</li>
                </ul>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Ensure 'Rich Text' is enabled in your Roblox TextLabel.{' '}
                <a
                    href="https://create.roblox.com/docs/ui/rich-text"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Learn more about Roblox Rich Text
                </a>
            </div>
        </div>
    );
};

export default RichTextEditor;