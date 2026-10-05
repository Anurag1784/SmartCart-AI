import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from '../components/Navbar'
import ProtectedRoute from '../components/ProtectedRoute'
import SellerRoute from '../components/SellerRoute'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import Profile from '../pages/Profile'
import Products from '../pages/Products'
import ProductDetails from '../pages/ProductDetails'
import Categories from '../pages/Categories'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Orders from '../pages/Orders'
import OrderDetails from '../pages/OrderDetails'
import Addresses from '../pages/Addresses'
import Wishlist from '../pages/Wishlist'

import SellerHome from '../pages/SellerHome'
import SellerProducts from '../pages/SellerProducts'
import SellerAddProduct from '../pages/SellerAddProduct'
import SellerInventory from '../pages/SellerInventory'
import SellerEditProduct from '../pages/SellerEditProduct'
import SellerOrders from '../pages/SellerOrders'
import SellerSettings from '../pages/SellerSettings'

// ============================================================
// SELLER ANALYTICS PAGE
// ============================================================
// This page displays seller sales and order analytics.
// Analytics will use the existing seller order API.
// ============================================================
import SellerAnalytics from '../pages/SellerAnalytics'


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* ==============================
            PUBLIC ROUTES
            ============================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        {/* All Categories */}
        <Route
          path="/categories"
          element={<Categories />}
        />

        {/* Dynamic Product Details Route */}
        <Route
          path="/products/:productId"
          element={<ProductDetails />}
        />


        {/* ==============================
            CUSTOMER PROTECTED ROUTES
            ============================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/addresses"
            element={<Addresses />}
          />

          {/* Wishlist is protected because
              wishlist belongs to the logged-in customer. */}
          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          {/* Cart is protected because the Cart API
              requires an authenticated customer. */}
          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* Checkout is protected because
              only authenticated customers can place orders. */}
          <Route
            path="/checkout"
            element={<Checkout />}
          />

          {/* Orders are protected because orders
              belong to the authenticated customer. */}
          <Route
            path="/orders"
            element={<Orders />}
          />

          {/* Dynamic Order Details Route */}
          <Route
            path="/orders/:orderId"
            element={<OrderDetails />}
          />

        </Route>


        {/* ==============================
            SELLER PROTECTED ROUTES
            ============================== */}

        {/* SellerRoute checks:
            1. User must be logged in.
            2. User must have SELLER role.
            3. Only then Seller pages are rendered. */}

        <Route element={<SellerRoute />}>

          {/* Seller Dashboard */}
          <Route
            path="/seller"
            element={<SellerHome />}
          />


          {/* Seller Product Management */}
          <Route
            path="/seller/products"
            element={<SellerProducts />}
          />


          {/* Seller Add Product */}
          <Route
            path="/seller/add-product"
            element={<SellerAddProduct />}
          />


          {/* Seller Inventory */}
          <Route
            path="/seller/inventory"
            element={<SellerInventory />}
          />


          {/* Seller Edit Product */}
          <Route
            path="/seller/products/edit/:productId"
            element={<SellerEditProduct />}
          />


          {/* Seller Orders */}
          <Route
            path="/seller/orders"
            element={<SellerOrders />}
          />


          {/* ==================================================
              SELLER ANALYTICS
              ==================================================

              Analytics uses the seller's existing order data.

              The seller is determined by the JWT through
              the backend's:

              GET /api/order-items/my-orders

              No sellerId is sent from the frontend.
          */}
          <Route
            path="/seller/analytics"
            element={<SellerAnalytics />}
          />

          <Route
            path="/seller/settings"
            element={<SellerSettings />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}


export default App