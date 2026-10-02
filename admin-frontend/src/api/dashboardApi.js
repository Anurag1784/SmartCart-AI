import axios from 'axios'

// ------------------------------------------------------------
// Admin Service base URL
// ------------------------------------------------------------
const ADMIN_SERVICE_URL = 'http://localhost:5191'

// ------------------------------------------------------------
// Get the currently logged-in Admin JWT
// ------------------------------------------------------------
// Admin authentication is stored as:
//
// sessionStorage
//    └── auth
//          ├── user
//          ├── token
//          └── isAuthenticated
// ------------------------------------------------------------
const getAdminToken = () => {
  const storedAuth = sessionStorage.getItem('auth')

  if (!storedAuth) {
    throw new Error('Admin authentication token was not found.')
  }

  try {
    const auth = JSON.parse(storedAuth)

    if (!auth.token) {
      throw new Error('Admin authentication token was not found.')
    }

    return auth.token
  } catch (error) {
    if (error.message === 'Admin authentication token was not found.') {
      throw error
    }

    throw new Error('Invalid Admin authentication data.')
  }
}

// ------------------------------------------------------------
// Fetch dashboard statistics from Admin Service
// ------------------------------------------------------------
export const getDashboardStats = async () => {
  // Get JWT from the same storage used by authSlice
  const token = getAdminToken()

  // Call Admin Service Dashboard API
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/dashboard/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}