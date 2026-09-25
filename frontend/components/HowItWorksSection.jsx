import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Search,
  ShoppingCart,
} from 'lucide-react'

import './HowItWorksSection.css'


/*
  How It Works Section
  --------------------
  Shows the customer's journey through SmartCart AI.
*/

const steps = [
  {
    id: '01',
    title: 'Discover',
    description:
      'Browse products and explore categories to find what you are looking for.',
    icon: Search,
  },
  {
    id: '02',
    title: 'Get Recommendations',
    description:
      'Discover intelligent recommendations designed around your shopping needs.',
    icon: BrainCircuit,
  },
  {
    id: '03',
    title: 'Add to Cart',
    description:
      'Select the products you want and manage your shopping cart with ease.',
    icon: ShoppingCart,
  },
  {
    id: '04',
    title: 'Checkout',
    description:
      'Complete your purchase through a simple and secure checkout experience.',
    icon: CheckCircle2,
  },
]


function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="how-it-works-section"
    >

      {/* =================================
          BACKGROUND DECORATION
      ================================== */}

      <div className="how-it-works-glow how-it-works-glow-left"></div>

      <div className="how-it-works-glow how-it-works-glow-center"></div>

      <div className="how-it-works-glow how-it-works-glow-right"></div>


      {/* Decorative dots */}
      <div className="how-it-works-dots how-it-works-dots-top">
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


      <div className="how-it-works-container">

        {/* =================================
            SECTION HEADER
        ================================== */}

        <div className="how-it-works-header">

          <p className="how-it-works-label">
            HOW IT WORKS
          </p>

          <h2>
            Shopping made
            <span> simple.</span>
          </h2>

          <p className="how-it-works-description">
            From discovering products to completing your order,
            SmartCart AI keeps every step simple and easy to follow.
          </p>

        </div>


        {/* =================================
            STEPS
        ================================== */}

        <div className="how-it-works-steps">

          {steps.map((step, index) => {

            const Icon = step.icon

            return (
              <div
                className="how-it-works-step-wrapper"
                key={step.id}
              >

                {/* Connecting arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <ArrowRight size={20} />
                  </div>
                )}


                <article className="how-it-works-step">

                  {/* Step number */}
                  <div className="step-number">
                    {step.id}
                  </div>


                  {/* Step icon */}
                  <div className="step-icon">
                    <Icon size={30} />
                  </div>


                  {/* Step content */}
                  <div className="step-content">

                    <p className="step-label">
                      STEP {step.id}
                    </p>

                    <h3>
                      {step.title}
                    </h3>

                    <p className="step-description">
                      {step.description}
                    </p>

                  </div>


                  {/* Bottom status */}
                  <div className="step-status">
                    <span className="step-status-dot"></span>

                    <span>
                      Easy &amp; intuitive
                    </span>
                  </div>

                </article>

              </div>
            )
          })}

        </div>

      </div>

    </section>
  )
}


export default HowItWorksSection