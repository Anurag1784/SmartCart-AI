import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
} from 'lucide-react'

import { useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import './OrderDetails.css'

import { orderApi, productApi } from '../services/api'


// =========================================================
// ORDER DETAILS COMPONENT
// =========================================================

function OrderDetails() {

  // =========================================================
  // GET ORDER ID FROM URL
  // =========================================================

  const { orderId } = useParams()


  // =========================================================
  // STATE
  // =========================================================

  // Stores the complete order returned by Order Service.
  const [order, setOrder] = useState(null)

  // Stores product information using productId as the key.
  //
  // Example:
  //
  // {
  //   7: {
  //     productName: 'Samsung Galaxy S25',
  //     brand: 'Samsung',
  //     imageUrl: '...'
  //   }
  // }
  const [products, setProducts] = useState({})

  // Controls the initial order loading state.
  const [loading, setLoading] = useState(true)

  // Stores an error message when the order cannot be loaded.
  const [error, setError] = useState('')

  // Controls the cancellation request state.
  const [cancelling, setCancelling] = useState(false)

  // Stores a message specifically for cancellation.
  const [cancelMessage, setCancelMessage] = useState('')


  // =========================================================
  // FETCH ORDER + PRODUCT DETAILS
  // =========================================================

  useEffect(() => {

    const fetchOrder = async () => {

      try {

        // Clear any previous error.
        setError('')

        // Reset product information before loading the order.
        setProducts({})


        // =====================================================
        // FETCH ORDER FROM ORDER SERVICE
        // =====================================================

        // Request the selected order from Order Service.
        const response = await orderApi.get(
          `/api/orders/${orderId}`
        )

        // Store the complete order response.
        const orderData = response.data

        setOrder(orderData)


        // =====================================================
        // FETCH PRODUCT INFORMATION
        // =====================================================

        // Get all product IDs from the order items.
        const productIds = [
          ...new Set(
            (orderData.orderItems || [])
              .map((item) => item.productId)
              .filter(Boolean)
          ),
        ]


        // If the order does not contain any products,
        // there is nothing else to fetch.
        if (productIds.length === 0) {
          return
        }


        // Fetch every product from Product Service.
        //
        // Promise.allSettled is used so that if one product
        // cannot be loaded, the complete order page does not fail.
        const productResults = await Promise.allSettled(
          productIds.map((productId) =>
            productApi.get(`/api/products/${productId}`)
          )
        )


        // Create a lookup object for the fetched products.
        const productMap = {}


        // Process every Product Service response.
        productResults.forEach((result, index) => {

          // Only use successfully fetched products.
          if (result.status === 'fulfilled') {

            const productId = productIds[index]

            productMap[productId] = result.value.data
          }
        })


        // Store the product lookup map.
        setProducts(productMap)

      } catch (error) {

        // Log the actual error for debugging.
        console.error(
          'Order Details Fetch Error:',
          error
        )


        // Handle server-side errors.
        if (error.response) {

          setError(
            `Unable to load order. Server returned ${error.response.status}.`
          )

        // Handle connection errors.
        } else if (error.request) {

          setError(
            'Unable to connect to Order Service. Please make sure it is running.'
          )

        // Handle any other unexpected error.
        } else {

          setError(
            'Something went wrong while loading the order.'
          )
        }

      } finally {

        // The order request has completed.
        setLoading(false)
      }
    }


    // Start loading the selected order.
    fetchOrder()

  }, [orderId])


  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {

    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {

    // Handle missing date.
    if (!date) {
      return 'Date unavailable'
    }


    try {

      // Convert the backend date into a readable Indian date.
      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )

    } catch {

      // Fallback when date formatting fails.
      return 'Date unavailable'
    }
  }


  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {

    // Handle missing status.
    if (!status) {
      return 'UNKNOWN'
    }


    // Convert:
    //
    // PENDING_PAYMENT
    //
    // into:
    //
    // PENDING PAYMENT
    return status.replaceAll('_', ' ')
  }


  // =========================================================
  // GET PRODUCT INFORMATION
  // =========================================================

  const getProduct = (productId) => {

    // Return the product from our lookup map.
    return products[productId]
  }


  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const handleCancelOrder = async () => {

    // Ask the customer for confirmation before cancelling.
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    )

    // Stop if the customer selects Cancel.
    if (!confirmed) {
      return
    }


    try {

      // Show cancellation loading state.
      setCancelling(true)

      // Clear any previous cancellation message.
      setCancelMessage('')


      // Send cancellation request to Order Service.
      const response = await orderApi.put(
        `/api/orders/${orderId}/cancel`
      )


      // Update the displayed order with the cancelled order.
      setOrder(response.data)


      // Show success message.
      setCancelMessage(
        'Order cancelled successfully.'
      )

    } catch (error) {

      // Log the actual error for debugging.
      console.error(
        'Cancel Order Error:',
        error
      )


      // Show backend error message when available.
      if (error.response?.data?.message) {

        setCancelMessage(
          error.response.data.message
        )

      } else {

        // Fallback message.
        setCancelMessage(
          'Unable to cancel the order. Please try again.'
        )
      }

    } finally {

      // Stop cancellation loading state.
      setCancelling(false)
    }
  }


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {

    return (
      <main className="order-details-page">

        <div className="order-details-container">

          <div className="order-details-message">

            <Package size={38} />

            <h2>
              Loading Order...
            </h2>

            <p>
              Please wait while we fetch your order details.
            </p>

          </div>

        </div>

      </main>
    )
  }


  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error || !order) {

    return (
      <main className="order-details-page">

        <div className="order-details-container">

          <div className="order-details-message">

            <Package size={38} />

            <h2>
              Unable to Load Order
            </h2>

            <p>
              {error || 'Order details could not be found.'}
            </p>

            <Link
              to="/orders"
              className="order-details-back-button"
            >
              <ArrowLeft size={17} />

              Back to Orders
            </Link>

          </div>

        </div>

      </main>
    )
  }


  // =========================================================
  // ORDER DATA
  // =========================================================

  // Get the delivery address from the order.
  const address = order.address

  // Get order items.
  const orderItems = order.orderItems || []


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="order-details-page">

      <div className="order-details-container">


        {/* =====================================================
            BACK LINK
            ===================================================== */}

        <Link
          to="/orders"
          className="order-details-back"
        >
          <ArrowLeft size={17} />

          <span>
            Back to Orders
          </span>
        </Link>


        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <div className="order-details-header">

          <p className="order-details-label">
            ORDER DETAILS
          </p>

          <h1>
            Order <span>#{order.orderId}</span>
          </h1>

          <p className="order-details-description">
            Review your order information, items,
            delivery address, and payment status.
          </p>

        </div>


        {/* =====================================================
            ORDER STATUS
            ===================================================== */}

        <section className="order-status-grid">


          {/* ===================================================
              ORDER STATUS CARD
              =================================================== */}

          <div className="order-status-card">

            <div className="order-status-icon">
              <Package size={22} />
            </div>

            <div>

              <span>
                ORDER STATUS
              </span>

              <strong>
                {formatStatus(order.orderStatus)}
              </strong>

            </div>

          </div>


          {/* ===================================================
              PAYMENT STATUS CARD
              =================================================== */}

          <div className="order-status-card">

            <div className="order-status-icon">
              <CreditCard size={22} />
            </div>

            <div>

              <span>
                PAYMENT STATUS
              </span>

              <strong>
                {formatStatus(order.paymentStatus)}
              </strong>

            </div>

          </div>


          {/* ===================================================
              ORDER DATE CARD
              =================================================== */}

          <div className="order-status-card">

            <div className="order-status-icon">
              <CalendarDays size={22} />
            </div>

            <div>

              <span>
                ORDER DATE
              </span>

              <strong>
                {formatDate(order.createdAt)}
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            MAIN CONTENT
            ===================================================== */}

        <div className="order-details-content">


          {/* ===================================================
              ORDER ITEMS
              =================================================== */}

          <section className="order-details-section">

            <div className="order-details-section-header">

              <div>

                <p className="order-details-section-label">
                  PURCHASE
                </p>

                <h2>
                  Order Items
                </h2>

              </div>

              <div className="order-details-section-icon">
                <Package size={23} />
              </div>

            </div>


            {/* =================================================
                ORDER ITEMS LIST
                ================================================= */}

            <div className="order-items-list">

              {orderItems.map((item) => {

                // Find the corresponding product fetched
                // from Product Service.
                const product = getProduct(item.productId)


                return (
                  <article
                    className="order-item"
                    key={
                      item.orderItemId ||
                      item.productId
                    }
                  >


                    {/* =========================================
                        PRODUCT IMAGE
                        ========================================= */}

                    <div className="order-item-image">

                      {product?.imageUrl ? (

                        <img
                          src={product.imageUrl}
                          alt={
                            product.productName ||
                            `Product ${item.productId}`
                          }

                          onError={(event) => {

                            // Hide a broken product image.
                            event.currentTarget.style.display =
                              'none'

                            // Show the package icon
                            // when the image fails.
                            const fallback =
                              event.currentTarget
                                .nextElementSibling

                            if (fallback) {
                              fallback.style.display = 'block'
                            }
                          }}
                        />

                      ) : null}


                      {/* =======================================
                          IMAGE FALLBACK
                          ======================================= */}

                      <Package
                        size={30}
                        style={{
                          display:
                            product?.imageUrl
                              ? 'none'
                              : 'block',
                        }}
                      />

                    </div>


                    {/* =========================================
                        PRODUCT INFORMATION
                        ========================================= */}

                    <div className="order-item-info">

                      <h3>
                        {
                          product?.productName ||
                          `Product #${item.productId}`
                        }
                      </h3>


                      {/* Show the product brand when
                          Product Service provides it. */}

                      {product?.brand && (
                        <p>
                          {product.brand}
                        </p>
                      )}


                      {/* Keep seller information from
                          the Order Service. */}

                      <p>
                        Seller ID: {item.sellerId}
                      </p>


                      <span>
                        Quantity: {item.quantity}
                      </span>

                    </div>


                    {/* =========================================
                        PRODUCT PRICE
                        ========================================= */}

                    <div className="order-item-price">

                      {/* Unit price is taken from the
                          historical OrderItem record.

                          We intentionally do not replace it
                          with the current Product Service price. */}

                      <span>
                        {formatCurrency(item.unitPrice)}
                      </span>

                      {/* Subtotal is also taken directly
                          from the Order Service. */}

                      <strong>
                        {formatCurrency(item.subtotal)}
                      </strong>

                    </div>

                  </article>
                )
              })}

            </div>

          </section>


          {/* ===================================================
              DELIVERY ADDRESS
              =================================================== */}

          <section className="order-details-section">

            <div className="order-details-section-header">

              <div>

                <p className="order-details-section-label">
                  DELIVERY
                </p>

                <h2>
                  Delivery Address
                </h2>

              </div>

              <div className="order-details-section-icon">
                <MapPin size={23} />
              </div>

            </div>


            {/* =================================================
                ADDRESS AVAILABLE
                ================================================= */}

            {address ? (

              <div className="order-address-card">

                <div className="order-address-icon">
                  <MapPin size={23} />
                </div>


                <div>

                  <strong>
                    {address.addressType ||
                      'Delivery Address'}
                  </strong>


                  <p>
                    {address.addressLine1}
                  </p>


                  {address.addressLine2 && (

                    <p>
                      {address.addressLine2}
                    </p>

                  )}


                  <p>
                    {address.city}, {address.state}
                  </p>


                  <p>
                    {address.postalCode},{' '}
                    {address.country}
                  </p>

                </div>

              </div>

            ) : (


              /* ===============================================
                 ADDRESS UNAVAILABLE
                 =============================================== */

              <div className="order-address-empty">

                <MapPin size={22} />

                <p>
                  Delivery address information is unavailable.
                </p>

              </div>

            )}

          </section>

        </div>


        {/* =====================================================
            ORDER TOTAL
            ===================================================== */}

        <section className="order-total-section">

          <div>

            <p>
              ORDER TOTAL
            </p>

            <h2>
              {formatCurrency(order.totalAmount)}
            </h2>

          </div>


          <div className="order-total-icon">
            <CheckCircle2 size={25} />
          </div>

        </section>


        {/* =====================================================
            CANCEL ORDER
            ===================================================== */}

        {order.orderStatus !== 'CANCELLED' &&
         order.orderStatus !== 'DELIVERED' &&
         order.orderStatus !== 'COMPLETED' && (

          <div className="order-cancel-section">

            <button
              type="button"
              className="order-cancel-button"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling
                ? 'Cancelling Order...'
                : 'Cancel Order'}
            </button>

            {cancelMessage && (
              <p className="order-cancel-message">
                {cancelMessage}
              </p>
            )}

          </div>
        )}


        {/* =====================================================
            SECURITY INFORMATION
            ===================================================== */}

        <div className="order-security">

          <ShieldCheck size={22} />

          <div>

            <strong>
              Secure Order
            </strong>

            <p>
              Your order information is securely
              processed and protected.
            </p>

          </div>

        </div>

      </div>

    </main>
  )
}


export default OrderDetails