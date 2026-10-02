import { createSlice } from '@reduxjs/toolkit'

// ------------------------------------------------------------
// Check whether authentication data already exists
// in sessionStorage from a previous login.
// ------------------------------------------------------------
const storedAuth = sessionStorage.getItem('auth')

// ------------------------------------------------------------
// Initial Redux authentication state
// If auth data exists, restore it.
// Otherwise, start with the user logged out.
// ------------------------------------------------------------
const initialState = storedAuth
  ? JSON.parse(storedAuth)
  : {
      user: null,
      token: null,
      isAuthenticated: false,
    }

// ------------------------------------------------------------
// Create authentication slice
// ------------------------------------------------------------
const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    // ----------------------------------------------------------
    // Called after successful Admin login.
    // Stores user + JWT token in Redux and sessionStorage.
    // ----------------------------------------------------------
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true

      // Persist authentication for the current browser session
      sessionStorage.setItem(
        'auth',
        JSON.stringify({
          user: state.user,
          token: state.token,
          isAuthenticated: true,
        })
      )

      // Remove any old localStorage authentication data
      localStorage.removeItem('auth')
    },

    // ----------------------------------------------------------
    // Logout Admin
    // ----------------------------------------------------------
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false

      // Remove authentication from browser storage
      sessionStorage.removeItem('auth')
      localStorage.removeItem('auth')
    },
  },
})

// ------------------------------------------------------------
// Export actions
// ------------------------------------------------------------
export const { setCredentials, logout } = authSlice.actions

// ------------------------------------------------------------
// Export reducer
// ------------------------------------------------------------
export default authSlice.reducer