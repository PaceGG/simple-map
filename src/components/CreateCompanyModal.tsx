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
}

function renderPoint(point: Point): string {
  return `(${Math.round(point.x)}; ${Math.round(point.y)})`;
}

export const CreateCompanyModal = ({ polygonId }: CreateCompanyModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.companyModal.state);
  const companyPosition = useSelector((s: RootState) => s.companyModal.point);

  const [companyPositionError, setCompanyPositionError] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationInfo | null>(null);
  const [image, setImage] = useState<File | null>(null);
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

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] || null;
    setImage(file);
    if (file) setImageError("");
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
    setImage(null);
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

    if (!image) {
      setImageError("Выберите изображение");
      return;
    } else setImageError("");

    const base64 = await fileToBase64(image);

    const data: Popup = {
      id: `${Date.now()}`,
      image: base64,
      organization: selectedOrganization,
      position: companyPosition,
    };

    await polygonsApi.addCompany(polygonId, data);
    clearFields();
    handleClose();
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
              <li {...props} key={option.name}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Организация" required fullWidth />
            )}
            value={selectedOrganization}
            onChange={(event, newValue) => {
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

          {/* 🔹 Загрузка изображения */}
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
