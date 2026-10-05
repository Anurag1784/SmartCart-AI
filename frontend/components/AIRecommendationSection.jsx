import { useEffect, useState } from 'react'
import { ArrowRight, Heart, ShoppingCart } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { getPersonalizedRecommendations } from '../services/aiService'

import './AIRecommendationSection.css'


function AIRecommendationSection() {

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  // Get the current authentication state from Redux.
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  )

  // Get the currently logged-in user's role.
  const userRole = useSelector(
    (state) => state.auth.user?.role
  )


  // ============================================================
  // STATE
  // ============================================================

  // Store AI-generated recommendations.
  const [recommendations, setRecommendations] = useState([])

  // Track loading state.
  const [loading, setLoading] = useState(false)

  // Store API error message.
  const [error, setError] = useState('')


  // ============================================================
  // FETCH AI RECOMMENDATIONS
  // ============================================================

  useEffect(() => {

    // ----------------------------------------------------------
    // Only CUSTOMER users should receive personalized
    // recommendations.
    // ----------------------------------------------------------

    if (!isAuthenticated || userRole !== 'CUSTOMER') {
      setRecommendations([])
      setLoading(false)
      setError('')
      return
    }


    const fetchRecommendations = async () => {

      try {

        // Start loading.
        setLoading(true)

        // Clear previous error.
        setError('')


        // Request recommendations from AI Service.
        const data =
          await getPersonalizedRecommendations()


        // Store returned recommendations.
        setRecommendations(
          data.recommendations || []
        )

      } catch (error) {

        // Log the technical error for development.
        console.error(
          'AI Recommendation Fetch Error:',
          error
        )


        // Display a user-friendly message.
        if (error.response) {

          setError(
            'Unable to load personalized recommendations.'
          )

        } else if (error.request) {

          setError(
            'Unable to connect to AI Service.'
          )

        } else {

          setError(
            'Something went wrong while loading recommendations.'
          )
        }

      } finally {

        // Stop loading.
        setLoading(false)

      }
    }


    fetchRecommendations()

  }, [
    isAuthenticated,
    userRole,
  ])


  // ============================================================
  // VISIBILITY
  // ============================================================

  // Do not display this section for:
  //
  // - logged-out visitors
  // - sellers
  //
  // The existing Featured Products section continues
  // to work normally for everyone.
  if (!isAuthenticated || userRole !== 'CUSTOMER') {
    return null
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      className="ai-recommendation-section"
    >

      {/* ================================================
          SECTION HEADER
      ================================================ */}

      <div className="ai-recommendation-header">

        <p className="ai-recommendation-label">
          SMART RECOMMENDATIONS
        </p>

        <h2>
          Recommended
          <span> for you.</span>
        </h2>

        <p className="ai-recommendation-description">
          Personalized product recommendations powered
          by SmartCart AI based on your shopping activity.
        </p>

      </div>


      {/* ================================================
          LOADING STATE
      ================================================ */}

      {loading && (

        <div className="ai-recommendation-message">

          <h3>
            Finding Products For You...
          </h3>

          <p>
            SmartCart AI is analyzing your shopping
            preferences.
          </p>

        </div>

      )}


      {/* ================================================
          ERROR STATE
      ================================================ */}

      {!loading && error && (

        <div className="ai-recommendation-message">

          <h3>
            Recommendations Unavailable
          </h3>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ================================================
          EMPTY STATE
      ================================================ */}

      {!loading &&
        !error &&
        recommendations.length === 0 && (

          <div className="ai-recommendation-message">

            <h3>
              No Recommendations Yet
            </h3>

            <p>
              Continue shopping and SmartCart AI will
              personalize recommendations for you.
            </p>

          </div>

        )}


      {/* ================================================
          RECOMMENDATION GRID
      ================================================ */}

      {!loading &&
        !error &&
        recommendations.length > 0 && (

          <div className="ai-recommendation-grid">

            {recommendations.map((product) => {

              // Product Service may return category
              // as an object or string.
              const categoryName =
                typeof product.category === 'string'
                  ? product.category
                  : product.category?.categoryName ||
                    'Product'


              return (

                <article
                  className="ai-recommendation-card"
                  key={product.productId}
                >

                  {/* ==================================
                      PRODUCT VISUAL
                  ================================== */}

                  <div className="ai-recommendation-visual">

                    {/* AI badge */}
                    <span className="ai-recommendation-badge">
                      AI Pick
                    </span>


                    {/* Wishlist */}
                    <button
                      type="button"
                      className="ai-recommendation-wishlist"
                      aria-label={
                        `Add ${product.productName} to wishlist`
                      }
                    >
                      <Heart size={20} />
                    </button>


                    {/* Product Image */}
                    {product.imageUrl ? (

                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="ai-recommendation-image"
                      />

                    ) : (

                      <div
                        className="ai-recommendation-image-placeholder"
                        aria-hidden="true"
                      >
                        📦
                      </div>

                    )}

                  </div>


                  {/* ==================================
                      PRODUCT CONTENT
                  ================================== */}

                  <div className="ai-recommendation-content">

                    {/* Category */}
                    <p className="ai-recommendation-category">
                      {categoryName}
                    </p>


                    {/* Product Name */}
                    <h3>
                      {product.productName}
                    </h3>


                    {/* Brand */}
                    <p className="ai-recommendation-brand">

                      <span>
                        Brand:
                      </span>{' '}

                      {product.brand || 'N/A'}

                    </p>


                    {/* Product Footer */}
                    <div className="ai-recommendation-footer">

                      {/* Price */}
                      <span className="ai-recommendation-price">

                        ₹{Number(
                          product.price || 0
                        ).toLocaleString('en-IN')}

                      </span>


                      {/* Product Details */}
                      <Link
                        to={`/products/${product.productId}`}
                        className="ai-recommendation-button"
                      >

                        <ShoppingCart size={17} />

                        <span>
                          View Details
                        </span>

                      </Link>

                    </div>

                  </div>

                </article>

              )
            })}

          </div>

        )}


      {/* ================================================
          VIEW ALL PRODUCTS
      ================================================ */}

      {!loading &&
        !error &&
        recommendations.length > 0 && (

          <div className="ai-recommendation-action">

            <Link
              to="/products"
              className="ai-recommendation-view-all"
            >

              <span>
                Explore All Products
              </span>

              <ArrowRight size={18} />

            </Link>

          </div>

        )}

    </section>
  )
}


export default AIRecommendationSection