import { createSlice } from '@reduxjs/toolkit';

const loadUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: loadUser(),
  isAuthenticated: !!loadUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    register: (state, action) => {
        // Register implies login in this simple app
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
        // In a real app we might store a list of users, but requirements say "Register: username + password" 
        // and "Login: username + password". "Disimpan di localStorage".
        // I will store a separate 'users' object in localStorage for validation.
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(action.payload);
        localStorage.setItem('users', JSON.stringify(users));
    }
  },
});

export const { login, logout, register } = authSlice.actions;
export default authSlice.reducer;
