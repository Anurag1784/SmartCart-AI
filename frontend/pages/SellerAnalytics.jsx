// ============================================================
// SELLER ANALYTICS PAGE
// ============================================================
// Displays real sales and order analytics for the currently
// logged-in seller.
//
// IMPORTANT:
// sellerId is NEVER sent from the frontend.
//
// Backend determines the seller from JWT:
//
// JWT
//   ↓
// Spring Security
//   ↓
// authenticated seller
//   ↓
// /api/order-items/my-orders
// ============================================================

import { useEffect, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import {
  BarChart3,
  ShoppingBag,
  Package,
  IndianRupee,
  TrendingUp,
  CreditCard,
} from 'lucide-react'

import {
  orderApi,
  productApi,
} from '../services/api'

import './SellerAnalytics.css'


function SellerAnalytics() {

  // ============================================================
  // STATE
  // ============================================================

  // Raw OrderItems returned by Order Service.
  const [orderItems, setOrderItems] = useState([])

  // Product information from Product Service.
  const [products, setProducts] = useState({})

  // Loading state.
  const [loading, setLoading] = useState(true)

  // Error message.
  const [error, setError] = useState('')


  // ============================================================
  // LOAD SELLER ORDERS
  // ============================================================

  useEffect(() => {

    const fetchSellerOrders = async () => {

      try {

        setLoading(true)
        setError('')

        // Backend determines seller from JWT.
        const response = await orderApi.get(
          '/api/order-items/my-orders'
        )

        setOrderItems(response.data)

      } catch (error) {

        console.error(
          'Seller Analytics Loading Error:',
          error
        )

        if (error.response?.status === 401) {

          setError(
            'Your session has expired. Please login again.'
          )

        } else if (error.response?.status === 403) {

          setError(
            'You do not have permission to view seller analytics.'
          )

        } else {

          setError(
            'Unable to load seller analytics. Please try again.'
          )

        }

      } finally {

        setLoading(false)

      }

    }


    fetchSellerOrders()

  }, [])


  // ============================================================
  // LOAD PRODUCT INFORMATION
  // ============================================================
  // Order Service gives productId.
  //
  // Product Service owns:
  // productName
  // sku
  // imageUrl
  //
  // So we load product information separately.
  // ============================================================

  useEffect(() => {

    const fetchProducts = async () => {

      if (orderItems.length === 0) {
        return
      }

      // Get unique product IDs.
      const productIds = [
        ...new Set(
          orderItems.map(
            (item) => item.productId
          )
        ),
      ]


      const productResults = {}


      // Load each unique product.
      for (const productId of productIds) {

        try {

          const response = await productApi.get(
            `/api/products/${productId}`
          )

          productResults[productId] =
            response.data

        } catch (error) {

          console.warn(
            `Unable to load product ${productId}`,
            error
          )

        }

      }


      setProducts(productResults)

    }


    fetchProducts()

  }, [orderItems])


  // ============================================================
  // HELPER — GET PRODUCT
  // ============================================================

  const getProduct = (productId) => {

    return products[productId] || null

  }


  // ============================================================
  // HELPER — PRODUCT NAME
  // ============================================================

  const getProductName = (productId) => {

    const product = getProduct(productId)

    return (
      product?.productName ||
      `Product #${productId}`
    )

  }


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount) => {

    const numericAmount = Number(amount)

    if (Number.isNaN(numericAmount)) {
      return '₹0.00'
    }

    return numericAmount.toLocaleString(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }
    )

  }


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return '—'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )

  }


  // ============================================================
  // UNIQUE ORDERS
  // ============================================================
  // One customer order can contain multiple OrderItems.
  //
  // Therefore we must count unique order IDs instead of
  // simply counting OrderItems.
  // ============================================================

  const orders = useMemo(() => {

    const groupedOrders = {}

    orderItems.forEach((item) => {

      const orderId = String(
        item.orderId
      )

      if (!groupedOrders[orderId]) {

        groupedOrders[orderId] = {
          orderId: item.orderId,
          orderStatus: item.orderStatus,
          paymentStatus: item.paymentStatus,
          createdAt: item.createdAt,
          items: [],
        }

      }

      groupedOrders[orderId].items.push(item)

    })


    return Object.values(
      groupedOrders
    )

  }, [orderItems])


  // ============================================================
  // SUCCESSFUL PAYMENT ITEMS
  // ============================================================

  const successfulItems = useMemo(() => {

    return orderItems.filter(
      (item) =>
        item.paymentStatus === 'SUCCESS'
    )

  }, [orderItems])


  // ============================================================
  // SUCCESSFUL ORDERS
  // ============================================================

  const successfulOrders = useMemo(() => {

    return orders.filter(
      (order) =>
        order.paymentStatus === 'SUCCESS'
    )

  }, [orders])


  // ============================================================
  // SUMMARY ANALYTICS
  // ============================================================

  const analytics = useMemo(() => {

    // Total revenue.
    const totalRevenue =
      successfulItems.reduce(
        (total, item) =>
          total + Number(
            item.subtotal || 0
          ),
        0
      )


    // Total successful orders.
    const totalOrders =
      successfulOrders.length


    // Total quantity sold.
    const totalItemsSold =
      successfulItems.reduce(
        (total, item) =>
          total + Number(
            item.quantity || 0
          ),
        0
      )


    // Average order value.
    const averageOrderValue =
      totalOrders > 0
        ? totalRevenue / totalOrders
        : 0


    return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      averageOrderValue,
    }

  }, [
    successfulItems,
    successfulOrders,
  ])


  // ============================================================
  // SALES OVERVIEW
  // ============================================================
  // Groups successful revenue by date.
  // ============================================================

  const salesOverview = useMemo(() => {

    const salesByDate = {}


    successfulItems.forEach((item) => {

      if (!item.createdAt) {
        return
      }

      const date =
        new Date(item.createdAt)


      if (Number.isNaN(date.getTime())) {
        return
      }


      const dateKey =
        date.toISOString().split('T')[0]


      if (!salesByDate[dateKey]) {

        salesByDate[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: new Set(),
        }

      }


      salesByDate[dateKey].revenue +=
        Number(item.subtotal || 0)


      salesByDate[dateKey].orders.add(
        item.orderId
      )

    })


    return Object.values(
      salesByDate
    )
      .map((entry) => ({
        date: entry.date,
        revenue: entry.revenue,
        orders: entry.orders.size,
      }))
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .slice(-7)

  }, [successfulItems])


  // ============================================================
  // MAX REVENUE
  // ============================================================
  // Used later by CSS-based chart.
  // ============================================================

  const maxRevenue = useMemo(() => {

    if (salesOverview.length === 0) {
      return 0
    }

    return Math.max(
      ...salesOverview.map(
        (entry) => entry.revenue
      )
    )

  }, [salesOverview])


  // ============================================================
  // TOP PRODUCTS
  // ============================================================
  // Only successful payments are included.
  // ============================================================

  const topProducts = useMemo(() => {

    const productMap = {}


    successfulItems.forEach((item) => {

      const productId =
        String(item.productId)


      if (!productMap[productId]) {

        productMap[productId] = {
          productId: item.productId,
          quantity: 0,
          revenue: 0,
        }

      }


      productMap[productId].quantity +=
        Number(item.quantity || 0)


      productMap[productId].revenue +=
        Number(item.subtotal || 0)

    })


    return Object.values(
      productMap
    )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 5)

  }, [successfulItems])


  // ============================================================
  // ORDER STATUS BREAKDOWN
  // ============================================================

  const orderStatusCounts = useMemo(() => {

    const counts = {}


    orders.forEach((order) => {

      const status =
        order.orderStatus ||
        'UNKNOWN'


      counts[status] =
        (counts[status] || 0) + 1

    })


    return counts

  }, [orders])


  // ============================================================
  // PAYMENT STATUS BREAKDOWN
  // ============================================================

  const paymentStatusCounts = useMemo(() => {

    const counts = {}


    orders.forEach((order) => {

      const status =
        order.paymentStatus ||
        'UNKNOWN'


      counts[status] =
        (counts[status] || 0) + 1

    })


    return counts

  }, [orders])


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {

    return (

      <main className="seller-analytics-page">

        <div className="seller-analytics-loading">

          <TrendingUp size={30} />

          <h2>
            Loading analytics...
          </h2>

          <p>
            Fetching your seller performance data.
          </p>

        </div>

      </main>

    )

  }


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <main className="seller-analytics-page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <section className="seller-analytics-header">

        <div>

          <span className="seller-analytics-eyebrow">
            SELLER WORKSPACE
          </span>

          <h1>
            Analytics
          </h1>

          <p>
            Understand your store performance and sales activity.
          </p>

        </div>


        <Link
          to="/seller"
          className="seller-analytics-back-button"
        >
          ← Dashboard
        </Link>

      </section>


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (

        <div className="seller-analytics-error">

          <strong>
            Unable to load analytics
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {!error && (

        <>

          {/* ==================================================
              SUMMARY CARDS
              ================================================== */}

          <section className="seller-analytics-summary">

            {/* REVENUE */}

            <div className="seller-analytics-card">

              <div className="seller-analytics-card-icon">

                <IndianRupee size={20} />

              </div>

              <span>
                TOTAL REVENUE
              </span>

              <strong>
                {formatCurrency(
                  analytics.totalRevenue
                )}
              </strong>

              <p>
                From successful payments
              </p>

            </div>


            {/* ORDERS */}

            <div className="seller-analytics-card">

              <div className="seller-analytics-card-icon">

                <ShoppingBag size={20} />

              </div>

              <span>
                SUCCESSFUL ORDERS
              </span>

              <strong>
                {analytics.totalOrders}
              </strong>

              <p>
                Orders with successful payment
              </p>

            </div>


            {/* ITEMS SOLD */}

            <div className="seller-analytics-card">

              <div className="seller-analytics-card-icon">

                <Package size={20} />

              </div>

              <span>
                ITEMS SOLD
              </span>

              <strong>
                {analytics.totalItemsSold}
              </strong>

              <p>
                Units from successful payments
              </p>

            </div>


            {/* AVERAGE ORDER VALUE */}

            <div className="seller-analytics-card">

              <div className="seller-analytics-card-icon">

                <BarChart3 size={20} />

              </div>

              <span>
                AVERAGE ORDER VALUE
              </span>

              <strong>
                {formatCurrency(
                  analytics.averageOrderValue
                )}
              </strong>

              <p>
                Average successful order value
              </p>

            </div>

          </section>


          {/* ==================================================
              SALES OVERVIEW
              ================================================== */}

          <section className="seller-analytics-panel">

            <div className="seller-analytics-panel-header">

              <div>

                <span>
                  PERFORMANCE
                </span>

                <h2>
                  Sales Overview
                </h2>

              </div>

              <BarChart3 size={20} />

            </div>


            {salesOverview.length > 0 ? (

              <div className="seller-sales-chart">

                {salesOverview.map(
                  (entry) => {

                    const barHeight =
                      maxRevenue > 0
                        ? Math.max(
                            8,
                            (entry.revenue /
                              maxRevenue) *
                              100
                          )
                        : 8


                    return (

                      <div
                        key={entry.date}
                        className="seller-sales-bar-wrapper"
                      >

                        <div className="seller-sales-bar-value">
                          {formatCurrency(
                            entry.revenue
                          )}
                        </div>

                        <div className="seller-sales-bar-area">

                          <div
                            className="seller-sales-bar"
                            style={{
                              height:
                                `${barHeight}%`,
                            }}
                          />

                        </div>

                        <span>
                          {formatDate(
                            entry.date
                          )}
                        </span>

                        <small>
                          {entry.orders}
                          {' '}
                          {entry.orders === 1
                            ? 'order'
                            : 'orders'}
                        </small>

                      </div>

                    )

                  }
                )}

              </div>

            ) : (

              <div className="seller-analytics-empty">

                <BarChart3 size={26} />

                <h3>
                  No sales data yet
                </h3>

                <p>
                  Successful sales will appear here.
                </p>

              </div>

            )}

          </section>


          {/* ==================================================
              LOWER ANALYTICS GRID
              ================================================== */}

          <section className="seller-analytics-grid">


            {/* =================================================
                TOP PRODUCTS
                ================================================= */}

            <div className="seller-analytics-panel">

              <div className="seller-analytics-panel-header">

                <div>

                  <span>
                    PRODUCT PERFORMANCE
                  </span>

                  <h2>
                    Top Products
                  </h2>

                </div>

                <Package size={20} />

              </div>


              {topProducts.length > 0 ? (

                <div className="seller-top-products">

                  {topProducts.map(
                    (product, index) => (

                      <div
                        key={product.productId}
                        className="seller-top-product"
                      >

                        <div className="seller-product-rank">
                          {index + 1}
                        </div>

                        <div className="seller-top-product-info">

                          <strong>
                            {getProductName(
                              product.productId
                            )}
                          </strong>

                          <span>
                            {product.quantity}
                            {' '}
                            {product.quantity === 1
                              ? 'unit'
                              : 'units'}
                            {' '}
                            sold
                          </span>

                        </div>

                        <strong className="seller-top-product-revenue">
                          {formatCurrency(
                            product.revenue
                          )}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="seller-analytics-empty">

                  <Package size={26} />

                  <h3>
                    No product sales yet
                  </h3>

                  <p>
                    Your top-selling products will appear here.
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                ORDER STATUS
                ================================================= */}

            <div className="seller-analytics-panel">

              <div className="seller-analytics-panel-header">

                <div>

                  <span>
                    ORDER INSIGHTS
                  </span>

                  <h2>
                    Order Status
                  </h2>

                </div>

                <ShoppingBag size={20} />

              </div>


              {Object.keys(orderStatusCounts).length > 0 ? (

                <div className="seller-status-list">

                  {Object.entries(
                    orderStatusCounts
                  ).map(
                    ([status, count]) => (

                      <div
                        key={status}
                        className="seller-status-row"
                      >

                        <span>
                          {status.replaceAll(
                            '_',
                            ' '
                          )}
                        </span>

                        <strong>
                          {count}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="seller-analytics-empty">

                  <ShoppingBag size={26} />

                  <h3>
                    No orders yet
                  </h3>

                  <p>
                    Order status information will appear here.
                  </p>

                </div>

              )}

            </div>


          </section>


          {/* ==================================================
              PAYMENT STATUS
              ================================================== */}

          <section className="seller-analytics-panel seller-payment-panel">

            <div className="seller-analytics-panel-header">

              <div>

                <span>
                  PAYMENT INSIGHTS
                </span>

                <h2>
                  Payment Status
                </h2>

              </div>

              <CreditCard size={20} />

            </div>


            {Object.keys(paymentStatusCounts).length > 0 ? (

              <div className="seller-payment-list">

                {Object.entries(
                  paymentStatusCounts
                ).map(
                  ([status, count]) => (

                    <div
                      key={status}
                      className="seller-payment-item"
                    >

                      <span>
                        {status.replaceAll(
                          '_',
                          ' '
                        )}
                      </span>

                      <strong>
                        {count}
                      </strong>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="seller-analytics-empty">

                <CreditCard size={26} />

                <h3>
                  No payment data yet
                </h3>

                <p>
                  Payment information will appear here.
                </p>

              </div>

            )}

          </section>

        </>

      )}

    </main>

  )

}


export default SellerAnalytics