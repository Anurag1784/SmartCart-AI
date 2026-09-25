import {
  Heart,
  MapPin,
  Package,
  ShoppingCart,
  User
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './Profile.css'


function Profile() {

  // Get the logged-in user's information from Redux
  const user = useSelector(
    (state) => state.auth.user
  )


  return (
    <main className="profile-page">

      <div className="profile-page-container">


        {/* ====================================================
            PROFILE HEADER
        ===================================================== */}

        <div className="profile-header">

          <div className="profile-avatar">
            <User size={34} />
          </div>


          <div>

            <p className="profile-label">
              MY ACCOUNT
            </p>

            <h1>
              Welcome, <span>{user?.firstName || 'Customer'}</span>
            </h1>

            <p className="profile-description">
              Manage your SmartCart AI account and access your
              customer services from one place.
            </p>

          </div>

        </div>


        {/* ====================================================
            ACCOUNT DETAILS
        ===================================================== */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>

              <p className="profile-section-label">
                ACCOUNT INFORMATION
              </p>

              <h2>
                Personal Details
              </h2>

            </div>

          </div>


          <div className="profile-details">


            {/* First Name */}

            <div className="profile-detail">

              <span>
                First Name
              </span>

              <strong>
                {user?.firstName || 'N/A'}
              </strong>

            </div>


            {/* Last Name */}

            <div className="profile-detail">

              <span>
                Last Name
              </span>

              <strong>
                {user?.lastName || 'N/A'}
              </strong>

            </div>


            {/* Email */}

            <div className="profile-detail">

              <span>
                Email
              </span>

              <strong>
                {user?.email || 'N/A'}
              </strong>

            </div>


            {/* Role */}

            <div className="profile-detail">

              <span>
                Account Type
              </span>

              <strong>
                {user?.role || 'CUSTOMER'}
              </strong>

            </div>

          </div>

        </section>


        {/* ====================================================
            CUSTOMER SERVICES
        ===================================================== */}

        <section className="profile-services">

          <div className="profile-services-header">

            <p className="profile-section-label">
              QUICK ACCESS
            </p>

            <h2>
              Manage Your Account
            </h2>

            <p>
              Quickly access your orders, wishlist, addresses
              and shopping cart.
            </p>

          </div>


          <div className="profile-service-grid">


            {/* ==================================================
                MY ORDERS
            ================================================== */}

            <Link
              to="/orders"
              className="profile-service-card"
            >

              <div className="profile-service-icon profile-orders-icon">

                <Package size={24} />

              </div>


              <div className="profile-service-content">

                <h3>
                  My Orders
                </h3>

                <p>
                  View your previous orders and track
                  your purchases.
                </p>

              </div>


              <span className="profile-service-arrow">
                →
              </span>

            </Link>


            {/* ==================================================
                MY WISHLIST
            ================================================== */}

            <Link
              to="/wishlist"
              className="profile-service-card"
            >

              <div className="profile-service-icon profile-wishlist-icon">

                <Heart size={24} />

              </div>


              <div className="profile-service-content">

                <h3>
                  My Wishlist
                </h3>

                <p>
                  View and manage products you have
                  saved for later.
                </p>

              </div>


              <span className="profile-service-arrow">
                →
              </span>

            </Link>


            {/* ==================================================
                MY ADDRESSES
            ================================================== */}

            <Link
              to="/addresses"
              className="profile-service-card"
            >

              <div className="profile-service-icon profile-address-icon">

                <MapPin size={24} />

              </div>


              <div className="profile-service-content">

                <h3>
                  My Addresses
                </h3>

                <p>
                  Add, edit and manage your delivery
                  addresses.
                </p>

              </div>


              <span className="profile-service-arrow">
                →
              </span>

            </Link>


            {/* ==================================================
                MY CART
            ================================================== */}

            <Link
              to="/cart"
              className="profile-service-card"
            >

              <div className="profile-service-icon profile-cart-icon">

                <ShoppingCart size={24} />

              </div>


              <div className="profile-service-content">

                <h3>
                  My Cart
                </h3>

                <p>
                  Review your selected products and
                  continue shopping.
                </p>

              </div>


              <span className="profile-service-arrow">
                →
              </span>

            </Link>

          </div>

        </section>

      </div>

    </main>
  )
}


export default Profile