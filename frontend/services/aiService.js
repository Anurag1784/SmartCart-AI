import { aiApi } from './api'


// ============================================================
// AI RECOMMENDATION SERVICE
// ============================================================


// ============================================================
// PERSONALIZED RECOMMENDATIONS
// ============================================================

// Fetch personalized product recommendations for
// the currently authenticated customer.
//
// The customer's JWT is automatically attached by
// the aiApi interceptor in api.js.
export const getPersonalizedRecommendations = async () => {

  const response = await aiApi.get(
    '/api/ai/recommendations'
  )

  return response.data
}


// ============================================================
// SIMILAR PRODUCTS
// ============================================================

// Fetch products that are similar to the requested product.
//
// The productId comes from the Product Details page.
//
// AI Service endpoint:
//
// GET /api/ai/products/{productId}/similar
//
// The AI Service uses its recommendation engine to
// determine which products are most similar.
export const getSimilarProducts = async (productId) => {

  const response = await aiApi.get(
    `/api/ai/products/${productId}/similar`
  )

  return response.data
}