import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

// ------------------------------------------------------------
// Create the Redux store
// ------------------------------------------------------------
// The auth reducer manages:
// - Logged-in user
// - JWT token
// - Authentication status
// ------------------------------------------------------------
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

// ------------------------------------------------------------
// Export the store so it can be connected to React
// in main.jsx.
// ------------------------------------------------------------
export default store