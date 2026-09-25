import { useEffect, useState } from 'react'
import { Eye, Heart, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

import './Products.css'
import { productApi, orderApi } from '../services/api'


function Products() {

  // ============================================================
  // PRODUCT STATE
  // ============================================================

  // Store all products received from Product Service
  const [products, setProducts] = useState([])


  // Store the currently selected category
  //
  // "ALL" means that all products should be displayed.
  const [selectedCategory, setSelectedCategory] = useState('ALL')


  // ============================================================
  // WISHLIST STATE
  // ============================================================

  // Store product IDs that are currently in the customer's wishlist
  const [wishlistProductIds, setWishlistProductIds] = useState(
    new Set()
  )


  // Store product IDs whose wishlist operation is currently running
  const [wishlistUpdatingIds, setWishlistUpdatingIds] = useState(
    new Set()
  )


  // ============================================================
  // PAGE STATE
  // ============================================================

  // Track whether products are currently being loaded
  const [loading, setLoading] = useState(true)


  // Store an error message if the Product API request fails
  const [error, setError] = useState('')


  // ============================================================
  // FETCH PRODUCTS + WISHLIST
  // ============================================================

  useEffect(() => {

    const fetchProductsAndWishlist = async () => {

      try {

        // Clear any previous error
        setError('')


        // --------------------------------------------------------
        // FETCH PRODUCTS
        // --------------------------------------------------------

        // Request all products from Product Service.
        //
        // productApi uses port 8081.
        //
        // The JWT interceptor is already configured
        // inside api.js.
        const productsResponse = await productApi.get(
          '/api/products'
        )


        // Store products returned by Product Service
        setProducts(productsResponse.data)


        // --------------------------------------------------------
        // FETCH CUSTOMER WISHLIST
        // --------------------------------------------------------

        // Get authentication information from sessionStorage
        const storedAuth = sessionStorage.getItem('auth')


        // Wishlist belongs to a logged-in customer.
        //
        // If there is no login information, we simply skip
        // the wishlist request.
        if (storedAuth) {

          try {

            // Request the customer's wishlist from Order Service
            const wishlistResponse = await orderApi.get(
              '/api/wishlist'
            )


            // Convert the wishlist response into a Set
            // containing only product IDs.
            const wishlistIds = new Set(
              wishlistResponse.data.map(
                (wishlistItem) => wishlistItem.productId
              )
            )


            // Store wishlist product IDs in React state
            setWishlistProductIds(wishlistIds)

          } catch (wishlistError) {

            // Wishlist failure should NOT prevent products
            // from being displayed.
            console.error(
              'Wishlist Fetch Error:',
              wishlistError
            )

          }
        }

      } catch (error) {

        // Print the actual Product API error
        // in the browser console.
        console.error(
          'Product Fetch Error:',
          error
        )


        // Backend returned an HTTP error response
        if (error.response) {

          setError(
            `Unable to load products. Server returned ${error.response.status}.`
          )

        }

        // Request was sent but Product Service did not respond
        else if (error.request) {

          setError(
            'Unable to connect to Product Service. Please make sure it is running.'
          )

        }

        // Unexpected error
        else {

          setError(
            'Something went wrong while loading products.'
          )
        }

      } finally {

        // Stop loading after the request finishes
        setLoading(false)
      }
    }


    fetchProductsAndWishlist()

  }, [])


  // ============================================================
  // CATEGORY LIST
  // ============================================================

  // Create a unique list of category names from the products.
  //
  // This means we don't have to hard-code category names.
  const categories = Array.from(
    new Set(
      products
        .map((product) => {

          if (typeof product.category === 'string') {
            return product.category
          }

          return product.category?.categoryName || null
        })
        .filter(Boolean)
    )
  )


  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  // If "ALL" is selected, display every product.
  //
  // Otherwise, display only products belonging to
  // the selected category.
  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter((product) => {

          const categoryName =
            typeof product.category === 'string'
              ? product.category
              : product.category?.categoryName || ''

          return categoryName === selectedCategory
        })


  // ============================================================
  // WISHLIST TOGGLE
  // ============================================================

  const handleWishlistToggle = async (productId) => {

    // ----------------------------------------------------------
    // CHECK LOGIN
    // ----------------------------------------------------------

    const storedAuth = sessionStorage.getItem('auth')


    // Wishlist requires customer authentication.
    if (!storedAuth) {

      window.alert(
        'Please login to add products to your wishlist.'
      )

      return
    }


    // ----------------------------------------------------------
    // PREVENT MULTIPLE CLICKS
    // ----------------------------------------------------------

    // If this product is already being updated,
    // do nothing.
    if (wishlistUpdatingIds.has(productId)) {

      return
    }


    // Mark this product as currently updating
    setWishlistUpdatingIds(
      (previousIds) => {

        const updatedIds = new Set(previousIds)

        updatedIds.add(productId)

        return updatedIds
      }
    )


    // Check whether this product is already in wishlist
    const isCurrentlyWishlisted =
      wishlistProductIds.has(productId)


    try {

      // ========================================================
      // REMOVE FROM WISHLIST
      // ========================================================

      if (isCurrentlyWishlisted) {

        // DELETE /api/wishlist/{productId}
        await orderApi.delete(
          `/api/wishlist/${productId}`
        )


        // Remove product ID from local wishlist state
        setWishlistProductIds(
          (previousIds) => {

            const updatedIds = new Set(previousIds)

            updatedIds.delete(productId)

            return updatedIds
          }
        )

      }

      // ========================================================
      // ADD TO WISHLIST
      // ========================================================

      else {

        // POST /api/wishlist/{productId}
        //
        // No request body is required because the backend
        // gets customerId from the JWT.
        await orderApi.post(
          `/api/wishlist/${productId}`
        )


        // Add product ID to local wishlist state
        setWishlistProductIds(
          (previousIds) => {

            const updatedIds = new Set(previousIds)

            updatedIds.add(productId)

            return updatedIds
          }
        )
      }

    } catch (error) {

      // Print wishlist operation error
      console.error(
        'Wishlist Update Error:',
        error
      )


      // Show a simple user-friendly message
      if (error.response) {

        window.alert(
          error.response.data ||
          `Unable to update wishlist. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        window.alert(
          'Unable to connect to Order Service. Please make sure it is running.'
        )

      } else {

        window.alert(
          'Something went wrong while updating your wishlist.'
        )
      }

    } finally {

      // Remove this product from the updating state
      setWishlistUpdatingIds(
        (previousIds) => {

          const updatedIds = new Set(previousIds)

          updatedIds.delete(productId)

          return updatedIds
        }
      )
    }
  }


  // ============================================================
  // PAGE UI
  // ============================================================

  return (
    <main className="products-page">

      <div className="products-page-container">


        {/* ====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="products-page-header">

          <p className="products-page-label">
            OUR PRODUCTS
          </p>

          <h1>
            Explore <span>Products</span>
          </h1>

          <p className="products-page-description">
            Discover products from different categories and find
            something that fits your needs.
          </p>

        </div>


        {/* ====================================================
            CATEGORY FILTER
        ===================================================== */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="products-category-filter">

              <div className="products-filter-label">

                <Filter size={18} />

                <span>
                  Filter by Category
                </span>

              </div>


              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
                className="products-category-select"
                aria-label="Filter products by category"
              >

                <option value="ALL">
                  All Categories
                </option>


                {categories.map((category) => (

                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>

                ))}

              </select>

            </div>

          )}


        {/* ====================================================
            PRODUCT CONTENT
        ===================================================== */}

        <div className="products-page-content">


          {/* ==================================================
              LOADING STATE
          =================================================== */}

          {loading && (

            <div className="products-page-message">

              <h2>
                Loading Products...
              </h2>

              <p>
                Please wait while we fetch the latest products.
              </p>

            </div>

          )}


          {/* ==================================================
              ERROR STATE
          =================================================== */}

          {!loading && error && (

            <div className="products-page-message">

              <h2>
                Unable to Load Products
              </h2>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* ==================================================
              NO PRODUCTS
          =================================================== */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="products-page-message">

                <h2>
                  No Products Found
                </h2>

                <p>
                  There are currently no products available.
                </p>

              </div>

            )}


          {/* ==================================================
              NO PRODUCTS IN SELECTED CATEGORY
          =================================================== */}

          {!loading &&
            !error &&
            products.length > 0 &&
            filteredProducts.length === 0 && (

              <div className="products-page-message">

                <h2>
                  No Products in This Category
                </h2>

                <p>
                  There are currently no products available
                  in the selected category.
                </p>

              </div>

            )}


          {/* ==================================================
              FILTERED PRODUCTS
          =================================================== */}

          {!loading &&
            !error &&
            filteredProducts.length > 0 && (

              <div className="products-grid">

                {filteredProducts.map((product) => {

                  // Product Service can return category as
                  // an object or as a simple string.
                  const categoryName =
                    typeof product.category === 'string'
                      ? product.category
                      : product.category?.categoryName ||
                        'Product'


                  // Check whether this product is currently
                  // present in the customer's wishlist.
                  const isWishlisted =
                    wishlistProductIds.has(
                      product.productId
                    )


                  // Check whether a wishlist API operation
                  // is currently running for this product.
                  const isWishlistUpdating =
                    wishlistUpdatingIds.has(
                      product.productId
                    )


                  return (

                    <article
                      className="product-card"
                      key={product.productId}
                    >


                      {/* ======================================
                          PRODUCT IMAGE AREA
                      ======================================= */}

                      <div className="product-image-container">


                        {/* Category Badge */}

                        <span className="product-category-badge">
                          {categoryName}
                        </span>


                        {/* Wishlist Button */}

                        <button
                          type="button"
                          className={`wishlist-button ${
                            isWishlisted
                              ? 'wishlist-button-active'
                              : ''
                          }`}
                          aria-label={
                            isWishlisted
                              ? `Remove ${product.productName} from wishlist`
                              : `Add ${product.productName} to wishlist`
                          }
                          aria-pressed={isWishlisted}
                          disabled={isWishlistUpdating}
                          onClick={() =>
                            handleWishlistToggle(
                              product.productId
                            )
                          }
                        >

                          <Heart
                            size={22}
                            fill={
                              isWishlisted
                                ? 'currentColor'
                                : 'none'
                            }
                          />

                        </button>


                        {/* Real Product Image */}

                        {product.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="product-image"
                          />

                        ) : (

                          <div className="product-image-placeholder">
                            📦
                          </div>

                        )}

                      </div>


                      {/* ======================================
                          PRODUCT INFORMATION
                      ======================================= */}

                      <div className="product-content">


                        {/* Product Name */}

                        <h3>
                          {product.productName}
                        </h3>


                        {/* Brand */}

                        <p className="product-brand">

                          <span>
                            Brand:
                          </span>{' '}

                          {product.brand || 'N/A'}

                        </p>


                        {/* Product Description */}

                        <p className="product-description">

                          {product.description ||
                            'No description available for this product.'}

                        </p>


                        {/* ====================================
                            PRICE + DETAILS
                        ===================================== */}

                        <div className="product-footer">


                          {/* Product Price */}

                          <span className="product-price">

                            ₹{Number(
                              product.price
                            ).toLocaleString('en-IN')}

                          </span>


                          {/* Product Details */}

                          <Link
                            to={`/products/${product.productId}`}
                            className="view-product-button"
                          >

                            <Eye size={18} />

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

        </div>

      </div>

    </main>
  )
}


export default Products