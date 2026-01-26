import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, Home, X, Copy, Check, Download } from "lucide-react";
import BlockPalette from "../components/ScriptEditor/BlockPalette";
import Canvas from "../components/ScriptEditor/Canvas";
import ContextMenu from "../components/ScriptEditor/ContextMenu";
import { PillButton } from "../components/ScriptEditor/Icon";
import Icon from "../components/ScriptEditor/Icon";
import ThemeToggle from "../components/ThemeToggle";
import { STYLING, EVENT_TYPES, ACTION_TYPES } from "../components/ScriptEditor/Constants";

const initialJson = [
  {
    enabled: "true",
    class: "script",
    globalid: "main_script",
    content: [
      {
        y: "5000",
        x: "5000",
        globalid: "on_load",
        id: "0",
        text: ["When website loaded..."],
        width: "350",
        actions: [],
      },
    ],
  },
];

const generateId = () => Math.random().toString(36).substr(2, 6);

// Convert internal editor format to CatWeb-compliant JSON
// Based on actual CatWeb exports (not just docs)
const convertToCatWebFormat = (editorData) => {
  const convertTextArray = (textArr) => {
    if (!Array.isArray(textArr)) return textArr;
    return textArr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        // Convert to CatWeb format: value, l (if exists), t
        const converted = {};

        // Value comes first
        if (item.value !== undefined) {
          converted.value = item.value;
        } else {
          converted.value = "";
        }

        // Label (l) - only add if present and meaningful
        const label = item.l !== undefined ? item.l : item.label;
        if (label !== undefined) {
          converted.l = label;
        }

        // Type (t)
        const type = item.t !== undefined ? item.t : item.type;
        if (type !== undefined) {
          converted.t = type;
        }

        return converted;
      }
      return item;
    });
  };

  const convertAction = (action) => {
    // CatWeb action format: id, text, globalid, t (always "0")
    const cleanAction = {
      id: action.id,
      text: convertTextArray(action.text),
      globalid: action.globalid,
      t: action.t !== undefined ? action.t : "0"  // CatWeb adds "t": "0" to actions
    };
    // Only add help for comment actions (id: 124)
    if (action.id === "124" && action.help) {
      cleanAction.help = action.help;
    }
    return cleanAction;
  };

  const convertEvent = (event) => {
    const cleanEvent = {
      y: event.y,
      x: event.x,
      globalid: event.globalid,
      id: event.id,
      text: convertTextArray(event.text),
      actions: (event.actions || []).map(convertAction),
      width: event.width,
    };
    // Only add variable_overrides for function definitions (id: 6)
    if (event.id === "6" && event.variable_overrides) {
      cleanEvent.variable_overrides = event.variable_overrides;
    }
    return cleanEvent;
  };

  return editorData.map(script => {
    const converted = {
      enabled: script.enabled || "true",
    };

    // Preserve children (UI elements) if they exist
    if (script.children && script.children.length > 0) {
      converted.children = script.children;
    }

    converted.content = (script.content || []).map(convertEvent);
    converted.class = script.class;
    converted.globalid = script.globalid;

    // Preserve alias if it exists
    if (script.alias) {
      converted.alias = script.alias;
    }

    return converted;
  });
};

export default function ScriptEditor() {
  const [data, setData] = useState(initialJson);
  const [selectedScriptIndex] = useState(0);
  const [scriptName, setScriptName] = useState("Untitled Script");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [canvasPastePos, setCanvasPastePos] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement;
      const bg = getComputedStyle(root).getPropertyValue('--background').trim();
      const isDark = bg.startsWith('#0') || bg.startsWith('#1') || bg.startsWith('#2') || bg === '#000000';
      setIsDarkTheme(isDark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
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
            ...payload.actionData,
            globalid: generateId(),
            text: JSON.parse(JSON.stringify(payload.actionData.text)),
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
    const newEvent = {
      y: String(Math.round(y)),
      x: String(Math.round(x)),
      globalid: generateId(),
      id: item.id,
      text: JSON.parse(JSON.stringify(item.text)),
      width: "350",
      actions: [],
      variable_overrides: item.hasOverrides ? [] : undefined,
    };
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
          y: String(Number(original.y) + 40),
        };
        script.content.push(dup);
      }
      return next;
    });
  }, [selectedScriptIndex]);

  const handleCopyEvent = useCallback((eventId) => {
    const script = data[selectedScriptIndex];
    const event = script.content.find((e) => e.globalid === eventId);
    if (event) {
      const eventCopy = JSON.parse(JSON.stringify(event));
      navigator.clipboard.writeText(JSON.stringify(eventCopy, null, 2));
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
          y: String(Math.round(y)),
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

  const handleReset = () => setData(initialJson);

  const handleExport = () => {
    setShowExportModal(true);
  };

  // Get CatWeb-spec-compliant export data
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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            setData(JSON.parse(ev.target.result));
          } catch {
            alert("Invalid JSON");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const buildContextMenuOptions = () => {
    if (!contextMenu) return [];

    if (contextMenu.type === "canvas") {
      return [
        {
          label: "Paste Block", icon: "duplicate", onClick: () => {
            if (canvasPastePos) handlePasteFromClipboard(canvasPastePos.x, canvasPastePos.y);
          }
        },
      ];
    }

    if (contextMenu.type === "event") {
      const eventTypeOptions = Object.entries(EVENT_TYPES).map(([id, evt]) => ({
        label: typeof evt.text[0] === 'string' ? evt.text[0] : 'Event',
        onClick: () => handleUpdateScript("changeEventType", { eventId: contextMenu.item.globalid, newTypeId: id }),
      }));
      return [
        { label: "Copy", icon: "duplicate", onClick: () => handleCopyEvent(contextMenu.item.globalid) },
        { label: "Duplicate", icon: "duplicate", onClick: () => handleDuplicateEvent(contextMenu.item.globalid) },
        { label: "Change Type", icon: "edit", submenu: eventTypeOptions },
        { label: "Delete", icon: "delete", danger: true, onClick: () => handleDeleteEvent(contextMenu.item.globalid) },
      ];
    }

    if (contextMenu.type === "action") {
      const actionTypeOptions = Object.entries(ACTION_TYPES).map(([id, act]) => ({
        label: typeof act.text[0] === 'string' ? act.text[0] : 'Action',
        category: act.category,
        onClick: () => handleUpdateScript("changeActionType", {
          eventId: contextMenu.eventId, actionIndex: contextMenu.actionIndex, newTypeId: id
        }),
      }));
      return [
        { label: "Duplicate", icon: "duplicate", onClick: () => handleUpdateScript("duplicateAction", { eventId: contextMenu.eventId, actionIndex: contextMenu.actionIndex }) },
        { label: "Change Type", icon: "edit", submenu: actionTypeOptions },
        { label: "Delete", icon: "delete", danger: true, onClick: () => handleUpdateScript("deleteAction", { eventId: contextMenu.eventId, actionIndex: contextMenu.actionIndex }) },
      ];
    }
    return [];
  };

  const GAP = 12;
  const PALETTE_WIDTH = 280;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--background)" }}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-border transition-all duration-500"
        style={{
          opacity: isFullscreen ? 0 : 1,
          transform: isFullscreen ? "translateY(-100%)" : "translateY(0)",
          pointerEvents: isFullscreen ? "none" : "auto",
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

      {/* Editor Container */}
      <div
        className="flex items-center justify-center transition-all duration-500"
        style={{
          position: isFullscreen ? "fixed" : "relative",
          inset: isFullscreen ? 0 : undefined,
          zIndex: isFullscreen ? 9999 : 1,
          height: isFullscreen ? "100vh" : "calc(100vh - 64px)",
          padding: isFullscreen ? GAP : "24px",
          backgroundColor: "var(--background)",
        }}
      >
        {/* Main Editor Grid */}
        <div
          className="flex flex-col transition-all duration-500"
          style={{
            width: isFullscreen ? "100%" : "900px",
            maxWidth: "100%",
            height: isFullscreen ? "100%" : "700px",
            gap: GAP,
          }}
        >
          {/* Top Row: Title + Actions */}
          <div className="flex items-center justify-between" style={{ gap: GAP }}>
            {/* Title Pill */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer group transition-all duration-300 hover:brightness-110"
              style={{
                backgroundColor: "var(--surface)",
                boxShadow: STYLING.shadow,
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

            {/* Action Pills */}
            <div className="flex gap-2">
              <PillButton icon="reset" label="Reset" onClick={handleReset} />
              <PillButton icon="import" label="Import" onClick={handleImport} />
              <PillButton icon="export" label="Export" onClick={handleExport} />
              <PillButton
                icon={isFullscreen ? "minimize" : "fullscreen"}
                label={isFullscreen ? "Exit" : "Fullscreen"}
                onClick={() => setIsFullscreen(!isFullscreen)}
              />
            </div>
          </div>

          {/* Bottom Row: Palette + Canvas */}
          <div className="flex flex-1 min-h-0" style={{ gap: GAP }}>
            {/* Block Palette */}
            <div
              className="overflow-hidden transition-all duration-500"
              style={{
                width: `${PALETTE_WIDTH}px`,
                flexShrink: 0,
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: STYLING.shadow,
              }}
            >
              <BlockPalette onDragStart={handlePaletteDragStart} onDeleteDrop={handleDeleteDrop} />
            </div>

            {/* Canvas */}
            <div
              className="flex-1 overflow-hidden transition-all duration-500"
              style={{
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: STYLING.shadow,
              }}
            >
              <Canvas
                scriptData={data[selectedScriptIndex].content}
                onUpdateScript={handleUpdateScript}
                onDropEvent={handleDropEvent}
                onMoveEvent={handleMoveEvent}
                onDeleteEvent={handleDeleteEvent}
                onDuplicateEvent={handleDuplicateEvent}
                onContextMenu={handleContextMenu}
                onCanvasContextMenu={handleCanvasContextMenu}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            options={buildContextMenuOptions()}
            onClose={() => { setContextMenu(null); setCanvasPastePos(null); }}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowExportModal(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col mx-4"
              style={{
                backgroundColor: "rgb(var(--bg-surface))",
                borderRadius: STYLING.borderRadiusLg,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                border: "1px solid rgb(var(--border))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgb(var(--border))" }}
              >
                <h2 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>Export Script</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* JSON Preview */}
              <div className="flex-1 overflow-auto p-4">
                <pre
                  className="text-xs font-mono p-4 rounded-xl overflow-auto max-h-[400px]"
                  style={{
                    backgroundColor: "rgb(var(--bg-primary))",
                    color: "rgb(var(--text-secondary))",
                    border: "1px solid rgb(var(--border))",
                  }}
                >
                  {JSON.stringify(getExportData(), null, 2)}
                </pre>
              </div>

              {/* Modal Footer */}
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
                      border: "1px solid rgb(var(--border))",
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
                      color: "#ffffff",
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
      </div>
    </div>
  );
}
