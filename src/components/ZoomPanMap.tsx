import { useRef, useState, useEffect, type MouseEvent } from "react";
import { Box, Paper } from "@mui/material";
import Menu, { type MenuData } from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import {
  openMenu,
  startMenuLoading,
  stopMenuLoading,
} from "../store/menuSlice";
import type { Point, Polygon, Popup } from "../types";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import { CreatePointModal } from "./CreatePointModal";
import { openModal } from "../store/modalSlice";
import { popupsApi } from "../api/popupsApi";
import {
  openPolygonModal,
  setPolygonAddress,
  type PolygonModalStates,
} from "../store/polygonModalSlice";
import CreatePolygonModal from "./CraetePolygonModal";
import type { RootState } from "../store";
import { polygonsApi } from "../api/polygonsApi";
import {
  setCompanyPoint,
  type CompanyModalStates,
} from "../store/companyModalSlice";
import { selectPolygonForMoving } from "../store/movePopupSlice";

interface ZoomPanMapProps {
  backgroundUrl?: string;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  sx?: object;
}

export default function ZoomPanMap({
  backgroundUrl = "gtav.png",
  minScale = 0.03,
  maxScale = 400,
  initialScale = 0.03,
  sx = {},
}: ZoomPanMapProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedScale = localStorage.getItem("mapScale");
    const savedTranslate = localStorage.getItem("mapTranslate");
    if (savedScale) scaleRef.current = parseFloat(savedScale);
    if (savedTranslate) {
      try {
        const t = JSON.parse(savedTranslate);
        if (t.x != null && t.y != null) translateRef.current = t;
      } catch (e) {
        console.error(e);
      }
    }
    requestAnimationFrame(applyTransform);
  }, []);

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

  const pushPopup = (newPopup: Popup) => {
    setPopups((prev) => [...prev, newPopup]);
    selectPopup(newPopup);
  };
  const delPopup = (delId: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== delId));
    setMenuData(null);
  };
  const editPopup = (popupId: string, newPopup: Popup) => {
    setPopups((prev) => prev.map((p) => (p.id === popupId ? newPopup : p)));
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
    selectPolygon(newPoly);
  };
  const delPolygon = (delId: string) => {
    setPolygons((prev) => prev.filter((p) => p.id !== delId));
    setMenuData(null);
  };
  const editPolygon = (polygonId: string, newPolygon: Polygon) => {
    setPolygons((prev) =>
      prev.map((p) => (p.id === polygonId ? newPolygon : p))
    );
    // selectPolygon(newPolygon);
  };

  // --- refs для карты ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapLayerRef = useRef<HTMLDivElement | null>(null);
  const popupLayerRef = useRef<HTMLDivElement | null>(null);
  const translateRef = useRef<Point>({ x: 620, y: 42 });
  const scaleRef = useRef<number>(initialScale);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundUrl;

    let cancelled = false;
    const MAX_INTERNAL = 20000;

    const draw = () => {
      if (cancelled) return;
      const imgW = img.naturalWidth || 1600;
      const imgH = img.naturalHeight || 1200;
      const logicalW = imgW;
      const logicalH = imgH;

      const dpr = window.devicePixelRatio || 1;

      const scaleDown = Math.min(
        1,
        MAX_INTERNAL / Math.max(logicalW, logicalH)
      );

      canvas.style.width = `${logicalW}px`;
      canvas.style.height = `${logicalH}px`;
      canvas.style.display = "block";
      canvas.style.pointerEvents = "none";
      canvas.style.userSelect = "none";

      // внутреннее разрешение буфера (в пикселях)
      canvas.width = Math.max(1, Math.round(logicalW * scaleDown * dpr));
      canvas.height = Math.max(1, Math.round(logicalH * scaleDown * dpr));

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // масштабируем контекст так, чтобы мы могли рисовать в LOGICAL координатах:
      // transformScale = dpr * scaleDown
      const transformScale = dpr * scaleDown;
      ctx.setTransform(transformScale, 0, 0, transformScale, 0, 0);

      // Очищаем и рисуем картинку на логических координатах
      ctx.clearRect(0, 0, logicalW, logicalH);
      // drawImage с размерами logicalW × logicalH — transform позаботится о персеверной
      ctx.drawImage(img, 0, 0, logicalW, logicalH);
    };

    if (img.complete && img.naturalWidth) {
      draw();
    } else {
      img.onload = draw;
      img.onerror = () => {
        console.warn("Не удалось загрузить фон:", backgroundUrl);
        // можно отрисовать заливку или плейсхолдер
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#333";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };
    }

    // опционально: если backgroundUrl изменится — повторно отрисуем
    return () => {
      cancelled = true;
    };
  }, [backgroundUrl]);

  const clamp = (v: number, a: number, b: number) =>
    Math.max(a, Math.min(b, v));

  // applyTransform — обновляет transform для карты и позицию попапов/овера (в пикселях)
  const applyTransform = () => {
    const mapEl = mapLayerRef.current;
    const popupLayer = popupLayerRef.current;
    if (!mapEl || !popupLayer) return;

    const { x, y } = translateRef.current;
    const s = scaleRef.current;
    console.log({ x, y }, s);
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

    // --- Временная точка компании ---
    const p = companyPointRef.current;
    if (p) {
      const dom = document.getElementById("temp-companypoint");
      if (dom) {
        const screenX = Math.round(translateRef.current.x + p.x * s - 16);
        const screenY = Math.round(translateRef.current.y + p.y * s - 16);
        const el = dom as HTMLElement;
        el.style.left = `${screenX}px`;
        el.style.top = `${screenY}px`;
      }
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

        const d =
          poly.points
            .map((p, i) => {
              const sx = Math.round(translateRef.current.x + p.x * s);
              const sy = Math.round(translateRef.current.y + p.y * s);
              return `${i === 0 ? "M" : "L"}${sx},${sy}`;
            })
            .join(" ") + " Z";
        pathEl.setAttribute("d", d);

        // --- центр полигона ---
        const centroid = (() => {
          let x = 0,
            y = 0;
          for (const p of poly.points) {
            x += p.x;
            y += p.y;
          }
          return {
            x: Math.round(
              translateRef.current.x + (x / poly.points.length) * s
            ),
            y: Math.round(
              translateRef.current.y + (y / poly.points.length) * s
            ),
          };
        })();

        const textEl = overlaySvg.querySelector(
          `#polygon-text-${poly.id}`
        ) as SVGTextElement | null;
        if (textEl) {
          textEl.setAttribute("x", String(centroid.x));
          textEl.setAttribute("y", String(centroid.y));
          textEl.setAttribute("font-size", String(s * 7.77));
          if (s > 0.9) {
            textEl.style.display = "inline";
          } else {
            textEl.style.display = "none";
          }
        }
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

  const companyModalState: CompanyModalStates = useSelector(
    (s: RootState) => s.companyModal.state
  );

  const companyPoint = useSelector((s: RootState) => s.companyModal.point);
  const companyPointRef = useRef<Point | null>(null);

  useEffect(() => {
    if (!companyPoint) return;
    companyPointRef.current = companyPoint;
    requestAnimationFrame(applyTransform);
  }, [companyPoint]);

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
      saveMapState();
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
      isMovedRef.current = true;
      lastRef.current = { x: e.clientX, y: e.clientY };
      translateRef.current.x += dx;
      translateRef.current.y += dy;
      requestAnimationFrame(applyTransform);
      saveMapState();
    };

    const onPointerUp = (event: PointerEvent) => {
      // Добавление точки — только если был "клик" (не движение) и режим "edit"
      if (
        isDraggingRef.current &&
        !isMovedRef.current &&
        (polygonModalState === "edit" || companyModalState === "edit")
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
            if (polygonModalState === "edit") addPolygonPoint({ x, y });
            if (companyModalState === "edit")
              dispatch(setCompanyPoint({ x, y }));
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
  }, [minScale, maxScale, polygonModalState, companyModalState, dispatch]);

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

  const addPolygonPoint = (point: Point) => {
    setPolygonPoints((prev) => [...prev, point]);
  };
  const removePoint = (index: number) => {
    setPolygonPoints((prev) => prev.filter((_, i) => i !== index));
  };
  const clearPoints = () => {
    setPolygonPoints([]);
  };

  // --- Выбор полигона для добавления в него попапа
  const selectedPolygonForMoving = useSelector(
    (s: RootState) => s.movePopup.polygonId
  );
  const selectionPolygonForMoving = useSelector(
    (s: RootState) => s.movePopup.selection
  );

  const [selectedPolygon, setSelectedPolygon] = useState("");
  const [polygonHovered, setPolygonHovered] = useState("");

  // --- выбор меню ---
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const isMenuLoading = useSelector((s: RootState) => s.menu.isLoading);
  const selectPopup = (popup: Popup) => {
    dispatch(startMenuLoading());
    const newMenuData: MenuData = {
      id: popup.id,
      title: popup.organization.name,
      type: popup.organization.type,
      icon: popup.organization.icon,
      imgSrc: popup.image,
      // logoSrc: popup.organization.logo,
      logoSrc: "",
      dataType: "popup",
      polygonInfo: popup.polygonInfo,
    };
    setSelectedPolygon("");
    setMenuData(newMenuData);
    dispatch(openMenu());
    dispatch(stopMenuLoading());
  };

  const selectPolygon = async (polygon: Polygon | string) => {
    dispatch(startMenuLoading());

    let poly: Polygon;

    if (typeof polygon === "string") {
      poly = await polygonsApi.getById(polygon);
    } else {
      poly = polygon;
    }
    const newMenuData: MenuData = {
      id: poly.id,
      title: `${poly.houseNumber} ${poly.title}`,
      type: "",
      imgSrc: poly.image,
      logoSrc: "",
      dataType: "polygon",
      companies: poly.companies,
      polygonInfo: poly,
    };
    setSelectedPolygon(poly.id);
    dispatch(setPolygonAddress(poly.title));
    setMenuData(newMenuData);
    dispatch(openMenu());
    dispatch(stopMenuLoading());
  };

  // helper: при монтировании — выставим позиции
  useEffect(() => {
    requestAnimationFrame(applyTransform);
  }, []);

  function debounce(func: () => void, wait: number) {
    let timeout: number; // <-- здесь просто number
    return () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(), wait); // <-- window.setTimeout
    };
  }

  const saveMapState = debounce(() => {
    console.log("Сохраняем состояние карты:", {
      scale: scaleRef.current,
      translate: translateRef.current,
    });
    localStorage.setItem("mapScale", scaleRef.current.toString());
    localStorage.setItem("mapTranslate", JSON.stringify(translateRef.current));
  }, 300);

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
        <Menu
          data={menuData}
          delPopup={delPopup}
          delPolygon={delPolygon}
          selectPolygon={selectPolygon}
          selectPopup={selectPopup}
          isLoading={isMenuLoading}
          pushPopup={pushPopup}
          editPopup={editPopup}
          editPolygon={editPolygon}
        />
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
          <canvas
            ref={bgCanvasRef}
            aria-hidden
            style={{
              position: "relative",
              width: 1600,
              height: 1200,
              display: "block",
              pointerEvents: "none", // фон не мешает кликам
              userSelect: "none",
            }}
          />
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
              <g key={polygon.id}>
                <path
                  id={`polygon-${polygon.id}`}
                  d={""} // applyTransform обновит
                  fill={
                    selectedPolygonForMoving === polygon.id
                      ? "rgba(0, 200, 83, 0.4)" // яркий зелёный с прозрачностью
                      : selectedPolygon === polygon.id
                      ? "rgba(30, 136, 229, 0.4)" // насыщенный синий
                      : polygonHovered === polygon.id
                      ? "rgba(255, 255, 255, 0.15)" // заметнее подсветка при наведении
                      : "red"
                  }
                  stroke={
                    selectedPolygonForMoving === polygon.id
                      ? "rgba(0, 150, 70, 0.9)" // тёмный зелёный контур
                      : selectedPolygon === polygon.id
                      ? "rgba(21, 101, 192, 0.9)" // тёмный синий контур
                      : polygonHovered === polygon.id
                      ? "rgba(255, 255, 255, 0.5)" // белый полупрозрачный контур
                      : "red"
                  }
                  strokeWidth={2}
                  style={{
                    pointerEvents:
                      polygonModalState === "edit" ||
                      companyModalState === "edit"
                        ? "none"
                        : "auto",
                    cursor: "pointer",
                    transition: "stroke 0.2s ease",
                  }}
                  onMouseEnter={() => {
                    setPolygonHovered(polygon.id);
                  }}
                  onMouseLeave={() => {
                    setPolygonHovered("");
                  }}
                  onClick={(e) => {
                    if (!isMovedRef.current) {
                      e.stopPropagation();
                      if (selectionPolygonForMoving)
                        dispatch(selectPolygonForMoving(polygon.id));
                      else selectPolygon(polygon);
                    }
                  }}
                />
                <text
                  id={`polygon-text-${polygon.id}`}
                  x={0}
                  y={0}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fill="#34495E" // насыщенный серо-синий
                  stroke="#BDC3C7" // средняя серая обводка
                  strokeWidth={2}
                  paintOrder="stroke" // сначала рисуется обводка, потом текст
                  fontSize={14}
                  fontWeight="500"
                  pointerEvents="none"
                  fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                >
                  {polygon.houseNumber}
                </text>
              </g>
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
                src={popup.organization.icon}
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
          {polygonPoints.map((_, i) => (
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

          {companyPoint && (
            <img
              id={`temp-companypoint`}
              key={"companypoint"}
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
                dispatch(setCompanyPoint(null));
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
        </Box>
      </Paper>
    </>
  );
}
