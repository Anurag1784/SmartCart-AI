import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'

// =========================================================
// GET TOTAL ORDER COUNT
// =========================================================

export const getOrderCount = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/orders/count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET ALL ORDERS
// =========================================================

export const getOrders = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/orders`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET ORDER BY ID
// =========================================================

export const getOrderById = async (orderId, token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}