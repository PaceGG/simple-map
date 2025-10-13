import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OrganizationInfo } from "../types";

interface OrganizationModalState {
  isOpen: boolean;
  newOrg?: OrganizationInfo;
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
    addNewOrg(state, actions: PayloadAction<OrganizationInfo>) {
      state.newOrg = actions.payload;
    },
  },
});

export const { openOrganizationModal, closeOrganizationModal, addNewOrg } =
  organizationModalSlice.actions;

export default organizationModalSlice.reducer;
