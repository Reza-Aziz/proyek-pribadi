import { createSlice } from "@reduxjs/toolkit";

const loadLogs = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }
    const logs = localStorage.getItem("logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Error loading logs from localStorage:", error);
    return [];
  }
};

const initialState = {
  history: loadLogs(),
};

const logSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    addLog: (state, action) => {
      // Payload: { date, start: { surah, ayat }, end: { surah, ayat } }
      const newLog = action.payload;
      const lastLog = state.history[0];

      // Session Merging Logic:
      // If same date AND same Start Position, we assume it's the same session.
      // Update the END position.
      if (lastLog && 
          lastLog.date === newLog.date && 
          lastLog.start && 
          lastLog.start.surah === newLog.start.surah && 
          lastLog.start.ayat === newLog.start.ayat) {
        
        // Update the end point
        lastLog.end = newLog.end;
        localStorage.setItem("logs", JSON.stringify(state.history));
        return;
      }

      // New Session Log
      state.history.unshift(newLog);

      // Auto-Cleanup: Keep only last 10 if count > 50
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 10);
      }

      localStorage.setItem("logs", JSON.stringify(state.history));
    },
    deleteLog: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.history.length) {
        state.history.splice(index, 1);
        localStorage.setItem("logs", JSON.stringify(state.history));
      }
    },
    pruneLogs: (state) => {
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 10);
        localStorage.setItem("logs", JSON.stringify(state.history));
      }
    },
    clearLogs: (state) => {
      state.history = [];
      localStorage.setItem("logs", JSON.stringify([]));
    },
  },
});

export const { addLog, deleteLog, pruneLogs, clearLogs } = logSlice.actions;
export default logSlice.reducer;
