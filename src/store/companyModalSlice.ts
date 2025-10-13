import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Point } from "../types";

export type CompanyModalStates = "hidden" | "visible" | "edit";

interface CompanyModalState {
  // isActive: boolean;
  state: CompanyModalStates;
  point: Point | null;
}

const initialState: CompanyModalState = {
  state: "hidden",
  point: null,
};

const companyModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openCompanyModal: (state) => {
      state.state = "visible";
    },
    closeCompanyModal: (state) => {
      state.state = "hidden";
    },
    openCompanyEditor: (state) => {
      state.state = "edit";
    },
    setCompanyPoint: (state, action: PayloadAction<Point | null>) => {
      state.point = action.payload;
    },
  },
});

export const {
  openCompanyModal,
  closeCompanyModal,
  openCompanyEditor,
  setCompanyPoint,
} = companyModalSlice.actions;
export default companyModalSlice.reducer;
