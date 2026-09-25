import { useEffect, useState } from 'react'
import { Eye, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import './Wishlist.css'
import { orderApi, productApi } from '../services/api'


function Wishlist() {

  // Store complete product information for wishlist items
  const [wishlistProducts, setWishlistProducts] = useState([])

  // Track loading state
  const [loading, setLoading] = useState(true)

  // Store error message
  const [error, setError] = useState('')

  // Store product ID currently being removed
  const [removingProductId, setRemovingProductId] = useState(null)


  // ============================================================
  // FETCH WISHLIST PRODUCTS
  // ============================================================

  useEffect(() => {

    const fetchWishlist = async () => {

      try {

        setError('')

        // --------------------------------------------------------
        // GET CUSTOMER WISHLIST
        // --------------------------------------------------------

        const wishlistResponse = await orderApi.get(
          '/api/wishlist'
        )

        const wishlistItems = wishlistResponse.data


        // If wishlist is empty, no Product Service requests
        // are necessary.
        if (wishlistItems.length === 0) {

          setWishlistProducts([])

          return
        }


        // --------------------------------------------------------
        // FETCH PRODUCT DETAILS
        // --------------------------------------------------------

        // Wishlist stores only productId.
        //
        // Therefore we fetch the actual product information
        // from Product Service.
        const productResults = await Promise.allSettled(

          wishlistItems.map(
            (wishlistItem) =>
              productApi.get(
                `/api/products/${wishlistItem.productId}`
              )
          )

        )


        // Keep only successfully fetched products
        const products = productResults
          .filter(
            (result) =>
              result.status === 'fulfilled'
          )
          .map(
            (result) =>
              result.value.data
          )


        setWishlistProducts(products)

      } catch (error) {

        console.error(
          'Wishlist Fetch Error:',
          error
        )


        if (error.response) {

          setError(
            `Unable to load wishlist. Server returned ${error.response.status}.`
          )

        } else if (error.request) {

          setError(
            'Unable to connect to the server. Please make sure the required services are running.'
          )

        } else {

          setError(
            'Something went wrong while loading your wishlist.'
          )
        }

      } finally {

        setLoading(false)
      }
    }


    fetchWishlist()

  }, [])


  // ============================================================
  // REMOVE FROM WISHLIST
  // ============================================================

  const handleRemove = async (productId) => {

    // Prevent multiple clicks on the same product
    if (removingProductId === productId) {

      return
    }


    try {

      setRemovingProductId(productId)


      // Remove product from backend wishlist
      await orderApi.delete(
        `/api/wishlist/${productId}`
      )


      // Remove product from local UI immediately
      setWishlistProducts(
        (previousProducts) =>
          previousProducts.filter(
            (product) =>
              product.productId !== productId
          )
      )

    } catch (error) {

      console.error(
        'Wishlist Remove Error:',
        error
      )


      if (error.response) {

        window.alert(
          error.response.data ||
          `Unable to remove product. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        window.alert(
          'Unable to connect to Order Service.'
        )

      } else {

        window.alert(
          'Something went wrong while removing the product.'
        )
      }

    } finally {

      setRemovingProductId(null)
    }
  }


  // ============================================================
  // PAGE UI
  // ============================================================

  return (
    <main className="wishlist-page">

      <div className="wishlist-page-container">


        {/* ====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="wishlist-page-header">

          <div className="wishlist-page-heading-icon">
            <Heart size={28} />
          </div>

          <div>

            <p className="wishlist-page-label">
              MY ACCOUNT
            </p>

            <h1>
              My <span>Wishlist</span>
            </h1>

            <p className="wishlist-page-description">
              Save your favorite products and find them again
              whenever you are ready to shop.
            </p>

          </div>

        </div>


        {/* ====================================================
            CONTENT
        ===================================================== */}

        <div className="wishlist-page-content">


          {/* ==================================================
              LOADING
          =================================================== */}

          {loading && (

            <div className="wishlist-page-message">

              <div className="wishlist-message-icon">
                <Heart size={34} />
              </div>

              <h2>
                Loading Wishlist...
              </h2>

              <p>
                Please wait while we load your saved products.
              </p>

            </div>

          )}


          {/* ==================================================
              ERROR
          =================================================== */}

          {!loading && error && (

            <div className="wishlist-page-message">

              <div className="wishlist-message-icon">
                ⚠️
              </div>

              <h2>
                Unable to Load Wishlist
              </h2>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* ==================================================
              EMPTY WISHLIST
          =================================================== */}

          {!loading &&
            !error &&
            wishlistProducts.length === 0 && (

              <div className="wishlist-page-message">

                <div className="wishlist-message-icon">
                  <Heart size={38} />
                </div>

                <h2>
                  Your Wishlist is Empty
                </h2>

                <p>
                  You haven't saved any products yet.
                  Explore our products and add your favorites.
                </p>

                <Link
                  to="/products"
                  className="wishlist-shop-button"
                >
                  <ShoppingBag size={18} />
                  <span>
                    Explore Products
                  </span>
                </Link>

              </div>

            )}


          {/* ==================================================
              WISHLIST PRODUCTS
          =================================================== */}

          {!loading &&
            !error &&
            wishlistProducts.length > 0 && (

              <div className="wishlist-grid">

                {wishlistProducts.map((product) => (

                  <article
                    className="wishlist-card"
                    key={product.productId}
                  >


                    {/* ========================================
                        PRODUCT IMAGE
                    ========================================= */}

                    <div className="wishlist-image-container">

                      <span className="wishlist-saved-badge">
                        <Heart
                          size={14}
                          fill="currentColor"
                        />

                        Saved
                      </span>


                      {product.imageUrl ? (

                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="wishlist-product-image"
                        />

                      ) : (

                        <div className="wishlist-image-placeholder">
                          📦
                        </div>

                      )}

                    </div>


                    {/* ========================================
                        PRODUCT INFORMATION
                    ========================================= */}

                    <div className="wishlist-card-content">

                      <h2>
                        {product.productName}
                      </h2>


                      <p className="wishlist-product-brand">

                        <span>
                          Brand:
                        </span>{' '}

                        {product.brand || 'N/A'}

                      </p>


                      <p className="wishlist-product-description">

                        {product.description ||
                          'No description available for this product.'}

                      </p>


                      {/* ======================================
                          PRICE
                      ======================================= */}

                      <div className="wishlist-product-price">

                        ₹{Number(
                          product.price
                        ).toLocaleString('en-IN')}

                      </div>


                      {/* ======================================
                          ACTIONS
                      ======================================= */}

                      <div className="wishlist-card-actions">

                        <Link
                          to={`/products/${product.productId}`}
                          className="wishlist-view-button"
                        >

                          <Eye size={17} />

                          <span>
                            View Details
                          </span>

                        </Link>


                        <button
                          type="button"
                          className="wishlist-remove-button"
                          onClick={() =>
                            handleRemove(
                              product.productId
                            )
                          }
                          disabled={
                            removingProductId ===
                            product.productId
                          }
                        >

                          <Trash2 size={17} />

                          <span>
                            {removingProductId ===
                            product.productId
                              ? 'Removing...'
                              : 'Remove'}
                          </span>

                        </button>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </div>

      </div>

    </main>
  )
}


export default Wishlist