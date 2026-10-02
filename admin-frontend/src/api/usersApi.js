import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'

// =========================================================
// GET USERS BY ROLE
// =========================================================

export const getUsersByRole = async (role, token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/users/${role}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET USER COUNT BY ROLE
// =========================================================

export const getUserCount = async (role, token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/users/count/${role}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// UPDATE USER ACCOUNT STATUS
// =========================================================

export const updateUserStatus = async (
  userId,
  status,
  token
) => {
  const response = await axios.put(
    `${ADMIN_SERVICE_URL}/api/admin/users/${userId}/status`,
    {
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}