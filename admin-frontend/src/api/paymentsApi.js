import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'


// =========================================================
// GET SUCCESSFUL PAYMENT COUNT
// =========================================================

export const getPaymentCount = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/payments/count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET TOTAL REVENUE
// =========================================================

export const getTotalRevenue = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/payments/revenue`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET ALL PAYMENTS
// =========================================================

export const getPayments = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/payments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET PAYMENT BY ID
// =========================================================

export const getPaymentById = async (
  paymentId,
  token
) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}