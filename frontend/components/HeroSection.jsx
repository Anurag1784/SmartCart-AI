import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ShoppingCart,
  BrainCircuit,
} from 'lucide-react'

import './HeroSection.css'

function HeroSection() {
  return (
    <section className="hero">

      {/* Decorative background shapes */}
      <div className="hero-glow hero-glow-left"></div>
      <div className="hero-glow hero-glow-right"></div>

      {/* Small decorative dots */}
      <div className="hero-dots hero-dots-top">
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


      <div className="hero-container">

        {/* ================================
            LEFT SIDE - HERO CONTENT
        ================================= */}

        <div className="hero-content">

          <div className="hero-label">
            <Sparkles size={17} />
            <span>SMART SHOPPING, POWERED BY AI</span>
          </div>


          <h1>
            Shop Smarter.
            <br />
            Find Better with
            <span> SmartCart AI.</span>
          </h1>


          <p className="hero-description">
            Discover products, explore smart recommendations, and enjoy
            a simple shopping experience designed around your needs.
          </p>


          <div className="hero-actions">

            {/* Real products route */}
            <Link
              to="/products"
              className="hero-primary-button"
            >
              <span>Explore Products</span>
              <ArrowRight size={18} />
            </Link>


            {/* Will connect to How It Works section */}
            <a
              href="#how-it-works"
              className="hero-secondary-button"
            >
              How It Works
            </a>

          </div>


          {/* Hero trust points */}
          <div className="hero-trust">

            <div className="hero-trust-item">
              <div className="hero-trust-icon">
                <BrainCircuit size={19} />
              </div>

              <div>
                <strong>AI Powered</strong>
                <span>Smart recommendations</span>
              </div>
            </div>


            <div className="hero-trust-item">
              <div className="hero-trust-icon">
                <ShoppingCart size={19} />
              </div>

              <div>
                <strong>Easy Shopping</strong>
                <span>Simple shopping experience</span>
              </div>
            </div>


            <div className="hero-trust-item">
              <div className="hero-trust-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>Secure</strong>
                <span>Protected platform</span>
              </div>
            </div>

          </div>

        </div>


        {/* ================================
            RIGHT SIDE - AI VISUAL
        ================================= */}

        <div className="hero-visual">

          <div className="hero-visual-glow"></div>


          {/* Main AI Assistant Card */}
          <div className="ai-card">

            <div className="ai-card-header">

              <div className="ai-card-logo">
                <Sparkles size={21} />
              </div>

              <div>
                <strong>SmartCart AI</strong>
                <span>Shopping Assistant</span>
              </div>

            </div>


            <div className="ai-card-message">
              <p className="ai-message-label">
                AI-POWERED DISCOVERY
              </p>

              <h3>
                Find products
                <span> you'll love.</span>
              </h3>

              <p>
                SmartCart helps you discover products based on
                your shopping preferences.
              </p>
            </div>


            {/* AI feature rows */}
            <div className="ai-feature-list">

              <div className="ai-feature">
                <div className="ai-feature-icon">
                  <Sparkles size={17} />
                </div>

                <div>
                  <strong>Smart Recommendations</strong>
                  <span>Personalized product discovery</span>
                </div>
              </div>


              <div className="ai-feature">
                <div className="ai-feature-icon">
                  <ShoppingCart size={17} />
                </div>

                <div>
                  <strong>Simple Shopping</strong>
                  <span>Browse, choose and checkout easily</span>
                </div>
              </div>

            </div>

          </div>


          {/* Floating card - top */}
          <div className="hero-floating-card hero-floating-card-top">

            <div className="floating-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <strong>AI Discovery</strong>
              <span>Smarter choices</span>
            </div>

          </div>


          {/* Floating card - bottom */}
          <div className="hero-floating-card hero-floating-card-bottom">

            <div className="floating-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <strong>Secure Platform</strong>
              <span>Built for safe shopping</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default HeroSection