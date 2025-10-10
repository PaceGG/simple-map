import { Box } from "@mui/material";
import ZoomPanMap, { type Popup } from "./components/ZoomPanMap";

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

function App() {
  return (
    <Box height={"98vh"}>
      <ZoomPanMap popups={popups} />
    </Box>
  );
}

export default App;
