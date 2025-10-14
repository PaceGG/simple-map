import {
  Box,
  Collapse,
  Button,
  Typography,
  Stack,
  Avatar,
  Divider,
  Link,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { startMenuLoading, toggleMenu } from "../store/menuSlice";
import { popupsApi } from "../api/popupsApi";
import { polygonsApi } from "../api/polygonsApi";
import { CreateCompanyModal } from "./CreateCompanyModal";
import { openCompanyModal } from "../store/companyModalSlice";
import type { Polygon, Popup } from "../types";
import { startMoving } from "../store/movePopupSlice";
import { MovePopupModal } from "./MovePopupModal";
import { openOrganizationModal } from "../store/organizationModalSlice";
import { CreateOrganizationModal } from "./CreateOrganizationModal";
import { SkeletonMenu } from "./SkeletonMenu";

export type MenuData = {
  id: string;
  title: string;
  type: string;
  icon?: string;
  imgSrc: string;
  logoSrc: string;
  dataType: "popup" | "polygon";
  companies?: Popup[];
  polygonInfo?: Omit<Polygon, "companies">;
  popupsPolygon?: Polygon;
} | null;

interface SideMenuProps {
  data: MenuData;
  delPopup: (id: string) => void;
  delPolygon: (id: string) => void;
  selectPolygon: (polygon: Polygon | string) => void;
  selectPopup: (popup: Popup) => void;
  isLoading: boolean;
  pushPopup: (popup: Popup) => void;
}

export default function SideMenu({
  data,
  delPopup,
  delPolygon,
  selectPolygon,
  selectPopup,
  isLoading,
  pushPopup,
}: SideMenuProps) {
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const dispatch = useDispatch();

  const popupPolygonSelection = useSelector(
    (s: RootState) => s.movePopup.selection
  );

  const deletePopup = (id: string) => {
    popupsApi.delete(id);
    delPopup(id);
  };

  const deletePolygon = (id: string) => {
    polygonsApi.delete(id);
    delPolygon(id);
  };

  if (isLoading) return <SkeletonMenu />;

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
          <Button
            variant="outlined"
            onClick={() => dispatch(openOrganizationModal())}
          >
            Добавить организацию
          </Button>
          <CreateOrganizationModal />
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
              <Box sx={{ px: 1.5, mb: 1 }}>
                <Typography
                  typography="p"
                  sx={{ fontSize: 10, color: "#777777ff" }}
                >
                  {data.id}
                </Typography>
                <Typography typography="h4">{data.title}</Typography>
                <Typography
                  typography="h7"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <img src={data.icon} alt="" />
                  {data.type}
                </Typography>
                {data.dataType === "popup" && data.polygonInfo && (
                  <Link
                    color="#268decff"
                    sx={{ cursor: "pointer" }}
                    onClick={async () => {
                      dispatch(startMenuLoading());
                      if (!data.polygonInfo) return;
                      const polygon = await polygonsApi.getById(
                        data.polygonInfo.id
                      );
                      selectPolygon(polygon);
                    }}
                  >
                    {data.polygonInfo.houseNumber} {data.polygonInfo.title}
                  </Link>
                )}
              </Box>
              {data.dataType === "polygon" && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 1.5,
                    }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => dispatch(openCompanyModal())}
                    >
                      Добавить организацию
                    </Button>
                  </Box>
                  {(data.companies?.length ?? 0) > 0 && (
                    <>
                      <Stack
                        sx={{
                          my: 2,
                          borderTop: "1px solid #0000001f",
                          borderBottom: "1px solid #0000001f",
                          maxHeight: 480,
                          overflowY: "auto",
                          overflowX: "hidden",
                        }}
                        divider={<Divider />}
                      >
                        {data.companies?.map((company, i) => (
                          <Box
                            key={`org-${i}`}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              p: 2,
                              cursor: "pointer",
                              ":hover": { bgcolor: "#0000001a" },
                            }}
                            onClick={() =>
                              selectPopup({
                                ...company,
                                polygonInfo: data.polygonInfo,
                              })
                            }
                          >
                            <Avatar
                              variant="square"
                              src={company.image}
                              sx={{ width: 80, height: 80, borderRadius: 1 }}
                            />
                            <Box>
                              <Typography variant="h6">
                                {company.organization.name}
                              </Typography>
                              <Typography
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <img src={company.organization.icon} />
                                {company.organization.type}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}
                  <CreateCompanyModal
                    polygonId={data.id}
                    pushPopup={pushPopup}
                  />
                </>
              )}
              {data.dataType === "popup" && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => dispatch(startMoving())}
                  >
                    Переместить в полигон
                  </Button>
                  <MovePopupModal
                    isOpen={popupPolygonSelection}
                    popupId={data.id}
                    selectPolygon={selectPolygon}
                  />

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deletePopup(data.id)}
                  >
                    Удалить точку
                  </Button>
                </>
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
