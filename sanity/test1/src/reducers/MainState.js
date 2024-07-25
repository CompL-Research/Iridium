import { createSlice } from '@reduxjs/toolkit'

export const mainStateSlice = createSlice({
  name: 'mainState',
  initialState: {
    loading: false,
    ended: false,
    currentSyn: undefined,
    theme: "light",
    connected: false,
    bytecodeSync: false,
    envState: {},
    envUpdates: {}
  },
  reducers: {
    setLoading: (state, action) => {
      console.assert(typeof action.payload === "boolean", "Setting loading state to non-boolean value"); 
      state.loading = action.payload;
    },
    setEnded: (state, action) => {
      console.assert(typeof action.payload === "boolean", "Setting ended state to non-boolean value"); 
      state.ended = action.payload;
    },
    setCurrentSyn: (state, action) => {
      state.currentSyn = action.payload;
    },
    toggleTheme: (state) => {
      if (state.theme === "dark") {
        state.theme = "light"
      } else {
        state.theme = "dark"
      }
    },
    setConnected: (state, action) => {
      console.assert(typeof action.payload === "boolean", "Setting connected state to non-boolean value"); 
      state.connected = action.payload;
    },
    setBytecodeSync: (state, action) => {
      console.assert(typeof action.payload === "boolean", "Setting bytecode sync state to non-boolean value"); 
      state.bytecodeSync = action.payload;
    },
    setEnvState: (state, action) => {
      state.envState = action.payload;
      state.envUpdates = {};
    },
    setEnvUpdates: (state, action) => {
      state.envUpdates = action.payload;
    },

  },
})
export const { setLoading, setEnded, setCurrentSyn, toggleTheme, setConnected, setBytecodeSync, setEnvState, setEnvUpdates } = mainStateSlice.actions
export default mainStateSlice.reducer