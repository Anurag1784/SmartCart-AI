import {
  ArrowRight,
  BrainCircuit,
  ShoppingCart,
  ShieldCheck,
} from 'lucide-react'

import './FeaturesSection.css'

function FeaturesSection() {
  return (
    <section
      id="features"
      className="features-section"
    >

      {/* Background decorative elements */}
      <div className="features-glow features-glow-left"></div>

      <div className="features-glow features-glow-right"></div>


      {/* Top-right decorative dots */}
      <div className="features-dots features-dots-top">
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


      {/* Bottom-left decorative dots */}
      <div className="features-dots features-dots-bottom">
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


      <div className="features-container">

        {/* =================================
            SECTION HEADER
        ================================== */}

        <div className="features-heading">

          <p className="features-label">
            WHY SMARTCART AI?
          </p>

          <h2>
            Shopping made
            <span> smarter.</span>
          </h2>

          <p className="features-description">
            SmartCart AI combines intelligent technology with
            modern e-commerce to make discovering and buying
            products simpler, smarter, and more convenient.
          </p>

        </div>


        {/* =================================
            FEATURES GRID
        ================================== */}

        <div className="features-grid">


          {/* =================================
              FEATURE CARD 01
          ================================== */}

          <article className="feature-card">

            {/* Decorative pastel arc */}
            <div className="feature-card-arc"></div>


            <div className="feature-card-top">

              <div className="feature-icon">
                <BrainCircuit size={30} />
              </div>

              <span className="feature-number">
                01
              </span>

            </div>


            <div className="feature-content">

              <p className="feature-small-label">
                INTELLIGENT DISCOVERY
              </p>

              <h3>
                AI-Powered
                <span> Recommendations</span>
              </h3>

              <p className="feature-description">
                Discover products through intelligent
                recommendations designed to help you find
                options that match your interests and
                shopping needs.
              </p>

            </div>


            <div className="feature-bottom">

              <span>
                Smarter product discovery
              </span>

              <div className="feature-arrow">
                <ArrowRight size={18} />
              </div>

            </div>

          </article>


          {/* =================================
              FEATURE CARD 02
          ================================== */}

          <article className="feature-card">

            {/* Decorative pastel arc */}
            <div className="feature-card-arc feature-card-arc-purple"></div>


            <div className="feature-card-top">

              <div className="feature-icon">
                <ShoppingCart size={30} />
              </div>

              <span className="feature-number">
                02
              </span>

            </div>


            <div className="feature-content">

              <p className="feature-small-label">
                SIMPLE EXPERIENCE
              </p>

              <h3>
                Smart
                <span> Shopping</span>
              </h3>

              <p className="feature-description">
                Browse products, explore details, manage
                your cart, and move through the shopping
                journey with a clean and simple experience.
              </p>

            </div>


            <div className="feature-bottom">

              <span>
                Easy browsing and shopping
              </span>

              <div className="feature-arrow">
                <ArrowRight size={18} />
              </div>

            </div>

          </article>


          {/* =================================
              FEATURE CARD 03
          ================================== */}

          <article className="feature-card">

            {/* Decorative pastel arc */}
            <div className="feature-card-arc"></div>


            <div className="feature-card-top">

              <div className="feature-icon">
                <ShieldCheck size={30} />
              </div>

              <span className="feature-number">
                03
              </span>

            </div>


            <div className="feature-content">

              <p className="feature-small-label">
                SECURE PLATFORM
              </p>

              <h3>
                Secure &
                <span> Reliable</span>
              </h3>

              <p className="feature-description">
                SmartCart AI uses authentication, protected
                services, and secure communication to provide
                a reliable shopping platform.
              </p>

            </div>


            <div className="feature-bottom">

              <span>
                Protected shopping experience
              </span>

              <div className="feature-arrow">
                <ArrowRight size={18} />
              </div>

            </div>

          </article>

        </div>

      </div>

    </section>
  )
}

export default FeaturesSection