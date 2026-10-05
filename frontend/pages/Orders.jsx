import {

  ArrowRight,

  CalendarDays,

  Package,

  ShoppingBag,

} from 'lucide-react'



import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'



import './Orders.css'



import { orderApi, productApi } from '../services/api'





function Orders() {



  // =========================================================

  // NAVIGATION

  // =========================================================



  // Used to navigate the user to the Order Details page.

  const navigate = useNavigate()





  // =========================================================

  // ORDERS STATE

  // =========================================================



  // Stores all orders belonging to the logged-in customer.

  const [orders, setOrders] = useState([])



  // Stores product information using productId as the key.

  const [products, setProducts] = useState({})



  // Controls the loading state while orders are being fetched.

  const [loading, setLoading] = useState(true)



  // Stores an error message if loading orders fails.

  const [error, setError] = useState('')





  // =========================================================

  // GET CUSTOMER ID

  // =========================================================



  const getCustomerId = () => {



    // Get saved authentication information.

    const storedAuth = sessionStorage.getItem('auth')



    // Stop if authentication information does not exist.

    if (!storedAuth) {

      return null

    }



    try {



      // Convert sessionStorage JSON into a JavaScript object.

      const auth = JSON.parse(storedAuth)



      // Return the logged-in customer's user ID.

      return auth.user?.userId || null



    } catch (error) {



      // Handle invalid authentication data safely.

      console.error(

        'Authentication Data Error:',

        error

      )



      return null

    }

  }





  // =========================================================

  // FETCH CUSTOMER ORDERS

  // =========================================================



  useEffect(() => {



    const fetchOrders = async () => {



      try {



        // Clear previous error.

        setError('')



        // Get logged-in customer ID.

        const customerId = getCustomerId()



        // Make sure customer ID exists.

        if (!customerId) {



          setError(

            'Unable to identify the logged-in customer.'

          )



          return

        }



        // Request all orders belonging to this customer.

        const response = await orderApi.get(

          `/api/orders/customer/${customerId}`

        )



        // Save real backend orders into state.

        const ordersData = Array.isArray(response.data)

          ? response.data

          : []



        setOrders(ordersData)





        // =====================================================

        // FETCH PRODUCT INFORMATION

        // =====================================================



        // Collect every unique product ID used by the customer's

        // orders so we can display product names instead of the

        // internal order ID.

        const productIds = [

          ...new Set(

            ordersData

              .flatMap((order) => order.orderItems || [])

              .map((item) => item.productId)

              .filter(Boolean)

          ),

        ]





        // Clear the product lookup when there are no order items.

        if (productIds.length === 0) {

          setProducts({})

          return

        }





        // Fetch product information without allowing one failed

        // product request to break the complete orders page.

        const productResults = await Promise.allSettled(

          productIds.map((productId) =>

            productApi.get(`/api/products/${productId}`)

          )

        )





        // Create a product lookup map using productId as the key.

        const productMap = {}





        productResults.forEach((result, index) => {

          if (result.status === 'fulfilled') {

            const productId = productIds[index]

            productMap[productId] = result.value.data

          }

        })





        setProducts(productMap)





      } catch (error) {



        console.error(

          'Orders Fetch Error:',

          error

        )



        if (error.response) {



          setError(

            `Unable to load orders. Server returned ${error.response.status}.`

          )



        } else if (error.request) {



          setError(

            'Unable to connect to Order Service. Please make sure it is running.'

          )



        } else {



          setError(

            'Something went wrong while loading your orders.'

          )

        }



      } finally {



        // Loading is finished.

        setLoading(false)

      }

    }





    fetchOrders()



  }, [])





  // =========================================================

  // VIEW ORDER

  // =========================================================



  const handleViewOrder = (orderId) => {



    // Navigate directly to the dynamic Order Details page.

    //

    // Example:

    // orderId = 14

    //        ↓

    // /orders/14

    navigate(`/orders/${orderId}`)

  }





  // =========================================================

  // FORMAT DATE

  // =========================================================



  const formatOrderDate = (date) => {



    if (!date) {

      return 'Order date unavailable'

    }



    try {



      const orderDate = new Date(date)



      return orderDate.toLocaleDateString(

        'en-IN',

        {

          day: 'numeric',

          month: 'short',

          year: 'numeric',

        }

      )



    } catch {



      return 'Order date unavailable'

    }

  }





  // =========================================================

  // FORMAT CURRENCY

  // =========================================================



  const formatCurrency = (amount) => {



    return `₹${Number(amount || 0).toLocaleString('en-IN')}`

  }





  // =========================================================

  // CALCULATE ITEM COUNT

  // =========================================================



  const getItemCount = (order) => {



    if (!order.orderItems) {

      return 0

    }



    return order.orderItems.reduce(

      (total, item) =>

        total + Number(item.quantity || 0),

      0

    )

  }





  // =========================================================

  // GET ORDER DISPLAY NAME

  // =========================================================



  const getOrderDisplayName = (order) => {



    const orderItems = order?.orderItems || []



    const productNames = orderItems

      .map((item) => products[item.productId]?.productName)

      .filter(Boolean)





    // If product information is not available,

    // use a neutral fallback.

    if (productNames.length === 0) {

      return 'Order'

    }





    // Single-product order.

    if (productNames.length === 1) {

      return productNames[0]

    }





    // Multiple-product order.

    return `${productNames[0]} + ${productNames.length - 1} more`

  }





  // =========================================================

  // FORMAT STATUS

  // =========================================================



  const formatStatus = (status) => {



    if (!status) {

      return 'UNKNOWN'

    }



    return status.replaceAll('_', ' ')

  }





  // =========================================================

  // RENDER

  // =========================================================



  return (

    <main className="orders-page">



      <div className="orders-container">





        {/* =====================================================

            PAGE HEADER

            ===================================================== */}



        <div className="orders-header">



          <p className="orders-label">

            YOUR SHOPPING

          </p>



          <h1>

            My <span>Orders</span>

          </h1>



          <p className="orders-description">

            Track your purchases, check order status,

            and view your complete order history.

          </p>



        </div>





        {/* =====================================================

            ORDERS CONTENT

            ===================================================== */}



        <section className="orders-section">



          <div className="orders-section-header">



            <div>



              <p className="orders-section-label">

                ORDER HISTORY

              </p>



              <h2>

                Recent Orders

              </h2>



            </div>





            <div className="orders-section-icon">



              <ShoppingBag size={24} />



            </div>



          </div>





          {/* ===================================================

              LOADING STATE

              =================================================== */}



          {loading && (



            <div className="orders-empty">



              <div className="orders-empty-icon">

                <ShoppingBag size={28} />

              </div>



              <h3>

                Loading Orders...

              </h3>



              <p>

                Please wait while we fetch your

                order history.

              </p>



            </div>



          )}





          {/* ===================================================

              ERROR STATE

              =================================================== */}



          {!loading && error && (



            <div className="orders-empty">



              <div className="orders-empty-icon">

                <Package size={28} />

              </div>



              <h3>

                Unable to Load Orders

              </h3>



              <p>

                {error}

              </p>



            </div>



          )}





          {/* ===================================================

              EMPTY STATE

              =================================================== */}



          {!loading &&

            !error &&

            orders.length === 0 && (



              <div className="orders-empty">



                <div className="orders-empty-icon">

                  <ShoppingBag size={28} />

                </div>



                <h3>

                  No Orders Yet

                </h3>



                <p>

                  Your orders will appear here

                  after you complete a purchase.

                </p>



              </div>



          )}





          {/* ===================================================

              REAL ORDERS

              =================================================== */}



          {!loading &&

            !error &&

            orders.length > 0 && (



              <div className="orders-list">



                {orders.map((order) => (



                  <article

                    className="order-card"

                    key={order.orderId}

                  >





                    {/* =========================================

                        ORDER CARD TOP

                        ========================================= */}



                    <div className="order-card-top">



                      <div className="order-card-info">



                        <div className="order-icon">



                          <Package size={22} />



                        </div>





                        <div>



                          <p className="order-number">

                            {getOrderDisplayName(order)}

                          </p>





                          <p className="order-date">



                            <CalendarDays size={15} />



                            {formatOrderDate(

                              order.createdAt

                            )}



                          </p>



                        </div>



                      </div>





                      <span className="order-status">



                        {formatStatus(

                          order.orderStatus

                        )}



                      </span>



                    </div>





                    {/* =========================================

                        ORDER DETAILS

                        ========================================= */}



                    <div className="order-card-details">





                      <div className="order-detail">



                        <span>

                          Total Amount

                        </span>



                        <strong>

                          {formatCurrency(

                            order.totalAmount

                          )}

                        </strong>



                      </div>





                      <div className="order-detail">



                        <span>

                          Payment

                        </span>



                        <strong className="order-payment">



                          {formatStatus(

                            order.paymentStatus

                          )}



                        </strong>



                      </div>





                      <div className="order-detail">



                        <span>

                          Items

                        </span>



                        <strong>

                          {getItemCount(order)}

                        </strong>



                      </div>



                    </div>





                    {/* =========================================

                        ORDER CARD FOOTER

                        ========================================= */}



                    <div className="order-card-footer">



                      <p>



                        {order.paymentStatus === 'PENDING'

                          ? 'Your order is waiting for payment.'

                          : 'View your order details.'}



                      </p>





                      <button

                        type="button"

                        className="order-view-button"

                        onClick={() =>

                          handleViewOrder(

                            order.orderId

                          )

                        }

                      >



                        <span>

                          View Order

                        </span>



                        <ArrowRight size={17} />



                      </button>



                    </div>





                  </article>



                ))}



              </div>



          )}



        </section>



      </div>



    </main>

  )

}





export default Orders