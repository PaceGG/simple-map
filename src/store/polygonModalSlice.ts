import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type PolygonModalStates = "hidden" | "visible" | "edit";

interface PolygonModalState {
  state: PolygonModalStates;
  address: string;
}

const initialState: PolygonModalState = {
  state: "hidden",
  address: "",
};

const polygonModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openPolygonModal: (state) => {
      state.state = "visible";
    },
    closePolygonModal: (state) => {
      state.state = "hidden";
    },
    openPolygonEditor: (state) => {
      state.state = "edit";
    },
    setPolygonAddress: (state, actions: PayloadAction<string>) => {
      state.address = actions.payload;
    },
  },
});

export const {
  openPolygonModal,
  closePolygonModal,
  openPolygonEditor,
  setPolygonAddress,
} = polygonModalSlice.actions;
export default polygonModalSlice.reducer;
