import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Autocomplete,
  FormHelperText,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { type Company } from "../types";
import { PopupType, Organization } from "../data";
import { closeCompanyModal } from "../store/companyModalSlice";
import { fileToBase64, polygonsApi } from "../api/polygonsApi";
// import { companiesApi } from "../api/companiesApi"; // предполагается, что есть API для компаний

interface CreateCompanyModalProps {
  // pushCompany: (company: Company) => void;
  polygonId: string;
}

export const CreateCompanyModal = ({ polygonId }: CreateCompanyModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.companyModal.isActive);

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

  const handleClose = () => dispatch(closeCompanyModal());

  const clearFields = () => {
    setOrganizationKey("CAP");
    setTypeKey("Clothes");
  };

  const handleCancel = () => {
    clearFields();
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) {
      setImageError("Выберите изображение");
      return;
    }

    const base64 = await fileToBase64(image);

    const data: Company = {
      image: base64,
      organization: Organization[organizationKey],
      type: PopupType[typeKey],
    };

    polygonsApi.addCompany(polygonId, data);

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
        <Typography variant="h5" sx={{ mb: 1 }}>
          Создать компанию
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
          onChange={(event, newValue) =>
            setOrganizationKey(newValue as keyof typeof Organization)
          }
        />

        <Autocomplete
          options={Object.keys(PopupType)}
          getOptionLabel={(key) =>
            PopupType[key as keyof typeof PopupType].type
          }
          renderOption={(props, key) => (
            <li {...props} key={key}>
              <Stack direction="row" alignItems="center" gap={1}>
                <img
                  src={PopupType[key as keyof typeof PopupType].icon}
                  alt=""
                  style={{ width: 32, height: 32 }}
                />
                {PopupType[key as keyof typeof PopupType].type}
              </Stack>
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Тип" required />
          )}
          value={typeKey}
          onChange={(event, newValue) =>
            setTypeKey(newValue as keyof typeof PopupType)
          }
          fullWidth
        />

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
