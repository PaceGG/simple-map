import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormHelperText,
  Stack,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { closeModal } from "../store/modalSlice";
import { PopupType, Organization } from "../data";

interface CreatePointModalProps {
  position: { x: number; y: number } | null;
}

export const CreatePointModal = ({ position }: CreatePointModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.modal.isActive);

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleClose = () => dispatch(closeModal());

  const handleCancel = () => {
    clearFields();
    dispatch(closeModal());
  };

  const clearFields = () => {
    setName("");
    setOrganization("");
    setType("");
    setImage(null);
    setImageError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    console.log({
      name,
      organization,
      type,
      image,
      position,
    });

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
          Создать точку ({position?.x};{position?.y})
        </Typography>

        <TextField
          label="Название точки"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          select
          label="Тип точки"
          required
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {Object.values(PopupType).map((t) => (
            <MenuItem key={t.type} value={t.type}>
              {t.type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Организация"
          required
          fullWidth
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        >
          {Object.values(Organization).map((o) => (
            <MenuItem key={o.name} value={o.name}>
              {o.name}
            </MenuItem>
          ))}
        </TextField>

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
