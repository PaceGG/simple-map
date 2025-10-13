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

interface MovePopupModalProps {
  isOpen: boolean;
  popupId: string;
}

export function MovePopupModal({ isOpen, popupId }: MovePopupModalProps) {
  const dispatch = useDispatch();
  const polygonId = useSelector((s: RootState) => s.movePopup.polygonId);
  const [polygonIdError, setPolygonIdError] = useState("");

  useEffect(() => {
    if (!polygonId) return;
    setPolygonIdError("");
  }, [polygonId]);

  const handleAdding = () => {
    if (!polygonId) {
      setPolygonIdError("Выберите полигон на карте");
      return;
    }
    polygonsApi.movePopup(popupId, polygonId);
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
