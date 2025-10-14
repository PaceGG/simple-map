import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Autocomplete,
  FormHelperText,
  Paper,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { Point, Popup, OrganizationInfo } from "../types";
import {
  closeCompanyModal,
  openCompanyEditor,
  openCompanyModal,
  setCompanyPoint,
} from "../store/companyModalSlice";
import { polygonsApi } from "../api/polygonsApi";
import { fileToBase64 } from "../utils";
import { organizationsApi } from "../api/organizationsApi";

interface CreateCompanyModalProps {
  polygonId: string;
  pushPopup: (popup: Popup) => void;
}

function renderPoint(point: Point): string {
  return `(${Math.round(point.x)}; ${Math.round(point.y)})`;
}

export const CreateCompanyModal = ({
  polygonId,
  pushPopup,
}: CreateCompanyModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.companyModal.state);
  const companyPosition = useSelector((s: RootState) => s.companyModal.point);

  const [companyPositionError, setCompanyPositionError] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationInfo | null>(null);
  const newOrg = useSelector((s: RootState) => s.organizationModal.newOrg);
  useEffect(() => {
    if (newOrg) setOrganizations((prev) => [...prev, newOrg]);
  }, [newOrg]);

  // 🔹 Состояния для изображения
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

  // 🔹 Вставка изображения из буфера
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

  const handleClose = () => dispatch(closeCompanyModal());
  const handleEditor = () => dispatch(openCompanyEditor());
  const handleAdding = () => {
    setCompanyPositionError("");
    dispatch(openCompanyModal());
  };

  const clearFields = () => {
    setSelectedOrganization(null);
    dispatch(setCompanyPoint(null));
    setCompanyPositionError("");
    setImageSource("");
    setImageDisplayName("");
    setImageFile(null);
    setImageError("");
  };

  const handleCancel = () => {
    clearFields();
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!companyPosition) {
      setCompanyPositionError("Укажите точку на карте");
      return;
    } else setCompanyPositionError("");

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
    } else setImageError("");

    const data: Popup = {
      id: `${Date.now()}`,
      image: finalImage,
      organization: selectedOrganization,
      position: companyPosition,
    };

    const polygon = await polygonsApi.addCompany(polygonId, data);
    clearFields();
    handleClose();
    pushPopup({ ...data, polygonInfo: polygon });
  };

  return (
    <>
      {/* 🔹 Мини-панель выбора точки */}
      {state === "edit" && (
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
            <Typography variant="h5">Выбор точки</Typography>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Button
                variant="contained"
                sx={{ flex: 1 }}
                onClick={handleAdding}
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

      {/* 🔹 Главное модальное окно */}
      <Modal open={state === "visible"} onClose={handleClose}>
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
          <Typography variant="h5" sx={{ mb: 1 }}>
            Создать компанию{" "}
            {companyPosition && `в точке ${renderPoint(companyPosition)}`}
          </Typography>

          {/* 🔹 Кнопка выбора точки */}
          <Box>
            <Button variant="outlined" onClick={handleEditor} fullWidth>
              Указать точку
            </Button>
            {companyPositionError && (
              <FormHelperText error sx={{ ml: 1 }}>
                {companyPositionError}
              </FormHelperText>
            )}
          </Box>

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
            onChange={(_, newValue) => {
              setSelectedOrganization(newValue);
            }}
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
    </>
  );
};
