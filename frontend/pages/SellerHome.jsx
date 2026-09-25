// ============================================================
// SELLER HOME / SELLER WORKSPACE
// ============================================================
//
// This page is the main dashboard for an authenticated seller.
//
// Existing functionality preserved:
// - Seller products count
// - Inventory summary
// - Seller orders
// - Seller sales
// - Recent activity
// - Inventory attention
// - Quick actions
// - Dashboard refresh
//
// New functionality:
// - Seller notifications
// - Unread notification count
// - Notification dropdown
// - Mark notification as read
// - Seller profile dropdown
// - Seller logout
//
// ============================================================


// ============================================================
// REACT HOOKS
// ============================================================

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'


// ============================================================
// REACT ROUTER
// ============================================================

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import SellerNavLink from '../components/SellerNavLink'


// ============================================================
// REDUX
// ============================================================

import {
  useDispatch,
  useSelector,
} from 'react-redux'

import { logout } from '../src/store/slices/authSlice'


// ============================================================
// AXIOS
// ============================================================
//
// We use axios directly only for Notification Service because
// your current centralized api.js does not expose a notificationApi.
//
// Notification Service is expected on port 8085.
// If your Notification Service uses another port, only change
// the fallback URL below or later move it into api.js.
//
// ============================================================

import axios from 'axios'


// ============================================================
// LUCIDE ICONS
// ============================================================

import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  ShoppingBag,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  ArrowUpRight,
  Store,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Mail,
  X,
  Check,
} from 'lucide-react'


// ============================================================
// EXISTING SMARTCART API CLIENTS
// ============================================================

import {
  productApi,
  inventoryApi,
  orderApi,
} from '../services/api'


// ============================================================
// SELLER DASHBOARD CSS
// ============================================================

import './SellerHome.css'


// ============================================================
// NOTIFICATION SERVICE CLIENT
// ============================================================
//
// Notification Service:
// http://localhost:8085
//
// Endpoint used:
// GET /api/notifications/user/{userId}
//
// ============================================================

const notificationApi = axios.create({
  baseURL:
    import.meta.env.VITE_NOTIFICATION_SERVICE_URL ||
    'http://localhost:8085',
})


// ============================================================
// NOTIFICATION JWT INTERCEPTOR
// ============================================================
//
// The existing api.js automatically adds JWT to requests.
// Because notificationApi is created locally here, we need
// to attach the JWT ourselves.
//
// ============================================================

notificationApi.interceptors.request.use(
  (config) => {

    try {

      // Read the existing authentication object.
      const storedAuth =
        sessionStorage.getItem('auth')

      if (storedAuth) {

        const auth =
          JSON.parse(storedAuth)

        const token =
          auth?.token

        if (token) {

          config.headers.Authorization =
            `Bearer ${token}`

        }

      }

    } catch (error) {

      console.error(
        'Notification authentication error:',
        error
      )

    }

    return config
  }
)


// ============================================================
// SELLER HOME COMPONENT
// ============================================================

function SellerHome() {

  // ==========================================================
  // AUTHENTICATED SELLER
  // ==========================================================

  // Redux dispatcher.
  const dispatch = useDispatch()

  // React Router navigation.
  const navigate = useNavigate()

  // ==========================================================
  // SELLER HOME BROWSER BACK GUARD
  // ==========================================================
  //
  // When the seller is on the main Seller Dashboard and presses
  // the browser Back button, show the existing logout confirmation
  // instead of immediately leaving the seller workspace.
  //
  // Internal seller navigation is still controlled by
  // SellerNavLink. For example:
  //
  // Seller Home -> Products -> Back -> Seller Home
  //
  // continues to work normally.
  //
  // ==========================================================

  const sellerHomeBackGuardActive = useRef(false)
  const sellerHomeLoggingOut = useRef(false)

  useEffect(() => {
    // This guard is active only while the Seller Home component
    // is mounted. Internal seller pages use their own navigation
    // history behavior.
    if (sellerHomeBackGuardActive.current) {
      return
    }

    sellerHomeBackGuardActive.current = true
    sellerHomeLoggingOut.current = false

    // Add one same-route history entry.
    //
    // Example:
    //
    // Previous page
    // Seller Home
    // Seller Home Guard
    //
    // Browser Back first returns to the real Seller Home entry.
    // Because that entry is on the same React document, popstate
    // can be intercepted before React Router leaves the page.
    window.history.pushState(
      {
        ...(window.history.state || {}),
        sellerHomeGuard: true,
      },
      '',
      window.location.href
    )

    const handleSellerHomeBack = () => {
      // If logout has already been confirmed, do not intercept
      // the history operation used to leave the seller workspace.
      if (sellerHomeLoggingOut.current) {
        return
      }

      // Immediately restore the guard entry.
      //
      // This keeps the seller on Seller Home while the confirmation
      // dialog is displayed.
      window.history.pushState(
        {
          ...(window.history.state || {}),
          sellerHomeGuard: true,
        },
        '',
        window.location.href
      )

      // Close any open dropdowns.
      setShowProfileMenu(false)
      setShowNotifications(false)

      // Show the existing Seller logout confirmation modal.
      setShowLogoutConfirm(true)
    }

    // Capture phase is intentional. It gives this handler the
    // opportunity to restore the guarded Seller Home entry before
    // React Router processes the browser Back navigation.
    window.addEventListener(
      'popstate',
      handleSellerHomeBack,
      true
    )

    return () => {
      window.removeEventListener(
        'popstate',
        handleSellerHomeBack,
        true
      )

      sellerHomeBackGuardActive.current = false
    }
  }, [])

  // Get currently logged-in seller.
  const user =
    useSelector(
      (state) => state.auth.user
    )


  // ==========================================================
  // SELLER PROFILE DROPDOWN
  // ==========================================================

  // Controls whether seller profile menu is visible.
  const [
    showProfileMenu,
    setShowProfileMenu,
  ] = useState(false)


  // ==========================================================
  // LOGOUT CONFIRMATION
  // ==========================================================

  // Controls logout confirmation popup.
  const [
    showLogoutConfirm,
    setShowLogoutConfirm,
  ] = useState(false)


  // ==========================================================
  // NOTIFICATION DROPDOWN
  // ==========================================================

  // Controls notification dropdown.
  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false)


  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  // Stores all seller notifications.
  const [
    notifications,
    setNotifications,
  ] = useState([])


  // Loading state for notifications.
  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false)


  // Error while loading notifications.
  const [
    notificationError,
    setNotificationError,
  ] = useState('')


  // ==========================================================
  // DASHBOARD STATE
  // ==========================================================

  // All products belonging to the seller.
  const [
    products,
    setProducts,
  ] = useState([])


  // Product + inventory information.
  const [
    inventoryItems,
    setInventoryItems,
  ] = useState([])


  // Seller order items.
  const [
    orderItems,
    setOrderItems,
  ] = useState([])


  // Dashboard loading state.
  const [
    loading,
    setLoading,
  ] = useState(true)


  // Dashboard error.
  const [
    error,
    setError,
  ] = useState('')


  // ==========================================================
  // SELLER NAME
  // ==========================================================

  const sellerName =
    user?.firstName ||
    user?.userName ||
    user?.name ||
    'Seller'


  // ==========================================================
  // SELLER EMAIL
  // ==========================================================

  const sellerEmail =
    user?.email ||
    'Seller account'


  // ==========================================================
  // LOAD SELLER DASHBOARD DATA
  // ==========================================================

  const loadDashboardData =
    async () => {

      try {

        // Start dashboard loading.
        setLoading(true)

        // Clear previous error.
        setError('')


        // ------------------------------------------------------
        // STEP 1
        // LOAD SELLER PRODUCTS
        // ------------------------------------------------------

        const productsResponse =
          await productApi.get(
            '/api/products/my-products'
          )

        const sellerProducts =
          productsResponse.data || []

        // Save seller products.
        setProducts(
          sellerProducts
        )


        // ------------------------------------------------------
        // STEP 2
        // LOAD INVENTORY
        // ------------------------------------------------------

        const combinedInventory =
          await Promise.all(

            sellerProducts.map(
              async (product) => {

                try {

                  // Get inventory for this product.
                  const inventoryResponse =
                    await inventoryApi.get(
                      `/api/inventory/product/${product.productId}`
                    )

                  return {
                    product,
                    inventory:
                      inventoryResponse.data,
                  }

                } catch (inventoryError) {

                  // Keep product visible even if inventory
                  // does not exist.
                  return {
                    product,
                    inventory: null,
                  }

                }

              }
            )

          )


        // Save inventory information.
        setInventoryItems(
          combinedInventory
        )


        // ------------------------------------------------------
        // STEP 3
        // LOAD SELLER ORDERS
        // ------------------------------------------------------
        //
        // IMPORTANT:
        // We do NOT send sellerId from the frontend.
        //
        // Backend determines seller using JWT.
        //
        // ------------------------------------------------------

        const ordersResponse =
          await orderApi.get(
            '/api/order-items/my-orders'
          )


        setOrderItems(
          ordersResponse.data || []
        )

      } catch (err) {

        console.error(
          'Seller Dashboard Loading Error:',
          err
        )

        setError(
          err?.response?.data?.message ||
          'Unable to load seller dashboard data.'
        )

      } finally {

        // Stop loading.
        setLoading(false)

      }

    }


  // ==========================================================
  // LOAD DASHBOARD WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {

    loadDashboardData()

  }, [])


  // ==========================================================
  // STOCK STATUS HELPER
  // ==========================================================

  const getStockStatus =
    (inventory) => {

      // Inventory record doesn't exist.
      if (!inventory) {

        return {
          label: 'Unavailable',
          type: 'unavailable',
        }

      }


      const availableQuantity =
        Number(
          inventory.availableQuantity ?? 0
        )


      const reorderLevel =
        Number(
          inventory.reorderLevel ?? 0
        )


      // No stock.
      if (
        availableQuantity === 0
      ) {

        return {
          label: 'Out of Stock',
          type: 'danger',
        }

      }


      // Stock at or below reorder level.
      if (
        reorderLevel > 0 &&
        availableQuantity <= reorderLevel
      ) {

        return {
          label: 'Low Stock',
          type: 'warning',
        }

      }


      // Healthy stock.
      return {
        label: 'In Stock',
        type: 'success',
      }

    }


  // ==========================================================
  // INVENTORY SUMMARY
  // ==========================================================

  const inventorySummary =
    useMemo(() => {

      let inStock = 0
      let lowStock = 0
      let outOfStock = 0


      inventoryItems.forEach(
        (item) => {

          const status =
            getStockStatus(
              item.inventory
            )


          if (
            status.type === 'success'
          ) {

            inStock++

          }


          if (
            status.type === 'warning'
          ) {

            lowStock++

          }


          if (
            status.type === 'danger'
          ) {

            outOfStock++

          }

        }
      )


      return {
        total:
          inventoryItems.length,

        inStock,

        lowStock,

        outOfStock,
      }

    }, [
      inventoryItems,
    ])


  // ==========================================================
  // GROUP SELLER ORDERS
  // ==========================================================

  const orders =
    useMemo(() => {

      const groupedOrders = {}


      orderItems.forEach(
        (item) => {

          const orderId =
            String(
              item.orderId
            )


          if (
            !groupedOrders[orderId]
          ) {

            groupedOrders[orderId] = {

              orderId:
                item.orderId,

              customerId:
                item.customerId,

              createdAt:
                item.createdAt,

              orderStatus:
                item.orderStatus,

              paymentStatus:
                item.paymentStatus,

              items: [],

            }

          }


          groupedOrders[
            orderId
          ].items.push(
            item
          )

        }
      )


      const groupedArray =
        Object.values(
          groupedOrders
        )


      // Latest orders first.
      groupedArray.sort(
        (a, b) =>
          Number(b.orderId) -
          Number(a.orderId)
      )


      return groupedArray

    }, [
      orderItems,
    ])


  // ==========================================================
  // SELLER SALES
  // ==========================================================

  const totalSales =
    useMemo(() => {

      // Only successfully paid orders
      // are counted as sales.
      return orderItems.reduce(
        (
          total,
          item
        ) => {

          if (
            item.paymentStatus !==
            'SUCCESS'
          ) {

            return total

          }


          return (
            total +
            Number(
              item.subtotal || 0
            )
          )

        },
        0
      )

    }, [
      orderItems,
    ])


  // ==========================================================
  // RECENT ORDERS
  // ==========================================================

  const recentOrders =
    useMemo(() => {

      return orders.slice(
        0,
        5
      )

    }, [
      orders,
    ])


  // ==========================================================
  // INVENTORY ATTENTION
  // ==========================================================

  const inventoryAttention =
    useMemo(() => {

      return inventoryItems

        .filter(
          (item) => {

            const status =
              getStockStatus(
                item.inventory
              )


            return (
              status.type ===
                'danger' ||
              status.type ===
                'warning'
            )

          }
        )

        .slice(
          0,
          5
        )

    }, [
      inventoryItems,
    ])


  // ==========================================================
  // FORMAT CURRENCY
  // ==========================================================

  const formatCurrency =
    (amount) => {

      return Number(
        amount || 0
      ).toLocaleString(
        'en-IN',
        {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        }
      )

    }


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate =
    (dateValue) => {

      if (!dateValue) {

        return '—'

      }


      const date =
        new Date(
          dateValue
        )


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return '—'

      }


      return date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      )

    }


  // ==========================================================
  // LOAD SELLER NOTIFICATIONS
  // ==========================================================

  const loadNotifications =
    async () => {

      // Seller must have a user ID.
      const userId =
        user?.userId


      if (!userId) {

        setNotificationError(
          'Unable to identify seller account.'
        )

        return

      }


      try {

        // Start notification loading.
        setNotificationsLoading(
          true
        )

        // Clear previous error.
        setNotificationError('')


        // ------------------------------------------------------
        // GET ALL SELLER NOTIFICATIONS
        // ------------------------------------------------------
        //
        // Controller:
        //
        // GET /api/notifications/user/{userId}
        //
        // ------------------------------------------------------

        const response =
          await notificationApi.get(
            `/api/notifications/user/${userId}`
          )


        const notificationList =
          response.data || []


        // Latest notifications first.
        const sortedNotifications =
          [...notificationList].sort(
            (a, b) => {

              const first =
                new Date(
                  a.createdAt || 0
                ).getTime()

              const second =
                new Date(
                  b.createdAt || 0
                ).getTime()

              return second - first

            }
          )


        setNotifications(
          sortedNotifications
        )

      } catch (err) {

        console.error(
          'Seller Notification Error:',
          err
        )


        if (
          err?.response?.status ===
          401
        ) {

          setNotificationError(
            'Your session has expired.'
          )

        } else if (
          err?.response?.status ===
          403
        ) {

          setNotificationError(
            'You do not have permission to view notifications.'
          )

        } else {

          setNotificationError(
            'Unable to load notifications.'
          )

        }

      } finally {

        setNotificationsLoading(
          false
        )

      }

    }


  // ==========================================================
  // OPEN / CLOSE NOTIFICATION DROPDOWN
  // ==========================================================

  const handleNotificationClick =
    async () => {

      // Close notification panel
      // if it is already open.
      if (
        showNotifications
      ) {

        setShowNotifications(
          false
        )

        return

      }


      // Close profile menu.
      setShowProfileMenu(
        false
      )


      // Open notification panel.
      setShowNotifications(
        true
      )


      // Load fresh notifications.
      await loadNotifications()

    }


  // ==========================================================
  // UNREAD NOTIFICATION COUNT
  // ==========================================================

  const unreadNotificationCount =
    notifications.filter(
      (notification) =>
        notification.isRead !== true
    ).length


  // ==========================================================
  // MARK NOTIFICATION AS READ
  // ==========================================================

  const handleMarkNotificationRead =
    async (
      notification
    ) => {

      // Don't send another request if already read.
      if (
        notification.isRead === true
      ) {

        return

      }


      try {

        // Controller:
        //
        // PUT /api/notifications/{notificationId}/read
        //
        await notificationApi.put(
          `/api/notifications/${notification.notificationId}/read`
        )


        // Update frontend immediately.
        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (currentNotification) => {

                if (
                  currentNotification.notificationId ===
                  notification.notificationId
                ) {

                  return {
                    ...currentNotification,
                    isRead: true,
                  }

                }


                return currentNotification

              }
            )
        )

      } catch (err) {

        console.error(
          'Mark Notification Read Error:',
          err
        )

      }

    }


  // ==========================================================
  // MARK ALL CURRENT NOTIFICATIONS AS READ
  // ==========================================================
  //
  // The backend currently exposes only the individual
  // mark-as-read endpoint, so we call it for each unread
  // notification.
  //
  // ==========================================================

  const handleMarkAllNotificationsRead =
    async () => {

      const unreadNotifications =
        notifications.filter(
          (notification) =>
            notification.isRead !== true
        )


      if (
        unreadNotifications.length === 0
      ) {

        return

      }


      try {

        await Promise.all(

          unreadNotifications.map(
            (notification) =>
              notificationApi.put(
                `/api/notifications/${notification.notificationId}/read`
              )
          )

        )


        // Update UI after successful requests.
        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        )

      } catch (err) {

        console.error(
          'Mark All Notifications Read Error:',
          err
        )

      }

    }


  // ==========================================================
  // PROFILE BUTTON
  // ==========================================================

  const handleProfileClick =
    () => {

      // Close notification dropdown.
      setShowNotifications(
        false
      )


      // Toggle profile menu.
      setShowProfileMenu(
        (current) =>
          !current
      )

    }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    () => {

      // Ask for confirmation first.
      setShowLogoutConfirm(
        true
      )

      // Close profile dropdown.
      setShowProfileMenu(
        false
      )

    }


  // ==========================================================
  // CONFIRM LOGOUT
  // ==========================================================

  const handleConfirmLogout =
    () => {

      // Tell the Seller Home back guard that the logout
      // was explicitly confirmed. This prevents the guard
      // from interfering with the navigation to Login.
      sellerHomeLoggingOut.current = true

      // Clear Redux authentication state.
      //
      // authSlice also removes "auth" from sessionStorage.
      dispatch(
        logout()
      )

      // Replace the current route so the seller dashboard
      // is not kept as the immediate previous route.
      navigate(
        '/login',
        {
          replace: true,
        }
      )

    }


  // ==========================================================
  // CANCEL LOGOUT
  // ==========================================================

  const handleCancelLogout =
    () => {

      setShowLogoutConfirm(
        false
      )

    }


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {

    return (

      <div className="seller-home">

        <main className="seller-main">

          <div className="seller-dashboard-loading">

            <RefreshCw
              size={34}
              className="seller-dashboard-spinner"
            />

            <h2>
              Loading Seller Dashboard
            </h2>

            <p>
              Fetching your products,
              inventory and orders...
            </p>

          </div>

        </main>

      </div>

    )

  }


  // ==========================================================
  // MAIN SELLER DASHBOARD
  // ==========================================================

  return (

    <div className="seller-home">


      {/* ======================================================
          SELLER SIDEBAR
          ====================================================== */}

      <aside className="seller-sidebar">


        {/* ====================================================
            SELLER BRAND
            ==================================================== */}

        <div className="seller-brand">

          <div className="seller-brand-icon">

            <Store
              size={24}
            />

          </div>


          <div>

            <h2>
              SmartCart AI
            </h2>

            <span>
              SELLER WORKSPACE
            </span>

          </div>

        </div>


        {/* ====================================================
            SIDEBAR NAVIGATION
            ==================================================== */}

        <nav className="seller-navigation">


          {/* Dashboard */}

          <a
            href="#seller-dashboard"
            className="seller-nav-item active"
          >

            <LayoutDashboard
              size={19}
            />

            <span>
              Dashboard
            </span>

          </a>


          {/* Products */}

          <SellerNavLink
            to="/seller/products"
            className="seller-nav-item"
          >

            <Package
              size={19}
            />

            <span>
              Products
            </span>

          </SellerNavLink>


          {/* Add Product */}

          <SellerNavLink
            to="/seller/add-product"
            className="seller-nav-item"
          >

            <PlusCircle
              size={19}
            />

            <span>
              Add Product
            </span>

          </SellerNavLink>


          {/* Inventory */}

          <SellerNavLink
            to="/seller/inventory"
            className="seller-nav-item"
          >

            <Boxes
              size={19}
            />

            <span>
              Inventory
            </span>

          </SellerNavLink>


          {/* Orders */}

          <SellerNavLink
            to="/seller/orders"
            className="seller-nav-item"
          >

            <ShoppingBag
              size={19}
            />

            <span>
              Orders
            </span>

          </SellerNavLink>


          {/* ==================================================
              Analytics
              ==================================================
              
              Analytics now opens the dedicated Seller Analytics
              page instead of using an in-page anchor.
              
              SellerNavLink also preserves the seller navigation
              browser-back behavior.
          ================================================== */}

          <SellerNavLink
            to="/seller/analytics"
            className="seller-nav-item"
          >

            <BarChart3
              size={19}
            />

            <span>
              Analytics
            </span>

          </SellerNavLink>


        </nav>


        {/* ====================================================
            SIDEBAR BOTTOM
            ==================================================== */}

        <div className="seller-sidebar-bottom">


          {/* Settings */}

          <SellerNavLink
                to="/seller/settings"
               className="seller-nav-item"
          >
           <Settings size={19} />

             <span>
              Settings
             </span>
          </SellerNavLink>


          {/* Seller Account */}

          <div className="seller-account">

            <div className="seller-account-icon">

              <UserCircle
                size={22}
              />

            </div>


            <div className="seller-account-info">

              <strong>

                {sellerName}

              </strong>

              <span>
                Seller Workspace
              </span>

            </div>

          </div>

        </div>


      </aside>


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main
        className="seller-main"
        id="seller-dashboard"
      >


        {/* ====================================================
            TOP HEADER
            ==================================================== */}

        <header className="seller-topbar">


          {/* PAGE HEADING */}

          <div className="seller-page-heading">

            <span className="seller-eyebrow">
              SELLER DASHBOARD
            </span>


            <h1>
              Welcome back 👋
            </h1>


            <p>
              Manage your SmartCart store from one place.
            </p>

          </div>


          {/* ==================================================
              TOP RIGHT SELLER ACTIONS
              ================================================== */}

          <div
            className="seller-top-actions"
            style={{
              position: 'relative',
            }}
          >


            {/* ==================================================
                NOTIFICATION BUTTON
                ================================================== */}

            <button
              type="button"
              className="seller-icon-button"
              aria-label="Notifications"
              onClick={
                handleNotificationClick
              }
              title="Notifications"
            >

              <Bell
                size={20}
              />


              {/* UNREAD BADGE */}

              {unreadNotificationCount >
                0 && (

                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '999px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    border: '2px solid #111827',
                  }}
                >

                  {unreadNotificationCount >
                    99
                    ? '99+'
                    : unreadNotificationCount}

                </span>

              )}

            </button>


            {/* ==================================================
                NOTIFICATION DROPDOWN
                ================================================== */}

            {showNotifications && (

              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: '150px',
                  width: '360px',
                  maxWidth: 'calc(100vw - 32px)',
                  background: '#111827',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >


                {/* NOTIFICATION HEADER */}

                <div
                  style={{
                    padding: '15px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom:
                      '1px solid rgba(148, 163, 184, 0.12)',
                  }}
                >

                  <div>

                    <strong
                      style={{
                        display: 'block',
                        color: '#f8fafc',
                        fontSize: '14px',
                      }}
                    >
                      Notifications
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '3px',
                        color: '#94a3b8',
                        fontSize: '11px',
                      }}
                    >
                      {unreadNotificationCount}
                      {' '}
                      unread
                    </span>

                  </div>


                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >

                    {unreadNotificationCount >
                      0 && (

                      <button
                        type="button"
                        onClick={
                          handleMarkAllNotificationsRead
                        }
                        title="Mark all as read"
                        style={{
                          border: 'none',
                          background:
                            'rgba(99, 102, 241, 0.12)',
                          color: '#a5b4fc',
                          padding: '6px 8px',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >

                        <Check
                          size={13}
                          style={{
                            verticalAlign:
                              'middle',
                            marginRight: '3px',
                          }}
                        />

                        Mark all read

                      </button>

                    )}


                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(
                          false
                        )
                      }
                      aria-label="Close notifications"
                      style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background:
                          'rgba(148, 163, 184, 0.08)',
                        color: '#94a3b8',
                        borderRadius: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >

                      <X
                        size={15}
                      />

                    </button>

                  </div>

                </div>


                {/* ==================================================
                    NOTIFICATION BODY
                    ================================================== */}

                <div
                  style={{
                    maxHeight: '390px',
                    overflowY: 'auto',
                  }}
                >


                  {/* LOADING */}

                  {notificationsLoading && (

                    <div
                      style={{
                        padding: '35px 20px',
                        textAlign: 'center',
                        color: '#94a3b8',
                      }}
                    >

                      <RefreshCw
                        size={22}
                        className="seller-dashboard-spinner"
                      />

                      <p
                        style={{
                          margin:
                            '10px 0 0',
                          fontSize: '12px',
                        }}
                      >
                        Loading notifications...
                      </p>

                    </div>

                  )}


                  {/* ERROR */}

                  {!notificationsLoading &&
                    notificationError && (

                    <div
                      style={{
                        padding: '30px 20px',
                        textAlign: 'center',
                        color: '#fca5a5',
                      }}
                    >

                      <AlertTriangle
                        size={25}
                      />

                      <p
                        style={{
                          margin:
                            '9px 0 0',
                          fontSize: '12px',
                        }}
                      >
                        {notificationError}
                      </p>

                    </div>

                  )}


                  {/* EMPTY */}

                  {!notificationsLoading &&
                    !notificationError &&
                    notifications.length ===
                      0 && (

                    <div
                      style={{
                        padding: '38px 20px',
                        textAlign: 'center',
                        color: '#94a3b8',
                      }}
                    >

                      <Bell
                        size={28}
                      />

                      <h3
                        style={{
                          margin:
                            '10px 0 5px',
                          color: '#e2e8f0',
                          fontSize: '13px',
                        }}
                      >
                        No notifications
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '11px',
                        }}
                      >
                        New seller notifications
                        will appear here.
                      </p>

                    </div>

                  )}


                  {/* NOTIFICATION LIST */}

                  {!notificationsLoading &&
                    !notificationError &&
                    notifications.length >
                      0 && (

                    <div>

                      {notifications.map(
                        (notification) => {

                          const isUnread =
                            notification.isRead !==
                            true


                          return (

                            <button
                              key={
                                notification.notificationId
                              }
                              type="button"
                              onClick={() =>
                                handleMarkNotificationRead(
                                  notification
                                )
                              }
                              style={{
                                width: '100%',
                                border: 'none',
                                borderBottom:
                                  '1px solid rgba(148, 163, 184, 0.08)',
                                background:
                                  isUnread
                                    ? 'rgba(99, 102, 241, 0.08)'
                                    : 'transparent',
                                padding: '13px 16px',
                                textAlign: 'left',
                                cursor:
                                  isUnread
                                    ? 'pointer'
                                    : 'default',
                              }}
                            >

                              <div
                                style={{
                                  display: 'flex',
                                  gap: '11px',
                                }}
                              >

                                {/* ICON */}

                                <div
                                  style={{
                                    flexShrink: 0,
                                    width: '34px',
                                    height: '34px',
                                    borderRadius:
                                      '10px',
                                    display: 'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    color:
                                      isUnread
                                        ? '#a5b4fc'
                                        : '#64748b',
                                    background:
                                      isUnread
                                        ? 'rgba(99, 102, 241, 0.13)'
                                        : 'rgba(148, 163, 184, 0.08)',
                                  }}
                                >

                                  <Bell
                                    size={16}
                                  />

                                </div>


                                {/* CONTENT */}

                                <div
                                  style={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >

                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems:
                                        'flex-start',
                                      justifyContent:
                                        'space-between',
                                      gap: '8px',
                                    }}
                                  >

                                    <strong
                                      style={{
                                        color:
                                          isUnread
                                            ? '#f8fafc'
                                            : '#cbd5e1',
                                        fontSize:
                                          '12px',
                                        lineHeight:
                                          1.35,
                                      }}
                                    >

                                      {
                                        notification.title ||
                                        'Notification'
                                      }

                                    </strong>


                                    {isUnread && (

                                      <span
                                        style={{
                                          flexShrink: 0,
                                          width: '7px',
                                          height: '7px',
                                          borderRadius:
                                            '50%',
                                          background:
                                            '#818cf8',
                                          marginTop:
                                            '4px',
                                        }}
                                      />

                                    )}

                                  </div>


                                  <p
                                    style={{
                                      margin:
                                        '4px 0 5px',
                                      color:
                                        '#94a3b8',
                                      fontSize:
                                        '11px',
                                      lineHeight:
                                        1.45,
                                    }}
                                  >

                                    {
                                      notification.message ||
                                      'You have a new notification.'
                                    }

                                  </p>


                                  <span
                                    style={{
                                      color:
                                        '#64748b',
                                      fontSize:
                                        '9px',
                                    }}
                                  >

                                    {formatDate(
                                      notification.createdAt
                                    )}

                                  </span>

                                </div>

                              </div>

                            </button>

                          )

                        }
                      )}

                    </div>

                  )}

                </div>

              </div>

            )}


            {/* ==================================================
                SELLER PROFILE BUTTON
                ================================================== */}

            <button
              type="button"
              className="seller-profile-button"
              onClick={
                handleProfileClick
              }
              aria-label="Seller profile"
            >

              <UserCircle
                size={24}
              />

              <span>
                {sellerName}
              </span>

            </button>


            {/* ==================================================
                PROFILE DROPDOWN
                ================================================== */}

            {showProfileMenu && (

              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '250px',
                  background: '#111827',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '15px',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >


                {/* PROFILE INFORMATION */}

                <div
                  style={{
                    padding: '16px',
                    borderBottom:
                      '1px solid rgba(148, 163, 184, 0.12)',
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                    }}
                  >

                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        flexShrink: 0,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c4b5fd',
                        background:
                          'rgba(139, 92, 246, 0.14)',
                      }}
                    >

                      <UserCircle
                        size={25}
                      />

                    </div>


                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >

                      <strong
                        style={{
                          display: 'block',
                          color: '#f8fafc',
                          fontSize: '13px',
                          whiteSpace:
                            'nowrap',
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                        }}
                      >

                        {sellerName}

                      </strong>


                      <span
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: '5px',
                          marginTop: '4px',
                          color: '#94a3b8',
                          fontSize: '10px',
                          whiteSpace:
                            'nowrap',
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                        }}
                      >

                        <Mail
                          size={11}
                        />

                        {sellerEmail}

                      </span>

                    </div>

                  </div>

                </div>


                {/* PROFILE ACTIONS */}

                <div
                  style={{
                    padding: '8px',
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    style={{
                      width: '100%',
                      border: 'none',
                      background:
                        'rgba(239, 68, 68, 0.08)',
                      color: '#fca5a5',
                      padding: '10px 11px',
                      borderRadius: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'left',
                    }}
                  >

                    <LogOut
                      size={16}
                    />

                    Logout

                  </button>

                </div>

              </div>

            )}

          </div>

        </header>


        {/* ====================================================
            ERROR
            ==================================================== */}

        {error && (

          <div className="seller-dashboard-error">

            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* ====================================================
            AI STORE ASSISTANT BANNER
            ==================================================== */}

        <section className="seller-ai-banner">

          <div className="seller-ai-icon">

            <Sparkles
              size={24}
            />

          </div>


          <div className="seller-ai-content">

            <span>
              SMARTCART AI FOR SELLERS
            </span>

            <h2>
              Run your store smarter.
            </h2>

            <p>
              Manage products, inventory, and customer orders
              from your Seller Workspace.
            </p>

          </div>

        </section>


        {/* ====================================================
            QUICK ACTIONS
            ==================================================== */}

        <section className="seller-section">

          <div className="seller-section-heading">

            <div>

              <span>
                QUICK ACTIONS
              </span>

              <h2>
                What would you like to do?
              </h2>

            </div>

          </div>


          <div className="seller-action-grid">


            {/* ADD PRODUCT */}

            <SellerNavLink
              to="/seller/add-product"
              className="seller-action-card"
            >

              <div className="seller-action-icon">

                <PlusCircle
                  size={24}
                />

              </div>


              <div>

                <h3>
                  Add Product
                </h3>

                <p>
                  List a new product in your store.
                </p>

              </div>


              <ArrowUpRight
                size={19}
              />

            </SellerNavLink>


            {/* MANAGE PRODUCTS */}

            <SellerNavLink
              to="/seller/products"
              className="seller-action-card"
            >

              <div className="seller-action-icon">

                <Package
                  size={24}
                />

              </div>


              <div>

                <h3>
                  Manage Products
                </h3>

                <p>
                  View and manage your product catalog.
                </p>

              </div>


              <ArrowUpRight
                size={19}
              />

            </SellerNavLink>


            {/* MANAGE INVENTORY */}

            <SellerNavLink
              to="/seller/inventory"
              className="seller-action-card"
            >

              <div className="seller-action-icon">

                <Boxes
                  size={24}
                />

              </div>


              <div>

                <h3>
                  Manage Inventory
                </h3>

                <p>
                  Keep track of your product stock.
                </p>

              </div>


              <ArrowUpRight
                size={19}
              />

            </SellerNavLink>


            {/* VIEW ORDERS */}

            <SellerNavLink
              to="/seller/orders"
              className="seller-action-card"
            >

              <div className="seller-action-icon">

                <ShoppingBag
                  size={24}
                />

              </div>


              <div>

                <h3>
                  View Orders
                </h3>

                <p>
                  Manage orders containing your products.
                </p>

              </div>


              <ArrowUpRight
                size={19}
              />

            </SellerNavLink>

          </div>

        </section>


        {/* ====================================================
            STORE OVERVIEW
            ==================================================== */}

        <section className="seller-section">

          <div className="seller-section-heading">

            <div>

              <span>
                STORE OVERVIEW
              </span>

              <h2>
                Your store at a glance
              </h2>

            </div>

          </div>


          <div className="seller-overview-grid">


            {/* PRODUCTS */}

            <div className="seller-overview-card">

              <div className="seller-overview-icon">

                <Package
                  size={22}
                />

              </div>

              <span>
                PRODUCTS
              </span>

              <strong>
                {products.length}
              </strong>

              <p>
                Products in your catalog
              </p>

            </div>


            {/* INVENTORY */}

            <div className="seller-overview-card">

              <div className="seller-overview-icon">

                <Boxes
                  size={22}
                />

              </div>

              <span>
                INVENTORY
              </span>

              <strong>
                {inventorySummary.inStock}
              </strong>

              <p>
                Products currently in stock
              </p>

            </div>


            {/* ORDERS */}

            <div className="seller-overview-card">

              <div className="seller-overview-icon">

                <ShoppingBag
                  size={22}
                />

              </div>

              <span>
                ORDERS
              </span>

              <strong>
                {orders.length}
              </strong>

              <p>
                Orders containing your products
              </p>

            </div>


            {/* SALES */}

            <div className="seller-overview-card">

              <div className="seller-overview-icon">

                <BarChart3
                  size={22}
                />

              </div>

              <span>
                SALES
              </span>

              <strong className="seller-sales-value">
                {formatCurrency(
                  totalSales
                )}
              </strong>

              <p>
                Successfully paid seller sales
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            LOWER DASHBOARD AREA
            ==================================================== */}

        <section className="seller-lower-grid">


          {/* ==================================================
              RECENT ACTIVITY
              ================================================== */}

          <div className="seller-panel">

            <div className="seller-panel-header">

              <div>

                <span>
                  RECENT ACTIVITY
                </span>

                <h2>
                  Store activity
                </h2>

              </div>


              <ShoppingBag
                size={21}
              />

            </div>


            {recentOrders.length ===
            0 ? (

              <div className="seller-empty-state">

                <div className="seller-empty-icon">

                  <ShoppingBag
                    size={25}
                  />

                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Recent customer orders will appear here.
                </p>

              </div>

            ) : (

              <div className="seller-recent-orders">

                {recentOrders.map(
                  (order) => (

                    <div
                      key={
                        order.orderId
                      }
                      className="seller-recent-order"
                    >

                      <div className="seller-recent-order-icon">

                        <ShoppingBag
                          size={17}
                        />

                      </div>


                      <div className="seller-recent-order-info">

                        <strong>
                          Order #
                          {order.orderId}
                        </strong>

                        <span>
                          Customer #
                          {order.customerId}
                        </span>

                      </div>


                      <div className="seller-recent-order-meta">

                        <span
                          className={`seller-mini-status status-${String(
                            order.orderStatus ||
                            'default'
                          )
                            .toLowerCase()
                            .replaceAll(
                              '_',
                              '-'
                            )}`}
                        >

                          {
                            order.orderStatus ||
                            'UNKNOWN'
                          }

                        </span>


                        <small>
                          {formatDate(
                            order.createdAt
                          )}
                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* ==================================================
              INVENTORY ATTENTION
              ================================================== */}

          <div className="seller-panel">

            <div className="seller-panel-header">

              <div>

                <span>
                  INVENTORY ATTENTION
                </span>

                <h2>
                  Stock overview
                </h2>

              </div>


              <Boxes
                size={21}
              />

            </div>


            {inventoryAttention.length ===
            0 ? (

              <div className="seller-empty-state">

                <div className="seller-empty-icon">

                  <CheckCircle2
                    size={25}
                  />

                </div>

                <h3>
                  Inventory looks good
                </h3>

                <p>
                  No low-stock or out-of-stock products need attention.
                </p>

              </div>

            ) : (

              <div className="seller-inventory-attention-list">

                {inventoryAttention.map(
                  (item) => {

                    const status =
                      getStockStatus(
                        item.inventory
                      )


                    const available =
                      item.inventory
                        ? Number(
                            item.inventory
                              .availableQuantity ??
                            0
                          )
                        : 0


                    return (

                      <div
                        key={
                          item.product.productId
                        }
                        className="seller-attention-item"
                      >

                        <div className="seller-attention-icon">

                          {status.type ===
                          'danger' ? (

                            <AlertTriangle
                              size={17}
                            />

                          ) : (

                            <Boxes
                              size={17}
                            />

                          )}

                        </div>


                        <div className="seller-attention-info">

                          <strong
                            title={
                              item.product.productName
                            }
                          >
                            {
                              item.product.productName
                            }
                          </strong>

                          <span>
                            Available:
                            {' '}
                            {available}
                          </span>

                        </div>


                        <span
                          className={`seller-mini-stock seller-mini-stock-${status.type}`}
                        >
                          {status.label}
                        </span>

                      </div>

                    )

                  }
                )}

              </div>

            )}

          </div>

        </section>


        {/* ====================================================
            DASHBOARD REFRESH
            ==================================================== */}

        <div className="seller-dashboard-refresh">

          <button
            type="button"
            onClick={
              loadDashboardData
            }
            className="seller-dashboard-refresh-button"
          >

            <RefreshCw
              size={15}
            />

            Refresh Dashboard

          </button>

        </div>

      </main>


      {/* ======================================================
          LOGOUT CONFIRMATION MODAL
          ====================================================== */}

      {showLogoutConfirm && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background:
              'rgba(2, 6, 23, 0.72)',
            backdropFilter:
              'blur(4px)',
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth: '390px',
              background: '#111827',
              border:
                '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow:
                '0 25px 60px rgba(0, 0, 0, 0.45)',
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >

              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'rgba(239, 68, 68, 0.12)',
                  color: '#fca5a5',
                }}
              >

                <LogOut
                  size={21}
                />

              </div>


              <div>

                <h2
                  style={{
                    margin: 0,
                    color: '#f8fafc',
                    fontSize: '17px',
                  }}
                >
                  Logout
                </h2>

                <p
                  style={{
                    margin:
                      '4px 0 0',
                    color: '#94a3b8',
                    fontSize: '11px',
                  }}
                >
                  Seller Workspace
                </p>

              </div>

            </div>


            <p
              style={{
                margin:
                  '20px 0',
                color: '#cbd5e1',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to logout from your seller account?
            </p>


            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '9px',
              }}
            >

              <button
                type="button"
                onClick={
                  handleCancelLogout
                }
                style={{
                  border:
                    '1px solid rgba(148, 163, 184, 0.18)',
                  background:
                    'rgba(148, 163, 184, 0.06)',
                  color: '#cbd5e1',
                  padding:
                    '9px 15px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleConfirmLogout
                }
                style={{
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding:
                    '9px 15px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >

                <LogOut
                  size={14}
                />

                Logout

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}


// ============================================================
// EXPORT
// ============================================================

export default SellerHome