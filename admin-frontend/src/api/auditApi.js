import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'

export const getAuditLogs = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/audit`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}