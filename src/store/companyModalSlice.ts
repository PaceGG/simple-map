import { createSlice } from "@reduxjs/toolkit";

interface CompanyModalState {
  isActive: boolean;
}

const initialState: CompanyModalState = {
  isActive: false,
};

const companyModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openCompanyModal: (state) => {
      state.isActive = true;
    },
    closeCompanyModal: (state) => {
      state.isActive = false;
    },
  },
});

export const { openCompanyModal, closeCompanyModal } =
  companyModalSlice.actions;
export default companyModalSlice.reducer;
