import { createSlice } from "@reduxjs/toolkit";

interface MenuState {
  isOpen: boolean;
  isLoading: boolean;
}

const initialState: MenuState = {
  isOpen: false,
  isLoading: false,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    openMenu: (state) => {
      state.isOpen = true;
    },
    closeMenu: (state) => {
      state.isOpen = false;
    },
    toggleMenu: (state) => {
      state.isOpen = !state.isOpen;
    },
    startMenuLoading: (state) => {
      console.log("меню начало загрузку");
      state.isLoading = true;
    },
    stopMenuLoading: (state) => {
      console.log("меню закончило загрузку");
      state.isLoading = false;
    },
  },
});

export const {
  openMenu,
  closeMenu,
  toggleMenu,
  startMenuLoading,
  stopMenuLoading,
} = menuSlice.actions;
export default menuSlice.reducer;
