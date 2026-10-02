import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'

export const sendAnnouncementToUser = async (
  userId,
  announcement,
  token
) => {
  const response = await axios.post(
    `${ADMIN_SERVICE_URL}/api/admin/announcements/user/${userId}`,
    announcement,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}

export const sendAnnouncementToAll = async (
  announcement,
  token
) => {
  const response = await axios.post(
    `${ADMIN_SERVICE_URL}/api/admin/announcements/all`,
    announcement,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}