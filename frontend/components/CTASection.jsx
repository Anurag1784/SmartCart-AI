import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import './CTASection.css'


function CTASection() {
  return (
    <section className="cta-section">

      {/* =================================
          BACKGROUND DECORATION
      ================================== */}

      <div className="cta-glow cta-glow-left"></div>

      <div className="cta-glow cta-glow-right"></div>


      {/* Decorative grid */}
      <div className="cta-grid-pattern">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>


      <div className="cta-container">

        {/* =================================
            CTA CONTENT
        ================================== */}

        <div className="cta-content">

          <div className="cta-icon">
            <Sparkles size={25} />
          </div>


          <p className="cta-label">
            READY TO SHOP SMARTER?
          </p>


          <h2>
            Your smarter shopping
            <span> journey starts here.</span>
          </h2>


          <p className="cta-description">
            Discover products, explore intelligent recommendations,
            and experience a better way to shop with SmartCart AI.
          </p>


          {/* =================================
              CTA ACTIONS
          ================================== */}

          <div className="cta-actions">

            <Link
              to="/products"
              className="cta-primary-button"
            >
              <span>
                Start Shopping
              </span>

              <ArrowRight size={18} />
            </Link>


            <Link
              to="/register"
              className="cta-secondary-button"
            >
              Create Account
            </Link>

          </div>


          {/* =================================
              TRUST MESSAGE
          ================================== */}

          <div className="cta-trust">

            <span className="cta-trust-dot"></span>

            <span>
              Simple shopping • Smart discovery • Secure platform
            </span>

          </div>

        </div>

      </div>

    </section>
  )
}


export default CTASection