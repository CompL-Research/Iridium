import { createSlice } from '@reduxjs/toolkit'

export const mainDataSlice = createSlice({
  name: 'mainData',
  initialState: {
    bytecodeMapping: {},
    sourcecodeMapping: {},
    stackframeMapping: {},
    currentContext: {},
    contextRuns: {},
    singleFun: false,
    cgState: ["digraph {","}"]
  },
  reducers: {
    setBytecodeMapping: (state, action) => {
      state.bytecodeMapping = action.payload;
    },
    setSourcecodeMapping: (state, action) => {
      state.sourcecodeMapping = action.payload;
    },
    setStackframeMapping: (state, action) => {
      state.stackframeMapping = action.payload;
    },
    setCurrentContext: (state, action) => {
      state.currentContext = action.payload;
    },
    setContextRuns: (state, action) => {
      state.contextRuns = action.payload;
    },
    setSingleFun: (state, action) => {
      state.singleFun = action.payload;
    },
    setCGState: (state, action) => {
      state.cgState = action.payload;
    }, 
  },
})
export const { setBytecodeMapping, setSourcecodeMapping, setStackframeMapping, setCurrentContext, setContextRuns, setSingleFun, setCGState } = mainDataSlice.actions
export default mainDataSlice.reducer