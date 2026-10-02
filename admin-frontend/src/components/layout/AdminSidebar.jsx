import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  Warehouse,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Settings,
} from 'lucide-react'

import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import './AdminSidebar.css'

function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  /*
   * ============================================================
   * Admin navigation history control
   * ============================================================
   *
   * Desired behavior:
   *
   * Dashboard → Users
   * Dashboard → Users → Orders
   *
   * becomes:
   *
   * Dashboard → Orders
   *
   * Therefore:
   *
   * 1. Dashboard → Feature
   *    = PUSH a new history entry
   *
   * 2. Feature → Another Feature
   *    = REPLACE current history entry
   *
   * This prevents the browser Back button from walking through
   * every Admin page visited.
   */

  const handleNavigation = (path) => {
    const isDashboard = location.pathname === '/dashboard'
    const isSamePage = location.pathname === path

    // Do nothing if the user clicks the page they are already on.
    if (isSamePage) {
      return
    }

    /*
     * When leaving Dashboard:
     *
     * Dashboard → Users
     *
     * We PUSH because Dashboard must remain in history.
     */
    if (isDashboard) {
      navigate(path)
      return
    }

    /*
     * When moving between Admin feature pages:
     *
     * Users → Orders
     *
     * Replace Users with Orders.
     *
     * History becomes:
     *
     * Dashboard → Orders
     *
     * instead of:
     *
     * Dashboard → Users → Orders
     */
    navigate(path, {
      replace: true,
    })
  }

  return (
    <aside className="admin-sidebar">

      {/* =====================================================
          Brand
          ===================================================== */}

      <div className="sidebar-brand">

        <div className="sidebar-brand-icon">
          SC
        </div>

        <div className="sidebar-brand-text">

          <span className="sidebar-brand-name">
            SmartCart
          </span>

          <span className="sidebar-brand-subtitle">
            ADMIN CONTROL
          </span>

        </div>

      </div>


      {/* =====================================================
          Navigation
          ===================================================== */}

      <nav className="sidebar-navigation">


        {/* ===================================================
            Overview
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            OVERVIEW
          </span>

          <NavLink
            to="/dashboard"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/dashboard')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <LayoutDashboard size={19} />

            <span>
              Dashboard
            </span>

          </NavLink>

        </div>


        {/* ===================================================
            Management
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            MANAGEMENT
          </span>


          {/* Users */}

          <NavLink
            to="/users"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/users')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <Users size={19} />

            <span>
              Users
            </span>

          </NavLink>


          {/* Products */}

          <NavLink
            to="/products"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/products')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <Package size={19} />

            <span>
              Products
            </span>

          </NavLink>


          {/* Categories */}

          <NavLink
            to="/categories"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/categories')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <FolderTree size={19} />

            <span>
              Categories
            </span>

          </NavLink>

        </div>


        {/* ===================================================
            Operations
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            OPERATIONS
          </span>


          {/* Orders */}

          <NavLink
            to="/orders"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/orders')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <ShoppingCart size={19} />

            <span>
              Orders
            </span>

          </NavLink>


          {/* Payments */}

          <NavLink
            to="/payments"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/payments')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <CreditCard size={19} />

            <span>
              Payments
            </span>

          </NavLink>


          {/* Inventory */}

          <NavLink
            to="/inventory"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/inventory')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <Warehouse size={19} />

            <span>
              Inventory
            </span>

          </NavLink>

        </div>


        {/* ===================================================
            Insights
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            INSIGHTS
          </span>


          {/* Analytics */}

          <NavLink
            to="/analytics"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/analytics')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <BarChart3 size={19} />

            <span>
              Analytics
            </span>

          </NavLink>

        </div>


        {/* ===================================================
            Communication
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            COMMUNICATION
          </span>


          {/* Announcements */}

          <NavLink
            to="/announcements"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/announcements')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <Megaphone size={19} />

            <span>
              Announcements
            </span>

          </NavLink>

        </div>


        {/* ===================================================
            Security
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            SECURITY
          </span>


          {/* Audit Logs */}

          <NavLink
            to="/audit-logs"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/audit-logs')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <ShieldCheck size={19} />

            <span>
              Audit Logs
            </span>

          </NavLink>

        </div>


        {/* ===================================================
            System
            =================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            SYSTEM
          </span>


          {/* Settings */}

          <NavLink
            to="/settings"
            onClick={(event) => {
              event.preventDefault()
              handleNavigation('/settings')
            }}
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >

            <Settings size={19} />

            <span>
              Settings
            </span>

          </NavLink>

        </div>

      </nav>


      {/* =====================================================
          Footer
          ===================================================== */}

      <div className="sidebar-footer">

        <div className="sidebar-admin-avatar">
          A
        </div>

        <div className="sidebar-admin-info">

          <span className="sidebar-admin-name">
            Administrator
          </span>

          <span className="sidebar-admin-role">
            System Administrator
          </span>

        </div>

      </div>

    </aside>
  )
}

export default AdminSidebar