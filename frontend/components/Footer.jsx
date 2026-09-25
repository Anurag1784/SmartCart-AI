import {
  ArrowUp,
  Mail,
  Sparkles,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import './Footer.css'


function Footer() {

  /*
    Smoothly scroll to a section on the Home page.
    This is useful for sections such as Features,
    Categories and How It Works.
  */
  const handleSectionNavigation = (sectionId) => {
    const section = document.getElementById(sectionId)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }


  /*
    Scroll back to the top of the page.
  */
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  return (
    <footer className="footer">

      {/* =================================
          BACKGROUND DECORATION
      ================================== */}

      <div className="footer-glow footer-glow-left"></div>

      <div className="footer-glow footer-glow-right"></div>


      <div className="footer-container">

        {/* =================================
            BRAND
        ================================== */}

        <div className="footer-brand">

          <Link
            to="/"
            className="footer-brand-name"
          >
            SmartCart AI
          </Link>


          <p className="footer-brand-description">
            Smarter shopping powered by intelligent technology.
            Discover products, explore recommendations, and
            enjoy a simpler shopping experience.
          </p>


          <div className="footer-brand-tag">

            <Sparkles size={15} />

            <span>
              Smart shopping starts here.
            </span>

          </div>

        </div>


        {/* =================================
            QUICK LINKS
        ================================== */}

        <div className="footer-column">

          <h4>
            Quick Links
          </h4>


          <div className="footer-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/products">
              Products
            </Link>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

          </div>

        </div>


        {/* =================================
            EXPLORE
        ================================== */}

        <div className="footer-column">

          <h4>
            Explore
          </h4>


          <div className="footer-links">

            <button
              type="button"
              onClick={() => handleSectionNavigation('features')}
            >
              Features
            </button>


            <button
              type="button"
              onClick={() => handleSectionNavigation('products')}
            >
              Featured Products
            </button>


            <button
              type="button"
              onClick={() => handleSectionNavigation('categories')}
            >
              Categories
            </button>


            <button
              type="button"
              onClick={() => handleSectionNavigation('how-it-works')}
            >
              How It Works
            </button>

          </div>

        </div>


        {/* =================================
            CONNECT
        ================================== */}

        <div className="footer-column footer-connect">

          <h4>
            Connect With Us
          </h4>


          <p>
            Have a question or want to know more
            about SmartCart AI?
          </p>


          <a
            href="mailto:contact@smartcartai.com"
            className="footer-email"
          >
            <Mail size={17} />

            <span>
              Contact Us
            </span>

          </a>

        </div>

      </div>


      {/* =================================
          FOOTER BOTTOM
      ================================== */}

      <div className="footer-bottom">

        <div className="footer-bottom-content">

          <p>
            © 2026 SmartCart AI. All rights reserved.
          </p>


          <button
            type="button"
            className="footer-top-button"
            onClick={handleBackToTop}
          >
            <span>
              Back to top
            </span>

            <ArrowUp size={16} />
          </button>

        </div>

      </div>

    </footer>
  )
}


export default Footer