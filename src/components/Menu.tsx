import { Box, Collapse, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { toggleMenu } from "../store/menuSlice";
import { popupsApi } from "../api/popupsApi";
import { polygonsApi } from "../api/polygonsApi";

export type MenuData = {
  id: string;
  title: string;
  type: string;
  imgSrc: string;
  logoSrc: string;
  dataType: "popup" | "polygon";
} | null;

interface SideMenuProps {
  data: MenuData;
  delPopup: (id: string) => void;
  delPolygon: (id: string) => void;
}

export default function SideMenu({
  data,
  delPopup,
  delPolygon,
}: SideMenuProps) {
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const dispatch = useDispatch();

  const deletePopup = (id: string) => {
    popupsApi.delete(id);
    delPopup(id);
  };

  const deletePolygon = (id: string) => {
    polygonsApi.delete(id);
    delPolygon(id);
  };

  return (
    <Box display="flex" alignItems="start">
      {/* Меню */}
      <Collapse in={isOpen} orientation="horizontal">
        <Box
          width="400px"
          bgcolor="white"
          display="flex"
          flexDirection="column"
          sx={{ pointerEvents: "all" }}
        >
          {data && (
            <>
              <Box sx={{ position: "relative" }}>
                {data.imgSrc && (
                  <Box
                    component="img"
                    src={data.imgSrc}
                    display={"block"}
                    sx={{ width: "100%" }}
                  />
                )}
                {data.logoSrc && (
                  <Box
                    component="img"
                    src={data.logoSrc}
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      left: 5,
                      filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))",
                    }}
                  />
                )}
              </Box>
              <Typography typography="p">{data.id}</Typography>
              <Typography typography="h4">{data.title}</Typography>
              <Typography typography="h7">{data.type}</Typography>
              {data.dataType === "popup" && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deletePopup(data.id)}
                >
                  Удалить точку
                </Button>
              )}
              {data.dataType === "polygon" && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deletePolygon(data.id)}
                >
                  Удалить полигон
                </Button>
              )}
            </>
          )}
        </Box>
      </Collapse>

      <Box display="flex" alignItems="center" p={1}>
        <Button
          variant="contained"
          onClick={() => dispatch(toggleMenu())}
          sx={{ pointerEvents: "all" }}
        >
          {isOpen ? "◄" : "►"}
        </Button>
      </Box>
    </Box>
  );
}
