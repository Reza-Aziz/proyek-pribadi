import { createSlice } from '@reduxjs/toolkit';

const loadLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('logs')) || [];
  } catch {
    return [];
  }
};

const initialState = {
  history: loadLogs(),
};

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: (state, action) => {
      // action.payload: { date: 'YYYY-MM-DD', surah, ayatStart, ayatEnd }
      const newLog = action.payload;
      const lastLog = state.history[0];

      // Forward Only Logic:
      // If same date and same Surah, check if we are just continuing or going back.
      if (lastLog && lastLog.date === newLog.date && lastLog.surah === newLog.surah) {
          // If new start is <= last end, it's a re-read or backward move. Ignore.
          // Unless it's a completely different part of surah?
          // User said: "baca 1-10, balik 3-7 hitungannya 1 log".
          // If we read 1-10, lastLog = 1-10.
          // Then read 3-7. 3 < 10. Ignore.
          // But if we read 11-20. 11 > 10. Add log?
          // User said "hitungan 1 log". Does he mean Merge?
          // "baca 1-10, trus balik 3-7 hitungannya 1 log".
          // This implies the previous log remains, and we don't add a new one.
          // So strict forward check:
          if (newLog.ayatStart <= lastLog.ayatEnd) {
              return; // Ignore backward/overlap traversal
          }
      }

      state.history.unshift(newLog);
      
      // Auto-Cleanup: Keep only last 10 if count > 50
      if (state.history.length > 50) {
          state.history = state.history.slice(0, 10);
      }
      
      localStorage.setItem('logs', JSON.stringify(state.history));
    },
    pruneLogs: (state) => {
        if (state.history.length > 50) {
            state.history = state.history.slice(0, 10);
            localStorage.setItem('logs', JSON.stringify(state.history));
        }
    }
  },
});

export const { addLog, pruneLogs } = logSlice.actions;
export default logSlice.reducer;
