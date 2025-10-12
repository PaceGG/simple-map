import { useRef, useState, useEffect, type MouseEvent } from "react";
import { Box, Paper } from "@mui/material";
import Menu, { type MenuData } from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import { openMenu } from "../store/menuSlice";
import type { Point, Polygon, Popup } from "../types";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import { CreatePointModal } from "./CreatePointModal";
import { openModal } from "../store/modalSlice";
import { popupsApi } from "../api/popupsApi";
import {
  openPolygonEditor,
  openPolygonModal,
  type PolygonModalStates,
} from "../store/polygonModalSlice";
import CreatePolygonModal from "./CraetePolygonModal";
import type { RootState } from "../store";
import { polygonsApi } from "../api/polygonsApi";

interface ZoomPanMapProps {
  backgroundUrl?: string;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  sx?: object;
}

export default function ZoomPanMap({
  backgroundUrl = "map.png",
  minScale = 0.5,
  maxScale = 400,
  initialScale = 1,
  sx = {},
}: ZoomPanMapProps) {
  const dispatch = useDispatch();

  // --- данные попапов ---
  const [popups, setPopups] = useState<Popup[]>([]);
  const popupsRef = useRef<Popup[]>([]);
  useEffect(() => {
    popupsRef.current = popups;
  }, [popups]);

  useEffect(() => {
    popupsApi.getAll().then((res) => {
      setPopups(res || []);
    });
  }, []);

  const pushPopup = (newPopup: Popup) =>
    setPopups((prev) => [...prev, newPopup]);
  const delPopup = (delId: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== delId));
    setMenuData(null);
  };

  // --- Данные полигонов ---
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const polygonsRef = useRef<Polygon[]>([]);
  useEffect(() => {
    polygonsApi.getAll().then((res) => {
      setPolygons(res || []);
    });
  }, []);
  useEffect(() => {
    polygonsRef.current = polygons;
    requestAnimationFrame(applyTransform);
  }, [polygons]);
  const pushPolygon = (newPoly: Polygon) => {
    setPolygons((prev) => [...prev, newPoly]);
  };

  // --- refs для карты ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapLayerRef = useRef<HTMLDivElement | null>(null);
  const popupLayerRef = useRef<HTMLDivElement | null>(null);
  const translateRef = useRef<Point>({ x: 0, y: 0 });
  const scaleRef = useRef<number>(initialScale);

  const clamp = (v: number, a: number, b: number) =>
    Math.max(a, Math.min(b, v));

  // applyTransform — обновляет transform для карты и позицию попапов/овера (в пикселях)
  const applyTransform = () => {
    const mapEl = mapLayerRef.current;
    const popupLayer = popupLayerRef.current;
    if (!mapEl || !popupLayer) return;

    const { x, y } = translateRef.current;
    const s = scaleRef.current;
    mapEl.style.transform = `translate(${x}px, ${y}px) scale(${s})`;

    // --- Попапы: позиционируем как раньше (screen coords) ---
    const currentPopups = popupsRef.current;
    for (const p of currentPopups) {
      const dom = document.getElementById(`popup-${p.id}`);
      if (!dom) continue;
      const screenX = Math.round(
        translateRef.current.x + p.position.x * s - 16
      );
      const screenY = Math.round(
        translateRef.current.y + p.position.y * s - 16
      );
      const el = dom as HTMLElement;
      el.style.left = `${screenX}px`;
      el.style.top = `${screenY}px`;
      el.style.width = `32px`;
      el.style.height = `32px`;
    }

    // --- Временные точки полигона (HTML элементы) ---
    const tempPoints = polygonPointsRef.current;
    for (let i = 0; i < tempPoints.length; i++) {
      const p = tempPoints[i];
      const dom = document.getElementById(`temp-${i}`);
      if (!dom) continue;
      const screenX = Math.round(translateRef.current.x + p.x * s - 16);
      const screenY = Math.round(translateRef.current.y + p.y * s - 16);
      const el = dom as HTMLElement;
      el.style.left = `${screenX}px`;
      el.style.top = `${screenY}px`;
      el.style.width = `32px`;
      el.style.height = `32px`;
    }

    // --- Полигоны: теперь рендерим их в non-scaled SVG (овере) и обновляем path в screen coords ---
    const overlaySvg = popupLayer.querySelector("svg#overlay-polygons");
    if (overlaySvg) {
      const polys = polygonsRef.current;
      for (const poly of polys) {
        const pathEl = overlaySvg.querySelector(
          `#polygon-${poly.id}`
        ) as SVGPathElement | null;
        if (!pathEl) continue;
        // построим путь в экранных координатах
        const d =
          poly.points
            .map((p, i) => {
              const sx = Math.round(translateRef.current.x + p.x * s);
              const sy = Math.round(translateRef.current.y + p.y * s);
              return `${i === 0 ? "M" : "L"}${sx},${sy}`;
            })
            .join(" ") + " Z";
        pathEl.setAttribute("d", d);
        // fill и stroke оставляем так, чтобы выглядеть стабильно на экране
        // pathEl.setAttribute("fill", poly.color || "rgba(0,0,255,0.3)");
        // pathEl.setAttribute("stroke", poly.strokeColor || "blue");
        // толщина обводки в пикселях — не зависит от scale, поэтому просто 2
        pathEl.setAttribute("stroke-width", String(2));
        pathEl.style.pointerEvents =
          polygonModalState === "edit" ? "none" : "auto";
        pathEl.style.cursor = "pointer";
      }

      // временный полигон (точки polygonPointsRef)
      if (polygonPointsRef.current.length > 1) {
        const tempEl = overlaySvg.querySelector(
          `#polygon-temp`
        ) as SVGPathElement | null;
        if (tempEl) {
          const d =
            polygonPointsRef.current
              .map((p, i) => {
                const sx = Math.round(translateRef.current.x + p.x * s);
                const sy = Math.round(translateRef.current.y + p.y * s);
                return `${i === 0 ? "M" : "L"}${sx},${sy}`;
              })
              .join(" ") + " Z";
          tempEl.setAttribute("d", d);
        }
      } else {
        const tempEl = overlaySvg.querySelector(
          `#polygon-temp`
        ) as SVGPathElement | null;
        if (tempEl) tempEl.setAttribute("d", "");
      }
    }
  };

  const polygonModalState: PolygonModalStates = useSelector(
    (state: RootState) => state.polygonModal.state
  );

  // --- drag / zoom ---
  const isDraggingRef = useRef(false);
  const isMovedRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const zoomFactor = 1 + (e.deltaY < 0 ? 0.12 : -0.12);
      const newScale = clamp(scaleRef.current * zoomFactor, minScale, maxScale);
      const oldScale = scaleRef.current;
      const tx = translateRef.current.x;
      const ty = translateRef.current.y;
      const newTx = cx - (cx - tx) * (newScale / oldScale);
      const newTy = cy - (cy - ty) * (newScale / oldScale);
      scaleRef.current = newScale;
      translateRef.current = { x: newTx, y: newTy };
      requestAnimationFrame(applyTransform);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // только левая кнопка
      isDraggingRef.current = true;
      isMovedRef.current = false; // сбрасываем флаг перемещения при начале нового действия
      lastRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastRef.current.x;
      const dy = e.clientY - lastRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isMovedRef.current = true;
      }
      lastRef.current = { x: e.clientX, y: e.clientY };
      translateRef.current.x += dx;
      translateRef.current.y += dy;
      requestAnimationFrame(applyTransform);
    };

    const onPointerUp = (event: PointerEvent) => {
      // Добавление точки — только если был "клик" (не движение) и режим "edit"
      if (
        isDraggingRef.current &&
        !isMovedRef.current &&
        polygonModalState === "edit"
      ) {
        const el = containerRef.current;
        const target = event.target as HTMLElement | null;
        if (
          !(
            target &&
            (target.closest('[data-popup="1"]') ||
              target.closest('[data-temp="1"]') ||
              target.closest("svg"))
          )
        ) {
          if (el) {
            const rect = el.getBoundingClientRect();
            const scale = scaleRef.current;
            const translate = translateRef.current;
            const x = (event.clientX - rect.left - translate.x) / scale;
            const y = (event.clientY - rect.top - translate.y) / scale;
            addPoint({ x, y });
          }
        }
      }

      isDraggingRef.current = false;
      // НЕ обнуляем isMovedRef.current здесь — нужно, чтобы onClick мог узнать, было ли движение.
      // isMovedRef будет сброшен при следующем onPointerDown.
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    requestAnimationFrame(applyTransform);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [minScale, maxScale, polygonModalState]);

  // При изменении popups — обновляем реф и позиции
  useEffect(() => {
    popupsRef.current = popups;
    requestAnimationFrame(applyTransform);
  }, [popups]);

  // --- контекстное меню ---
  const [anchorPosition, setAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [position, setPosition] = useState<Point | null>(null);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const el = containerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const scale = scaleRef.current;
      const translate = translateRef.current;
      const x = (event.clientX - rect.left - translate.x) / scale;
      const y = (event.clientY - rect.top - translate.y) / scale;
      setPosition({ x, y });
    }
    setAnchorPosition({ top: event.clientY, left: event.clientX });
  };

  const handleClose = () => setAnchorPosition(null);

  const menuItems: ContextMenuItem[] = [
    { label: "Создать точку...", onClick: () => dispatch(openModal()) },
    {
      label: "Создать полигон...",
      onClick: () => dispatch(openPolygonModal()),
    },
  ];

  // --- добавление полигона ---
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const polygonPointsRef = useRef<Point[]>([]);
  useEffect(() => {
    polygonPointsRef.current = polygonPoints;
    requestAnimationFrame(applyTransform);
  }, [polygonPoints]);

  const addPoint = (point: Point) => {
    setPolygonPoints((prev) => [...prev, point]);
  };
  const removePoint = (index: number) => {
    setPolygonPoints((prev) => prev.filter((_, i) => i !== index));
  };
  const clearPoints = () => {
    setPolygonPoints([]);
  };

  // --- выбор попапа ---
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const selectPopup = (popup: Popup) => {
    const newMenuData: MenuData = {
      id: popup.id,
      title: popup.organization.name,
      type: popup.type.type,
      imgSrc: popup.image,
      logoSrc: popup.organization.logo,
    };
    setMenuData(newMenuData);
    dispatch(openMenu());
  };

  // helper: при монтировании — выставим позиции
  useEffect(() => {
    requestAnimationFrame(applyTransform);
  }, []);

  return (
    <>
      {/* Контекстное меню и модалка */}
      <ContextMenu
        items={menuItems}
        anchorPosition={anchorPosition}
        onClose={handleClose}
      />
      <CreatePointModal position={position} pushPopup={pushPopup} />
      <CreatePolygonModal
        points={polygonPoints}
        onClose={clearPoints}
        onSubmit={pushPolygon}
      />

      {/* Панель информации */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 30,
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <Menu data={menuData} delPopup={delPopup} />
      </Box>

      <Paper
        ref={containerRef}
        elevation={2}
        onContextMenu={handleContextMenu}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          userSelect: "none",
          touchAction: "none",
          bgcolor: "#627594",
          borderRadius: 0,
          ...sx,
        }}
      >
        {/* Слой карты с трансформацией */}
        <Box
          ref={mapLayerRef}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {/* Фон карты */}
          <Box
            sx={{
              position: "relative",
              width: 1600,
              height: 1200,
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          {/* ПОЛИГОНОВ БОЛЬШЕ НЕТ ЗДЕСЬ — они рисуются в non-scaled оверле */}
        </Box>

        {/* Слой попапов и временных точек — НЕ масштабируется */}
        <Box
          ref={popupLayerRef}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {/* Оверлейный SVG — здесь рендерим полигоны в screen coords (не масштабируем) */}
          <svg
            id="overlay-polygons"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none", // Svg сам решает pointer-events для path-ов
              zIndex: 5,
            }}
          >
            {/* Полигоны: рендерим path-ы с id, d будет устанавливаться в applyTransform */}
            {polygons.map((polygon) => (
              <path
                key={polygon.id}
                id={`polygon-${polygon.id}`}
                d={""}
                fill="transparent"
                stroke="transparent"
                strokeWidth={2}
                style={{
                  pointerEvents: polygonModalState === "edit" ? "none" : "auto",
                  cursor: "pointer",
                  transition: "stroke 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.fill = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.stroke = "transparent";
                  e.currentTarget.style.fill = "transparent";
                }}
                onClick={(e) => {
                  if (!isMovedRef.current) {
                    e.stopPropagation();
                    console.log(`Клик по полигону: ${polygon.title}`);
                  }
                }}
              />
            ))}

            {/* Временный полигон из polygonPoints (овера). applyTransform обновит d */}
            <path
              id="polygon-temp"
              d={""}
              fill="rgba(0,255,0,0.25)"
              stroke="limegreen"
              strokeWidth={2}
            />
          </svg>

          {/* Попапы */}
          {popups.map((popup) => (
            <Box
              id={`popup-${popup.id}`}
              key={popup.id}
              data-popup="1"
              onClick={(e) => {
                // если было перемещение — не открываем меню
                if (!isMovedRef.current) {
                  e.stopPropagation();
                  selectPopup(popup);
                }
              }}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 32,
                height: 32,
                cursor: "pointer",
                userSelect: "none",
                zIndex: 30,
                pointerEvents: polygonModalState === "edit" ? "none" : "auto",
              }}
            >
              <img
                src={popup.type.icon}
                alt={popup.organization.name}
                style={{
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  display: "block",
                }}
              />
            </Box>
          ))}

          {/* Временные точки полигона — позиционирование делает applyTransform по id */}
          {polygonPoints.map((p, i) => (
            <img
              id={`temp-${i}`}
              key={i}
              data-temp="1"
              src="https://docs-backend.fivem.net/blips/radar_incapacitated.png"
              alt=""
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 32,
                height: 32,
                cursor: "pointer",
                pointerEvents: "auto",
                zIndex: 25,
                userSelect: "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                removePoint(i);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ))}
        </Box>
      </Paper>
    </>
  );
}
