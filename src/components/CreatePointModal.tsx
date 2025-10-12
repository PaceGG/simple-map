import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  FormHelperText,
  Stack,
  Autocomplete,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { closeModal } from "../store/modalSlice";
import { type Popup } from "../types";
import { PopupType, Organization } from "../data";
import { popupsApi } from "../api/popupsApi";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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

  const [organizationKey, setOrganizationKey] =
    useState<keyof typeof Organization>("CAP");
  const [typeKey, setTypeKey] = useState<keyof typeof PopupType>("Clothes");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleClose = () => dispatch(closeModal());

  const handleCancel = () => {
    clearFields();
    dispatch(closeModal());
  };

  const clearFields = () => {
    setOrganizationKey("House");
    setTypeKey("House");
    setImage(null);
    setImageError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Проверяем нативную валидацию остальных полей
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Проверяем наличие изображения вручную
    if (!image) {
      setImageError("Выберите изображение");
      return;
    }

    const base64 = await fileToBase64(image);

    const data: Popup = {
      id: `${Date.now()}`,
      organization: Organization[organizationKey],
      type: PopupType[typeKey],
      image: base64,
      position: position ?? { x: 0, y: 0 },
    };
    popupsApi.create(data);

    pushPopup(data);
    clearFields();
    handleClose();
  };

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] || null;
    setImage(file);
    if (file) setImageError("");
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
        <Typography variant="h5" sx={{ mb: 1 }}>
          Создать точку ({position?.x && <span>{Math.round(position.x)}</span>};{" "}
          {position?.y && <span>{Math.round(position.y)}</span>})
        </Typography>

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
            setTypeKey(
              Organization[newValue as keyof typeof Organization]
                .type as keyof typeof PopupType
            );
          }}
        />

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
  );
};
