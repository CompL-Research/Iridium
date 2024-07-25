import { configureStore } from '@reduxjs/toolkit'
import MainStateReducer from './reducers/MainState'
import MainDataReducer from './reducers/MainData'

export default configureStore({
  reducer: {
    mainState: MainStateReducer,
    mainData: MainDataReducer
  },
})