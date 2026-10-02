import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  // ----------------------------------------------------------
  // Get authentication information from Redux
  // ----------------------------------------------------------
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  )

  // ----------------------------------------------------------
  // If user is not logged in, send them to Admin Login
  // ----------------------------------------------------------
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ----------------------------------------------------------
  // Even if authenticated, only ADMIN can access
  // the Admin Frontend.
  // ----------------------------------------------------------
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  // ----------------------------------------------------------
  // Authentication + ADMIN role verified.
  // Allow the requested protected page to render.
  // ----------------------------------------------------------
  return <Outlet />
}

export default ProtectedRoute