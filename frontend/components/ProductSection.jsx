import { ArrowRight, Heart, ShoppingCart } from 'lucide-react'

import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import { productApi } from '../services/api'

import './ProductSection.css'


/*
  Featured products shown on the Home page.

  IMPORTANT:
  Products are now loaded dynamically from Product Service.

  Product Service:
  http://localhost:8081/api/products

  Only the first 4 products are displayed on the homepage.

  The complete product catalog is available on:
  /products
*/


function ProductSection() {

  // ============================================================
  // STATE
  // ============================================================

  // Store featured products received from Product Service.
  const [products, setProducts] = useState([])

  // Track loading state.
  const [loading, setLoading] = useState(true)

  // Store API error message.
  const [error, setError] = useState('')


  // ============================================================
  // FETCH PRODUCTS
  // ============================================================

  useEffect(() => {

    const fetchFeaturedProducts = async () => {

      try {

        // Clear previous error.
        setError('')


        // Request real products from Product Service.
        const response = await productApi.get(
          '/api/products'
        )


        // Get products from backend response.
        const allProducts = response.data


        // Display only the first 4 products
        // on the homepage.
        setProducts(
          allProducts.slice(0, 4)
        )

      } catch (error) {

        console.error(
          'Featured Product Fetch Error:',
          error
        )


        // Backend returned an HTTP error.
        if (error.response) {

          setError(
            `Unable to load featured products. Server returned ${error.response.status}.`
          )

        }

        // Product Service did not respond.
        else if (error.request) {

          setError(
            'Unable to connect to Product Service.'
          )

        }

        // Unexpected error.
        else {

          setError(
            'Something went wrong while loading featured products.'
          )

        }

      } finally {

        // Stop loading.
        setLoading(false)

      }

    }


    fetchFeaturedProducts()

  }, [])


  return (

    <section
      id="products"
      className="featured-products-section"
    >

      {/* =================================
          BACKGROUND DECORATION
      ================================== */}

      <div className="featured-products-glow featured-products-glow-left"></div>

      <div className="featured-products-glow featured-products-glow-right"></div>


      {/* Decorative dots */}

      <div className="featured-products-dots featured-products-dots-top">

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


      <div className="featured-products-container">

        {/* =================================
            SECTION HEADER
        ================================== */}

        <div className="featured-products-header">

          <p className="featured-products-label">
            FEATURED PRODUCTS
          </p>

          <h2>
            Products picked
            <span> for you.</span>
          </h2>

          <p className="featured-products-description">
            Explore a selection of products available
            in SmartCart AI.
          </p>

        </div>


        {/* =================================
            LOADING STATE
        ================================== */}

        {loading && (

          <div className="featured-products-message">

            <h3>
              Loading Products...
            </h3>

            <p>
              Please wait while we fetch the latest products.
            </p>

          </div>

        )}


        {/* =================================
            ERROR STATE
        ================================== */}

        {!loading && error && (

          <div className="featured-products-message">

            <h3>
              Unable to Load Products
            </h3>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* =================================
            EMPTY STATE
        ================================== */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <div className="featured-products-message">

              <h3>
                No Featured Products
              </h3>

              <p>
                There are currently no products available.
              </p>

            </div>

          )}


        {/* =================================
            PRODUCTS GRID
        ================================== */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="featured-products-grid">

              {products.map((product) => {

                // Product Service can return category
                // as an object or string.
                const categoryName =
                  typeof product.category === 'string'
                    ? product.category
                    : product.category?.categoryName ||
                      'Product'


                return (

                  <article
                    className="featured-product-card"
                    key={product.productId}
                  >

                    {/* =================================
                        PRODUCT VISUAL
                    ================================== */}

                    <div className="featured-product-visual">

                      {/* Decorative circle */}

                      <div className="product-visual-circle"></div>


                      {/* Product badge */}

                      <span className="featured-product-badge">
                        Featured
                      </span>


                      {/* Wishlist */}

                      <button
                        type="button"
                        className="featured-wishlist-button"
                        aria-label={`Add ${product.productName} to wishlist`}
                      >

                        <Heart size={20} />

                      </button>


                      {/* Real Product Image */}

                      {product.imageUrl ? (

                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="featured-product-image"
                        />

                      ) : (

                        <div
                          className="featured-product-image-placeholder"
                          aria-hidden="true"
                        >
                          📦
                        </div>

                      )}

                    </div>


                    {/* =================================
                        PRODUCT CONTENT
                    ================================== */}

                    <div className="featured-product-content">

                      {/* Category */}

                      <p className="featured-product-category">
                        {categoryName}
                      </p>


                      {/* Product Name */}

                      <h3>
                        {product.productName}
                      </h3>


                      {/* Brand */}

                      <p className="featured-product-brand">
                        <span>
                          Brand:
                        </span>{' '}

                        {product.brand || 'N/A'}

                      </p>


                      {/* Product Footer */}

                      <div className="featured-product-footer">

                        {/* Product Price */}

                        <span className="featured-product-price">

                          ₹{Number(
                            product.price || 0
                          ).toLocaleString('en-IN')}

                        </span>


                        {/* Product Details */}

                        <Link
                          to={`/products/${product.productId}`}
                          className="featured-product-button"
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


        {/* =================================
            VIEW ALL PRODUCTS
        ================================== */}

        <div className="featured-products-action">

          <Link
            to="/products"
            className="featured-view-all-button"
          >

            <span>
              View All Products
            </span>

            <ArrowRight size={18} />

          </Link>

        </div>

      </div>

    </section>

  )

}


export default ProductSection