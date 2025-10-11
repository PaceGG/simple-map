import React, { useRef, useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";

interface Point {
  x: number;
  y: number;
}

export interface Popup {
  id: string;
  position: Point; // координаты на изображении, в пикселях
  iconUrl: string;
  title: string;
}

export interface Polygon {
  id: string;
  points: Point[];
  color?: string;
  strokeColor?: string;
  title?: string;
}

interface ZoomPanMapProps {
  backgroundUrl?: string;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  sx?: object;
  popups?: Popup[];
  polygons?: Polygon[];
}

interface DragState {
  dragging: boolean;
  lastPointer: Point;
}

export default function ZoomPanMap({
  backgroundUrl = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&auto=format&fit=crop",
  minScale = 0.5,
  maxScale = 4,
  initialScale = 1,
  sx = {},
  popups = [],
  polygons = [],
}: ZoomPanMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<DragState>({
    dragging: false,
    lastPointer: { x: 0, y: 0 },
  });

  const [scale, setScale] = useState<number>(initialScale);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 });

  const clamp = (v: number, a: number, b: number) =>
    Math.max(a, Math.min(b, v));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const zoomFactor = 1 + (e.deltaY < 0 ? 0.12 : -0.12);
      const newScale = clamp(scale * zoomFactor, minScale, maxScale);

      const oldScale = scale;
      const tx = translate.x;
      const ty = translate.y;

      const newTx = cx - (cx - tx) * (newScale / oldScale);
      const newTy = cy - (cy - ty) * (newScale / oldScale);

      setScale(newScale);
      setTranslate({ x: newTx, y: newTy });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, translate, minScale, maxScale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-popup="1"]')) return;

      if (e.button !== 0) return;

      try {
        el.setPointerCapture(e.pointerId);
      } catch (e) {
        console.log(e);
      }
      stateRef.current.dragging = true;
      stateRef.current.lastPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const lp = stateRef.current.lastPointer;
      const dx = e.clientX - lp.x;
      const dy = e.clientY - lp.y;
      stateRef.current.lastPointer = { x: e.clientX, y: e.clientY };
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    };

    const onPointerUp = (e: PointerEvent) => {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (e) {
        console.error(e);
      }
      stateRef.current.dragging = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [initialScale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // чтобы не открывалось контекстное меню
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - translate.x) / scale;
      const y = (e.clientY - rect.top - translate.y) / scale;
      console.log("Координаты на изображении:", { x, y });
    };

    el.addEventListener("contextmenu", onContextMenu);
    return () => el.removeEventListener("contextmenu", onContextMenu);
  }, [translate, scale]);

  const transformStyle: React.CSSProperties = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    transformOrigin: "0 0",
    willChange: "transform",
  };

  return (
    <Paper
      ref={containerRef}
      elevation={2}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box sx={transformStyle}>
          <Box
            sx={{
              position: "relative",
              width: 1600,
              height: 1200,
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Box>

        {/* Полигоны */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {polygons?.map((polygon) => {
            const pathD =
              polygon.points
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"}${translate.x + p.x * scale},${
                      translate.y + p.y * scale
                    }`
                )
                .join(" ") + " Z";

            return (
              <path
                key={polygon.id}
                d={pathD}
                data-popup="1"
                fill={polygon.color || "rgba(0,0,255,0.3)"}
                stroke={polygon.strokeColor || "blue"}
                strokeWidth={2}
                style={{ pointerEvents: "auto", cursor: "pointer" }}
                onClick={() =>
                  console.log(`Клик по полигону: ${polygon.title}`)
                }
              />
            );
          })}
        </svg>

        {/* Попапы фиксированного размера */}
        {popups.map((popup) => {
          // Преобразуем координаты с учётом трансляции и масштаба
          const left = translate.x + popup.position.x * scale - 16;
          const top = translate.y + popup.position.y * scale - 16;

          return (
            <Box
              key={popup.id}
              data-popup="1"
              onClick={() => console.log(`Попап нажат: ${popup.title}`)}
              sx={{
                position: "absolute",
                left,
                top,
                width: 32,
                height: 32,
                cursor: "pointer",
                userSelect: "none",
                zIndex: 10, // поверх карты
                pointerEvents: "auto", // обязательно, чтобы события мыши проходили
              }}
            >
              <img
                src={popup.iconUrl}
                alt={popup.title}
                style={{ width: 32, height: 32, pointerEvents: "none" }} // чтобы клик шёл на Box, а не на img
              />
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          position: "absolute",
          right: 8,
          bottom: 8,
          bgcolor: "rgba(255,255,255,0.8)",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          boxShadow: 1,
          fontSize: 12,
          userSelect: "none",
        }}
      >
        {Math.round(scale * 100)}%
      </Box>
    </Paper>
  );
}
