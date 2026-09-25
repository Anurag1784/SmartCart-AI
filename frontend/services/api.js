import axios from 'axios'


// ============================================================
// AUTH SERVICE AXIOS INSTANCE
// ============================================================

// Auth Service is running on port 8080
const api = axios.create({
  baseURL: 'http://localhost:8080',

  // Tell the backend that we are sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
})


// ============================================================
// PRODUCT SERVICE AXIOS INSTANCE
// ============================================================

// Product Service is running on port 8081
const productApi = axios.create({
  baseURL: 'http://localhost:8081',

  // Tell the backend that we are sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
})


// ============================================================
// INVENTORY SERVICE AXIOS INSTANCE
// ============================================================

// Inventory Service is running on port 8082
//
// Seller inventory operations will use this Axios instance.
const inventoryApi = axios.create({
  baseURL: 'http://localhost:8082',

  // Tell the backend that we are sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
})


// ============================================================
// ORDER SERVICE AXIOS INSTANCE
// ============================================================

// Order Service is running on port 8083
//
// Cart and Order APIs will use this Axios instance.
const orderApi = axios.create({
  baseURL: 'http://localhost:8083',

  // Tell the backend that we are sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
})


// ============================================================
// PAYMENT SERVICE AXIOS INSTANCE
// ============================================================

// Payment Service is running on port 8084
//
// Razorpay payment-related APIs will use this Axios instance.
const paymentApi = axios.create({
  baseURL: 'http://localhost:8084',

  // Tell the backend that we are sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
})


// ============================================================
// JWT AUTHENTICATION INTERCEPTOR
// ============================================================

// Function to attach JWT token to API requests.
const addAuthToken = (config) => {

  // ==========================================================
  // IMPORTANT
  // ==========================================================
  //
  // Authentication is now stored in sessionStorage instead of
  // localStorage.
  //
  // This means:
  //
  // Login
  //   ↓
  // sessionStorage
  //   ↓
  // Refresh page
  //   ↓
  // Still logged in
  //
  // End browser session
  //   ↓
  // Authentication is cleared
  //
  // ==========================================================

  const storedAuth =
    sessionStorage.getItem('auth')


  // Check whether authentication data exists.
  if (storedAuth) {

    try {

      // Convert JSON string into JavaScript object.
      const auth =
        JSON.parse(storedAuth)


      // Check whether a JWT token exists.
      if (auth.token) {

        // Add JWT to the Authorization header.
        //
        // Example:
        //
        // Authorization: Bearer eyJhbGci...
        //
        config.headers.Authorization =
          `Bearer ${auth.token}`
      }

    } catch (error) {

      // If session authentication data is corrupted,
      // remove it instead of breaking every API request.

      console.error(
        'Invalid authentication data in sessionStorage:',
        error
      )

      sessionStorage.removeItem('auth')
    }
  }


  // Continue with the API request.
  return config
}


// ============================================================
// AUTH SERVICE INTERCEPTOR
// ============================================================

// This runs automatically before every Auth Service request.
api.interceptors.request.use(

  addAuthToken,

  (error) => {

    // Handle an error that happens before the request is sent.
    return Promise.reject(error)
  }
)


// ============================================================
// PRODUCT SERVICE INTERCEPTOR
// ============================================================

// This runs automatically before every Product Service request.
productApi.interceptors.request.use(

  addAuthToken,

  (error) => {

    // Handle an error that happens before the request is sent.
    return Promise.reject(error)
  }
)


// ============================================================
// INVENTORY SERVICE INTERCEPTOR
// ============================================================

// This runs automatically before every Inventory Service request.
//
// Seller inventory APIs will receive the seller's JWT token.
inventoryApi.interceptors.request.use(

  addAuthToken,

  (error) => {

    // Handle an error that happens before the request is sent.
    return Promise.reject(error)
  }
)


// ============================================================
// ORDER SERVICE INTERCEPTOR
// ============================================================

// This runs automatically before every Order Service request.
//
// This is important because Cart and Order APIs require
// JWT authentication.
orderApi.interceptors.request.use(

  addAuthToken,

  (error) => {

    // Handle an error that happens before the request is sent.
    return Promise.reject(error)
  }
)


// ============================================================
// PAYMENT SERVICE INTERCEPTOR
// ============================================================

// This runs automatically before every Payment Service request.
//
// This is important because our payment APIs are protected
// and require the customer's JWT token.
paymentApi.interceptors.request.use(

  addAuthToken,

  (error) => {

    // Handle an error that happens before the request is sent.
    return Promise.reject(error)
  }
)


// ============================================================
// EXPORTS
// ============================================================

// Export Auth Service Axios instance.
export default api


// Export Product, Inventory, Order and Payment
// Service Axios instances.
export {
  productApi,
  inventoryApi,
  orderApi,
  paymentApi,
}