import {
  Box,
  Button,
  FormHelperText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectPolygonForMoving, stopMoving } from "../store/movePopupSlice";
import { polygonsApi } from "../api/polygonsApi";
import type { RootState } from "../store";
import { useEffect, useState } from "react";
import type { Polygon, Popup } from "../types";

interface MovePopupModalProps {
  isOpen: boolean;
  popupId: string;
  selectPolygon: (polygon: Polygon | string) => void;
  editPopup: (popupId: string, newPopup: Popup) => void;
  editPolygon: (polygonId: string, newPolygon: Polygon) => void;
}

export function MovePopupModal({
  isOpen,
  popupId,
  selectPolygon,
  editPopup,
  editPolygon,
}: MovePopupModalProps) {
  const dispatch = useDispatch();
  const polygonId = useSelector((s: RootState) => s.movePopup.polygonId);
  const [polygonIdError, setPolygonIdError] = useState("");

  useEffect(() => {
    if (!polygonId) return;
    setPolygonIdError("");
  }, [polygonId]);

  const handleAdding = async () => {
    if (!polygonId) {
      setPolygonIdError("Выберите полигон на карте");
      return;
    }
    const { oldPolygon, newPolygon } = await polygonsApi.movePopup(
      popupId,
      polygonId
    );

    const newPopup = newPolygon.companies.find((c) => c.id === popupId);

    if (newPopup) {
      editPopup(popupId, { ...newPopup, polygonInfo: newPolygon });
    }

    if (oldPolygon) {
      editPolygon(oldPolygon.id, oldPolygon);
    }

    editPolygon(newPolygon.id, newPolygon);

    selectPolygon(newPolygon);

    dispatch(selectPolygonForMoving(""));
    dispatch(stopMoving());
  };
  const handleCancel = () => {
    dispatch(selectPolygonForMoving(""));
    dispatch(stopMoving());
  };

  if (!isOpen) return;

  return (
    <Paper
      sx={{
        position: "fixed",
        right: 30,
        bottom: 30,
        zIndex: 50,
        p: 2,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="h5">Выбор полигона</Typography>
        {polygonIdError && (
          <FormHelperText error sx={{ ml: 1 }}>
            {polygonIdError}
          </FormHelperText>
        )}
        <Stack direction="row" justifyContent="space-between" gap={1}>
          <Button variant="contained" sx={{ flex: 1 }} onClick={handleAdding}>
            Подтвердить
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ flex: 1 }}
            onClick={handleCancel}
          >
            Отмена
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
