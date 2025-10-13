import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { organizationsApi } from "../api/organizationsApi";
import { fileToBase64 } from "../utils";
import { closeOrganizationModal } from "../store/organizationModalSlice";
import type { OrganizationInfo } from "../types";

export const CreateOrganizationModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector(
    (state: RootState) => state.organizationModal.isOpen
  );

  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const [iconSource, setIconSource] = useState<string>("");
  const [iconDisplayName, setIconDisplayName] = useState<string>("");
  const [iconError, setIconError] = useState("");

  // Вставка изображения из буфера
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;
      const items = event.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            fileToBase64(file).then((base64) => {
              setIconSource(base64);
              setIconDisplayName("Вставленное изображение");
              setIconError("");
            });
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setIconSource(base64);
    setIconDisplayName(file.name);
    setIconError("");
  };

  const handleTextChange = (value: string) => {
    setIconDisplayName(value);
    setIconSource(value);
    setIconError("");
  };

  const handleClose = () => {
    clearFields();
    dispatch(closeOrganizationModal());
  };

  const clearFields = () => {
    setName("");
    setType("");
    setIconSource("");
    setIconDisplayName("");
    setIconError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !type.trim()) {
      alert("Заполните название и тип организации");
      return;
    }

    if (!iconSource) {
      setIconError("Укажите, вставьте или загрузите иконку");
      return;
    }

    const newOrg: Omit<OrganizationInfo, "id"> = {
      name: name.trim(),
      type: type.trim(),
      icon: iconSource,
    };

    await organizationsApi.create(newOrg);
    clearFields();
    handleClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
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
        <Typography variant="h5">Создать организацию</Typography>

        {/* Название и тип */}
        <TextField
          label="Название"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Тип"
          required
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        {/* Поле URL / имени файла / вставленной иконки */}
        <TextField
          label="Ссылка или иконка"
          placeholder="URL, изображение или выберите файл"
          fullWidth
          value={iconDisplayName}
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
          error={!!iconError}
          helperText={
            iconError || "Можно вставить ссылку, изображение или загрузить файл"
          }
        />

        {/* Превью иконки */}
        {iconSource && (
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
              src={iconSource}
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

        {/* Кнопки */}
        <Stack direction="row" justifyContent="space-between">
          <Button type="submit" variant="contained">
            Создать
          </Button>
          <Button variant="contained" color="error" onClick={handleClose}>
            Отмена
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
