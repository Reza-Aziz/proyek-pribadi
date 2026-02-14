import { createSlice } from '@reduxjs/toolkit';

const loadSettings = () => {
  try {
    return JSON.parse(localStorage.getItem('settings')) || {
        targetChunks: 1, 
        targetPeriod: 'day', 
        notificationsEnabled: false,
        notificationTime: '05:00',
        fontSize: 28, // Default Arabic font size
    };
  } catch {
    return {
        targetChunks: 1,
        targetPeriod: 'day',
        notificationsEnabled: false,
        notificationTime: '05:00',
        fontSize: 28,
    };
  }
};

const initialState = loadSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      const newState = { ...state, ...action.payload };
      localStorage.setItem('settings', JSON.stringify(newState));
      return newState;
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
