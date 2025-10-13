import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { closeModal } from "../store/modalSlice";
import type { OrganizationInfo, Popup } from "../types";
import { popupsApi } from "../api/popupsApi";
import { fileToBase64 } from "../utils";
import { organizationsApi } from "../api/organizationsApi";

interface CreatePointModalProps {
  position: { x: number; y: number } | null;
  pushPopup: (popup: Popup) => void;
}

export const CreatePointModal = ({
  position,
  pushPopup,
}: CreatePointModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.modal.isActive);

  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationInfo | null>(null);
  const newOrg = useSelector((s: RootState) => s.organizationModal.newOrg);
  useEffect(() => {
    if (newOrg) setOrganizations((prev) => [...prev, newOrg]);
  }, [newOrg]);

  const [imageSource, setImageSource] = useState<string>("");
  const [imageDisplayName, setImageDisplayName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  // 🔹 Загрузка организаций
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await organizationsApi.getAll();
        setOrganizations(orgs);
      } catch (error) {
        console.error("Ошибка при загрузке организаций:", error);
      }
    };

    fetchOrganizations();
  }, []);

  // 🔹 Вставка изображения из буфера обмена
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

  const handleClose = () => dispatch(closeModal());

  const handleCancel = () => {
    clearFields();
    dispatch(closeModal());
  };

  const clearFields = () => {
    setSelectedOrganization(null);
    setImageSource("");
    setImageDisplayName("");
    setImageFile(null);
    setImageError("");
  };

  const handleFileChange = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImageSource(base64);
    setImageFile(file);
    setImageDisplayName(file.name);
    setImageError("");
  };

  const handleTextChange = (value: string) => {
    setImageDisplayName(value);
    setImageSource(value);
    setImageFile(null);
    setImageError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOrganization) {
      alert("Выберите организацию");
      return;
    }

    let finalImage = imageSource;
    if (!finalImage && imageFile) {
      finalImage = await fileToBase64(imageFile);
    }

    if (!finalImage) {
      setImageError("Укажите, вставьте или загрузите изображение");
      return;
    }

    const data: Popup = {
      id: `${Date.now()}`,
      organization: selectedOrganization,
      image: finalImage,
      position: position ?? { x: 0, y: 0 },
    };

    await popupsApi.create(data);
    pushPopup(data);
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
          minWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          Создать точку ({position?.x && <span>{Math.round(position.x)}</span>};{" "}
          {position?.y && <span>{Math.round(position.y)}</span>})
        </Typography>

        {/* 🔹 Выбор организации */}
        <Autocomplete
          options={organizations}
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => (
            <li
              {...props}
              key={option.name}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {option.icon && (
                <img
                  src={option.icon}
                  alt={option.name}
                  style={{ width: 24, height: 24, borderRadius: 4 }}
                />
              )}
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Организация" required fullWidth />
          )}
          value={selectedOrganization}
          onChange={(_, newValue) => setSelectedOrganization(newValue)}
        />

        {/* 🔹 Отображение информации об организации */}
        {selectedOrganization && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            {selectedOrganization.icon && (
              <img
                src={selectedOrganization.icon}
                alt={selectedOrganization.name}
                style={{ width: 32, height: 32 }}
              />
            )}
            <Typography>{selectedOrganization.type}</Typography>
          </Box>
        )}

        {/* 🔹 Поле URL / имени файла / вставленного изображения */}
        <TextField
          label="Ссылка или изображение"
          placeholder="URL, изображение или выберите файл"
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
            "Можно вставить ссылку, изображение или загрузить файл"
          }
        />

        {/* 🔹 Превью изображения */}
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

        {/* 🔹 Кнопки */}
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
  );
};
