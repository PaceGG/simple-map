import { Box, Collapse, Button, Typography } from "@mui/material";
import { useState } from "react";

export type MenuData = {
  title: string;
  type: string;
  imgSrc: string;
  logoSrc: string;
};

interface SideMenuProps {
  data: MenuData;
}

export default function SideMenu({ data }: SideMenuProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleMenu = () => setExpanded(!expanded);

  return (
    <Box display="flex" alignItems="start">
      {/* Меню */}
      <Collapse in={expanded} orientation="horizontal">
        <Box
          width="400px"
          bgcolor="white"
          display="flex"
          flexDirection="column"
          sx={{ pointerEvents: "all" }}
        >
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
              sx={{ position: "absolute", bottom: 5, left: 5 }}
            />
          </Box>
          <Typography typography="h3">{data.title}</Typography>
          <Typography typography="h5">{data.type}</Typography>
        </Box>
      </Collapse>

      <Box display="flex" alignItems="center" p={1}>
        <Button
          variant="contained"
          onClick={toggleMenu}
          sx={{ pointerEvents: "all" }}
        >
          {expanded ? "◄" : "►"}
        </Button>
      </Box>
    </Box>
  );
}
