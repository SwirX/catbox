import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Layers, Home, X, Copy, Check, Download, Upload } from "lucide-react";
import BlockPalette from "../components/ScriptEditor/BlockPalette";
import Canvas from "../components/ScriptEditor/Canvas";
import ContextMenu from "../components/ScriptEditor/ContextMenu";
import { PillButton } from "../components/ScriptEditor/Icon";
import Icon from "../components/ScriptEditor/Icon";
import ThemeToggle from "../components/ThemeToggle";
import { STYLING, EVENT_TYPES, ACTION_TYPES } from "../components/ScriptEditor/Constants";
import ToolsDropdown from "../components/ScriptEditor/ToolsDropdown";
import MultiReplacePanel from "../components/ScriptEditor/MultiReplacePanel";
import MacroReplacePanel from "../components/ScriptEditor/MacroReplacePanel";
import DeObfuscatorPanel from "../components/ScriptEditor/DeObfuscatorPanel";

const generateId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let id = "";
  for (let i = 0; i < 2; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const createInitialScript = () => [{
  class: "script",
  content: [{
    y: "5000",
    x: "5000",
    globalid: generateId(),
    id: "0",
    text: ["When website loaded..."],
    actions: [],
    width: "350"
  }],
  globalid: "main_script",
  enabled: "true"
}];

const convertTextToCatWeb = (textArr) => {
  if (!Array.isArray(textArr)) return textArr;
  return textArr.map(item => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null) {
      let value = item.value !== undefined ? item.value : "";

      // Recursively handle tuples
      if (item.t === "tuple" && Array.isArray(value)) {
        value = value.map(tupleItem => {
          const result = { value: tupleItem.value !== undefined ? tupleItem.value : "" };
          if (tupleItem.l !== undefined) result.l = tupleItem.l;
          if (tupleItem.t !== undefined) result.t = tupleItem.t;
          return result;
        });
      }

      const result = { value };
      if (item.l !== undefined) result.l = item.l;
      if (item.t !== undefined) result.t = item.t;
      return result;
    }
    return item;
  });
};

const convertActionToCatWeb = (action) => {
  const result = {
    id: action.id,
    text: convertTextToCatWeb(action.text),
    globalid: action.globalid
  };
  if (action.id === "124" && action.help) {
    result.help = action.help;
  }
  return result;
};

const convertEventToCatWeb = (event) => {
  const result = {
    y: event.y,
    x: event.x,
    globalid: event.globalid,
    id: event.id,
    text: convertTextToCatWeb(event.text),
    actions: (event.actions || []).map(convertActionToCatWeb),
    width: event.width
  };
  if (event.id === "6" && event.variable_overrides) {
    result.variable_overrides = event.variable_overrides;
  }
  return result;
};

const convertToCatWebFormat = (editorData) => {
  return editorData.map(script => {
    const result = {
      class: script.class,
      content: (script.content || []).map(convertEventToCatWeb),
      globalid: script.globalid,
      enabled: script.enabled || "true"
    };
    if (script.alias) {
      result.alias = script.alias;
    }
    if (script.children && script.children.length > 0) {
      result.children = script.children;
    }
    return result;
  });
};

export default function ScriptEditor() {
  const [data, setData] = useState(createInitialScript);
  const [selectedScriptIndex] = useState(0);
  const [scriptName, setScriptName] = useState("Untitled Script");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [canvasPastePos, setCanvasPastePos] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [importText, setImportText] = useState("");

  // Tools state
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [savedMacros, setSavedMacros] = useState([]);
  const [highlightedMacros, setHighlightedMacros] = useState([]);
  const [clickableNames, setClickableNames] = useState([]);
  const [highlightedOccurrence, setHighlightedOccurrence] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement;
      const bg = getComputedStyle(root).getPropertyValue("--background").trim();
      const isDark = bg.startsWith("#0") || bg.startsWith("#1") || bg.startsWith("#2") || bg === "#000000";
      setIsDarkTheme(isDark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F - Open Find & Replace
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setToolsOpen(true);
        setActiveTool("multireplace");
      }
      // Ctrl+H - Open Find & Replace (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setToolsOpen(true);
        setActiveTool("multireplace");
      }
      // Escape - Close active tool
      if (e.key === "Escape" && activeTool) {
        setActiveTool(null);
        setToolsOpen(false);
        setSearchMatches([]);
        setCurrentMatchIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTool]);

  // Tool selection handler
  const handleToolSelect = useCallback((toolId) => {
    if (activeTool === toolId) {
      setActiveTool(null);
    } else {
      setActiveTool(toolId);
    }
  }, [activeTool]);

  // Close active tool
  const handleCloseTool = useCallback(() => {
    setActiveTool(null);
    setSearchMatches([]);
    setCurrentMatchIndex(-1);
    setHighlightedMacros([]);
    setClickableNames([]);
    setHighlightedOccurrence(null);
  }, []);

  // Replace single match
  const handleReplaceSingle = useCallback((match, newValue) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];

      if (match.type === "event") {
        const event = script.content.find(e => e.globalid === match.eventId);
        if (event && event.text[match.segmentIndex]) {
          const seg = event.text[match.segmentIndex];
          const before = seg.value.substring(0, match.matchIndex);
          const after = seg.value.substring(match.matchIndex + match.matchLength);
          seg.value = before + newValue + after;
        }
      } else if (match.type === "action") {
        const event = script.content.find(e => e.globalid === match.eventId);
        if (event && event.actions[match.actionIndex]) {
          const action = event.actions[match.actionIndex];
          const seg = action.text[match.segmentIndex];
          if (seg) {
            const before = seg.value.substring(0, match.matchIndex);
            const after = seg.value.substring(match.matchIndex + match.matchLength);
            seg.value = before + newValue + after;
          }
        }
      } else if (match.type === "override") {
        const event = script.content.find(e => e.globalid === match.eventId);
        if (event && event.variable_overrides && event.variable_overrides[match.overrideIndex]) {
          const override = event.variable_overrides[match.overrideIndex];
          const before = override.value.substring(0, match.matchIndex);
          const after = override.value.substring(match.matchIndex + match.matchLength);
          override.value = before + newValue + after;
        }
      }

      return next;
    });
  }, [selectedScriptIndex]);

  // Replace all matches
  const handleReplaceAll = useCallback((replacements) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];

      // Group replacements by segment to handle multiple matches in same field
      const groupedBySegment = new Map();

      replacements.forEach(r => {
        const key = `${r.type}-${r.eventId}-${r.actionIndex ?? ""}-${r.segmentIndex ?? ""}-${r.overrideIndex ?? ""}`;
        if (!groupedBySegment.has(key)) {
          groupedBySegment.set(key, []);
        }
        groupedBySegment.get(key).push(r);
      });

      // Process each segment's replacements in reverse order (to preserve indices)
      groupedBySegment.forEach((matches, key) => {
        matches.sort((a, b) => b.matchIndex - a.matchIndex);

        matches.forEach(match => {
          if (match.type === "event") {
            const event = script.content.find(e => e.globalid === match.eventId);
            if (event && event.text[match.segmentIndex]) {
              const seg = event.text[match.segmentIndex];
              const before = seg.value.substring(0, match.matchIndex);
              const after = seg.value.substring(match.matchIndex + match.matchLength);
              seg.value = before + match.replacement + after;
            }
          } else if (match.type === "action") {
            const event = script.content.find(e => e.globalid === match.eventId);
            if (event && event.actions[match.actionIndex]) {
              const action = event.actions[match.actionIndex];
              const seg = action.text[match.segmentIndex];
              if (seg) {
                const before = seg.value.substring(0, match.matchIndex);
                const after = seg.value.substring(match.matchIndex + match.matchLength);
                seg.value = before + match.replacement + after;
              }
            }
          } else if (match.type === "override") {
            const event = script.content.find(e => e.globalid === match.eventId);
            if (event && event.variable_overrides && event.variable_overrides[match.overrideIndex]) {
              const override = event.variable_overrides[match.overrideIndex];
              const before = override.value.substring(0, match.matchIndex);
              const after = override.value.substring(match.matchIndex + match.matchLength);
              override.value = before + match.replacement + after;
            }
          }
        });
      });

      return next;
    });
  }, [selectedScriptIndex]);

  // Save macro
  const handleSaveMacro = useCallback((macro) => {
    setSavedMacros(prev => [...prev.filter(m => m.name !== macro.name), macro]);
  }, []);

  // Replace macro comment with macro actions
  const handleReplaceMacro = useCallback((macroComment, newActions) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];
      const event = script.content.find(e => e.globalid === macroComment.eventId);

      if (event && event.actions) {
        // Remove the macro comment action
        event.actions.splice(macroComment.actionIndex, 1);
        // Insert new actions at the same position
        const actionsWithIds = newActions.map(a => ({
          ...a,
          globalid: generateId(),
        }));
        event.actions.splice(macroComment.actionIndex, 0, ...actionsWithIds);
      }

      return next;
    });
  }, [selectedScriptIndex]);

  // Rename all occurrences
  const handleRenameAll = useCallback((oldName, newName) => {
    // Escape special regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];

      // Helper to replace both exact matches and variable references like {varName}
      const replaceInValue = (value) => {
        if (Array.isArray(value)) {
          return value.map(val => {
            if (typeof val === "object" && val !== null) {
              return { ...val, value: replaceInValue(val.value) };
            }
            return replaceInValue(val);
          });
        }

        if (typeof value !== "string") return value;

        // Replace exact match
        if (value === oldName) return newName;

        // Replace variable references like {oldName} with {newName}
        // This handles Catweb's variable reference syntax
        const regex = new RegExp(`\\{${escapeRegex(oldName)}\\}`, 'g');
        return value.replace(regex, `{${newName}}`);
      };

      script.content.forEach(event => {
        // Check event text
        event.text?.forEach(seg => {
          if (typeof seg === "object" && seg.value) {
            seg.value = replaceInValue(seg.value);
          }
        });

        // Check actions
        event.actions?.forEach(action => {
          action.text?.forEach(seg => {
            if (typeof seg === "object" && seg.value) {
              seg.value = replaceInValue(seg.value);
            }
          });
        });

        // Check variable overrides (function arguments)
        if (event.variable_overrides) {
          event.variable_overrides.forEach(override => {
            if (override.value) {
              override.value = replaceInValue(override.value);
            }
          });
        }
      });

      return next;
    });
  }, [selectedScriptIndex]);

  // Navigate to event (center canvas on it)
  const handleNavigateToEvent = useCallback((eventId) => {
    if (canvasRef.current && canvasRef.current.navigateToEvent) {
      canvasRef.current.navigateToEvent(eventId);
    }
  }, []);

  const handleMoveEvent = useCallback((eventId, x, y) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];
      const idx = script.content.findIndex((e) => e.globalid === eventId);
      if (idx !== -1) {
        script.content[idx].x = String(Math.round(x));
        script.content[idx].y = String(Math.round(y));
      }
      return next;
    });
  }, [selectedScriptIndex]);

  const handleUpdateScript = useCallback((type, payload) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];

      if (type === "updateEvent") {
        const idx = script.content.findIndex((e) => e.globalid === payload.globalid);
        if (idx !== -1) script.content[idx] = payload;
      } else if (type === "addAction") {
        const eventIdx = script.content.findIndex((e) => e.globalid === payload.eventId);
        if (eventIdx !== -1) {
          const newAction = {
            id: payload.actionData.id,
            text: JSON.parse(JSON.stringify(payload.actionData.text)),
            globalid: generateId()
          };
          if (!script.content[eventIdx].actions) script.content[eventIdx].actions = [];
          script.content[eventIdx].actions.push(newAction);
        }
      } else if (type === "updateAction") {
        const eventIdx = script.content.findIndex((e) => e.globalid === payload.eventId);
        if (eventIdx !== -1 && script.content[eventIdx].actions) {
          script.content[eventIdx].actions[payload.actionIndex] = payload.updated;
        }
      } else if (type === "deleteAction") {
        const eventIdx = script.content.findIndex((e) => e.globalid === payload.eventId);
        if (eventIdx !== -1 && script.content[eventIdx].actions) {
          script.content[eventIdx].actions.splice(payload.actionIndex, 1);
        }
      } else if (type === "duplicateAction") {
        const eventIdx = script.content.findIndex((e) => e.globalid === payload.eventId);
        if (eventIdx !== -1 && script.content[eventIdx].actions) {
          const original = script.content[eventIdx].actions[payload.actionIndex];
          const dup = { ...JSON.parse(JSON.stringify(original)), globalid: generateId() };
          script.content[eventIdx].actions.splice(payload.actionIndex + 1, 0, dup);
        }
      } else if (type === "changeEventType") {
        const eventIdx = script.content.findIndex((e) => e.globalid === payload.eventId);
        if (eventIdx !== -1) {
          const newType = EVENT_TYPES[payload.newTypeId];
          if (newType) {
            script.content[eventIdx].id = payload.newTypeId;
            script.content[eventIdx].text = JSON.parse(JSON.stringify(newType.text));
            if (newType.hasOverrides) {
              script.content[eventIdx].variable_overrides = [];
            } else {
              delete script.content[eventIdx].variable_overrides;
            }
          }
        }
      } else if (type === "changeActionType") {
        const eventIdx = script.content.findIndex((e) => e.globalid === payload.eventId);
        if (eventIdx !== -1 && script.content[eventIdx].actions) {
          const newType = ACTION_TYPES[payload.newTypeId];
          if (newType) {
            script.content[eventIdx].actions[payload.actionIndex].id = payload.newTypeId;
            script.content[eventIdx].actions[payload.actionIndex].text = JSON.parse(JSON.stringify(newType.text));
          }
        }
      }
      return next;
    });
  }, [selectedScriptIndex]);

  const handleDropEvent = useCallback((item, x, y) => {
    if (item.isMove) return;
    const eventDef = EVENT_TYPES[item.id];
    const newEvent = {
      y: String(Math.round(y)),
      x: String(Math.round(x)),
      globalid: generateId(),
      id: item.id,
      text: JSON.parse(JSON.stringify(eventDef ? eventDef.text : item.text)),
      actions: [],
      width: "350"
    };
    if (eventDef?.hasOverrides) {
      newEvent.variable_overrides = [];
    }
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[selectedScriptIndex].content.push(newEvent);
      return next;
    });
  }, [selectedScriptIndex]);

  const handleDeleteEvent = useCallback((eventId) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[selectedScriptIndex].content = next[selectedScriptIndex].content.filter((e) => e.globalid !== eventId);
      return next;
    });
  }, [selectedScriptIndex]);

  const handleDuplicateEvent = useCallback((eventId) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const script = next[selectedScriptIndex];
      const original = script.content.find((e) => e.globalid === eventId);
      if (original) {
        const dup = {
          ...JSON.parse(JSON.stringify(original)),
          globalid: generateId(),
          x: String(Number(original.x) + 40),
          y: String(Number(original.y) + 40)
        };
        if (dup.actions) {
          dup.actions = dup.actions.map(a => ({ ...a, globalid: generateId() }));
        }
        script.content.push(dup);
      }
      return next;
    });
  }, [selectedScriptIndex]);

  const handleCopyEvent = useCallback((eventId) => {
    const script = data[selectedScriptIndex];
    const event = script.content.find((e) => e.globalid === eventId);
    if (event) {
      navigator.clipboard.writeText(JSON.stringify(convertEventToCatWeb(event), null, 2));
    }
  }, [data, selectedScriptIndex]);

  const handlePasteFromClipboard = useCallback(async (x, y) => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (parsed && parsed.id !== undefined && parsed.text) {
        const newEvent = {
          ...parsed,
          globalid: generateId(),
          x: String(Math.round(x)),
          y: String(Math.round(y))
        };
        if (newEvent.actions) {
          newEvent.actions = newEvent.actions.map(a => ({ ...a, globalid: generateId() }));
        }
        setData((prev) => {
          const next = JSON.parse(JSON.stringify(prev));
          next[selectedScriptIndex].content.push(newEvent);
          return next;
        });
      }
    } catch { }
  }, [selectedScriptIndex]);

  const handleDeleteDrop = useCallback((id) => handleDeleteEvent(id), [handleDeleteEvent]);

  const handlePaletteDragStart = (e, item) => {
    if (item.isEvent) {
      e.dataTransfer.setData("newBlock", JSON.stringify(item));
    } else {
      e.dataTransfer.setData("action", JSON.stringify(item));
    }
  };

  const handleContextMenu = (e, item, type, eventId = null, actionIndex = null) => {
    setContextMenu({ x: e.clientX, y: e.clientY, item, type, eventId, actionIndex });
  };

  const handleCanvasContextMenu = (screenX, screenY, canvasX, canvasY) => {
    setCanvasPastePos({ x: canvasX, y: canvasY });
    setContextMenu({ x: screenX, y: screenY, type: "canvas" });
  };

  const handleReset = () => setData(createInitialScript());

  const handleExport = () => setShowExportModal(true);

  const getExportData = () => convertToCatWebFormat(data);

  const handleExportCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getExportData(), null, 2));
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExportDownload = () => {
    const json = JSON.stringify(getExportData(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setShowImportModal(true);
    setImportText("");
  };

  const handleProcessImport = (text) => {
    try {
      const imported = JSON.parse(text || importText);
      if (Array.isArray(imported) && imported.length > 0) {
        setData(imported);
        setShowImportModal(false);
      } else {
        alert("Invalid CatWeb script format");
      }
    } catch {
      alert("Invalid JSON");
    }
  };

  const handleImportFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImportText(ev.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const buildContextMenuOptions = () => {
    if (!contextMenu) return [];

    if (contextMenu.type === "canvas") {
      return [{
        label: "Paste Block",
        icon: "duplicate",
        onClick: () => {
          if (canvasPastePos) handlePasteFromClipboard(canvasPastePos.x, canvasPastePos.y);
        }
      }];
    }

    if (contextMenu.type === "event") {
      const eventTypeOptions = Object.entries(EVENT_TYPES).map(([id, evt]) => ({
        label: typeof evt.text[0] === "string" ? evt.text[0] : "Event",
        onClick: () => handleUpdateScript("changeEventType", { eventId: contextMenu.item.globalid, newTypeId: id })
      }));
      return [
        { label: "Copy", icon: "duplicate", onClick: () => handleCopyEvent(contextMenu.item.globalid) },
        { label: "Duplicate", icon: "duplicate", onClick: () => handleDuplicateEvent(contextMenu.item.globalid) },
        { label: "Change Type", icon: "edit", submenu: eventTypeOptions },
        { label: "Delete", icon: "delete", danger: true, onClick: () => handleDeleteEvent(contextMenu.item.globalid) }
      ];
    }

    if (contextMenu.type === "action") {
      const actionTypeOptions = Object.entries(ACTION_TYPES).map(([id, act]) => ({
        label: typeof act.text[0] === "string" ? act.text[0] : "Action",
        category: act.category,
        onClick: () => handleUpdateScript("changeActionType", {
          eventId: contextMenu.eventId,
          actionIndex: contextMenu.actionIndex,
          newTypeId: id
        })
      }));
      return [
        { label: "Duplicate", icon: "duplicate", onClick: () => handleUpdateScript("duplicateAction", { eventId: contextMenu.eventId, actionIndex: contextMenu.actionIndex }) },
        { label: "Change Type", icon: "edit", submenu: actionTypeOptions },
        { label: "Delete", icon: "delete", danger: true, onClick: () => handleUpdateScript("deleteAction", { eventId: contextMenu.eventId, actionIndex: contextMenu.actionIndex }) }
      ];
    }
    return [];
  };

  const GAP = 12;
  const PALETTE_WIDTH = 280;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--background)" }}>
      <header
        className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-border transition-all duration-500"
        style={{
          opacity: isFullscreen ? 0 : 1,
          transform: isFullscreen ? "translateY(-100%)" : "translateY(0)",
          pointerEvents: isFullscreen ? "none" : "auto"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="group flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                <Layers size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight text-text-primary">Catbox</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-text-secondary hover:bg-surface-hover">
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="w-px h-6 bg-border mx-2" />
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <div
        className="flex items-center justify-center transition-all duration-500"
        style={{
          position: isFullscreen ? "fixed" : "relative",
          inset: isFullscreen ? 0 : undefined,
          zIndex: isFullscreen ? 9999 : 1,
          height: isFullscreen ? "100vh" : "calc(100vh - 64px)",
          padding: isFullscreen ? GAP : "24px",
          backgroundColor: "var(--background)"
        }}
      >
        <div
          className="flex flex-col transition-all duration-500"
          style={{
            width: isFullscreen ? "100%" : "900px",
            maxWidth: "100%",
            height: isFullscreen ? "100%" : "700px",
            gap: GAP
          }}
        >
          <div className="flex items-center justify-between" style={{ gap: GAP }}>
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer group transition-all duration-300 hover:brightness-110"
              style={{
                backgroundColor: "var(--surface)",
                boxShadow: STYLING.shadow
              }}
              onClick={() => setIsEditingName(true)}
            >
              <span className="text-sm font-bold" style={{ color: "var(--text)" }}>Script Editor</span>
              <span style={{ color: "var(--secondary)" }}>•</span>
              {isEditingName ? (
                <input
                  autoFocus
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                  className="bg-transparent text-sm font-medium outline-none"
                  style={{ color: "var(--text)", width: `${Math.max(60, scriptName.length * 7)}px` }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{scriptName}</span>
              )}
              <Icon name="edit" size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--secondary)" }} />
            </div>

            <div className="flex gap-2">
              <PillButton icon="reset" label="Reset" onClick={handleReset} />
              <PillButton icon="import" label="Import" onClick={handleImport} />
              <PillButton icon="export" label="Export" onClick={handleExport} />
              <ToolsDropdown
                isOpen={toolsOpen}
                onToggle={() => setToolsOpen(!toolsOpen)}
                activeTool={activeTool}
                onToolSelect={handleToolSelect}
              />
              <PillButton
                icon={isFullscreen ? "minimize" : "fullscreen"}
                label={isFullscreen ? "Exit" : "Fullscreen"}
                onClick={() => setIsFullscreen(!isFullscreen)}
              />
            </div>
          </div>

          <div className="flex flex-1 min-h-0" style={{ gap: GAP }}>
            {/* Left Sidebar - Either BlockPalette or Tool Panel */}
            <div
              className="flex flex-col overflow-hidden transition-all duration-500"
              style={{
                width: `${PALETTE_WIDTH}px`,
                flexShrink: 0,
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: STYLING.shadow,
                backgroundColor: "var(--surface)",
              }}
            >
              {/* When tool is active, show collapsible "Script Blocks" pill + tool panel */}
              {activeTool ? (
                <div className="flex flex-col h-full">
                  {/* Collapsible Script Blocks header */}
                  <button
                    onClick={handleCloseTool}
                    className="flex items-center justify-between gap-2 px-4 py-3 hover:brightness-95 transition-all"
                    style={{
                      backgroundColor: "var(--hover)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      ← Script Blocks
                    </span>
                  </button>

                  {/* Tool Panel Content */}
                  <div className="flex-1 overflow-y-auto p-3">
                    {activeTool === "multireplace" && (
                      <MultiReplacePanel
                        isOpen={true}
                        onClose={handleCloseTool}
                        scriptData={data[selectedScriptIndex].content}
                        onReplaceAll={handleReplaceAll}
                        onReplaceSingle={handleReplaceSingle}
                        searchMatches={searchMatches}
                        setSearchMatches={setSearchMatches}
                        currentMatchIndex={currentMatchIndex}
                        setCurrentMatchIndex={setCurrentMatchIndex}
                        onNavigateToEvent={handleNavigateToEvent}
                      />
                    )}
                    {activeTool === "macro" && (
                      <MacroReplacePanel
                        isOpen={true}
                        onClose={handleCloseTool}
                        scriptData={data[selectedScriptIndex].content}
                        savedMacros={savedMacros}
                        onSaveMacro={handleSaveMacro}
                        onReplaceMacro={handleReplaceMacro}
                        highlightedMacros={highlightedMacros}
                        setHighlightedMacros={setHighlightedMacros}
                        onNavigateToEvent={handleNavigateToEvent}
                      />
                    )}
                    {activeTool === "deobfuscate" && (
                      <DeObfuscatorPanel
                        isOpen={true}
                        onClose={handleCloseTool}
                        scriptData={data[selectedScriptIndex].content}
                        onRenameAll={handleRenameAll}
                        clickableNames={clickableNames}
                        setClickableNames={setClickableNames}
                        onNavigateToEvent={handleNavigateToEvent}
                        highlightedOccurrence={highlightedOccurrence}
                        setHighlightedOccurrence={setHighlightedOccurrence}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Normal BlockPalette when no tool is active */
                <BlockPalette onDragStart={handlePaletteDragStart} onDeleteDrop={handleDeleteDrop} />
              )}
            </div>

            <div
              className="flex-1 overflow-hidden transition-all duration-500"
              style={{
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: STYLING.shadow
              }}
            >
              <Canvas
                ref={canvasRef}
                scriptData={data[selectedScriptIndex].content}
                onUpdateScript={handleUpdateScript}
                onDropEvent={handleDropEvent}
                onMoveEvent={handleMoveEvent}
                onDeleteEvent={handleDeleteEvent}
                onDuplicateEvent={handleDuplicateEvent}
                onContextMenu={handleContextMenu}
                onCanvasContextMenu={handleCanvasContextMenu}
                isDarkTheme={isDarkTheme}
                searchMatches={searchMatches}
                currentMatchIndex={currentMatchIndex}
                highlightedMacros={highlightedMacros}
                clickableNames={clickableNames}
                highlightedOccurrence={highlightedOccurrence}
              />
            </div>
          </div>
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            options={buildContextMenuOptions()}
            onClose={() => { setContextMenu(null); setCanvasPastePos(null); }}
          />
        )}

        {showExportModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowExportModal(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col"
              style={{
                backgroundColor: "rgb(var(--bg-surface))",
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                border: "1px solid rgb(var(--border))"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgb(var(--border))" }}
              >
                <h2 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>Export Script</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-surface-hover"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <pre
                  className="text-xs font-mono p-4 rounded-xl overflow-auto max-h-[400px]"
                  style={{
                    backgroundColor: "rgb(var(--bg-primary))",
                    color: "rgb(var(--text-secondary))",
                    border: "1px solid rgb(var(--border))"
                  }}
                >
                  {JSON.stringify(getExportData(), null, 2)}
                </pre>
              </div>

              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderTop: "1px solid rgb(var(--border))" }}
              >
                <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                  {scriptName}.json
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportCopy}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: exportCopied ? "#22c55e" : "rgb(var(--bg-primary))",
                      color: exportCopied ? "white" : "rgb(var(--text-primary))",
                      border: "1px solid rgb(var(--border))"
                    }}
                  >
                    {exportCopied ? <Check size={16} /> : <Copy size={16} />}
                    {exportCopied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleExportDownload}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 hover:brightness-110"
                    style={{
                      backgroundColor: "rgb(var(--accent))",
                      color: "#ffffff"
                    }}
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showImportModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowImportModal(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col"
              style={{
                backgroundColor: "rgb(var(--bg-surface))",
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                border: "1px solid rgb(var(--border))"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgb(var(--border))" }}
              >
                <h2 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>Import Script</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-surface-hover"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <textarea
                  className="w-full h-64 p-4 rounded-xl font-mono text-xs resize-none outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-inner"
                  placeholder="Paste your script JSON here..."
                  style={{
                    backgroundColor: "rgb(var(--bg-primary))",
                    color: "rgb(var(--text-primary))",
                    border: "1px solid rgb(var(--border))"
                  }}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>

              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderTop: "1px solid rgb(var(--border))" }}
              >
                <div className="flex gap-3">
                  <button
                    onClick={handleImportFile}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: "rgb(var(--bg-primary))",
                      color: "rgb(var(--text-primary))",
                      border: "1px solid rgb(var(--border))"
                    }}
                  >
                    <Upload size={16} />
                    Load File
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProcessImport()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105 hover:brightness-110"
                    style={{
                      backgroundColor: "rgb(var(--accent))",
                      color: "#ffffff"
                    }}
                  >
                    <Check size={16} />
                    Load JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
