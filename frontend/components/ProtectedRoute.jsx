import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  // Get authentication status from Redux
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  )

  // If the user is not logged in,
  // redirect them to the Login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If the user is logged in,
  // allow the requested protected page to open
  return <Outlet />
}

export default ProtectedRoute