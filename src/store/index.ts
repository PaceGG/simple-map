import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./menuSlice";
import modalReducer from "./modalSlice";
import polygonModalReducer from "./polygonModalSlice";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    modal: modalReducer,
    polygonModal: polygonModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
