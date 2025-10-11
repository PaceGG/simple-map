import { Box } from "@mui/material";
import ZoomPanMap from "./components/ZoomPanMap";

import { popups } from "./data";

function App() {
  return (
    <Box height={"100vh"}>
      <ZoomPanMap popups={popups} />
    </Box>
  );
}

export default App;
