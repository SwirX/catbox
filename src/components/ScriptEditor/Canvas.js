import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import EventBlock from "./EventBlock";
import { IconPill } from "./Icon";
import { CANVAS_SIZE, GRID_SIZE } from "./Constants";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const CENTER_X = 5000;
const CENTER_Y = 5000;

const Canvas = forwardRef(({
    scriptData,
    onUpdateScript,
    onDropEvent,
    onMoveEvent,
    onDeleteEvent,
    onDuplicateEvent,
    onContextMenu,
    onCanvasContextMenu,
    isDarkTheme,
    searchMatches = [],
    currentMatchIndex = -1,
    highlightedMacros = [],
    clickableNames = [],
    highlightedOccurrence = null,
    onNameClick,
}, ref) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [draggingEvent, setDraggingEvent] = useState(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const offsetStartRef = useRef({ x: 0, y: 0 });
    const eventStartPosRef = useRef({ x: 0, y: 0 });

    const gridColor = isDarkTheme ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.08)";

    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setOffset({
                x: -CENTER_X + rect.width / 2,
                y: -CENTER_Y + rect.height / 2,
            });
        }
    }, []);

    const handleMouseDown = useCallback((e) => {
        const isBackground = e.target === containerRef.current || e.target === canvasRef.current;
        if (e.button === 0 && isBackground) {
            e.preventDefault();
            setIsPanning(true);
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            offsetStartRef.current = { ...offset };
        }
    }, [offset]);

    const handleMouseMove = useCallback((e) => {
        if (isPanning) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setOffset({
                x: offsetStartRef.current.x + dx,
                y: offsetStartRef.current.y + dy,
            });
        } else if (draggingEvent) {
            const dx = (e.clientX - dragStartRef.current.x) / zoom;
            const dy = (e.clientY - dragStartRef.current.y) / zoom;
            const newX = eventStartPosRef.current.x + dx;
            const newY = eventStartPosRef.current.y + dy;
            onMoveEvent(draggingEvent, newX, newY);
        }
    }, [isPanning, draggingEvent, zoom, onMoveEvent]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
        setDraggingEvent(null);
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
        const zoomRatio = newZoom / zoom;

        setOffset((prev) => ({
            x: mouseX - (mouseX - prev.x) * zoomRatio,
            y: mouseY - (mouseY - prev.y) * zoomRatio,
        }));
        setZoom(newZoom);
    }, [zoom]);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newBlockData = e.dataTransfer.getData("newBlock");

        if (newBlockData) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - offset.x) / zoom;
            const y = (e.clientY - rect.top - offset.y) / zoom;
            const item = JSON.parse(newBlockData);
            if (item.isEvent) onDropEvent(item, x, y);
        }
    };

    const handleEventDragStart = (eventId, startX, startY, mouseX, mouseY) => {
        setDraggingEvent(eventId);
        dragStartRef.current = { x: mouseX, y: mouseY };
        eventStartPosRef.current = { x: startX, y: startY };
    };

    const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + 0.1));
    const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - 0.1));

    const handleCenter = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setOffset({
                x: -CENTER_X * zoom + rect.width / 2,
                y: -CENTER_Y * zoom + rect.height / 2,
            });
        }
    };

    const navigateToEvent = useCallback((eventId) => {
        const event = scriptData.find(e => e.globalid === eventId);
        if (event && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const eventX = Number(event.x);
            const eventY = Number(event.y);
            setOffset({
                x: -eventX * zoom + rect.width / 2,
                y: -eventY * zoom + rect.height / 2,
            });
        }
    }, [scriptData, zoom]);

    useImperativeHandle(ref, () => ({
        navigateToEvent,
    }), [navigateToEvent]);

    const handleCanvasRightClick = (e) => {
        const isBackground = e.target === containerRef.current || e.target === canvasRef.current;
        if (isBackground) {
            e.preventDefault();
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - offset.x) / zoom;
            const y = (e.clientY - rect.top - offset.y) / zoom;
            onCanvasContextMenu(e.clientX, e.clientY, x, y);
        }
    };

    const cursor = isPanning ? "cursor-grabbing" : draggingEvent ? "cursor-move" : "cursor-grab";

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden relative ${cursor}`}
            style={{ backgroundColor: "var(--background)" }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onContextMenu={handleCanvasRightClick}
        >
            <div
                ref={canvasRef}
                className="absolute origin-top-left"
                style={{
                    width: CANVAS_SIZE,
                    height: CANVAS_SIZE,
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                    backgroundColor: "var(--surface)",
                }}
            >
                <div
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                        left: CENTER_X - 6,
                        top: CENTER_Y - 6,
                        backgroundColor: "var(--accent)",
                        opacity: 0.6,
                    }}
                />

                {scriptData.map((eventBlock, i) => {
                    const eventClickables = clickableNames.filter(c => c.eventId === eventBlock.globalid);
                    const hasNeonHighlight = highlightedOccurrence && highlightedOccurrence.eventId === eventBlock.globalid;

                    return (
                        <EventBlock
                            key={eventBlock.globalid || i}
                            event={eventBlock}
                            x={Number(eventBlock.x)}
                            y={Number(eventBlock.y)}
                            onUpdate={(updated) => onUpdateScript("updateEvent", updated)}
                            onActionDrop={(eventId, actionData) => onUpdateScript("addAction", { eventId, actionData })}
                            onActionUpdate={(eventId, actionIndex, updated) => onUpdateScript("updateAction", { eventId, actionIndex, updated })}
                            onActionDelete={(eventId, actionIndex) => onUpdateScript("deleteAction", { eventId, actionIndex })}
                            onActionDuplicate={(eventId, actionIndex) => onUpdateScript("duplicateAction", { eventId, actionIndex })}
                            onDelete={onDeleteEvent}
                            onDuplicate={onDuplicateEvent}
                            onContextMenu={onContextMenu}
                            onDragStart={(eventId, x, y, mouseX, mouseY) => handleEventDragStart(eventId, x, y, mouseX, mouseY)}
                            isDragging={draggingEvent === eventBlock.globalid}
                            highlightedInputs={eventClickables}
                            neonHighlight={hasNeonHighlight ? highlightedOccurrence : null}
                        />
                    );
                })}
            </div>

            <div className="absolute bottom-3 right-3 flex gap-1.5">
                <IconPill icon="zoomOut" onClick={handleZoomOut} title="Zoom Out" />
                <IconPill icon="zoomIn" onClick={handleZoomIn} title="Zoom In" />
                <IconPill icon="center" onClick={handleCenter} title="Center View" />
            </div>

            <div
                className="absolute bottom-3 left-3 px-2.5 py-1 text-[10px] font-medium rounded-full"
                style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--secondary)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
            >
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
});

export default Canvas;
