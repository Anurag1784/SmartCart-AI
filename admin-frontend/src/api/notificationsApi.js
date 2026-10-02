import axios from 'axios'

// ------------------------------------------------------------
// Notification Service URL
// ------------------------------------------------------------
// Existing SmartCart Notification Service runs on port 8085.
// ------------------------------------------------------------
const NOTIFICATION_SERVICE_URL = 'http://localhost:8085'

// ------------------------------------------------------------
// Get unread notifications for the logged-in Admin
// ------------------------------------------------------------
export const getUnreadNotifications = async (
  userId,
  token
) => {
  const response = await axios.get(
    `${NOTIFICATION_SERVICE_URL}/api/notifications/user/${userId}/unread`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}

// ------------------------------------------------------------
// Mark notification as read
// ------------------------------------------------------------
export const markNotificationAsRead = async (
  notificationId,
  token
) => {
  const response = await axios.put(
    `${NOTIFICATION_SERVICE_URL}/api/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}