import {
  Heart,
  Home as HomeIcon,
  LogOut,
  Package,
  ShoppingBag,
  ShoppingCart,
  User
} from 'lucide-react'

import {
  NavLink,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  useDispatch,
  useSelector
} from 'react-redux'

import {
  useEffect,
  useRef
} from 'react'

import { logout } from '../src/store/slices/authSlice'
import './Navbar.css'


function Navbar() {

  // ============================================================
  // REDUX
  // ============================================================

  const dispatch = useDispatch()

  const {
    isAuthenticated,
    user
  } = useSelector(
    (state) => state.auth
  )


  // ============================================================
  // ROUTER
  // ============================================================

  const navigate = useNavigate()

  const location = useLocation()


  // ============================================================
  // HOME HISTORY GUARD
  // ============================================================

  // Keeps track of whether the special Home
  // browser-history entry has already been created.
  const homeGuardActive = useRef(false)


  // ============================================================
  // SELLER WORKSPACE
  // ============================================================

  const isSellerPage =
    location.pathname.startsWith('/seller')


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    // Remove authentication from Redux.
    dispatch(logout())


    // Remove authentication from localStorage.
    localStorage.removeItem('auth')


    // Go to Login and remove the current page
    // from browser history.
    navigate('/login', {
      replace: true
    })
  }


  // ============================================================
  // LOGGED-IN HOME BACK BUTTON
  // ============================================================

  useEffect(() => {

    // ----------------------------------------------------------
    // IMPORTANT
    //
    // We only create this special browser-history guard when:
    //
    // 1. User is logged in
    // 2. User is on Home
    //
    // Logged-out Home must behave normally.
    // ----------------------------------------------------------

    if (
      !isAuthenticated ||
      location.pathname !== '/'
    ) {

      homeGuardActive.current = false

      return
    }


    // ----------------------------------------------------------
    // CREATE HOME GUARD
    // ----------------------------------------------------------

    if (!homeGuardActive.current) {

      /*
       * We add one extra history entry for Home.
       *
       * Example:
       *
       * Previous Page
       *      ↓
       *    Home
       *      ↓
       * Home Guard
       *
       * When Back is pressed, the browser moves
       * from Home Guard to Home.
       *
       * The popstate event is then intercepted
       * by our listener.
       */

      window.history.pushState(
        {
          ...(window.history.state || {}),
          smartCartHomeGuard: true
        },
        '',
        window.location.href
      )

      homeGuardActive.current = true
    }


    // ----------------------------------------------------------
    // BROWSER BACK HANDLER
    // ----------------------------------------------------------

    const handleHomeBack = (event) => {

      /*
       * IMPORTANT:
       *
       * This listener is registered with `true`.
       *
       * That means CAPTURE PHASE.
       *
       * React Router normally handles popstate as well.
       * We need our handler to execute before React Router
       * changes the route.
       */

      event.preventDefault()


      // --------------------------------------------------------
      // ASK USER
      // --------------------------------------------------------

      const shouldLogout = window.confirm(
        'Do you want to logout and exit SmartCart AI?'
      )


      // --------------------------------------------------------
      // USER SELECTED CANCEL
      // --------------------------------------------------------

      if (!shouldLogout) {

        /*
         * The browser has already moved one history
         * position backward.
         *
         * Put our Home guard back.
         */

        window.history.pushState(
          {
            ...(window.history.state || {}),
            smartCartHomeGuard: true
          },
          '',
          window.location.href
        )

        return
      }


      // --------------------------------------------------------
      // USER SELECTED OK
      // --------------------------------------------------------

      // Disable the Home guard first.
      homeGuardActive.current = false


      // Logout from Redux.
      dispatch(logout())


      // Remove authentication from localStorage.
      localStorage.removeItem('auth')


      /*
       * We are currently back on the real Home entry.
       *
       * Move one more step backward to the page
       * before SmartCart Home.
       */

      window.history.go(-1)
    }


    // ----------------------------------------------------------
    // REGISTER POPSTATE LISTENER
    // ----------------------------------------------------------

    /*
     * `true` is extremely important here.
     *
     * It registers the listener during the capture phase.
     *
     * This allows our handler to process the browser Back
     * before React Router processes the same history event.
     */

    window.addEventListener(
      'popstate',
      handleHomeBack,
      true
    )


    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {

      window.removeEventListener(
        'popstate',
        handleHomeBack,
        true
      )
    }

  }, [
    isAuthenticated,
    location.pathname,
    dispatch
  ])


  // ============================================================
  // HIDE CUSTOMER NAVBAR ON SELLER PAGES
  // ============================================================

  if (isSellerPage) {
    return null
  }


  // ============================================================
  // MAIN NAVIGATION HANDLER
  // ============================================================

  /*
   * MAIN NAVIGATION:
   *
   * Home
   * Products
   * Wishlist
   * Cart
   * Orders
   * Profile
   *
   * These behave like sibling pages.
   *
   *
   * INTERNAL NAVIGATION:
   *
   * Products
   *     ↓
   * Product Details
   *
   * Profile
   *     ↓
   * Addresses
   *
   * These remain in browser history.
   *
   *
   * Therefore:
   *
   * Home → Main Page
   *        PUSH
   *
   * Main Page → Main Page
   *              REPLACE
   */


  const handleMainNavigation = (
    event,
    path
  ) => {

    // If the user is already on this page,
    // allow normal behavior.
    if (location.pathname === path) {
      return
    }


    // ----------------------------------------------------------
    // HOME → MAIN PAGE
    // ----------------------------------------------------------

    /*
     * Normal NavLink behavior.
     *
     * This creates:
     *
     * Home → Products
     *
     * so Back can return to Home.
     */

    if (location.pathname === '/') {
      return
    }


    // ----------------------------------------------------------
    // MAIN PAGE → MAIN PAGE
    // ----------------------------------------------------------

    // Stop normal history PUSH.
    event.preventDefault()


    // Replace current main page.
    navigate(path, {
      replace: true
    })
  }


  // ============================================================
  // NAVIGATION LINK CLASS
  // ============================================================

  const getNavLinkClass = ({
    isActive
  }) =>
    `navbar-link ${
      isActive
        ? 'navbar-link-active'
        : ''
    }`


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <nav className="navbar">

      <div className="navbar-container">


        {/* ======================================================
            SMARTCART AI LOGO
        ====================================================== */}

        <NavLink
          to="/"
          end
          className="navbar-brand"
          onClick={(event) =>
            handleMainNavigation(
              event,
              '/'
            )
          }
        >

          <span className="navbar-brand-icon">
            <ShoppingBag size={22} />
          </span>

          <span>
            SmartCart <strong>AI</strong>
          </span>

        </NavLink>


        {/* ======================================================
            NAVIGATION LINKS
        ====================================================== */}

        <div className="navbar-links">


          {/* ====================================================
              HOME
          ==================================================== */}

          <NavLink
            to="/"
            end
            className={getNavLinkClass}
            onClick={(event) =>
              handleMainNavigation(
                event,
                '/'
              )
            }
          >

            <HomeIcon size={17} />

            <span>
              Home
            </span>

          </NavLink>


          {/* ====================================================
              PRODUCTS
          ==================================================== */}

          <NavLink
            to="/products"
            className={getNavLinkClass}
            onClick={(event) =>
              handleMainNavigation(
                event,
                '/products'
              )
            }
          >

            <ShoppingBag size={17} />

            <span>
              Products
            </span>

          </NavLink>


          {/* ====================================================
              LOGGED-IN CUSTOMER NAVIGATION
          ==================================================== */}

          {isAuthenticated ? (
            <>


              {/* ==================================================
                  WISHLIST
              ================================================== */}

              <NavLink
                to="/wishlist"
                className={getNavLinkClass}
                onClick={(event) =>
                  handleMainNavigation(
                    event,
                    '/wishlist'
                  )
                }
              >

                <Heart size={17} />

                <span>
                  Wishlist
                </span>

              </NavLink>


              {/* ==================================================
                  CART
              ================================================== */}

              <NavLink
                to="/cart"
                className={getNavLinkClass}
                onClick={(event) =>
                  handleMainNavigation(
                    event,
                    '/cart'
                  )
                }
              >

                <ShoppingCart size={17} />

                <span>
                  Cart
                </span>

              </NavLink>


              {/* ==================================================
                  ORDERS
              ================================================== */}

              <NavLink
                to="/orders"
                className={getNavLinkClass}
                onClick={(event) =>
                  handleMainNavigation(
                    event,
                    '/orders'
                  )
                }
              >

                <Package size={17} />

                <span>
                  Orders
                </span>

              </NavLink>


              {/* ==================================================
                  PROFILE
              ================================================== */}

              <NavLink
                to="/profile"
                className="navbar-user"
                title="My Profile"
                onClick={(event) =>
                  handleMainNavigation(
                    event,
                    '/profile'
                  )
                }
              >

                <span className="navbar-user-icon">
                  <User size={17} />
                </span>

                <span className="navbar-user-name">
                  Hi, {user?.firstName || 'Customer'}
                </span>

              </NavLink>


              {/* ==================================================
                  LOGOUT
              ================================================== */}

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
                title="Logout"
              >

                <LogOut size={17} />

                <span>
                  Logout
                </span>

              </button>

            </>

          ) : (

            /* ====================================================
               NOT LOGGED-IN CUSTOMER
            ==================================================== */

            <>


              {/* ==================================================
                  LOGIN
              ================================================== */}

              <NavLink
                to="/login"
                replace
                className={getNavLinkClass}
              >

                <User size={17} />

                <span>
                  Login
                </span>

              </NavLink>


              {/* ==================================================
                  REGISTER
              ================================================== */}

              <NavLink
                to="/register"
                replace
                className="navbar-register"
              >

                <span>
                  Get Started
                </span>

              </NavLink>

            </>

          )}

        </div>

      </div>

    </nav>
  )
}


export default Navbar