import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'


// =========================================================
// GET ALL PRODUCTS
// =========================================================

export const getProducts = async (token) => {

  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/products`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}