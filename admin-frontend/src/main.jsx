import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import './index.css'
import './styles/variables.css'

import App from './App.jsx'
import store from './redux/store.js'

// ------------------------------------------------------------
// BrowserRouter
// ------------------------------------------------------------
// Enables React Router for the Admin Frontend.
//
// Provider
// ------------------------------------------------------------
// Makes the Redux store available to every component.
// ------------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)