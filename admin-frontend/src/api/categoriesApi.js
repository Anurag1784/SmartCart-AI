import axios from 'axios'

const ADMIN_SERVICE_URL = 'http://localhost:5191'

// =========================================================
// GET ALL CATEGORIES
// =========================================================

export const getCategories = async (token) => {
  const response = await axios.get(
    `${ADMIN_SERVICE_URL}/api/admin/categories`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// CREATE CATEGORY
// =========================================================

export const createCategory = async (
  category,
  token
) => {
  const response = await axios.post(
    `${ADMIN_SERVICE_URL}/api/admin/categories`,
    category,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// UPDATE CATEGORY
// =========================================================

export const updateCategory = async (
  categoryId,
  category,
  token
) => {
  const response = await axios.put(
    `${ADMIN_SERVICE_URL}/api/admin/categories/${categoryId}`,
    category,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}


// =========================================================
// DELETE CATEGORY
// =========================================================

export const deleteCategory = async (
  categoryId,
  token
) => {
  const response = await axios.delete(
    `${ADMIN_SERVICE_URL}/api/admin/categories/${categoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}