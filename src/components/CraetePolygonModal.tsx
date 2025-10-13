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
  InputAdornment,
} from "@mui/material";
import { useState, useEffect, type FormEvent } from "react";
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
  const [houseNumber, setHouseNumber] = useState("");

  // 🔹 Источник изображения (URL, вставка или base64)
  const [imageSource, setImageSource] = useState<string>("");
  const [imageDisplayName, setImageDisplayName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const openModal = () => dispatch(openPolygonModal());
  const handleClose = () => {
    onClose();
    dispatch(closePolygonModal());
  };
  const handleEditorMode = () => dispatch(openPolygonEditor());
  const handleEditor = () => handleEditorMode();
  const handleAddPoints = () => openModal();

  // 🔹 обработка выбора файла
  const handleFileChange = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImageSource(base64);
    setImageFile(file);
    setImageDisplayName(file.name);
    setImageError("");
  };

  // 🔹 вставка изображения из буфера обмена
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;
      const items = event.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            fileToBase64(file).then((base64) => {
              setImageSource(base64);
              setImageFile(file);
              setImageDisplayName("Вставленное изображение");
              setImageError("");
            });
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // 🔹 ручной ввод ссылки
  const handleTextChange = (value: string) => {
    setImageDisplayName(value);
    setImageSource(value);
    setImageFile(null);
    setImageError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let finalImage = imageSource;
    if (!finalImage && imageFile) {
      finalImage = await fileToBase64(imageFile);
    }

    if (!finalImage) {
      setImageError("Укажите, вставьте или загрузите изображение");
      return;
    }

    const data: Polygon = {
      id: `${Date.now()}`,
      points,
      houseNumber,
      title: address,
      image: finalImage,
      companies: [],
    };

    await polygonsApi.create(data);
    onSubmit(data);
    handleClose();
  };

  const handleCancel = () => handleClose();

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
            maxWidth: 400,
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            pt: 2.5,
            borderRadius: 2,
            minWidth: 360,
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
            {points.map((p, i) => (
              <span key={i}>
                {"{"}
                {Math.round(p.x)}; {Math.round(p.y)}
                {"} "}
              </span>
            ))}
          </Typography>

          <Button variant="outlined" onClick={handleEditor}>
            Добавить точки
          </Button>

          <Stack flexDirection={"row"} gap={1}>
            <TextField
              required
              label="№"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              sx={{ maxWidth: 80 }}
            />
            <TextField
              required
              label="Адрес"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* 🔹 Поле для вставки, ссылки или выбора файла */}
          <TextField
            label="Ссылка или изображение"
            placeholder="Вставьте или выберите изображение"
            fullWidth
            value={imageDisplayName}
            onChange={(e) => handleTextChange(e.target.value.trim())}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button component="label" variant="outlined">
                    Загрузить
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                  </Button>
                </InputAdornment>
              ),
            }}
            error={!!imageError}
            helperText={
              imageError ||
              "Можно вставить из буфера, указать ссылку или выбрать файл"
            }
          />

          {/* 🔹 Предпросмотр изображения */}
          {imageSource && (
            <Box
              mt={1}
              sx={{
                display: "flex",
                justifyContent: "center",
                maxHeight: 180,
                overflow: "hidden",
              }}
            >
              <img
                src={imageSource}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 180,
                  borderRadius: 4,
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

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
