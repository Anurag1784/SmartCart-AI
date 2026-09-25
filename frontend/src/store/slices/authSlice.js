import { createSlice } from '@reduxjs/toolkit'


// ============================================================
// SESSION AUTHENTICATION
// ============================================================
//
// SmartCart uses sessionStorage for authentication.
//
// Why sessionStorage?
//
// - User remains logged in when the page is refreshed.
// - Authentication survives React/Vite reloads.
// - Authentication is cleared when the browser session ends.
// - Old seller/customer login data does not permanently remain
//   in the browser's localStorage.
//
// ============================================================


// Read authentication data saved during the current
// browser session.
const storedAuth =
  sessionStorage.getItem('auth')


// Create the initial Redux authentication state.
const initialState = storedAuth
  ? JSON.parse(storedAuth)
  : {
      user: null,
      token: null,
      isAuthenticated: false,
    }


// Create authentication slice.
const authSlice = createSlice({

  name: 'auth',

  initialState,

  reducers: {

    // ========================================================
    // LOGIN / SET CREDENTIALS
    // ========================================================

    setCredentials: (state, action) => {

      // Store logged-in user information in Redux.
      state.user =
        action.payload.user

      // Store JWT token in Redux.
      state.token =
        action.payload.token

      // Mark the user as authenticated.
      state.isAuthenticated = true


      // Persist authentication only for the
      // current browser session.
      sessionStorage.setItem(
        'auth',
        JSON.stringify({
          user: state.user,
          token: state.token,
          isAuthenticated: true,
        })
      )


      // Remove any old SmartCart authentication
      // left behind by the previous localStorage system.
      localStorage.removeItem('auth')
    },


    // ========================================================
    // LOGOUT
    // ========================================================

    logout: (state) => {

      // Clear Redux user.
      state.user = null

      // Clear Redux JWT.
      state.token = null

      // Mark user as logged out.
      state.isAuthenticated = false


      // Remove current-session authentication.
      sessionStorage.removeItem('auth')


      // Also remove old authentication storage.
      //
      // This is important because older versions of
      // SmartCart used localStorage.
      localStorage.removeItem('auth')
    },
  },
})


// Export authentication actions.
export const {
  setCredentials,
  logout,
} = authSlice.actions


// Export authentication reducer.
export default authSlice.reducer