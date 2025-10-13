import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./menuSlice";
import modalReducer from "./modalSlice";
import polygonModalReducer from "./polygonModalSlice";
import companyModalReducer from "./companyModalSlice";
import movePopupReducer from "./movePopupSlice";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    modal: modalReducer,
    polygonModal: polygonModalReducer,
    companyModal: companyModalReducer,
    movePopup: movePopupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
