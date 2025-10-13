import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface MovePopupState {
  selection: boolean;
  polygonId: string | null;
}

const initialState: MovePopupState = {
  selection: false,
  polygonId: null,
};

const movePopupSlice = createSlice({
  name: "movePopup",
  initialState,
  reducers: {
    startMoving: (state) => {
      state.selection = true;
    },
    stopMoving: (state) => {
      state.selection = false;
    },
    selectPolygonForMoving: (state, action: PayloadAction<string | null>) => {
      state.polygonId = action.payload;
    },
  },
});

export const { startMoving, stopMoving, selectPolygonForMoving } =
  movePopupSlice.actions;

export default movePopupSlice.reducer;
