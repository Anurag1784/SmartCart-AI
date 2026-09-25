// ============================================================
// SELLER NAVIGATION LINK
// ============================================================
// This component controls browser history for Seller pages.
//
// Desired behavior:
//
// Seller Home
//     ↓
// Manage Products
//     ↓
// Manage Inventory
//     ↓
// View Orders
//     ↓
// Add Product
//
// Browser Back
//     ↓
// Seller Home
//
// BUT:
//
// Seller Products
//     ↓
// Edit Product
//
// Browser Back
//     ↓
// Seller Products
//
// So Edit Product remains a child workflow.
// ============================================================

import { Link, useLocation } from 'react-router-dom'

function SellerNavLink({
  to,
  children,
  className,
  ...props
}) {
  // Get the current browser route.
  const location = useLocation()

  // Check whether we are currently inside the Seller workspace.
  const isInsideSellerWorkspace =
    location.pathname.startsWith('/seller')

  // Check whether the destination is the Edit Product page.
  //
  // Edit Product is intentionally NOT replaced in browser history
  // because we want:
  //
  // Products → Edit Product → Back → Products
  //
  const isEditProductDestination =
    typeof to === 'string' &&
    to.startsWith('/seller/products/edit/')

  // We want normal PUSH navigation when going:
  //
  // Seller Home → first Seller feature
  //
  // This keeps Seller Home in browser history.
  const isSellerHome =
    location.pathname === '/seller'

  // Decide whether React Router should REPLACE the current
  // Seller page in browser history.
  //
  // Example:
  //
  // Home → Products
  //      PUSH
  //
  // Products → Inventory
  //            REPLACE
  //
  // Inventory → Orders
  //             REPLACE
  //
  // Orders → Add Product
  //          REPLACE
  //
  // Back → Home
  //
  const shouldReplace =
    isInsideSellerWorkspace &&
    !isSellerHome &&
    !isEditProductDestination

  return (
    <Link
      to={to}
      replace={shouldReplace}
      className={className}
      {...props}
    >
      {children}
    </Link>
  )
}

export default SellerNavLink