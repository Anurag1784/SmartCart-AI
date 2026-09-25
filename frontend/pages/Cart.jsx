import { useEffect, useState } from 'react'

import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Trash2,
  Truck,
} from 'lucide-react'

import { Link, useNavigate } from 'react-router-dom'

import './Cart.css'

import { orderApi, productApi } from '../services/api'


function Cart() {

  // ============================================================
  // NAVIGATION
  // ============================================================

  // React Router navigate function.
  // We use this to move the customer to the Checkout page
  // when the Proceed to Checkout button is clicked.
  const navigate = useNavigate()


  // ============================================================
  // CART STATE
  // ============================================================

  // Store all cart items received from Order Service
  const [cartItems, setCartItems] = useState([])

  // Store product information for each cart item
  const [products, setProducts] = useState({})

  // Track initial cart loading
  const [loading, setLoading] = useState(true)

  // Store page-level API error
  const [error, setError] = useState('')

  // Store error that happens during quantity/remove actions
  const [actionError, setActionError] = useState('')

  // Store the cart item currently being updated
  const [updatingItemId, setUpdatingItemId] = useState(null)

  // Store the cart item currently being removed
  const [removingItemId, setRemovingItemId] = useState(null)


  // ============================================================
  // GET CUSTOMER ID
  // ============================================================

  // Read the logged-in customer's ID from sessionStorage
  const getCustomerId = () => {

    // Get authentication data saved after login
    const storedAuth = sessionStorage.getItem('auth')

    // If authentication data does not exist,
    // return null.
    if (!storedAuth) {
      return null
    }

    // Convert stored JSON into JavaScript object
    const auth = JSON.parse(storedAuth)

    // Return the logged-in user's ID
    return auth.user?.userId || null
  }


  // ============================================================
  // FETCH CART
  // ============================================================

  useEffect(() => {

    const fetchCart = async () => {

      try {

        // Clear previous page error
        setError('')

        // Get customer ID
        const customerId = getCustomerId()

        // If customer ID does not exist,
        // stop the request.
        if (!customerId) {
          setError('Unable to identify the logged-in customer.')
          return
        }


        // ======================================================
        // GET CART FROM ORDER SERVICE
        // ======================================================

        // Order Service runs on port 8083.
        //
        // orderApi automatically attaches the JWT token.
        const response = await orderApi.get(
          `/api/carts/customer/${customerId}`
        )


        // Get cart items from the response
        const items = response.data?.cartItems || []


        // Store cart items in React state
        setCartItems(items)


        // ======================================================
        // FETCH PRODUCT DETAILS
        // ======================================================

        // CartItem only contains:
        //
        // productId
        // quantity
        // unitPrice
        //
        // It does not contain:
        //
        // productName
        // brand
        // category
        // image
        //
        // Therefore Product Service is called for every item.
        if (items.length > 0) {

          const productResponses = await Promise.all(

            items.map((item) =>
              productApi.get(
                `/api/products/${item.productId}`
              )
            )

          )


          // Create an object where productId
          // becomes the key.
          const productMap = {}

          productResponses.forEach((productResponse) => {

            const product =
              productResponse.data

            productMap[product.productId] =
              product

          })


          // Store product information
          setProducts(productMap)

        } else {

          // Clear old product information
          setProducts({})

        }

      } catch (error) {

        // Print actual error for debugging
        console.error(
          'Cart Fetch Error:',
          error
        )


        // Backend returned an HTTP error
        if (error.response) {

          setError(
            `Unable to load your cart. Server returned ${error.response.status}.`
          )

        }

        // Request was sent but service did not respond
        else if (error.request) {

          setError(
            'Unable to connect to Order Service. Please make sure it is running.'
          )

        }

        // Unexpected error
        else {

          setError(
            'Something went wrong while loading your cart.'
          )

        }

      } finally {

        // Stop loading state
        setLoading(false)

      }

    }


    // Fetch cart when page loads
    fetchCart()

  }, [])


  // ============================================================
  // UPDATE CART ITEM QUANTITY
  // ============================================================

  const handleUpdateQuantity = async (
    item,
    newQuantity
  ) => {

    // Quantity cannot become zero or negative
    if (newQuantity < 1) {
      return
    }


    try {

      // Clear previous action error
      setActionError('')

      // Show loading state for this particular item
      setUpdatingItemId(item.cartItemId)


      // Get logged-in customer ID
      const customerId = getCustomerId()


      // Make sure customer ID exists
      if (!customerId) {

        setActionError(
          'Unable to identify the logged-in customer.'
        )

        return
      }


      // ========================================================
      // UPDATE QUANTITY IN ORDER SERVICE
      // ========================================================

      // Endpoint:
      //
      // PUT
      // /api/carts/customer/{customerId}/items/{productId}
      //
      // Query parameter:
      //
      // ?quantity=...
      const response = await orderApi.put(
        `/api/carts/customer/${customerId}/items/${item.productId}`,
        null,
        {
          params: {
            quantity: newQuantity,
          },
        }
      )


      // Backend returns the updated CartItem
      const updatedItem = response.data


      // Update only the changed item in React state
      setCartItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.cartItemId === item.cartItemId
            ? updatedItem
            : currentItem
        )
      )


    } catch (error) {

      // Print actual error for debugging
      console.error(
        'Update Cart Quantity Error:',
        error
      )


      // Show useful error message
      if (error.response) {

        setActionError(
          `Unable to update quantity. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        setActionError(
          'Unable to connect to Order Service.'
        )

      } else {

        setActionError(
          'Something went wrong while updating the quantity.'
        )

      }

    } finally {

      // Remove loading state
      setUpdatingItemId(null)

    }

  }


  // ============================================================
  // REMOVE CART ITEM
  // ============================================================

  const handleRemoveItem = async (item) => {

    try {

      // Clear previous action error
      setActionError('')

      // Show removing state
      setRemovingItemId(item.cartItemId)


      // Get logged-in customer ID
      const customerId = getCustomerId()


      // Make sure customer ID exists
      if (!customerId) {

        setActionError(
          'Unable to identify the logged-in customer.'
        )

        return
      }


      // ========================================================
      // REMOVE ITEM FROM ORDER SERVICE
      // ========================================================

      // Endpoint:
      //
      // DELETE
      // /api/carts/customer/{customerId}/items/{productId}
      await orderApi.delete(
        `/api/carts/customer/${customerId}/items/${item.productId}`
      )


      // Remove item from React state
      //
      // We do not need to reload the whole page.
      setCartItems((currentItems) =>
        currentItems.filter(
          (currentItem) =>
            currentItem.cartItemId !== item.cartItemId
        )
      )


    } catch (error) {

      // Print actual error for debugging
      console.error(
        'Remove Cart Item Error:',
        error
      )


      // Show useful error message
      if (error.response) {

        setActionError(
          `Unable to remove item. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        setActionError(
          'Unable to connect to Order Service.'
        )

      } else {

        setActionError(
          'Something went wrong while removing the item.'
        )

      }

    } finally {

      // Remove loading state
      setRemovingItemId(null)

    }

  }


  // ============================================================
  // CALCULATE CART VALUES
  // ============================================================

  // Calculate total quantity of all products
  const totalItems = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  )


  // Calculate subtotal
  //
  // Unit Price × Quantity
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.unitPrice || 0) *
      Number(item.quantity || 0),
    0
  )


  // Delivery is currently free
  const delivery = 0


  // Final total
  const total = subtotal + delivery


  // Format Indian currency
  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString('en-IN')}`


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {

    return (

      <main className="cart-page">

        <div className="cart-page-container">

          <div className="cart-loading-state">

            <div className="cart-loading-icon">
              <ShoppingBag size={34} />
            </div>

            <h1>
              Loading your cart...
            </h1>

            <p>
              Please wait while we fetch your shopping cart.
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

      <main className="cart-page">

        <div className="cart-page-container">

          <div className="cart-error-state">

            <div className="cart-error-icon">
              <ShoppingBag size={34} />
            </div>

            <h1>
              Unable to Load Cart
            </h1>

            <p>
              {error}
            </p>

            <Link
              to="/products"
              className="cart-browse-button"
            >
              <ArrowLeft size={17} />

              <span>
                Continue Shopping
              </span>

            </Link>

          </div>

        </div>

      </main>

    )

  }


  // ============================================================
  // MAIN CART PAGE
  // ============================================================

  return (

    <main className="cart-page">

      <div className="cart-page-container">


        {/* =========================================
            PAGE HEADER
            ========================================= */}

        <div className="cart-page-header">

          <div>

            <p className="cart-page-label">
              YOUR SHOPPING CART
            </p>

            <h1>
              Review your
              <span> items.</span>
            </h1>

            <p className="cart-page-description">
              Check your selected products, update quantities,
              and continue to checkout when you're ready.
            </p>

          </div>


          <div className="cart-header-icon">
            <ShoppingBag size={30} />
          </div>

        </div>


        {/* =========================================
            CART CONTENT
            ========================================= */}

        <section className="cart-layout">


          {/* =======================================
              LEFT SIDE - CART ITEMS
              ======================================= */}

          <div className="cart-items-section">

            <div className="cart-section-heading">

              <div>

                <h2>
                  Shopping Cart
                </h2>

                <p>
                  Your selected products
                </p>

              </div>


              <span className="cart-item-count">

                {totalItems}{' '}

                {totalItems === 1
                  ? 'Item'
                  : 'Items'}

              </span>

            </div>


            {/* =====================================
                ACTION ERROR
                ===================================== */}

            {actionError && (

              <div
                className="cart-action-error"
                role="alert"
              >
                {actionError}
              </div>

            )}


            {/* =====================================
                EMPTY CART
                ===================================== */}

            {cartItems.length === 0 && (

              <div className="cart-empty-state">

                <div className="cart-empty-icon">
                  <ShoppingBag size={38} />
                </div>

                <h2>
                  Your cart is empty
                </h2>

                <p>
                  Looks like you haven't added anything
                  to your cart yet.
                </p>

                <Link
                  to="/products"
                  className="cart-browse-button"
                >
                  <ArrowLeft size={17} />

                  <span>
                    Continue Shopping
                  </span>

                </Link>

              </div>

            )}


            {/* =====================================
                REAL CART ITEMS
                ===================================== */}

            {cartItems.length > 0 && (

              <div className="cart-items-list">

                {cartItems.map((item) => {

                  // Find product information
                  // using the productId.
                  const product =
                    products[item.productId]


                  // Check whether this item is currently
                  // being updated.
                  const isUpdating =
                    updatingItemId === item.cartItemId


                  // Check whether this item is currently
                  // being removed.
                  const isRemoving =
                    removingItemId === item.cartItemId


                  return (

                    <article
                      className="cart-item-card"
                      key={item.cartItemId}
                    >


                      {/* =================================
                          PRODUCT IMAGE
                          ================================= */}

                      <div className="cart-item-image">

                        {product?.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={
                              product.productName ||
                              'Product'
                            }
                          />

                        ) : (

                          <ShoppingBag size={30} />

                        )}

                      </div>


                      {/* =================================
                          PRODUCT INFORMATION
                          ================================= */}

                      <div className="cart-item-content">

                        <div className="cart-item-top">

                          <div>

                            <p className="cart-item-category">

                              {product?.category?.categoryName ||
                                product?.category ||
                                'Product'}

                            </p>

                            <h3>

                              {product?.productName ||
                                `Product #${item.productId}`}

                            </h3>

                            <p className="cart-item-brand">

                              {product?.brand ||
                                'Brand unavailable'}

                            </p>

                          </div>


                          {/* Wishlist UI */}

                          <button
                            type="button"
                            className="cart-item-wishlist"
                            aria-label="Add product to wishlist"
                          >
                            <Heart size={18} />
                          </button>

                        </div>


                        {/* =================================
                            PRICE + QUANTITY + REMOVE
                            ================================= */}

                        <div className="cart-item-bottom">


                          {/* UNIT PRICE */}

                          <div className="cart-item-price">

                            <span>
                              Unit Price
                            </span>

                            <strong>
                              {formatPrice(item.unitPrice)}
                            </strong>

                          </div>


                          {/* QUANTITY */}

                          <div className="cart-item-quantity">

                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  Number(item.quantity) - 1
                                )
                              }
                              disabled={
                                isUpdating ||
                                isRemoving ||
                                Number(item.quantity) <= 1
                              }
                            >
                              <Minus size={15} />
                            </button>


                            <span>

                              {isUpdating
                                ? '...'
                                : item.quantity}

                            </span>


                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  Number(item.quantity) + 1
                                )
                              }
                              disabled={
                                isUpdating ||
                                isRemoving
                              }
                            >
                              <Plus size={15} />
                            </button>

                          </div>


                          {/* REMOVE */}

                          <button
                            type="button"
                            className="cart-item-remove"
                            aria-label="Remove product from cart"
                            onClick={() =>
                              handleRemoveItem(item)
                            }
                            disabled={
                              isUpdating ||
                              isRemoving
                            }
                          >
                            <Trash2 size={17} />

                            <span>
                              {isRemoving
                                ? 'Removing...'
                                : 'Remove'}
                            </span>

                          </button>

                        </div>

                      </div>

                    </article>

                  )

                })}

              </div>

            )}

          </div>


          {/* =======================================
              RIGHT SIDE - ORDER SUMMARY
              ======================================= */}

          <aside className="cart-summary">

            <div className="cart-summary-header">

              <h2>
                Order Summary
              </h2>

              <span>

                {totalItems}{' '}

                {totalItems === 1
                  ? 'Item'
                  : 'Items'}

              </span>

            </div>


            <div className="cart-summary-lines">

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatPrice(subtotal)}
                </strong>

              </div>


              <div>

                <span>
                  Delivery
                </span>

                <strong className="cart-free">

                  {delivery === 0
                    ? 'FREE'
                    : formatPrice(delivery)}

                </strong>

              </div>

            </div>


            <div className="cart-summary-divider"></div>


            <div className="cart-summary-total">

              <span>
                Total
              </span>

              <strong>
                {formatPrice(total)}
              </strong>

            </div>


            {/* =================================================
                PROCEED TO CHECKOUT
                =================================================

                The button is disabled when the cart is empty.

                When the cart contains products, clicking the
                button navigates the customer to:

                /checkout
                ================================================= */}

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate('/checkout')}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>


            <Link
              to="/products"
              className="cart-continue-link"
            >
              Continue Shopping
            </Link>


            {/* =====================================
                TRUST INFORMATION
                ===================================== */}

            <div className="cart-trust-list">

              <div className="cart-trust-item">

                <div className="cart-trust-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>

                  <strong>
                    Secure Checkout
                  </strong>

                  <span>
                    Your shopping experience is protected
                  </span>

                </div>

              </div>


              <div className="cart-trust-item">

                <div className="cart-trust-icon">
                  <Truck size={18} />
                </div>

                <div>

                  <strong>
                    Reliable Delivery
                  </strong>

                  <span>
                    Fast and convenient product delivery
                  </span>

                </div>

              </div>

            </div>

          </aside>

        </section>

      </div>

    </main>

  )

}


export default Cart