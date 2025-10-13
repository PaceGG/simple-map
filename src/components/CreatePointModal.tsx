import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  FormHelperText,
  Stack,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { closeModal } from "../store/modalSlice";
import { type Popup } from "../types";
import { PopupType, Organization } from "../data_AC";
import { popupsApi } from "../api/popupsApi";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

  // 🔹 для хранения фактического источника (URL или base64)
  const [imageSource, setImageSource] = useState<string>("");
  // 🔹 то, что отображается в поле ввода (URL, имя файла или пусто)
  const [imageDisplayName, setImageDisplayName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleClose = () => dispatch(closeModal());
  const handleCancel = () => {
    clearFields();
    dispatch(closeModal());
  };

  const clearFields = () => {
    setOrganizationKey("House");
    setTypeKey("House");
    setImageSource("");
    setImageDisplayName("");
    setImageFile(null);
    setImageError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
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
      organization: Organization[organizationKey],
      type: PopupType[typeKey],
      image: finalImage,
      position: position ?? { x: 0, y: 0 },
    };

    popupsApi.create(data);
    pushPopup(data);
    clearFields();
    handleClose();
  };

  const handleFileChange = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImageSource(base64);
    setImageFile(file);
    setImageDisplayName(file.name); // ← теперь в поле отображается имя файла
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
              setImageDisplayName("Вставленное изображение"); // понятная метка
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

  const handleTextChange = (value: string) => {
    setImageDisplayName(value);
    setImageSource(value);
    setImageFile(null);
    setImageError("");
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
  );
};
