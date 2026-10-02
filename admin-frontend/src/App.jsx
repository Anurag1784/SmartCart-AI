import { Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from './components/layout/AdminLayout'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Users from './pages/Users'
import Categories from './pages/Categories'
import ComingSoon from './pages/ComingSoon'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Inventory from './pages/Inventory'
import Analytics from './pages/Analytics'
import Announcements from './pages/Announcements'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'

import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =====================================================
          PROTECTED ADMIN ROUTES
          ===================================================== */}

      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />


        {/* Users */}
        <Route
          path="/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />


        {/* Categories */}
        <Route
          path="/categories"
          element={
            <AdminLayout>
              <Categories />
            </AdminLayout>
          }
        />


        {/* Products */}
        <Route
          path="/products"
          element={
            <AdminLayout>
              <Products/>
            </AdminLayout>
          }
        />


        {/* Orders */}
        <Route
          path="/orders"
          element={
            <AdminLayout>
              <Orders/>
            </AdminLayout>
          }
        />


        {/* Payments */}
        <Route
          path="/payments"
          element={
            <AdminLayout>
              <Payments/>
            </AdminLayout>
          }
        />


        {/* Inventory */}
        <Route
          path="/inventory"
          element={
            <AdminLayout>
              <Inventory/>
            </AdminLayout>
          }
        />


        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <AdminLayout>
              <Analytics/>
            </AdminLayout>
          }
        />


        {/* Announcements */}
        <Route
          path="/announcements"
          element={
            <AdminLayout>
              <Announcements/>
            </AdminLayout>
          }
        />


        {/* Audit Logs */}
        <Route
          path="/audit-logs"
          element={
            <AdminLayout>
              <AuditLogs/>
            </AdminLayout>
          }
        />


        {/* Settings */}
        <Route
          path="/settings"
          element={
            <AdminLayout>
              <Settings/>
            </AdminLayout>
          }
        />

      </Route>


      {/* =====================================================
          DEFAULT ROUTES
          ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  )
}

export default App