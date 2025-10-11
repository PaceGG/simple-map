import { createSlice } from "@reduxjs/toolkit";

interface ModalState {
  isActive: boolean;
}

const initialState: ModalState = {
  isActive: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isActive = true;
    },
    closeModal: (state) => {
      state.isActive = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
