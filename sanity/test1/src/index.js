import React from 'react'
import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import store from './store'

import App from './App'

let a, bc;
var as, bcs;
const [x,rest] = [121,1,12,12,1]
const [aaa, ...axs] = [1,2,3,4];
const [aaax, ...[,xx]] = [1,2,3,4];

// As of React 18
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)

