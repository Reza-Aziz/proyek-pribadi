import { createSlice } from '@reduxjs/toolkit';

const loadBookmarks = () => {
  try {
    return JSON.parse(localStorage.getItem('bookmarks')) || [];
  } catch {
    return [];
  }
};

const loadLastRead = () => {
    try {
        return JSON.parse(localStorage.getItem('lastRead')) || null;
    } catch {
        return null;
    }
}

const initialState = {
  bookmarks: loadBookmarks(),
  lastRead: loadLastRead(), // { surah: 1, ayat: 1, page: 1 }
  currentSurah: 1,
  currentPage: 1,
};

const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    setBookmark: (state, action) => {
      state.bookmarks.push(action.payload);
      localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
    },
    removeBookmark: (state, action) => {
        state.bookmarks = state.bookmarks.filter(b => b.id !== action.payload);
        localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
    },
    setLastRead: (state, action) => {
        state.lastRead = action.payload;
        localStorage.setItem('lastRead', JSON.stringify(action.payload));
    },
    setCurrentPosition: (state, action) => {
        state.currentSurah = action.payload.surah;
        state.currentPage = action.payload.page;
    }
  },
});

export const { setBookmark, removeBookmark, setLastRead, setCurrentPosition } = quranSlice.actions;
export default quranSlice.reducer;
