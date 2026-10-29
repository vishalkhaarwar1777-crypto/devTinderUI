import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (_state, action) => action.payload,
    appendFeed: (state, action) => {
      const existing = Array.isArray(state) ? state : [];
      const seen = new Set(existing.map((user) => user._id));
      const incoming = Array.isArray(action.payload) ? action.payload : [];

      return [...existing, ...incoming.filter((user) => !seen.has(user._id))];
    },
    removeUserFromFeed: (state, action) => {
      if (!Array.isArray(state)) return state;
      return state.filter((user) => user._id !== action.payload);
    },
    removeFeed: () => null,
  },
});

export const { addFeed, appendFeed, removeUserFromFeed, removeFeed } =
  feedSlice.actions;

export default feedSlice.reducer;
