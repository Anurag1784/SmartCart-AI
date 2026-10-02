import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'


// =========================================================
// GET ALL INVENTORY
// =========================================================

export const getInventory = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/inventory`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// GET LOW-STOCK INVENTORY
// =========================================================

export const getLowStockInventory = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/inventory/low-stock`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}