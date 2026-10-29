import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: [],
  reducers: {
    addRequests: (_state, action) => action.payload,
    removeRequest: (state, action) => {
      if (!Array.isArray(state)) return [];
      return state.filter((request) => request._id !== action.payload);
    },
    removeRequests: () => [],
  },
});

export const { addRequests, removeRequest, removeRequests } =
  requestSlice.actions;

export default requestSlice.reducer;
