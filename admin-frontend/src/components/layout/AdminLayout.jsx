import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react'

import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

import { logout } from '../../redux/slices/authSlice'

import './AdminLayout.css'


function AdminLayout({ children }) {

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // ----------------------------------------------------------
  // Always keep the latest route available to the popstate
  // handler without depending on a stale closure.
  // ----------------------------------------------------------
  const currentPathRef = useRef(location.pathname)

  // ----------------------------------------------------------
  // Logout popup
  // ----------------------------------------------------------
  const [showLogoutModal, setShowLogoutModal] =
    useState(false)


  // ==========================================================
  // KEEP CURRENT ROUTE IN REF
  // ==========================================================

  useEffect(() => {

    currentPathRef.current = location.pathname

  }, [location.pathname])


  // ==========================================================
  // HANDLE BROWSER BACK BUTTON
  // ==========================================================
  //
  // Desired behavior:
  //
  // Dashboard → Users → Orders
  //
  // Browser Back:
  //
  // Orders → Dashboard
  //
  // Browser Back again:
  //
  // Dashboard → Logout Popup
  //
  // The important point is that we DO NOT interfere with
  // browser Back while the user is on a feature page.
  //
  // We only intercept Back when the current page is Dashboard.
  // ==========================================================

  useEffect(() => {

    const handlePopState = (event) => {

      /*
       * ======================================================
       * CASE 1
       *
       * User is currently on Dashboard.
       *
       * Browser Back must NOT leave the Admin Portal.
       *
       * Stop the browser history navigation before React Router
       * can process it.
       * ======================================================
       */

      if (currentPathRef.current === '/dashboard') {

        // Stop React Router from processing this Back action.
        event.stopImmediatePropagation()

        /*
         * The browser has already moved one history step backward.
         *
         * Put Dashboard back as the current history entry.
         *
         * pushState does NOT create a React Router navigation.
         * It simply restores the Admin Dashboard URL.
         */
        window.history.pushState(
          window.history.state,
          '',
          '/dashboard'
        )

        // Show the logout confirmation popup.
        setShowLogoutModal(true)

        return
      }

      /*
       * ======================================================
       * CASE 2
       *
       * User is inside a feature page.
       *
       * Example:
       *
       * Dashboard → Users → Orders
       *
       * Browser Back:
       *
       * Orders → Dashboard
       *
       * We intentionally do NOTHING here.
       *
       * The browser and React Router are allowed to perform
       * their normal navigation.
       * ======================================================
       */

    }


    /*
     * Capture phase is important.
     *
     * It allows our Dashboard Back protection to run before
     * React Router's normal history handling.
     */
    window.addEventListener(
      'popstate',
      handlePopState,
      true
    )


    return () => {

      window.removeEventListener(
        'popstate',
        handlePopState,
        true
      )

    }

  }, [])


  // ==========================================================
  // CONFIRM LOGOUT
  // ==========================================================

  const handleConfirmLogout = () => {

    setShowLogoutModal(false)

    /*
     * Clear Redux authentication and sessionStorage.
     */
    dispatch(logout())

    /*
     * Replace Dashboard with Login.
     *
     * This prevents the user from returning to the protected
     * Dashboard through the same history entry.
     */
    navigate('/login', {
      replace: true,
    })

  }


  // ==========================================================
  // CANCEL LOGOUT
  // ==========================================================

  const handleCancelLogout = () => {

    setShowLogoutModal(false)

    /*
     * Nothing else is required.
     *
     * Dashboard has already been restored by pushState(),
     * so the user simply remains on Dashboard.
     */

  }


  return (
    <div className="admin-layout">

      <AdminSidebar />

      <div className="admin-main">

        <AdminTopbar />

        <main className="admin-content">
          {children}
        </main>

      </div>


      {/* ======================================================
          LOGOUT CONFIRMATION MODAL
          ====================================================== */}

      {showLogoutModal && (

        <div
          className="admin-logout-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-logout-title"
        >

          <div className="admin-logout-modal">

            {/* Close */}

            <button
              type="button"
              className="admin-logout-close"
              onClick={handleCancelLogout}
              aria-label="Close logout confirmation"
            >

              <X size={18} />

            </button>


            {/* Icon */}

            <div className="admin-logout-icon">

              <LogOut size={24} />

            </div>


            {/* Content */}

            <div className="admin-logout-content">

              <span className="admin-logout-eyebrow">
                ADMIN SESSION
              </span>

              <h2 id="admin-logout-title">
                Logout from Admin Portal?
              </h2>

              <p>
                You are currently on the Admin Dashboard.
                Do you want to logout from your Admin account?
              </p>

            </div>


            {/* Buttons */}

            <div className="admin-logout-actions">

              <button
                type="button"
                className="admin-logout-cancel"
                onClick={handleCancelLogout}
              >
                Stay on Dashboard
              </button>


              <button
                type="button"
                className="admin-logout-confirm"
                onClick={handleConfirmLogout}
              >

                <ShieldCheck size={17} />

                Logout

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


export default AdminLayout