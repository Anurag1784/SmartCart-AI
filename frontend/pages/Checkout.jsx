import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Plus,
  X,
  Save,
  CreditCard,
} from 'lucide-react'

import './Checkout.css'
import { orderApi, productApi, paymentApi } from '../services/api'

function Checkout() {

  // =========================================================
  // CART STATE
  // =========================================================

  // Store cart items fetched from Order Service.
  const [cartItems, setCartItems] = useState([])

  // Store complete product information using productId as key.
  const [products, setProducts] = useState({})


  // =========================================================
  // ADDRESS STATE
  // =========================================================

  // Store all saved customer addresses.
  const [addresses, setAddresses] = useState([])

  // Store the currently selected address.
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  // Control whether Add Address form is visible.
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Track whether an address is being saved.
  const [savingAddress, setSavingAddress] = useState(false)

  // Store address-related errors.
  const [addressError, setAddressError] = useState('')


  // =========================================================
  // ADDRESS FORM STATE
  // =========================================================

  const [addressForm, setAddressForm] = useState({
    addressType: 'HOME',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })


  // =========================================================
  // ORDER STATE
  // =========================================================

  // Track whether an order is currently being created.
  const [placingOrder, setPlacingOrder] = useState(false)

  // Store order creation error.
  const [orderError, setOrderError] = useState('')

  // Store successfully created order.
  const [createdOrder, setCreatedOrder] = useState(null)

  // Store the payment created for the order.
  // Payment Service creates the Razorpay order on the backend.
  const [createdPayment, setCreatedPayment] = useState(null)

  // Track whether Razorpay Checkout is currently opening
  // or payment verification is in progress.
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  // Store payment-related information for the user.
  const [paymentMessage, setPaymentMessage] = useState('')


  // =========================================================
  // GENERAL STATE
  // =========================================================

  // Track checkout loading state.
  const [loading, setLoading] = useState(true)

  // Store general checkout errors.
  const [error, setError] = useState('')


  // =========================================================
  // GET CUSTOMER ID
  // =========================================================

  const getCustomerId = () => {

    // Get authentication information from localStorage.
    const storedAuth = sessionStorage.getItem('auth')

    if (!storedAuth) {
      return null
    }

    // Convert JSON string into JavaScript object.
    const auth = JSON.parse(storedAuth)

    // Return logged-in customer's user ID.
    return auth.user?.userId
  }


  // =========================================================
  // FETCH CHECKOUT DATA
  // =========================================================

  useEffect(() => {

    const fetchCheckoutData = async () => {

      try {

        setLoading(true)
        setError('')

        // Get logged-in customer ID.
        const customerId = getCustomerId()

        if (!customerId) {

          setError(
            'Unable to identify the logged-in customer.'
          )

          return
        }


        // =====================================================
        // FETCH CART
        // =====================================================

        const cartResponse = await orderApi.get(
          `/api/carts/customer/${customerId}`
        )

        const items =
          cartResponse.data.cartItems || []

        setCartItems(items)


        // =====================================================
        // FETCH PRODUCTS
        // =====================================================

        const productResponses = await Promise.all(

          items.map((item) =>
            productApi.get(
              `/api/products/${item.productId}`
            )
          )

        )


        // Create product map.
        const productMap = {}

        productResponses.forEach((response) => {

          const product = response.data

          productMap[product.productId] = product

        })

        setProducts(productMap)


        // =====================================================
        // FETCH CUSTOMER ADDRESSES
        // =====================================================

        const addressResponse = await orderApi.get(
          `/api/addresses/customer/${customerId}`
        )

        const customerAddresses =
          addressResponse.data || []

        setAddresses(customerAddresses)


        // Automatically select first address.
        if (customerAddresses.length > 0) {

          setSelectedAddressId(
            customerAddresses[0].addressId
          )

        }

      } catch (error) {

        console.error(
          'Checkout Fetch Error:',
          error
        )

        if (error.response) {

          setError(
            `Unable to load checkout information. Server returned ${error.response.status}.`
          )

        } else if (error.request) {

          setError(
            'Unable to connect to the backend services. Please make sure they are running.'
          )

        } else {

          setError(
            'Something went wrong while loading checkout information.'
          )

        }

      } finally {

        setLoading(false)

      }

    }

    fetchCheckoutData()

  }, [])


  // =========================================================
  // ADDRESS FORM INPUT HANDLER
  // =========================================================

  const handleAddressChange = (event) => {

    const { name, value } = event.target

    setAddressForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))

  }


  // =========================================================
  // OPEN ADDRESS FORM
  // =========================================================

  const handleOpenAddressForm = () => {

    setAddressError('')

    setShowAddressForm(true)

  }


  // =========================================================
  // CLOSE ADDRESS FORM
  // =========================================================

  const handleCloseAddressForm = () => {

    setAddressError('')

    setShowAddressForm(false)

  }


  // =========================================================
  // SAVE NEW ADDRESS
  // =========================================================

  const handleSaveAddress = async (event) => {

    event.preventDefault()

    try {

      setSavingAddress(true)
      setAddressError('')

      // Get logged-in customer ID.
      const customerId = getCustomerId()

      if (!customerId) {

        setAddressError(
          'Unable to identify the logged-in customer.'
        )

        return

      }


      // =====================================================
      // CREATE ADDRESS REQUEST
      // =====================================================

      const newAddress = {

        customerId: customerId,

        addressLine1:
          addressForm.addressLine1.trim(),

        addressLine2:
          addressForm.addressLine2.trim(),

        city:
          addressForm.city.trim(),

        state:
          addressForm.state.trim(),

        postalCode:
          addressForm.postalCode.trim(),

        country:
          addressForm.country.trim(),

        addressType:
          addressForm.addressType,

        // New addresses are not default unless explicitly changed later.
        isDefault:
          false,

        // Current backend requires createdAt.
        createdAt:
          new Date()
            .toISOString()
            .slice(0, 19),
      }


      // Send address to Order Service.
      const response = await orderApi.post(
        '/api/addresses',
        newAddress
      )


      // Get saved address returned by backend.
      const savedAddress = response.data


      // Add new address to existing address list.
      setAddresses((previousAddresses) => [
        ...previousAddresses,
        savedAddress,
      ])


      // Automatically select newly created address.
      setSelectedAddressId(
        savedAddress.addressId
      )


      // Reset address form.
      setAddressForm({
        addressType: 'HOME',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      })


      // Close address form.
      setShowAddressForm(false)

    } catch (error) {

      console.error(
        'Address Save Error:',
        error
      )

      if (error.response) {

        setAddressError(
          `Unable to save address. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        setAddressError(
          'Unable to connect to the Order Service.'
        )

      } else {

        setAddressError(
          'Something went wrong while saving the address.'
        )

      }

    } finally {

      setSavingAddress(false)

    }

  }


  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async () => {

    try {

      // Clear previous order error.
      setOrderError('')


      // -------------------------------------------------------
      // GET CUSTOMER ID
      // -------------------------------------------------------

      const customerId = getCustomerId()

      if (!customerId) {

        setOrderError(
          'Unable to identify the logged-in customer.'
        )

        return
      }


      // -------------------------------------------------------
      // VALIDATE ADDRESS
      // -------------------------------------------------------

      if (!selectedAddressId) {

        setOrderError(
          'Please select a delivery address before placing your order.'
        )

        return
      }


      // -------------------------------------------------------
      // VALIDATE CART
      // -------------------------------------------------------

      if (cartItems.length === 0) {

        setOrderError(
          'Your cart is empty. Please add products before placing an order.'
        )

        return
      }


      // -------------------------------------------------------
      // START ORDER CREATION
      // -------------------------------------------------------

      setPlacingOrder(true)


      // =======================================================
      // PREPARE ORDER ITEMS
      // =======================================================

      // We intentionally send only productId and quantity.
      //
      // The backend gets the real price and seller ID
      // from Product Service.
      //
      // This prevents the frontend from controlling
      // important order pricing information.

      const orderItems = cartItems.map((item) => ({

        productId:
          item.productId,

        quantity:
          item.quantity,

      }))


      // =======================================================
      // CREATE ORDER REQUEST
      // =======================================================

      const orderRequest = {

        // Basic order information.
        order: {

          customerId:
            customerId,

        },

        // Selected delivery address.
        addressId:
          selectedAddressId,

        // Products being ordered.
        orderItems:
          orderItems,

      }


      // =======================================================
      // SEND REQUEST TO ORDER SERVICE
      // =======================================================

      const response = await orderApi.post(
        '/api/orders',
        orderRequest
      )


      // =======================================================
      // STORE CREATED ORDER
      // =======================================================

      const savedOrder = response.data


      // =======================================================
      // CREATE PAYMENT
      // =======================================================

      // The order is now created in Order Service.
      // Next, ask Payment Service to create the Razorpay order.
      //
      // IMPORTANT:
      // The amount comes from the backend-created order,
      // not directly from the cart.

      const paymentRequest = {

        // SmartCart order ID created by Order Service.
        orderId:
          savedOrder.orderId,

        // Logged-in customer ID.
        customerId:
          customerId,

        // Final order amount returned by Order Service.
        amount:
          Number(savedOrder.totalAmount),

        // We are currently testing Razorpay with UPI.
        paymentMethod:
          'UPI',
      }


      // Send the payment request to Payment Service.
      const paymentResponse = await paymentApi.post(
        '/api/payments',
        paymentRequest
      )


      // Store Payment Service response.
      const savedPayment = paymentResponse.data


      // If Razorpay order creation failed,
      // don't show payment-ready screen.
      if (
        savedPayment.paymentStatus ===
        'FAILED'
      ) {

        throw new Error(
          savedPayment.failureReason ||
          'Unable to create the Razorpay payment order.'
        )
      }


      // Payment is now ready for Razorpay Checkout.
      setCreatedPayment(
        savedPayment
      )


      // Only show payment screen after both
      // Order Service and Payment Service succeeded.
      setCreatedOrder(
        savedOrder
      )

    } catch (error) {

      console.error(
        'Place Order Error:',
        error
      )


      // -------------------------------------------------------
      // BACKEND ERROR
      // -------------------------------------------------------

      if (error.response) {

        const responseData =
          error.response.data


        // Spring ResponseStatusException commonly
        // returns the error message in "detail".
        const backendMessage =
          responseData?.detail ||
          responseData?.message ||
          responseData?.error


        if (backendMessage) {

          setOrderError(
            backendMessage
          )

        } else {

          setOrderError(
            `Unable to place order. Server returned ${error.response.status}.`
          )

        }

      }


      // -------------------------------------------------------
      // NETWORK ERROR
      // -------------------------------------------------------

      else if (error.request) {

        setOrderError(
          'Unable to connect to the backend services. Please make sure they are running.'
        )

      }


      // -------------------------------------------------------
      // OTHER ERROR
      // -------------------------------------------------------

      else {

        setOrderError(
          error.message ||
          'Something went wrong while placing the order.'
        )

      }

    } finally {

      setPlacingOrder(false)

    }

  }


  // =========================================================
  // OPEN RAZORPAY CHECKOUT
  // =========================================================

  const handleOpenRazorpayCheckout = () => {

    // Clear any previous payment message.
    setPaymentMessage('')


    // =======================================================
    // CHECK RAZORPAY SDK
    // =======================================================

    // Razorpay Checkout is loaded from index.html.
    if (!window.Razorpay) {

      setPaymentMessage(
        'Razorpay Checkout could not be loaded. Please refresh the page and try again.'
      )

      return
    }


    // =======================================================
    // CHECK RAZORPAY KEY
    // =======================================================

    // Vite exposes only variables using the VITE_ prefix.
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {

      setPaymentMessage(
        'Razorpay Test Key ID is missing. Please check the frontend .env file.'
      )

      return
    }


    // =======================================================
    // CHECK PAYMENT INFORMATION
    // =======================================================

    // Payment Service must have already created
    // a Razorpay order.
    if (
      !createdPayment?.gatewayOrderId ||
      !createdPayment?.amount
    ) {

      setPaymentMessage(
        'Payment information is not ready yet. Please try again.'
      )

      return
    }


    // =======================================================
    // GET CUSTOMER INFORMATION
    // =======================================================

    let userEmail = ''
    let userName = ''

    try {

      const storedAuth =
        sessionStorage.getItem('auth')

      if (storedAuth) {

        const auth =
          JSON.parse(storedAuth)

        userEmail =
          auth.user?.email || ''

        userName = [
          auth.user?.firstName,
          auth.user?.lastName,
        ]
          .filter(Boolean)
          .join(' ')
      }

    } catch (error) {

      console.error(
        'Razorpay Prefill Error:',
        error
      )

    }


    // =======================================================
    // CONVERT AMOUNT TO PAISE
    // =======================================================

    // Razorpay expects INR amounts in paise.
    //
    // Example:
    // ₹59,999 → 5,999,900 paise.

    const amountInPaise =
      Math.round(
        Number(createdPayment.amount) * 100
      )


    // =======================================================
    // RAZORPAY CHECKOUT OPTIONS
    // =======================================================

    const options = {

      // Public Razorpay Test Key ID.
      //
      // IMPORTANT:
      // This is safe to expose in frontend.
      // The Razorpay Secret Key is NEVER placed here.
      key:
        import.meta.env.VITE_RAZORPAY_KEY_ID,

      // Amount in paise.
      amount:
        amountInPaise,

      // SmartCart uses INR.
      currency:
        'INR',

      // Store name shown by Razorpay.
      name:
        'SmartCart AI',

      // Payment description.
      description:
        `Payment for Order #${createdOrder.orderId}`,

      // Razorpay Order ID created by Payment Service.
      order_id:
        createdPayment.gatewayOrderId,

      // =====================================================
      // CUSTOMER PREFILL
      // =====================================================

      prefill: {

        name:
          userName,

        email:
          userEmail,
      },


      // =====================================================
      // SUCCESSFUL RAZORPAY CHECKOUT
      // =====================================================

      handler: async (response) => {

        console.log(
          'Razorpay payment response received:',
          response
        )

        try {

          // Customer completed Razorpay Checkout.
          //
          // Razorpay gives us:
          //
          // razorpay_order_id
          // razorpay_payment_id
          // razorpay_signature
          //
          // We DO NOT trust the browser response by itself.
          //
          // These values are sent to our backend.
          // Payment Service verifies the signature using
          // the backend-only Razorpay Secret Key.

          setPaymentProcessing(true)

          setPaymentMessage(
            'Verifying your payment securely...'
          )


          // =================================================
          // SEND RESPONSE TO PAYMENT SERVICE
          // =================================================

          const verificationResponse =
            await paymentApi.post(
              '/api/payments/verify',
              null,
              {
                params: {

                  // Razorpay Order ID.
                  razorpay_order_id:
                    response.razorpay_order_id,

                  // Razorpay Payment ID.
                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  // Razorpay generated signature.
                  razorpay_signature:
                    response.razorpay_signature,
                },
              }
            )


          // Payment Service returns the verified
          // SmartCart payment.
          const verifiedPayment =
            verificationResponse.data


          // =================================================
          // CHECK VERIFIED PAYMENT STATUS
          // =================================================

          if (
            verifiedPayment.paymentStatus !==
            'SUCCESS'
          ) {

            throw new Error(
              verifiedPayment.failureReason ||
              'Payment verification failed.'
            )
          }


          // =================================================
          // UPDATE PAYMENT STATE
          // =================================================

          setCreatedPayment(
            verifiedPayment
          )


          // =================================================
          // UPDATE ORDER STATE
          // =================================================

          // Payment Service also updates Order Service.
          //
          // We update the local React state immediately
          // so the UI does not need to reload to show
          // the successful payment.

          setCreatedOrder(
            (previousOrder) => ({

              ...previousOrder,

              paymentStatus:
                'SUCCESS',

              orderStatus:
                'CONFIRMED',

            })
          )


          // Stop payment loading state.
          setPaymentProcessing(false)


          // Show successful payment message.
          setPaymentMessage(
            'Payment successful! Your payment has been verified securely.'
          )

        } catch (error) {

          console.error(
            'Razorpay Payment Verification Error:',
            error
          )


          // Stop payment loading state.
          setPaymentProcessing(false)


          // =================================================
          // BACKEND ERROR
          // =================================================

          if (error.response) {

            const responseData =
              error.response.data

            const backendMessage =
              responseData?.detail ||
              responseData?.message ||
              responseData?.error

            setPaymentMessage(
              backendMessage ||
              `Payment verification failed. Server returned ${error.response.status}.`
            )

          }


          // =================================================
          // NETWORK ERROR
          // =================================================

          else if (error.request) {

            setPaymentMessage(
              'Unable to connect to Payment Service while verifying the payment.'
            )

          }


          // =================================================
          // OTHER ERROR
          // =================================================

          else {

            setPaymentMessage(
              error.message ||
              'Payment verification failed. Please contact support if money was deducted.'
            )

          }

        }

      },


      // =====================================================
      // RAZORPAY MODAL
      // =====================================================

      modal: {

        // Customer closed Razorpay without completing
        // the payment.
        ondismiss: () => {

          setPaymentProcessing(false)

          setPaymentMessage(
            'Payment window was closed. Your order is still waiting for payment.'
          )

        },

      },


      // =====================================================
      // RAZORPAY THEME
      // =====================================================

      theme: {

        color:
          '#111827',

      },

    }


    // =======================================================
    // OPEN RAZORPAY
    // =======================================================

    try {

      setPaymentProcessing(true)

      // Create Razorpay Checkout instance.
      const razorpay =
        new window.Razorpay(options)


      // =====================================================
      // HANDLE RAZORPAY PAYMENT FAILURE
      // =====================================================

      razorpay.on(
        'payment.failed',
        (response) => {

          console.error(
            'Razorpay Payment Failed:',
            response.error
          )

          setPaymentProcessing(false)

          setPaymentMessage(
            response.error?.description ||
            'Payment failed. Please try again.'
          )

        }
      )


      // Open Razorpay Checkout popup.
      razorpay.open()

    } catch (error) {

      console.error(
        'Razorpay Checkout Error:',
        error
      )

      setPaymentProcessing(false)

      setPaymentMessage(
        'Unable to open Razorpay Checkout. Please try again.'
      )

    }

  }


  // =========================================================
  // CALCULATE CART TOTALS
  // =========================================================

  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    )


  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.unitPrice || 0) *
        item.quantity,
      0
    )


  // Delivery is currently free.
  const delivery = 0


  // Displayed checkout total.
  const total =
    subtotal + delivery


  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {

    return `₹${Number(price).toLocaleString('en-IN')}`

  }


  // =========================================================
  // FORMAT ADDRESS
  // =========================================================

  const formatAddress = (address) => {

    const parts = [

      address.addressLine1,

      address.addressLine2,

      address.city,

      address.state,

      address.postalCode,

      address.country,

    ]

    return parts
      .filter(Boolean)
      .join(', ')

  }


  // =========================================================
  // SUCCESSFUL ORDER / PAYMENT SCREEN
  // =========================================================

  if (createdOrder) {

    return (

      <main className="checkout-page">

        <div className="checkout-container">

          <div className="checkout-message checkout-success">

            <CheckCircle2 size={60} />

            <p className="checkout-label">
              ORDER CREATED
            </p>

            <h1>
              Your Order Is <span>Ready</span>
            </h1>

            <p>
              Your order has been successfully created
              and is currently waiting for payment.
            </p>


            {/* =================================================
                ORDER ID
                ================================================= */}

            <div className="checkout-success-order">

              <span>
                Order ID
              </span>

              <strong>
                #{createdOrder.orderId}
              </strong>

            </div>


            {/* =================================================
                ORDER STATUS
                ================================================= */}

            <div className="checkout-success-status">

              <div>

                <span>
                  Order Status
                </span>

                <strong>
                  {createdOrder.orderStatus}
                </strong>

              </div>


              <div>

                <span>
                  Payment Status
                </span>

                <strong>
                  {createdOrder.paymentStatus}
                </strong>

              </div>

            </div>


            {/* =================================================
                TOTAL
                ================================================= */}

            <div className="checkout-success-total">

              <span>
                Order Total
              </span>

              <strong>
                {formatPrice(
                  createdOrder.totalAmount
                )}
              </strong>

            </div>


            {/* =================================================
                PAYMENT INFORMATION
                ================================================= */}

            <div className="checkout-payment-notice">

              <CreditCard size={21} />

              <div>

                <strong>

                  {createdPayment?.paymentStatus ===
                  'SUCCESS'
                    ? 'Payment Verified'
                    : 'Payment Ready'}

                </strong>

                <p>

                  {createdPayment?.paymentStatus ===
                  'SUCCESS'

                    ? 'Your payment has been successfully verified by SmartCart.'

                    : 'Your payment order has been created successfully. Razorpay Checkout is ready for payment.'}

                </p>


                {createdPayment?.gatewayOrderId && (

                  <small>
                    Razorpay Order: {createdPayment.gatewayOrderId}
                  </small>

                )}

              </div>

            </div>


            {/* =================================================
                RAZORPAY PAY NOW BUTTON
                ================================================= */}

            {createdPayment?.paymentStatus !==
              'SUCCESS' && (

              <button
                type="button"
                className="checkout-place-order-button"
                onClick={handleOpenRazorpayCheckout}
                disabled={paymentProcessing}
              >

                {paymentProcessing ? (

                  <>
                    Verifying Payment...
                  </>

                ) : (

                  <>
                    <CreditCard size={19} />
                    Pay Now with Razorpay
                  </>

                )}

              </button>

            )}


            {/* =================================================
                PAYMENT MESSAGE
                ================================================= */}

            {paymentMessage && (

              <div className="checkout-payment-notice">

                <CreditCard size={21} />

                <div>

                  <strong>
                    Payment Information
                  </strong>

                  <p>
                    {paymentMessage}
                  </p>

                </div>

              </div>

            )}


            {/* =================================================
                CONTINUE SHOPPING
                ================================================= */}

            <Link
              to="/products"
              className="checkout-back-button"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </main>

    )

  }


  // =========================================================
  // MAIN CHECKOUT RENDER
  // =========================================================

  return (

    <main className="checkout-page">

      <div className="checkout-container">


        {/* ===================================================
            CHECKOUT HEADER
            =================================================== */}

        <div className="checkout-header">

          <p className="checkout-label">
            SMART CHECKOUT
          </p>

          <h1>
            Complete Your <span>Order</span>
          </h1>

          <p className="checkout-description">

            Review your order, choose your delivery address,
            and complete your purchase securely.

          </p>

        </div>


        {/* ===================================================
            LOADING STATE
            =================================================== */}

        {loading && (

          <div className="checkout-message">

            <ShoppingBag size={32} />

            <h2>
              Loading Your Checkout...
            </h2>

            <p>
              Please wait while we prepare your order.
            </p>

          </div>

        )}


        {/* ===================================================
            ERROR STATE
            =================================================== */}

        {!loading &&
          error && (

          <div className="checkout-message checkout-error">

            <h2>
              Unable to Load Checkout
            </h2>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* ===================================================
            EMPTY CART
            =================================================== */}

        {!loading &&
          !error &&
          cartItems.length === 0 && (

          <div className="checkout-message">

            <ShoppingBag size={40} />

            <h2>
              Your Cart Is Empty
            </h2>

            <p>

              Add some products to your cart before
              proceeding to checkout.

            </p>

            <Link
              to="/products"
              className="checkout-back-button"
            >
              Browse Products
            </Link>

          </div>

        )}


        {/* ===================================================
            CHECKOUT CONTENT
            =================================================== */}

        {!loading &&
          !error &&
          cartItems.length > 0 && (

          <div className="checkout-content">


            {/* =============================================
                LEFT SIDE
                ============================================= */}

            <div className="checkout-left">


              {/* =========================================
                  STEP 1 - DELIVERY ADDRESS
                  ========================================= */}

              <section className="checkout-section">

                <div className="checkout-section-header">

                  <div>

                    <p className="checkout-section-label">
                      STEP 1
                    </p>

                    <h2>
                      Delivery Address
                    </h2>

                  </div>

                  <Truck size={26} />

                </div>


                {/* =======================================
                    SAVED ADDRESSES
                    ======================================= */}

                {addresses.length > 0 && (

                  <div className="checkout-addresses">

                    {addresses.map((address) => (

                      <label
                        key={address.addressId}
                        className={
                          `checkout-address-card ${
                            selectedAddressId ===
                            address.addressId
                              ? 'selected'
                              : ''
                          }`
                        }
                      >

                        <input
                          type="radio"
                          name="deliveryAddress"
                          value={address.addressId}
                          checked={
                            selectedAddressId ===
                            address.addressId
                          }
                          onChange={() =>
                            setSelectedAddressId(
                              address.addressId
                            )
                          }
                        />


                        <div className="checkout-address-icon">

                          <MapPin size={21} />

                        </div>


                        <div className="checkout-address-info">

                          <div className="checkout-address-top">

                            <strong>
                              {address.addressType ||
                                'Delivery Address'}
                            </strong>

                            {selectedAddressId ===
                              address.addressId && (

                              <span className="checkout-selected-badge">

                                <CheckCircle2 size={15} />

                                Selected

                              </span>

                            )}

                          </div>


                          <p>
                            {formatAddress(address)}
                          </p>

                        </div>

                      </label>

                    ))}

                  </div>

                )}


                {/* =======================================
                    NO ADDRESS MESSAGE
                    ======================================= */}

                {addresses.length === 0 &&
                  !showAddressForm && (

                  <div className="checkout-no-address">

                    <div className="checkout-no-address-icon">

                      <MapPin size={23} />

                    </div>

                    <div>

                      <strong>
                        No Saved Address
                      </strong>

                      <p>

                        You don't have a delivery address
                        saved yet.

                      </p>

                    </div>

                  </div>

                )}


                {/* =======================================
                    ADD ADDRESS BUTTON
                    ======================================= */}

                {!showAddressForm && (

                  <button
                    type="button"
                    className="checkout-add-address-button"
                    onClick={handleOpenAddressForm}
                  >

                    <Plus size={19} />

                    <span>
                      Add New Address
                    </span>

                  </button>

                )}


                {/* =======================================
                    ADD ADDRESS FORM
                    ======================================= */}

                {showAddressForm && (

                  <form
                    className="checkout-address-form"
                    onSubmit={handleSaveAddress}
                  >

                    <div className="checkout-address-form-header">

                      <div>

                        <p className="checkout-section-label">
                          NEW ADDRESS
                        </p>

                        <h3>
                          Add Delivery Address
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="checkout-close-form-button"
                        onClick={handleCloseAddressForm}
                        aria-label="Close address form"
                      >

                        <X size={20} />

                      </button>

                    </div>


                    {/* Address Type */}

                    <div className="checkout-form-group">

                      <label htmlFor="addressType">
                        Address Type
                      </label>

                      <select
                        id="addressType"
                        name="addressType"
                        value={addressForm.addressType}
                        onChange={handleAddressChange}
                        required
                      >

                        <option value="HOME">
                          Home
                        </option>

                        <option value="WORK">
                          Work
                        </option>

                        <option value="OTHER">
                          Other
                        </option>

                      </select>

                    </div>


                    {/* Address Line 1 */}

                    <div className="checkout-form-group">

                      <label htmlFor="addressLine1">
                        Address Line 1
                      </label>

                      <input
                        id="addressLine1"
                        name="addressLine1"
                        type="text"
                        value={addressForm.addressLine1}
                        onChange={handleAddressChange}
                        placeholder="House / Flat / Street"
                        required
                      />

                    </div>


                    {/* Address Line 2 */}

                    <div className="checkout-form-group">

                      <label htmlFor="addressLine2">

                        Address Line 2

                        <span>
                          Optional
                        </span>

                      </label>

                      <input
                        id="addressLine2"
                        name="addressLine2"
                        type="text"
                        value={addressForm.addressLine2}
                        onChange={handleAddressChange}
                        placeholder="Apartment, landmark, area"
                      />

                    </div>


                    {/* City + State */}

                    <div className="checkout-form-row">

                      <div className="checkout-form-group">

                        <label htmlFor="city">
                          City
                        </label>

                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          required
                        />

                      </div>


                      <div className="checkout-form-group">

                        <label htmlFor="state">
                          State
                        </label>

                        <input
                          id="state"
                          name="state"
                          type="text"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="State"
                          required
                        />

                      </div>

                    </div>


                    {/* Postal Code + Country */}

                    <div className="checkout-form-row">

                      <div className="checkout-form-group">

                        <label htmlFor="postalCode">
                          Postal Code
                        </label>

                        <input
                          id="postalCode"
                          name="postalCode"
                          type="text"
                          value={addressForm.postalCode}
                          onChange={handleAddressChange}
                          placeholder="Postal code"
                          required
                        />

                      </div>


                      <div className="checkout-form-group">

                        <label htmlFor="country">
                          Country
                        </label>

                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={addressForm.country}
                          onChange={handleAddressChange}
                          placeholder="Country"
                          required
                        />

                      </div>

                    </div>


                    {/* Address Error */}

                    {addressError && (

                      <div className="checkout-address-error">

                        {addressError}

                      </div>

                    )}


                    {/* Form Actions */}

                    <div className="checkout-form-actions">

                      <button
                        type="button"
                        className="checkout-cancel-address-button"
                        onClick={handleCloseAddressForm}
                        disabled={savingAddress}
                      >
                        Cancel
                      </button>


                      <button
                        type="submit"
                        className="checkout-save-address-button"
                        disabled={savingAddress}
                      >

                        {savingAddress ? (

                          <>
                            Saving...
                          </>

                        ) : (

                          <>
                            <Save size={18} />
                            Save Address
                          </>

                        )}

                      </button>

                    </div>

                  </form>

                )}

              </section>


              {/* =========================================
                  STEP 2 - REVIEW ITEMS
                  ========================================= */}

              <section className="checkout-section">

                <div className="checkout-section-header">

                  <div>

                    <p className="checkout-section-label">
                      STEP 2
                    </p>

                    <h2>
                      Review Your Items
                    </h2>

                  </div>

                  <ShoppingBag size={26} />

                </div>


                <div className="checkout-items">

                  {cartItems.map((item) => {

                    const product =
                      products[item.productId]

                    return (

                      <article
                        className="checkout-item"
                        key={item.productId}
                      >

                        <div className="checkout-item-image">

                          {product?.imageUrl ? (

                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                            />

                          ) : (

                            <span>
                              📦
                            </span>

                          )}

                        </div>


                        <div className="checkout-item-info">

                          <h3>
                            {product?.productName ||
                              'Product'}
                          </h3>

                          <p>
                            {product?.brand || 'N/A'}
                          </p>

                          <span>
                            Quantity: {item.quantity}
                          </span>

                        </div>


                        <div className="checkout-item-price">

                          <span>
                            {formatPrice(
                              item.unitPrice
                            )}
                          </span>

                          <small>
                            {formatPrice(
                              Number(
                                item.unitPrice
                              ) *
                              item.quantity
                            )}
                          </small>

                        </div>

                      </article>

                    )

                  })}

                </div>

              </section>

            </div>


            {/* =============================================
                RIGHT SIDE - ORDER SUMMARY
                ============================================= */}

            <aside className="checkout-summary">

              <div className="checkout-summary-header">

                <div>

                  <p className="checkout-section-label">
                    YOUR ORDER
                  </p>

                  <h2>
                    Order Summary
                  </h2>

                </div>

                <ShoppingBag size={26} />

              </div>


              {/* Item Count */}

              <div className="checkout-summary-row">

                <span>
                  Items ({totalItems})
                </span>

                <span>
                  {formatPrice(subtotal)}
                </span>

              </div>


              {/* Subtotal */}

              <div className="checkout-summary-row">

                <span>
                  Subtotal
                </span>

                <span>
                  {formatPrice(subtotal)}
                </span>

              </div>


              {/* Delivery */}

              <div className="checkout-summary-row">

                <span>
                  Delivery
                </span>

                <span className="checkout-free">
                  FREE
                </span>

              </div>


              {/* Divider */}

              <div className="checkout-summary-divider"></div>


              {/* Total */}

              <div className="checkout-total-row">

                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(total)}
                </strong>

              </div>


              {/* Order Error */}

              {orderError && (

                <div className="checkout-order-error">

                  {orderError}

                </div>

              )}


              {/* Place Order Button */}

              <button
                type="button"
                className="checkout-place-order-button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >

                {placingOrder ? (

                  <>
                    Creating Order...
                  </>

                ) : (

                  <>
                    <ShoppingBag size={19} />
                    Place Order
                  </>

                )}

              </button>


              {/* Security Information */}

              <div className="checkout-security">

                <ShieldCheck size={20} />

                <div>

                  <strong>
                    Secure Checkout
                  </strong>

                  <p>
                    Your order information is securely
                    processed.
                  </p>

                </div>

              </div>

            </aside>

          </div>

        )}

      </div>

    </main>

  )

}

export default Checkout