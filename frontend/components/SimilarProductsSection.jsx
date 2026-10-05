import { useEffect, useState } from 'react'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getSimilarProducts } from '../services/aiService'

import './SimilarProductsSection.css'


function SimilarProductsSection({ productId }) {

  // ============================================================
  // STATE
  // ============================================================

  // Store AI-generated similar products.
  const [similarProducts, setSimilarProducts] = useState([])

  // Track loading state.
  const [loading, setLoading] = useState(true)

  // Store API error message.
  const [error, setError] = useState('')


  // ============================================================
  // FETCH SIMILAR PRODUCTS
  // ============================================================

  useEffect(() => {

    // Do not call the AI Service if productId is missing.
    if (!productId) {
      setSimilarProducts([])
      setLoading(false)
      return
    }


    const fetchSimilarProducts = async () => {

      try {

        // Start loading.
        setLoading(true)

        // Clear previous error.
        setError('')


        // Request similar products from AI Service.
        const data = await getSimilarProducts(
          productId
        )


        // Store returned recommendations.
        setSimilarProducts(
          data.recommendations || []
        )

      } catch (error) {

        // Log technical error for development.
        console.error(
          'AI Similar Products Fetch Error:',
          error
        )


        // Store a user-friendly error.
        if (error.response) {

          setError(
            'Unable to load similar products.'
          )

        } else if (error.request) {

          setError(
            'Unable to connect to AI Service.'
          )

        } else {

          setError(
            'Something went wrong while loading similar products.'
          )

        }

        // Remove stale recommendations if the request fails.
        setSimilarProducts([])

      } finally {

        // Stop loading.
        setLoading(false)

      }
    }


    fetchSimilarProducts()

  }, [productId])


  // ============================================================
  // EMPTY RESULT
  // ============================================================

  // If AI has no similar products, don't display
  // an unnecessary empty section.
  if (
    !loading &&
    !error &&
    similarProducts.length === 0
  ) {
    return null
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="similar-products-section">

      {/* ========================================================
          SECTION HEADER
      ======================================================== */}

      <div className="similar-products-header">

        <div>

          <p className="similar-products-label">
            SMART MATCHES
          </p>

          <h2>
            You May Also
            <span> Like</span>
          </h2>

          <p className="similar-products-description">
            Products selected by SmartCart AI based on
            similarities with the product you're viewing.
          </p>

        </div>


        {/* Explore all products */}
        <Link
          to="/products"
          className="similar-products-view-all"
        >

          <span>
            View All
          </span>

          <ArrowRight size={18} />

        </Link>

      </div>


      {/* ========================================================
          LOADING STATE
      ======================================================== */}

      {loading && (

        <div className="similar-products-message">

          <h3>
            Finding Similar Products...
          </h3>

          <p>
            SmartCart AI is finding products that
            match your interests.
          </p>

        </div>

      )}


      {/* ========================================================
          ERROR STATE
      ======================================================== */}

      {!loading && error && (

        <div className="similar-products-message">

          <h3>
            Similar Products Unavailable
          </h3>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ========================================================
          SIMILAR PRODUCTS GRID
      ======================================================== */}

      {!loading &&
        !error &&
        similarProducts.length > 0 && (

          <div className="similar-products-grid">

            {similarProducts.map((product) => {

              // Product Service returns category as an object.
              const categoryName =
                product.category?.categoryName ||
                'Product'


              return (

                <article
                  className="similar-product-card"
                  key={product.productId}
                >

                  {/* ==========================================
                      PRODUCT IMAGE
                  ========================================== */}

                  <div className="similar-product-visual">

                    <span className="similar-product-badge">
                      AI Match
                    </span>


                    {product.imageUrl ? (

                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="similar-product-image"
                      />

                    ) : (

                      <div
                        className="similar-product-placeholder"
                        aria-hidden="true"
                      >
                        📦
                      </div>

                    )}

                  </div>


                  {/* ==========================================
                      PRODUCT INFORMATION
                  ========================================== */}

                  <div className="similar-product-content">

                    <p className="similar-product-category">
                      {categoryName}
                    </p>


                    <h3>
                      {product.productName}
                    </h3>


                    <p className="similar-product-brand">

                      <span>
                        Brand:
                      </span>{' '}

                      {product.brand || 'N/A'}

                    </p>


                    <div className="similar-product-footer">

                      <span className="similar-product-price">

                        ₹{Number(
                          product.price || 0
                        ).toLocaleString('en-IN')}

                      </span>


                      <Link
                        to={`/products/${product.productId}`}
                        className="similar-product-button"
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

    </section>
  )
}


export default SimilarProductsSection