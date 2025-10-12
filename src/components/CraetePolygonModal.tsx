import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  closePolygonModal,
  openPolygonEditor,
  openPolygonModal,
  type PolygonModalStates,
} from "../store/polygonModalSlice";
import {
  Box,
  Button,
  FormHelperText,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import type { Point, Polygon } from "../types";
import { fileToBase64, polygonsApi } from "../api/polygonsApi";

interface CreatePointModalProps {
  points: Point[];
  onClose: () => void;
  onSubmit: (polygon: Polygon) => void;
}

export default function CreatePolygonModal({
  points,
  onClose,
  onSubmit,
}: CreatePointModalProps) {
  const state: PolygonModalStates = useSelector(
    (state: RootState) => state.polygonModal.state
  );
  const dispatch = useDispatch<AppDispatch>();

  const [address, setAddress] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] || null;
    setImage(file);
    if (file) setImageError("");
  };

  const openModal = () => dispatch(openPolygonModal());
  const handleClose = () => {
    onClose();
    dispatch(closePolygonModal());
  };
  const handleEditorMode = () => dispatch(openPolygonEditor());

  const handleEditor = () => {
    console.log("добавление точек");
    handleEditorMode();
  };

  const handleAddPoints = () => {
    console.log("добавить точки");
    openModal();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) {
      setImageError("Выберите изображение");
      return;
    }

    // Конвертируем File в base64
    const imageBase64 = await fileToBase64(image);

    const data: Polygon = {
      id: `${Date.now()}`,
      points,
      title: address,
      image: imageBase64, // сохраняем как base64
    };

    await polygonsApi.create(data);
    onSubmit(data);
    handleClose();
  };

  const handleCancel = () => {
    console.log("отмена");
    handleClose();
  };

  return (
    <>
      {state === "edit" && (
        <Paper
          sx={{
            position: "absolute",
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
            <Typography variant="h5">Добавление точек</Typography>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Button
                variant="contained"
                sx={{ flex: 1 }}
                onClick={handleAddPoints}
              >
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
      )}
      <Modal open={state === "visible"}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            maxWidth: 350,
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            pt: 2.5,
            borderRadius: 2,
            minWidth: 350,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: 1 }}>
            Создать полигон
          </Typography>

          <Typography>
            Точки:{" "}
            {points.map((p) => {
              return (
                <span>
                  {"{"}
                  {Math.round(p.x)}; {Math.round(p.y)}
                  {"}"}
                </span>
              );
            })}
          </Typography>
          <Button variant="outlined" onClick={handleEditor}>
            Добавить точки
          </Button>

          <TextField
            required
            label="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Box>
            <Button variant="outlined" component="label" fullWidth>
              {image ? image.name : "Загрузить изображение"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </Button>
            {imageError && (
              <FormHelperText error sx={{ ml: 1 }}>
                {imageError}
              </FormHelperText>
            )}
          </Box>

          <Stack direction="row" justifyContent="space-between">
            <Button type="submit" variant="contained">
              Создать
            </Button>
            <Button variant="contained" color="error" onClick={handleCancel}>
              Отмена
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
