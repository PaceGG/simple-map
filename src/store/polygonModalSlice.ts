import { createSlice } from "@reduxjs/toolkit";

export type PolygonModalStates = "hidden" | "visible" | "edit";

interface PolygonModalState {
  state: PolygonModalStates;
}

const initialState: PolygonModalState = {
  state: "hidden",
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
  },
});

export const { openPolygonModal, closePolygonModal, openPolygonEditor } =
  polygonModalSlice.actions;
export default polygonModalSlice.reducer;
