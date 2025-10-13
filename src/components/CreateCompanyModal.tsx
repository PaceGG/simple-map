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
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { type Point, type Popup } from "../types";
import { PopupType, Organization } from "../data";
import {
  closeCompanyModal,
  openCompanyEditor,
  openCompanyModal,
  setCompanyPoint,
} from "../store/companyModalSlice";
import { polygonsApi } from "../api/polygonsApi";
import { fileToBase64 } from "../utils";
// import { companiesApi } from "../api/companiesApi"; // предполагается, что есть API для компаний

interface CreateCompanyModalProps {
  // pushCompany: (company: Company) => void;
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

  const [organizationKey, setOrganizationKey] =
    useState<keyof typeof Organization>("CAP");
  const [typeKey, setTypeKey] = useState<keyof typeof PopupType>("Clothes");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] || null;
    setImage(file);
    if (file) setImageError("");
  };

  const handleClose = () => {
    dispatch(closeCompanyModal());
  };
  const handleEditor = () => dispatch(openCompanyEditor());
  const handleAdding = () => {
    setCompanyPositionError("");
    dispatch(openCompanyModal());
  };

  const clearFields = () => {
    setOrganizationKey("CAP");
    setTypeKey("Clothes");
    dispatch(setCompanyPoint(null));
    setCompanyPositionError("");
    setImageError("");
  };

  const handleCancel = () => {
    clearFields();
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!companyPosition) setCompanyPositionError("Укажите точку на карте");
    else setCompanyPositionError("");

    if (!image) setImageError("Выберите изображение");
    else setImageError("");

    if (!image || !companyPosition) return;

    const base64 = await fileToBase64(image);

    const data: Popup = {
      id: `${Date.now()}`,
      image: base64,
      organization: Organization[organizationKey],
      type: PopupType[typeKey],
      position: companyPosition,
    };

    polygonsApi.addCompany(polygonId, data);

    clearFields();
    handleClose();
  };

  return (
    <>
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

          <Autocomplete
            options={Object.keys(Organization)}
            getOptionLabel={(key) =>
              Organization[key as keyof typeof Organization].name
            }
            renderOption={(props, key) => (
              <li {...props} key={key}>
                {Organization[key as keyof typeof Organization].name}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Организация" required fullWidth />
            )}
            value={organizationKey}
            onChange={(event, newValue) => {
              if (!newValue) return;
              setOrganizationKey(newValue as keyof typeof Organization);
              // Автоустановка типа при выборе организации
              setTypeKey(
                Organization[newValue as keyof typeof Organization]
                  .type as keyof typeof PopupType
              );
            }}
          />

          {/* Автоматический тип компании с иконкой */}
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
            <img
              src={PopupType[typeKey].icon}
              alt={PopupType[typeKey].type}
              style={{ width: 32, height: 32 }}
            />
            <Typography>{PopupType[typeKey].type}</Typography>
          </Box>

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
};
