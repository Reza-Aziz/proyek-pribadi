import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import quranReducer from "../features/quran/quranSlice";
import settingsReducer from "../features/settings/settingsSlice";
import logReducer from "../features/logs/logSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quran: quranReducer,
    settings: settingsReducer,
    logs: logReducer,
  },
});
