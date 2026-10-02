import { useEffect, useState } from 'react'

import {
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Users,
  Package,
  Tags,
  ShoppingCart,
  CreditCard,
  Boxes,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Settings,
  X,
  Check,
  BellOff,
  CheckCheck,
  Loader2,
} from 'lucide-react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'

import {
  getUnreadNotifications,
  markNotificationAsRead,
} from '../../api/notificationsApi'

import './AdminTopbar.css'


// ============================================================
// ADMIN SEARCH ITEMS
// ============================================================

const searchItems = [
  {
    label: 'Dashboard',
    description: 'View Admin dashboard and platform overview',
    path: '/dashboard',
    icon: LayoutDashboard,
    keywords: 'dashboard home overview',
  },
  {
    label: 'Users',
    description: 'Manage customers, sellers and administrators',
    path: '/users',
    icon: Users,
    keywords: 'users customers sellers administrators accounts',
  },
  {
    label: 'Products',
    description: 'View platform products and catalog',
    path: '/products',
    icon: Package,
    keywords: 'products items catalog',
  },
  {
    label: 'Categories',
    description: 'Manage product categories',
    path: '/categories',
    icon: Tags,
    keywords: 'categories products classification',
  },
  {
    label: 'Orders',
    description: 'View platform orders and order details',
    path: '/orders',
    icon: ShoppingCart,
    keywords: 'orders purchases transactions',
  },
  {
    label: 'Payments',
    description: 'View payments and revenue activity',
    path: '/payments',
    icon: CreditCard,
    keywords: 'payments revenue transactions money',
  },
  {
    label: 'Inventory',
    description: 'Monitor stock levels and inventory health',
    path: '/inventory',
    icon: Boxes,
    keywords: 'inventory stock quantity low stock',
  },
  {
    label: 'Analytics',
    description: 'View platform analytics and insights',
    path: '/analytics',
    icon: BarChart3,
    keywords: 'analytics reports insights charts statistics',
  },
  {
    label: 'Announcements',
    description: 'Send announcements to users',
    path: '/announcements',
    icon: Megaphone,
    keywords: 'announcements communication messages',
  },
  {
    label: 'Audit Logs',
    description: 'Review administrator activity and security logs',
    path: '/audit',
    icon: ShieldCheck,
    keywords: 'audit security logs administrator activity',
  },
  {
    label: 'Settings',
    description: 'Manage Admin profile and preferences',
    path: '/settings',
    icon: Settings,
    keywords: 'settings profile preferences appearance security',
  },
]


// ============================================================
// PAGE INFORMATION
// ============================================================

const pageInfo = {
  '/dashboard': {
    title: 'Dashboard',
    section: 'Overview',
  },
  '/users': {
    title: 'User Management',
    section: 'Management',
  },
  '/products': {
    title: 'Products',
    section: 'Management',
  },
  '/categories': {
    title: 'Categories',
    section: 'Management',
  },
  '/orders': {
    title: 'Orders',
    section: 'Operations',
  },
  '/payments': {
    title: 'Payments',
    section: 'Operations',
  },
  '/inventory': {
    title: 'Inventory',
    section: 'Operations',
  },
  '/analytics': {
    title: 'Analytics',
    section: 'Insights',
  },
  '/announcements': {
    title: 'Announcements',
    section: 'Communication',
  },
  '/audit': {
    title: 'Audit Logs',
    section: 'Security',
  },
  '/settings': {
    title: 'Settings',
    section: 'System',
  },
}


// ============================================================
// COMPONENT
// ============================================================

function AdminTopbar() {

  const navigate = useNavigate()
  const location = useLocation()

  const dispatch = useDispatch()

  // ----------------------------------------------------------
  // AUTHENTICATED ADMIN DATA
  // ----------------------------------------------------------

  const {
    user,
    token,
    isAuthenticated,
  } = useSelector((state) => state.auth)


  // ----------------------------------------------------------
  // SEARCH STATE
  // ----------------------------------------------------------

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')


  // ----------------------------------------------------------
  // NOTIFICATION STATE
  // ----------------------------------------------------------

  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false)

  const [notifications, setNotifications] = useState([])

  const [isNotificationsLoading, setIsNotificationsLoading] =
    useState(false)

  const [notificationError, setNotificationError] =
    useState('')

  const [isMarkingAllRead, setIsMarkingAllRead] =
    useState(false)


  // ----------------------------------------------------------
  // CURRENT PAGE
  // ----------------------------------------------------------

  const currentPage =
    pageInfo[location.pathname] || {
      title: 'Admin Portal',
      section: 'SmartCart',
    }


  // ==========================================================
  // LOAD UNREAD NOTIFICATIONS
  // ==========================================================

  const loadUnreadNotifications = async () => {

    if (
      !isAuthenticated ||
      !token ||
      !user?.userId
    ) {
      setNotifications([])
      return
    }

    try {

      setIsNotificationsLoading(true)
      setNotificationError('')

      const data = await getUnreadNotifications(
        user.userId,
        token
      )

      setNotifications(
        Array.isArray(data) ? data : []
      )

    } catch (error) {

      console.error(
        'Failed to load notifications:',
        error
      )

      setNotificationError(
        'Unable to load notifications.'
      )

    } finally {

      setIsNotificationsLoading(false)

    }
  }


  // ==========================================================
  // LOAD NOTIFICATIONS WHEN ADMIN LOGIN IS AVAILABLE
  // ==========================================================

  useEffect(() => {

    loadUnreadNotifications()

  }, [
    isAuthenticated,
    token,
    user?.userId,
  ])


  // ==========================================================
  // KEYBOARD SHORTCUTS
  // ==========================================================

  useEffect(() => {

    const handleKeyboardShortcut = (event) => {

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {

        event.preventDefault()

        setIsSearchOpen(true)
        setIsNotificationOpen(false)

      }

      if (event.key === 'Escape') {

        setIsSearchOpen(false)
        setIsNotificationOpen(false)

      }

    }

    window.addEventListener(
      'keydown',
      handleKeyboardShortcut
    )

    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyboardShortcut
      )

    }

  }, [])


  // ==========================================================
  // RESET SEARCH WHEN CLOSED
  // ==========================================================

  useEffect(() => {

    if (!isSearchOpen) {

      setSearchTerm('')

    }

  }, [isSearchOpen])


  // ==========================================================
  // CLOSE NOTIFICATION PANEL WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {

    const handleDocumentClick = (event) => {

      if (
        !event.target.closest(
          '.topbar-notification-wrapper'
        )
      ) {

        setIsNotificationOpen(false)

      }

    }

    document.addEventListener(
      'mousedown',
      handleDocumentClick
    )

    return () => {

      document.removeEventListener(
        'mousedown',
        handleDocumentClick
      )

    }

  }, [])


  // ==========================================================
  // FILTER SEARCH ITEMS
  // ==========================================================

  const filteredItems = searchItems.filter((item) => {

    const value = searchTerm
      .trim()
      .toLowerCase()

    if (!value) {

      return true

    }

    return (
      item.label
        .toLowerCase()
        .includes(value) ||

      item.description
        .toLowerCase()
        .includes(value) ||

      item.keywords
        .toLowerCase()
        .includes(value)
    )

  })


  // ==========================================================
  // SEARCH HANDLERS
  // ==========================================================

  const openSearch = () => {

    setIsSearchOpen(true)
    setIsNotificationOpen(false)

  }


  const closeSearch = () => {

    setIsSearchOpen(false)

  }


  const handleSearchSubmit = (event) => {

    event.preventDefault()

    if (filteredItems.length === 0) {

      return

    }

    navigate(filteredItems[0].path)

    closeSearch()

  }


  const handleSearchItemClick = (path) => {

    navigate(path)

    closeSearch()

  }


  // ==========================================================
  // NOTIFICATION PANEL
  // ==========================================================

  const handleNotificationClick = async () => {

    const willOpen =
      !isNotificationOpen

    setIsNotificationOpen(willOpen)
    setIsSearchOpen(false)

    if (willOpen) {

      await loadUnreadNotifications()

    }

  }


  // ==========================================================
  // MARK ONE NOTIFICATION AS READ
  // ==========================================================

  const handleNotificationRead = async (
    notificationId
  ) => {

    if (!token) {

      return

    }

    try {

      await markNotificationAsRead(
        notificationId,
        token
      )

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.notificationId !==
            notificationId
        )
      )

    } catch (error) {

      console.error(
        'Failed to mark notification as read:',
        error
      )

      setNotificationError(
        'Unable to mark notification as read.'
      )

    }

  }


  // ==========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================================

  const handleMarkAllRead = async () => {

    if (
      !token ||
      notifications.length === 0
    ) {

      return

    }

    try {

      setIsMarkingAllRead(true)
      setNotificationError('')

      await Promise.all(
        notifications.map(
          (notification) =>
            markNotificationAsRead(
              notification.notificationId,
              token
            )
        )
      )

      setNotifications([])

    } catch (error) {

      console.error(
        'Failed to mark all notifications as read:',
        error
      )

      setNotificationError(
        'Some notifications could not be marked as read.'
      )

      await loadUnreadNotifications()

    } finally {

      setIsMarkingAllRead(false)

    }

  }


  // ==========================================================
  // NOTIFICATION TIME FORMATTER
  // ==========================================================

  const formatNotificationTime = (
    createdAt
  ) => {

    if (!createdAt) {

      return ''

    }

    const notificationDate =
      new Date(createdAt)

    if (
      Number.isNaN(
        notificationDate.getTime()
      )
    ) {

      return ''

    }

    const now = new Date()

    const difference =
      now.getTime() -
      notificationDate.getTime()

    const seconds =
      Math.floor(difference / 1000)

    if (seconds < 60) {

      return 'Just now'

    }

    const minutes =
      Math.floor(seconds / 60)

    if (minutes < 60) {

      return `${minutes} min ago`

    }

    const hours =
      Math.floor(minutes / 60)

    if (hours < 24) {

      return `${hours} hr ago`

    }

    const days =
      Math.floor(hours / 24)

    if (days < 7) {

      return `${days} day${days !== 1 ? 's' : ''} ago`

    }

    return notificationDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )

  }


  // ==========================================================
  // NOTIFICATION ICON
  // ==========================================================

  const getNotificationIcon = (
    notificationType
  ) => {

    switch (
      String(notificationType || '')
        .toUpperCase()
    ) {

      case 'ORDER':
        return (
          <ShoppingCart size={18} />
        )

      case 'PAYMENT':
        return (
          <CreditCard size={18} />
        )

      case 'ANNOUNCEMENT':
        return (
          <Megaphone size={18} />
        )

      default:
        return (
          <ShieldCheck size={18} />
        )

    }

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>

      <header className="admin-topbar">

        {/* =================================================
            BRAND / PAGE INFORMATION
            ================================================= */}

        <div className="topbar-left">

          <div className="topbar-brand-mark">
            SC
          </div>

          <div className="topbar-page-info">

            <div className="topbar-brand-line">

              <span className="topbar-brand-name">
                SmartCart
              </span>

              <span className="topbar-brand-badge">
                ADMIN
              </span>

            </div>

            <div className="topbar-page-heading">

              <h1>
                {currentPage.title}
              </h1>

              <div className="topbar-breadcrumb">

                <span>
                  SmartCart
                </span>

                <span>
                  /
                </span>

                <span>
                  {currentPage.section}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
            ================================================= */}

        <div className="topbar-right">

          {/* Search */}

          <form
            className="topbar-search"
            onSubmit={handleSearchSubmit}
          >

            <Search
              size={19}
              className="topbar-search-icon"
            />

            <input
              type="text"
              placeholder="Search Admin..."
              value={searchTerm}
              onFocus={openSearch}
              onChange={(event) => {

                setSearchTerm(
                  event.target.value
                )

                setIsSearchOpen(true)

              }}
              aria-label="Search Admin modules"
            />

            <span className="search-shortcut">

              <kbd>
                Ctrl
              </kbd>

              <kbd>
                K
              </kbd>

            </span>

          </form>


          {/* =================================================
              NOTIFICATIONS
              ================================================= */}

          <div className="topbar-notification-wrapper">

            <button
              type="button"
              className={`topbar-icon-button ${
                isNotificationOpen
                  ? 'active'
                  : ''
              }`}
              aria-label="Notifications"
              aria-expanded={
                isNotificationOpen
              }
              onClick={
                handleNotificationClick
              }
            >

              <Bell size={20} />

              {notifications.length > 0 && (
                <span className="notification-dot">
                  <span>
                    {notifications.length > 9
                      ? '9+'
                      : notifications.length}
                  </span>
                </span>
              )}

            </button>


            {isNotificationOpen && (

              <div className="notification-panel">

                <div className="notification-panel-header">

                  <div>

                    <span className="notification-eyebrow">
                      ADMIN CENTER
                    </span>

                    <h3>
                      Notifications
                    </h3>

                  </div>

                  <button
                    type="button"
                    className="notification-close"
                    onClick={() =>
                      setIsNotificationOpen(
                        false
                      )
                    }
                    aria-label="Close notifications"
                  >

                    <X size={17} />

                  </button>

                </div>


                <div className="notification-panel-content">

                  {/* Loading */}

                  {isNotificationsLoading ? (

                    <div className="notification-empty">

                      <div className="notification-empty-icon">

                        <Loader2
                          size={24}
                          className="notification-loading-icon"
                        />

                      </div>

                      <strong>
                        Loading notifications
                      </strong>

                      <span>
                        Checking for new Admin notifications...
                      </span>

                    </div>

                  ) : notificationError ? (

                    <div className="notification-empty">

                      <div className="notification-empty-icon">

                        <BellOff size={24} />

                      </div>

                      <strong>
                        Notifications unavailable
                      </strong>

                      <span>
                        {notificationError}
                      </span>

                    </div>

                  ) : notifications.length > 0 ? (

                    <>

                      {notifications.map(
                        (notification) => (

                          <button
                            type="button"
                            className="notification-item unread"
                            key={
                              notification.notificationId
                            }
                            onClick={() =>
                              handleNotificationRead(
                                notification.notificationId
                              )
                            }
                          >

                            <div className="notification-item-icon">

                              {getNotificationIcon(
                                notification.notificationType
                              )}

                            </div>


                            <div className="notification-item-content">

                              <strong>
                                {notification.title}
                              </strong>

                              <p>
                                {notification.message}
                              </p>

                              <span>
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </span>

                            </div>


                            <div className="notification-unread-dot"></div>

                          </button>

                        )
                      )}

                    </>

                  ) : (

                    <div className="notification-empty">

                      <div className="notification-empty-icon">

                        <BellOff size={24} />

                      </div>

                      <strong>
                        You're all caught up
                      </strong>

                      <span>
                        There are no unread Admin
                        notifications.
                      </span>

                    </div>

                  )}

                </div>


                <div className="notification-panel-footer">

                  <button
                    type="button"
                    className="mark-read-button"
                    onClick={
                      handleMarkAllRead
                    }
                    disabled={
                      notifications.length === 0 ||
                      isMarkingAllRead ||
                      isNotificationsLoading
                    }
                  >

                    {isMarkingAllRead ? (

                      <Loader2
                        size={15}
                        className="notification-loading-icon"
                      />

                    ) : (

                      <CheckCheck size={15} />

                    )}

                    {isMarkingAllRead
                      ? 'Marking...'
                      : 'Mark all as read'}

                  </button>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              ADMIN PROFILE
              ================================================= */}

          <button
            type="button"
            className="topbar-profile"
          >

            <div className="topbar-avatar">
              A
            </div>

            <div className="topbar-profile-info">

              <span className="topbar-profile-name">
                Administrator
              </span>

              <span className="topbar-profile-role">
                System Administrator
              </span>

            </div>

            <ChevronDown
              size={17}
              className="topbar-profile-arrow"
            />

          </button>

        </div>

      </header>


      {/* =====================================================
          COMMAND PALETTE
          ===================================================== */}

      {isSearchOpen && (

        <div
          className="command-palette-overlay"
          onMouseDown={closeSearch}
        >

          <div
            className="command-palette"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="command-palette-header">

              <div className="command-palette-search">

                <Search size={20} />

                <input
                  type="text"
                  autoFocus
                  placeholder="Search Admin modules..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="command-palette-close"
                  onClick={closeSearch}
                  aria-label="Close search"
                >

                  <X size={18} />

                </button>

              </div>

            </div>


            <div className="command-palette-body">

              <div className="command-palette-section-title">

                {searchTerm.trim()
                  ? 'SEARCH RESULTS'
                  : 'ADMIN MODULES'}

              </div>


              {filteredItems.length > 0 ? (

                <div className="command-palette-results">

                  {filteredItems.map((item) => {

                    const Icon = item.icon

                    return (

                      <button
                        type="button"
                        className="command-palette-item"
                        key={item.path}
                        onClick={() =>
                          handleSearchItemClick(
                            item.path
                          )
                        }
                      >

                        <div className="command-item-icon">

                          <Icon size={19} />

                        </div>

                        <div className="command-item-content">

                          <strong>
                            {item.label}
                          </strong>

                          <span>
                            {item.description}
                          </span>

                        </div>

                        <span className="command-item-arrow">
                          →
                        </span>

                      </button>

                    )

                  })}

                </div>

              ) : (

                <div className="command-palette-empty">

                  <Search size={28} />

                  <strong>
                    No modules found
                  </strong>

                  <span>
                    Try searching for Dashboard,
                    Users, Orders, Products or Settings.
                  </span>

                </div>

              )}

            </div>


            <div className="command-palette-footer">

              <span>

                <kbd>
                  ESC
                </kbd>

                Close

              </span>

              <span>

                <kbd>
                  ENTER
                </kbd>

                Open first result

              </span>

              <span>

                <kbd>
                  CTRL
                </kbd>

                <kbd>
                  K
                </kbd>

                Search

              </span>

            </div>

          </div>

        </div>

      )}

    </>
  )
}

export default AdminTopbar