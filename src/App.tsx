import { Box } from "@mui/material";
import ZoomPanMap, { type Polygon, type Popup } from "./components/ZoomPanMap";

const popups: Popup[] = [
  {
    id: "popup1",
    position: { x: 200, y: 150 },
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    title: "Склад оружия",
  },
  {
    id: "popup2",
    position: { x: 800, y: 400 },
    iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
    title: "Лагерь выживших",
  },
  {
    id: "popup3",
    position: { x: 1200, y: 700 },
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    title: "Торговая точка",
  },
  {
    id: "popup4",
    position: { x: 400, y: 1000 },
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    title: "Бункер",
  },
  {
    id: "popup5",
    position: { x: 1400, y: 200 },
    iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
    title: "Мастерская",
  },
  {
    id: "popup6",
    position: { x: 0, y: 0 },
    iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
    title: "Мастерская",
  },
];

const polygons: Polygon[] = [
  {
    id: "poly1",
    title: "Полигон 1",
    points: [
      { x: 200, y: 150 },
      { x: 400, y: 150 },
      { x: 350, y: 300 },
      { x: 180, y: 280 },
    ],
    color: "rgba(255,0,0,0.3)",
    strokeColor: "red",
  },
  {
    id: "poly2",
    title: "Полигон 2",
    points: [
      { x: 600, y: 400 },
      { x: 750, y: 450 },
      { x: 700, y: 600 },
      { x: 550, y: 580 },
      { x: 500, y: 450 },
    ],
    color: "rgba(0,255,0,0.3)",
    strokeColor: "green",
  },
  {
    id: "poly3",
    title: "Полигон 3",
    points: [
      { x: 1000, y: 200 },
      { x: 1200, y: 220 },
      { x: 1250, y: 350 },
      { x: 1100, y: 400 },
      { x: 1050, y: 300 },
      { x: 1000, y: 250 },
    ],
    color: "rgba(0,0,255,0.3)",
    strokeColor: "blue",
  },
];

function App() {
  return (
    <Box height={"98vh"}>
      <ZoomPanMap popups={popups} polygons={polygons} />
    </Box>
  );
}

export default App;
