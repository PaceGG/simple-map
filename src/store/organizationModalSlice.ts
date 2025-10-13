import { createSlice } from "@reduxjs/toolkit";

interface OrganizationModalState {
  isOpen: boolean;
}

const initialState: OrganizationModalState = {
  isOpen: false,
};

export const organizationModalSlice = createSlice({
  name: "organizationModal",
  initialState,
  reducers: {
    openOrganizationModal(state) {
      state.isOpen = true;
    },
    closeOrganizationModal(state) {
      state.isOpen = false;
    },
  },
});

export const { openOrganizationModal, closeOrganizationModal } =
  organizationModalSlice.actions;

export default organizationModalSlice.reducer;
