import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./menuSlice";
import modalReducer from "./modalSlice";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    modal: modalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
