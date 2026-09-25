// Import Link so the buttons can navigate to different pages
// without reloading the React application.
import { Link } from 'react-router-dom'

// Import icons from Lucide React.
// These icons visually represent the Customer and Seller roles.
import {
  ShoppingBag,
  Store,
  Sparkles,
  Package,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

// Import the CSS file responsible for styling this section.
import './UserTypeSection.css'


function UserTypeSection() {
  return (
    <section className="user-type-section">

      {/* Decorative background glow for the section. */}
      <div className="user-type-glow user-type-glow-one"></div>

      {/* Another decorative background glow. */}
      <div className="user-type-glow user-type-glow-two"></div>


      {/* Main container keeps the content centered. */}
      <div className="user-type-container">

        {/* ==============================
            SECTION HEADER
            ============================== */}

        <div className="user-type-header">

          {/* Small section label. */}
          <span className="user-type-label">
            CHOOSE YOUR JOURNEY
          </span>

          {/* Main section heading. */}
          <h2>
            How do you want to use <span>SmartCart AI?</span>
          </h2>

          {/* Short explanation for visitors. */}
          <p>
            Whether you're shopping for products or selling them,
            SmartCart AI gives you a simple and intelligent experience.
          </p>

        </div>


        {/* ==============================
            CUSTOMER + SELLER CARDS
            ============================== */}

        <div className="user-type-grid">


          {/* ==============================
              CUSTOMER CARD
              ============================== */}

          <div className="user-type-card customer-card">

            {/* Card icon. */}
            <div className="user-type-icon customer-icon">
              <ShoppingBag size={32} />
            </div>

            {/* Card content. */}
            <div className="user-type-content">

              {/* Small role label. */}
              <span className="user-type-role">
                FOR CUSTOMERS
              </span>

              {/* Customer heading. */}
              <h3>
                Shop Smarter
              </h3>

              {/* Customer description. */}
              <p>
                Discover products, get intelligent recommendations,
                add items to your cart, and complete your shopping
                journey with secure checkout.
              </p>


              {/* Customer benefits. */}
              <ul className="user-type-features">

                <li>
                  <Sparkles size={18} />
                  <span>Discover products easily</span>
                </li>

                <li>
                  <Sparkles size={18} />
                  <span>Get smart product recommendations</span>
                </li>

                <li>
                  <Package size={18} />
                  <span>Manage your cart and orders</span>
                </li>

                <li>
                  <ShieldCheck size={18} />
                  <span>Secure checkout experience</span>
                </li>

              </ul>


              {/* Customer action button. */}
              <Link
                to="/products"
                className="user-type-button customer-button"
              >
                Start Shopping
                <ArrowRight size={18} />
              </Link>

            </div>

          </div>


          {/* ==============================
              SELLER CARD
              ============================== */}

          <div className="user-type-card seller-card">

            {/* Card icon. */}
            <div className="user-type-icon seller-icon">
              <Store size={32} />
            </div>

            {/* Card content. */}
            <div className="user-type-content">

              {/* Small role label. */}
              <span className="user-type-role">
                FOR SELLERS
              </span>

              {/* Seller heading. */}
              <h3>
                Sell Smarter
              </h3>

              {/* Seller description. */}
              <p>
                List your products, manage your product catalog,
                keep track of inventory, and manage orders from
                your seller workspace.
              </p>


              {/* Seller benefits. */}
              <ul className="user-type-features">

                <li>
                  <Package size={18} />
                  <span>List and manage products</span>
                </li>

                <li>
                  <Store size={18} />
                  <span>Manage your product catalog</span>
                </li>

                <li>
                  <Package size={18} />
                  <span>Manage product inventory</span>
                </li>

                <li>
                  <ShieldCheck size={18} />
                  <span>Manage customer orders</span>
                </li>

              </ul>


              {/* 
                Seller currently goes to Login because the Seller
                Dashboard route does not exist yet.

                After we build the Seller frontend, we will change
                this route to the actual Seller Dashboard route.
              */}
              <Link
                to="/login"
                className="user-type-button seller-button"
              >
                Start Selling
                <ArrowRight size={18} />
              </Link>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}


export default UserTypeSection