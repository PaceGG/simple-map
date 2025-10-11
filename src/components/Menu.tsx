import { Box, Collapse, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { toggleMenu } from "../store/menuSlice";
import { popupsApi } from "../api/popupsApi";

export type MenuData = {
  id: string;
  title: string;
  type: string;
  imgSrc: string;
  logoSrc: string;
} | null;

interface SideMenuProps {
  data: MenuData;
}

export default function SideMenu({ data }: SideMenuProps) {
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const dispatch = useDispatch();

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
                <Box
                  component="img"
                  src={data.imgSrc}
                  display={"block"}
                  sx={{ width: "100%" }}
                />
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
              </Box>
              <Typography typography="h3">{data.title}</Typography>
              <Typography typography="h5">{data.type}</Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => popupsApi.delete(data.id)}
              >
                Удалить точку
              </Button>
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
