import axios from 'axios'

// ------------------------------------------------------------
// Auth Service URL
// ------------------------------------------------------------
// The existing SmartCart Auth Service runs on port 8080.
// ------------------------------------------------------------
const AUTH_SERVICE_URL = 'http://localhost:8080'

// ------------------------------------------------------------
// Admin Login
// ------------------------------------------------------------
// Sends Admin credentials to the existing Auth Service.
//
// The Auth Service will:
// 1. Verify email and password
// 2. Generate JWT
// 3. Return user information + role
// ------------------------------------------------------------
export const loginAdmin = async (email, password) => {
  const response = await axios.post(
    `${AUTH_SERVICE_URL}/api/auth/login`,
    {
      email,
      password,
    }
  )

  return response.data
}