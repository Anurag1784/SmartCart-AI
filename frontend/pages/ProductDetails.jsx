import { useEffect, useState } from 'react'

import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import './ProductDetails.css'

import {
  productApi,
  orderApi,
} from '../services/api'


function ProductDetails() {

  // ============================================================
  // GET PRODUCT ID FROM URL
  // ============================================================

  // Example:
  //
  // /products/2
  //
  // productId will be "2".
  const { productId } = useParams()


  // ============================================================
  // PRODUCT STATE
  // ============================================================

  // Store the product received from Product Service
  const [product, setProduct] = useState(null)

  // Track product loading state
  const [loading, setLoading] = useState(true)

  // Store product API error
  const [error, setError] = useState('')


  // ============================================================
  // CART STATE
  // ============================================================

  // Store selected quantity
  //
  // Default quantity is 1.
  const [quantity, setQuantity] = useState(1)

  // Track Add to Cart API request
  const [addingToCart, setAddingToCart] = useState(false)

  // Store Add to Cart error
  const [cartError, setCartError] = useState('')

  // Store successful Add to Cart message
  const [cartSuccess, setCartSuccess] = useState('')


  // ============================================================
  // FETCH PRODUCT
  // ============================================================

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        // Reset states when product changes
        setLoading(true)
        setError('')
        setCartError('')
        setCartSuccess('')
        setQuantity(1)


        // Call Product Service
        //
        // Product Service:
        // http://localhost:8081
        //
        // Endpoint:
        // GET /api/products/{productId}
        const response = await productApi.get(
          `/api/products/${productId}`
        )


        // Store real product data
        setProduct(response.data)

      } catch (error) {

        // Print actual error for debugging
        console.error(
          'Product Details Fetch Error:',
          error
        )


        // Backend returned an HTTP error
        if (error.response) {

          setError(
            `Unable to load this product. Server returned ${error.response.status}.`
          )

        }

        // Product Service did not respond
        else if (error.request) {

          setError(
            'Unable to connect to Product Service. Please make sure it is running.'
          )

        }

        // Unexpected error
        else {

          setError(
            'Something went wrong while loading the product.'
          )

        }


        // Remove stale product data
        setProduct(null)

      } finally {

        // Loading completed
        setLoading(false)

      }

    }


    // Only fetch when productId exists
    if (productId) {
      fetchProduct()
    }

  }, [productId])


  // ============================================================
  // DECREASE QUANTITY
  // ============================================================

  const handleDecreaseQuantity = () => {

    // Quantity cannot go below 1
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1)
    )

    // Remove old messages when quantity changes
    setCartError('')
    setCartSuccess('')

  }


  // ============================================================
  // INCREASE QUANTITY
  // ============================================================

  const handleIncreaseQuantity = () => {

    // Increase selected quantity by 1
    setQuantity((currentQuantity) =>
      currentQuantity + 1
    )

    // Remove old messages when quantity changes
    setCartError('')
    setCartSuccess('')

  }


  // ============================================================
  // ADD TO CART
  // ============================================================

  const handleAddToCart = async () => {

    try {

      // Reset previous messages
      setCartError('')
      setCartSuccess('')

      // Start loading state
      setAddingToCart(true)


      // ========================================================
      // GET LOGGED-IN CUSTOMER
      // ========================================================

      // Authentication data is stored after login.
      //
      // IMPORTANT:
      // SmartCart currently uses sessionStorage
      // for authentication.
      const storedAuth =
        sessionStorage.getItem('auth')


      // If authentication data is missing,
      // don't try to call the Cart API.
      if (!storedAuth) {

        setCartError(
          'Please login before adding products to your cart.'
        )

        return
      }


      // Convert JSON string into JavaScript object
      const auth = JSON.parse(storedAuth)


      // Get customer ID from logged-in user
      const customerId =
        auth.user?.userId


      // Make sure customer ID exists
      if (!customerId) {

        setCartError(
          'Unable to identify the logged-in customer.'
        )

        return
      }


      // ========================================================
      // ADD PRODUCT TO CART
      // ========================================================

      // Order Service:
      // http://localhost:8083
      //
      // Endpoint:
      // POST /api/carts/customer/{customerId}/items
      //
      // CartItem requires:
      //
      // productId
      // quantity
      // unitPrice
      const response = await orderApi.post(
        `/api/carts/customer/${customerId}/items`,
        {
          productId: Number(product.productId),
          quantity: quantity,
          unitPrice: Number(product.price),
        }
      )


      // Print successful response for debugging
      console.log(
        'Add to Cart Response:',
        response.data
      )


      // Show success message
      setCartSuccess(
        `${product.productName} added to your cart.`
      )

    } catch (error) {

      // Print actual API error
      console.error(
        'Add to Cart Error:',
        error
      )


      // Backend returned an HTTP error
      if (error.response) {

        setCartError(
          `Unable to add product to cart. Server returned ${error.response.status}.`
        )

      }

      // Order Service did not respond
      else if (error.request) {

        setCartError(
          'Unable to connect to Order Service. Please make sure it is running.'
        )

      }

      // Unexpected error
      else {

        setCartError(
          'Something went wrong while adding the product to your cart.'
        )

      }

    } finally {

      // Stop Add to Cart loading state
      setAddingToCart(false)

    }

  }


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {

    return (
      <main className="product-details-page">

        <div className="product-details-container">

          <div className="product-details-message">

            <h2>
              Loading Product...
            </h2>

            <p>
              Please wait while we fetch the product details.
            </p>

          </div>

        </div>

      </main>
    )

  }


  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {

    return (
      <main className="product-details-page">

        <div className="product-details-container">

          <div className="product-details-message">

            <h2>
              Unable to Load Product
            </h2>

            <p>
              {error}
            </p>

            <Link
              to="/products"
              className="product-back-link"
            >

              <ArrowLeft size={18} />

              <span>
                Back to Products
              </span>

            </Link>

          </div>

        </div>

      </main>
    )

  }


  // ============================================================
  // PRODUCT NOT FOUND
  // ============================================================

  if (!product) {

    return (
      <main className="product-details-page">

        <div className="product-details-container">

          <div className="product-details-message">

            <h2>
              Product Not Found
            </h2>

            <p>
              The requested product could not be found.
            </p>

            <Link
              to="/products"
              className="product-back-link"
            >

              <ArrowLeft size={18} />

              <span>
                Back to Products
              </span>

            </Link>

          </div>

        </div>

      </main>
    )

  }


  // ============================================================
  // CATEGORY NAME
  // ============================================================

  // Product Service returns category as an object.
  const categoryName =
    product.category?.categoryName || 'Product'


  // ============================================================
  // MAIN PRODUCT DETAILS UI
  // ============================================================

  return (

    <main className="product-details-page">

      <div className="product-details-container">


        {/* ==============================================
            BACK TO PRODUCTS
            ============================================== */}

        <Link
          to="/products"
          className="product-back-link"
        >

          <ArrowLeft size={18} />

          <span>
            Back to Products
          </span>

        </Link>


        {/* ==============================================
            MAIN PRODUCT AREA
            ============================================== */}

        <section className="product-details-main">


          {/* ============================================
              LEFT SIDE - PRODUCT IMAGE
              ============================================ */}

          <div className="product-details-image-section">

            <div className="product-details-image-card">

              <span className="product-details-category">
                {categoryName}
              </span>


              <button
                type="button"
                className="product-details-wishlist"
                aria-label={`Add ${product.productName} to wishlist`}
              >

                <Heart size={21} />

              </button>


              {product.imageUrl ? (

                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="product-details-image"
                />

              ) : (

                <div className="product-details-image-placeholder">
                  No Image Available
                </div>

              )}

            </div>

          </div>


          {/* ============================================
              RIGHT SIDE - PRODUCT INFORMATION
              ============================================ */}

          <div className="product-details-content">


            {/* Brand */}

            <p className="product-details-brand">
              {product.brand || 'Brand'}
            </p>


            {/* Product Name */}

            <h1>
              {product.productName}
            </h1>


            {/* Product Availability */}

            <div className="product-details-rating">

              <span>
                {product.status === 'ACTIVE'
                  ? 'Available'
                  : product.status}
              </span>

            </div>


            <div className="product-details-divider"></div>


            {/* Price */}

            <div className="product-details-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>


            <p className="product-details-price-note">
              Inclusive of all applicable taxes
            </p>


            {/* Description */}

            <p className="product-details-description">
              {product.description ||
                'No description available for this product.'}
            </p>


            {/* ==========================================
                PRODUCT HIGHLIGHTS
                ========================================== */}

            <div className="product-details-highlights">


              {/* Fast Delivery */}

              <div className="product-highlight">

                <div className="product-highlight-icon">
                  <Truck size={19} />
                </div>

                <div>

                  <strong>
                    Fast Delivery
                  </strong>

                  <span>
                    Get your product delivered quickly
                  </span>

                </div>

              </div>


              {/* Secure Purchase */}

              <div className="product-highlight">

                <div className="product-highlight-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>

                  <strong>
                    Secure Purchase
                  </strong>

                  <span>
                    Safe and protected shopping
                  </span>

                </div>

              </div>


              {/* Easy Returns */}

              <div className="product-highlight">

                <div className="product-highlight-icon">
                  <RotateCcw size={19} />
                </div>

                <div>

                  <strong>
                    Easy Returns
                  </strong>

                  <span>
                    Simple return experience
                  </span>

                </div>

              </div>

            </div>


            {/* ==========================================
                QUANTITY + ADD TO CART
                ========================================== */}

            <div className="product-details-purchase">


              {/* Quantity Selector */}

              <div className="quantity-selector">

                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={handleDecreaseQuantity}
                  disabled={addingToCart}
                >

                  <Minus size={17} />

                </button>


                <span>
                  {quantity}
                </span>


                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={handleIncreaseQuantity}
                  disabled={addingToCart}
                >

                  <Plus size={17} />

                </button>

              </div>


              {/* Add To Cart */}

              <button
                type="button"
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >

                {addingToCart ? (

                  <>
                    <ShoppingCart size={19} />

                    <span>
                      Adding...
                    </span>
                  </>

                ) : (

                  <>
                    <ShoppingCart size={19} />

                    <span>
                      Add to Cart
                    </span>
                  </>

                )}

              </button>

            </div>


            {/* ==========================================
                CART SUCCESS MESSAGE
                ========================================== */}

            {cartSuccess && (

              <div className="product-cart-success">

                <CheckCircle2 size={18} />

                <span>
                  {cartSuccess}
                </span>

              </div>

            )}


            {/* ==========================================
                CART ERROR MESSAGE
                ========================================== */}

            {cartError && (

              <div className="product-cart-error">

                <span>
                  {cartError}
                </span>

              </div>

            )}


            {/* ==========================================
                PRODUCT METADATA
                ========================================== */}

            <div className="product-details-meta">


              <div>

                <span>
                  SKU
                </span>

                <strong>
                  {product.sku || 'N/A'}
                </strong>

              </div>


              <div>

                <span>
                  Brand
                </span>

                <strong>
                  {product.brand || 'N/A'}
                </strong>

              </div>


              <div>

                <span>
                  Category
                </span>

                <strong>
                  {categoryName}
                </strong>

              </div>


            </div>

          </div>

        </section>

      </div>

    </main>

  )

}


export default ProductDetails