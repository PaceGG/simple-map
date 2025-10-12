import { useRef, useState, useEffect, type MouseEvent } from "react";
import { Box, Paper } from "@mui/material";
import Menu, { type MenuData } from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import { openMenu } from "../store/menuSlice";
import type { Point, Popup } from "../data";
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
  polygons?: Polygon[];
}

export default function ZoomPanMap({
  backgroundUrl = "map.png",
  minScale = 0.5,
  maxScale = 400,
  initialScale = 1,
  sx = {},
  polygons = [],
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

  // --- refs для карты ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapLayerRef = useRef<HTMLDivElement | null>(null);
  const popupLayerRef = useRef<HTMLDivElement | null>(null);
  const translateRef = useRef<Point>({ x: 0, y: 0 });
  const scaleRef = useRef<number>(initialScale);

  const clamp = (v: number, a: number, b: number) =>
    Math.max(a, Math.min(b, v));

  // applyTransform — обновляет transform для карты и позиции попапов (в пикселях)
  const applyTransform = () => {
    const mapEl = mapLayerRef.current;
    const popupLayer = popupLayerRef.current;
    if (!mapEl || !popupLayer) return;

    const { x, y } = translateRef.current;
    const s = scaleRef.current;
    mapEl.style.transform = `translate(${x}px, ${y}px) scale(${s})`;

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

    const desiredScreenRadius = 16;
    const tempCircles = mapEl.querySelectorAll('circle[data-temp="1"]');
    const rSvg = desiredScreenRadius / s;
    const strokeScreen = 1.5;
    const strokeSvg = strokeScreen / s;
    tempCircles.forEach((c) => {
      (c as SVGCircleElement).setAttribute("r", String(rSvg));
      (c as SVGCircleElement).setAttribute("stroke-width", String(strokeSvg));
    });
  };

  const polygonModalState: PolygonModalStates = useSelector(
    (state: RootState) => state.polygonModal.state
  );

  // --- drag / zoom ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isDragging = false;
    let isMoved = false;
    let last = { x: 0, y: 0 };

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
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.closest &&
        (target.closest('[data-popup="1"]') || target.closest("svg"))
      ) {
        return;
      }
      if (e.button !== 0) return;
      isDragging = true;
      isMoved = false;
      last = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isMoved = true;
      }
      last = { x: e.clientX, y: e.clientY };
      translateRef.current.x += dx;
      translateRef.current.y += dy;
      requestAnimationFrame(applyTransform);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (isDragging && !isMoved && polygonModalState === "edit") {
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
            const x = Math.round(
              (event.clientX - rect.left - translate.x) / scale
            );
            const y = Math.round(
              (event.clientY - rect.top - translate.y) / scale
            );
            addPoint({ x, y });
          }
        }
      }
      isDragging = false;
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
      const x = Math.round((event.clientX - rect.left - translate.x) / scale);
      const y = Math.round((event.clientY - rect.top - translate.y) / scale);
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

  // --- добавление полигона
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
      <CreatePolygonModal />

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

          {/* Полигоны (в масштабе) */}
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
            {polygons.map((polygon) => {
              const pathD =
                polygon.points
                  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
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

            {/* Отрисовка временного полигона из точек */}
            {polygonPoints.length > 1 && (
              <path
                d={
                  polygonPoints
                    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
                    .join(" ") + " Z"
                }
                fill="rgba(0,255,0,0.25)"
                stroke="limegreen"
                strokeWidth={2}
              />
            )}
          </svg>
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
          {/* Попапы */}
          {popups.map((popup) => (
            <Box
              id={`popup-${popup.id}`}
              key={popup.id}
              data-popup="1"
              onClick={() => selectPopup(popup)}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 32,
                height: 32,
                cursor: "pointer",
                userSelect: "none",
                zIndex: 30,
                pointerEvents: "auto",
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
          {polygonPoints.map((p, i) => {
            return (
              <Box
                id={`temp-${i}`}
                key={i}
                data-temp="1"
                sx={{
                  position: "absolute",
                  // left/top будут выставляться в applyTransform, всё что тут — начальные/статичные стили
                  left: 0,
                  top: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "yellow",
                  border: "1.5px solid black",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  zIndex: 25,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removePoint(i);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              />
            );
          })}
        </Box>
      </Paper>
    </>
  );
}
