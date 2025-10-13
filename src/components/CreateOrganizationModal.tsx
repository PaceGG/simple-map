import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
  Autocomplete,
  Avatar,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { organizationsApi } from "../api/organizationsApi";
import { fileToBase64 } from "../utils";
import { closeOrganizationModal } from "../store/organizationModalSlice";
import type { OrganizationInfo } from "../types";

interface TypeOption {
  label: string;
  icon: string;
}

export const CreateOrganizationModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector(
    (state: RootState) => state.organizationModal.isOpen
  );

  const [name, setName] = useState("");
  const [type, setType] = useState<TypeOption | string>(""); // выбранный тип
  const [typesList, setTypesList] = useState<TypeOption[]>([]); // список существующих типов с иконками
  const [iconSource, setIconSource] = useState<string>("");
  const [iconDisplayName, setIconDisplayName] = useState<string>("");
  const [iconError, setIconError] = useState("");

  // загрузка существующих типов при открытии модалки
  useEffect(() => {
    const fetchTypes = async () => {
      const orgs = await organizationsApi.getAll();
      // создаём уникальные типы с иконками
      const uniqueTypesMap = new Map<string, string>();
      orgs.forEach((org) => {
        if (!uniqueTypesMap.has(org.type)) {
          uniqueTypesMap.set(org.type, org.icon);
        }
      });
      const uniqueTypesArray: TypeOption[] = Array.from(
        uniqueTypesMap.entries()
      ).map(([label, icon]) => ({ label, icon }));
      setTypesList(uniqueTypesArray);
    };
    if (isOpen) fetchTypes();
  }, [isOpen]);

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
    if (!name.trim() || !type) {
      alert("Заполните название и тип организации");
      return;
    }
    if (!iconSource) {
      setIconError("Укажите, вставьте или загрузите иконку");
      return;
    }

    const typeValue = typeof type === "string" ? type : type.label;

    const newOrg: Omit<OrganizationInfo, "id"> = {
      name: name.trim(),
      type: typeValue.trim(),
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

        {/* Название */}
        <TextField
          label="Название"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Тип с выбором и вводом */}
        <Autocomplete
          freeSolo
          options={typesList}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
          }
          value={type}
          onChange={(_, newValue) => {
            setType(newValue || "");
            if (typeof newValue !== "string" && newValue?.icon) {
              setIconSource(newValue.icon);
              setIconDisplayName("Иконка из типа");
              setIconError("");
            }
          }}
          onInputChange={(_, newInputValue, reason) => {
            // если ввод вручную, очищаем иконку
            if (reason === "input") {
              setType(newInputValue);
              setIconSource("");
              setIconDisplayName("");
            }
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Box
                component="li"
                {...rest}
                key={key}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                {"icon" in option && (
                  <Avatar src={option.icon} sx={{ width: 24, height: 24 }} />
                )}
                {typeof option === "string" ? option : option.label}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Тип"
              required
              fullWidth
              placeholder="Выберите существующий или введите новый"
              InputProps={{
                ...params.InputProps,
                startAdornment:
                  typeof type !== "string" && type.icon ? (
                    <InputAdornment position="start">
                      <Avatar
                        src={type.icon}
                        sx={{ width: 28, height: 28, mr: 1 }}
                      />
                    </InputAdornment>
                  ) : null,
              }}
            />
          )}
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
