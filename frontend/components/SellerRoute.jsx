import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function SellerRoute() {
  // Get authentication information from Redux.
  // authSlice stores the logged-in user's information
  // inside state.auth.user.
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  )

  // If the user is not logged in,
  // redirect them to the Login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If the user is logged in but does not have
  // the SELLER role, they cannot access Seller Workspace.
  if (user?.role !== 'SELLER') {
    return <Navigate to="/" replace />
  }

  // User is authenticated and is a SELLER,
  // so allow the seller page to render.
  return <Outlet />
}

export default SellerRoute