// ============================================================
// SELLER ORDERS PAGE
// ============================================================
//
// This page displays orders containing products belonging to
// the currently logged-in seller.
//
// Main features:
// 1. Search orders
// 2. Filter by order status
// 3. Filter by payment status
// 4. Filter by date
// 5. Group OrderItems by orderId
// 6. Expand/collapse order details
// 7. Pagination
// 8. Compact seller-friendly table layout
//
// IMPORTANT:
// sellerId is NEVER sent from the frontend.
//
// Backend determines the seller from the JWT:
//
// JWT
//   ↓
// Spring Security
//   ↓
// authenticated seller
//   ↓
// /api/order-items/my-orders
//
// ============================================================

import { useEffect, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'
import SellerNavLink from '../components/SellerNavLink'

import {
  Search,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Package,
  X,
} from 'lucide-react'

import { orderApi, productApi } from '../services/api'

import './SellerOrders.css'


function SellerOrders() {

  // ============================================================
  // STATE
  // ============================================================

  // Raw OrderItems returned by Order Service.
  const [orderItems, setOrderItems] = useState([])

  // Product information loaded from Product Service.
  //
  // Example:
  //
  // {
  //   5: {
  //     productName: 'Laptop',
  //     sku: 'LAPTOP-001',
  //     imageUrl: '...'
  //   }
  // }
  const [products, setProducts] = useState({})

  // Loading state for Order Service.
  const [loading, setLoading] = useState(true)

  // Error message.
  const [error, setError] = useState('')

  // Search text.
  const [searchText, setSearchText] = useState('')

  // Order status filter.
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')

  // Payment status filter.
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL')

  // Date filter.
  const [dateFilter, setDateFilter] = useState('ALL')

  // Currently expanded order.
  //
  // null means no order is expanded.
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Current pagination page.
  const [currentPage, setCurrentPage] = useState(1)

  // Number of orders displayed per page.
  const ORDERS_PER_PAGE = 10


  // ============================================================
  // LOAD SELLER ORDER ITEMS
  // ============================================================

  useEffect(() => {

    const fetchSellerOrders = async () => {

      try {

        setLoading(true)

        setError('')

        // Backend automatically determines the seller
        // from the JWT token.
        const response = await orderApi.get(
          '/api/order-items/my-orders'
        )

        setOrderItems(response.data)

      } catch (error) {

        console.error(
          'Seller Orders Loading Error:',
          error
        )

        if (error.response?.status === 401) {

          setError(
            'Your session has expired. Please login again.'
          )

        } else if (error.response?.status === 403) {

          setError(
            'You do not have permission to view seller orders.'
          )

        } else {

          setError(
            'Unable to load seller orders. Please try again.'
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
  //
  // Order Service gives us productId.
  //
  // Product Service owns product information such as:
  //
  // productName
  // sku
  // imageUrl
  //
  // So we ask Product Service for the information.
  //
  // If product information cannot be loaded, the page still
  // works and falls back to "Product #ID".
  // ============================================================

  useEffect(() => {

    const fetchProductInformation = async () => {

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

          productResults[productId] = response.data

        } catch (error) {

          console.warn(
            `Unable to load product ${productId}`,
            error
          )

        }
      }

      setProducts(productResults)

    }


    fetchProductInformation()

  }, [orderItems])


  // ============================================================
  // GROUP ORDER ITEMS BY ORDER ID
  // ============================================================
  //
  // Example:
  //
  // OrderItem #20 → Order #21 → Product #5
  // OrderItem #21 → Order #21 → Product #6
  //
  // becomes:
  //
  // Order #21
  //   ├── Product #5
  //   └── Product #6
  //
  // This is what allows us to show ONE compact row per order.
  // ============================================================

  const orders = useMemo(() => {

    const groupedOrders = {}

    orderItems.forEach((item) => {

      const orderId = String(item.orderId)

      if (!groupedOrders[orderId]) {

        groupedOrders[orderId] = {

          orderId: item.orderId,

          customerId: item.customerId,

          createdAt: item.createdAt,

          orderStatus: item.orderStatus,

          paymentStatus: item.paymentStatus,

          items: [],

        }
      }

      groupedOrders[orderId].items.push(item)

    })

    // Convert object into array.
    const groupedArray = Object.values(groupedOrders)

    // Latest orders first.
    groupedArray.sort(
      (a, b) =>
        Number(b.orderId) - Number(a.orderId)
    )

    return groupedArray

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

    if (product?.productName) {
      return product.productName
    }

    return `Product #${productId}`
  }


  // ============================================================
  // HELPER — PRODUCT SKU
  // ============================================================

  const getProductSku = (productId) => {

    const product = getProduct(productId)

    if (product?.sku) {
      return `SKU: ${product.sku}`
    }

    return `Product ID: ${productId}`
  }


  // ============================================================
  // HELPER — PRODUCT IMAGE
  // ============================================================

  const getProductImage = (productId) => {

    const product = getProduct(productId)

    return product?.imageUrl || null
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
  // FORMAT TIME
  // ============================================================

  const formatTime = (dateValue) => {

    if (!dateValue) {
      return ''
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }


  // ============================================================
  // SELLER TOTAL
  // ============================================================

  const calculateOrderTotal = (items) => {

    return items.reduce(
      (total, item) => {

        return total + Number(
          item.subtotal || 0
        )

      },
      0
    )
  }


  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filteredOrders = useMemo(() => {

    let result = [...orders]


    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    const search = searchText
      .trim()
      .toLowerCase()

    if (search) {

      result = result.filter((order) => {

        // Search by order ID.
        if (
          String(order.orderId)
            .toLowerCase()
            .includes(search)
        ) {
          return true
        }


        // Search by customer ID.
        if (
          String(order.customerId)
            .toLowerCase()
            .includes(search)
        ) {
          return true
        }


        // Search by product ID / product name / SKU.
        return order.items.some((item) => {

          const product = getProduct(
            item.productId
          )

          const productName =
            product?.productName || ''

          const sku =
            product?.sku || ''

          return (

            String(item.productId)
              .toLowerCase()
              .includes(search)

            ||

            productName
              .toLowerCase()
              .includes(search)

            ||

            sku
              .toLowerCase()
              .includes(search)

          )

        })

      })

    }


    // ----------------------------------------------------------
    // ORDER STATUS
    // ----------------------------------------------------------

    if (orderStatusFilter !== 'ALL') {

      result = result.filter(
        (order) =>
          order.orderStatus ===
          orderStatusFilter
      )

    }


    // ----------------------------------------------------------
    // PAYMENT STATUS
    // ----------------------------------------------------------

    if (paymentStatusFilter !== 'ALL') {

      result = result.filter(
        (order) =>
          order.paymentStatus ===
          paymentStatusFilter
      )

    }


    // ----------------------------------------------------------
    // DATE FILTER
    // ----------------------------------------------------------

    if (dateFilter !== 'ALL') {

      const now = new Date()

      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )

      result = result.filter((order) => {

        if (!order.createdAt) {
          return false
        }

        const orderDate = new Date(
          order.createdAt
        )

        if (dateFilter === 'TODAY') {

          return orderDate >= today

        }


        if (dateFilter === '7_DAYS') {

          const sevenDaysAgo =
            new Date(today)

          sevenDaysAgo.setDate(
            today.getDate() - 7
          )

          return orderDate >= sevenDaysAgo

        }


        if (dateFilter === '30_DAYS') {

          const thirtyDaysAgo =
            new Date(today)

          thirtyDaysAgo.setDate(
            today.getDate() - 30
          )

          return orderDate >= thirtyDaysAgo

        }


        return true

      })

    }


    return result

  }, [
    orders,
    searchText,
    orderStatusFilter,
    paymentStatusFilter,
    dateFilter,
    products,
  ])


  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
      ORDERS_PER_PAGE
    )
  )


  // Orders visible on current page.
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  )


  // ============================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {

    setCurrentPage(1)

  }, [
    searchText,
    orderStatusFilter,
    paymentStatusFilter,
    dateFilter,
  ])


  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {

    setSearchText('')

    setOrderStatusFilter('ALL')

    setPaymentStatusFilter('ALL')

    setDateFilter('ALL')

    setCurrentPage(1)

  }


  // ============================================================
  // EXPAND / COLLAPSE
  // ============================================================

  const toggleOrder = (orderId) => {

    if (expandedOrderId === orderId) {

      setExpandedOrderId(null)

    } else {

      setExpandedOrderId(orderId)

    }

  }


  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {

    if (!status) {
      return 'status-default'
    }

    return `status-${status
      .toLowerCase()
      .replaceAll('_', '-')}`

  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <main className="seller-orders-page">

        <div className="seller-orders-loading">

          <div className="seller-orders-spinner"></div>

          <h2>
            Loading orders...
          </h2>

          <p>
            Fetching orders containing your products.
          </p>

        </div>

      </main>
    )

  }


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <main className="seller-orders-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <section className="seller-orders-header">

        <div>

          <span className="seller-orders-eyebrow">
            SELLER WORKSPACE
          </span>

          <h1>
            Orders
          </h1>

          <p>
            View and manage orders containing your products.
          </p>

        </div>


        <SellerNavLink
            to="/seller"
           className="seller-orders-back-button"
       >
            ← Dashboard
        </SellerNavLink>
      </section>


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (

        <div className="seller-orders-error">

          <strong>
            Unable to load orders
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ======================================================
          SEARCH + FILTER BAR
          ====================================================== */}

      {!error && (

        <section className="seller-orders-controls">

          {/* SEARCH */}
          <div className="seller-orders-search">

            <Search size={19} />

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search by order ID, customer ID or product..."
            />

            {searchText && (

              <button
                type="button"
                onClick={() =>
                  setSearchText('')
                }
                className="seller-orders-clear-search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>

            )}

          </div>


          {/* ORDER STATUS */}
          <select
            value={orderStatusFilter}
            onChange={(event) =>
              setOrderStatusFilter(
                event.target.value
              )
            }
            className="seller-orders-filter"
          >

            <option value="ALL">
              All Order Status
            </option>

            <option value="PENDING_PAYMENT">
              Pending Payment
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="PROCESSING">
              Processing
            </option>

            <option value="SHIPPED">
              Shipped
            </option>

            <option value="DELIVERED">
              Delivered
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>


          {/* PAYMENT STATUS */}
          <select
            value={paymentStatusFilter}
            onChange={(event) =>
              setPaymentStatusFilter(
                event.target.value
              )
            }
            className="seller-orders-filter"
          >

            <option value="ALL">
              All Payment Status
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="SUCCESS">
              Success
            </option>

            <option value="FAILED">
              Failed
            </option>

            <option value="REFUNDED">
              Refunded
            </option>

          </select>


          {/* DATE FILTER */}
          <div className="seller-orders-date-filter">

            <CalendarDays size={17} />

            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All Time
              </option>

              <option value="TODAY">
                Today
              </option>

              <option value="7_DAYS">
                Last 7 Days
              </option>

              <option value="30_DAYS">
                Last 30 Days
              </option>

            </select>

          </div>


          {/* CLEAR */}
          <button
            type="button"
            className="seller-orders-clear-button"
            onClick={clearFilters}
          >
            Clear
          </button>

        </section>

      )}


      {/* ======================================================
          RESULT COUNT
          ====================================================== */}

      {!error && (

        <div className="seller-orders-result-bar">

          <div>

            <strong>
              {filteredOrders.length}
            </strong>

            <span>
              {filteredOrders.length === 1
                ? ' Order found'
                : ' Orders found'}
            </span>

          </div>


          <div className="seller-orders-per-page">

            <span>
              Show
            </span>

            <strong>
              {ORDERS_PER_PAGE}
            </strong>

            <span>
              per page
            </span>

          </div>

        </div>

      )}


      {/* ======================================================
          ORDER TABLE
          ====================================================== */}

      {!error &&
        paginatedOrders.length > 0 && (

          <section className="seller-orders-table">

            {/* TABLE HEADER */}

            <div className="seller-orders-table-header">

              <span>ORDER</span>

              <span>CUSTOMER</span>

              <span>PRODUCTS</span>

              <span>ITEMS</span>

              <span>SELLER TOTAL</span>

              <span>ORDER STATUS</span>

              <span>PAYMENT</span>

              <span>DATE</span>

              <span>ACTIONS</span>

            </div>


            {/* TABLE ROWS */}

            {paginatedOrders.map((order) => {

              const isExpanded =
                expandedOrderId ===
                order.orderId

              const totalItems =
                order.items.reduce(
                  (total, item) =>
                    total +
                    Number(item.quantity || 0),
                  0
                )

              const sellerTotal =
                calculateOrderTotal(
                  order.items
                )


              return (

                <div
                  key={order.orderId}
                  className={`seller-order-row-wrapper ${
                    isExpanded
                      ? 'expanded'
                      : ''
                  }`}
                >

                  {/* ========================================
                      COMPACT ROW
                      ======================================== */}

                  <div className="seller-order-row">

                    {/* ORDER */}
                    <div className="seller-order-number">

                      <button
                        type="button"
                        className="seller-order-expand-button"
                        onClick={() =>
                          toggleOrder(
                            order.orderId
                          )
                        }
                        aria-label={
                          isExpanded
                            ? 'Collapse order'
                            : 'Expand order'
                        }
                      >

                        {isExpanded
                          ? <ChevronUp size={16} />
                          : <ChevronDown size={16} />
                        }

                      </button>

                      <strong>
                        #{order.orderId}
                      </strong>

                    </div>


                    {/* CUSTOMER */}
                    <div className="seller-order-customer">

                      <span>
                        #{order.customerId}
                      </span>

                    </div>


                    {/* PRODUCTS */}
                    <div className="seller-order-products-count">

                      <span>
                        {order.items.length}
                        {' '}
                        {order.items.length === 1
                          ? 'product'
                          : 'products'}
                      </span>

                    </div>


                    {/* ITEMS */}
                    <div className="seller-order-items-count">

                      <strong>
                        {totalItems}
                      </strong>

                    </div>


                    {/* SELLER TOTAL */}
                    <div className="seller-order-total">

                      <strong>
                        {formatCurrency(
                          sellerTotal
                        )}
                      </strong>

                    </div>


                    {/* ORDER STATUS */}
                    <div>

                      <span
                        className={`seller-status-badge ${getStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>

                    </div>


                    {/* PAYMENT */}
                    <div>

                      <span
                        className={`seller-payment-badge ${getStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>

                    </div>


                    {/* DATE */}
                    <div className="seller-order-date">

                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                      <small>
                        {formatTime(
                          order.createdAt
                        )}
                      </small>

                    </div>


                    {/* ACTION */}
                    <div>

                      <button
                        type="button"
                        className="seller-order-view-button"
                        onClick={() =>
                          toggleOrder(
                            order.orderId
                          )
                        }
                      >
                        {isExpanded
                          ? 'Hide'
                          : 'View'}
                      </button>

                    </div>

                  </div>


                  {/* ========================================
                      EXPANDED ORDER DETAILS
                      ======================================== */}

                  {isExpanded && (

                    <div className="seller-order-expanded">

                      <div className="seller-order-expanded-header">

                        <span>
                          ORDER ITEMS
                        </span>

                        <strong>
                          {order.items.length}
                          {' '}
                          {order.items.length === 1
                            ? 'Product'
                            : 'Products'}
                        </strong>

                      </div>


                      {/* PRODUCT TABLE */}

                      <div className="seller-order-item-table">

                        <div className="seller-order-item-header">

                          <span>
                            PRODUCT
                          </span>

                          <span>
                            QUANTITY
                          </span>

                          <span>
                            UNIT PRICE
                          </span>

                          <span>
                            SUBTOTAL
                          </span>

                        </div>


                        {order.items.map((item) => {

                          const product =
                            getProduct(
                              item.productId
                            )

                          const imageUrl =
                            getProductImage(
                              item.productId
                            )


                          return (

                            <div
                              key={
                                item.orderItemId
                              }
                              className="seller-order-item-row"
                            >

                              {/* PRODUCT */}

                              <div className="seller-expanded-product">

                                <div className="seller-expanded-product-image">

                                  {imageUrl ? (

                                    <img
                                      src={imageUrl}
                                      alt={getProductName(
                                        item.productId
                                      )}
                                    />

                                  ) : (

                                    <Package
                                      size={20}
                                    />

                                  )}

                                </div>


                                <div>

                                  <strong>
                                    {getProductName(
                                      item.productId
                                    )}
                                  </strong>

                                  <span>
                                    {getProductSku(
                                      item.productId
                                    )}
                                  </span>

                                </div>

                              </div>


                              {/* QUANTITY */}

                              <strong>
                                {item.quantity}
                              </strong>


                              {/* UNIT PRICE */}

                              <span>
                                {formatCurrency(
                                  item.unitPrice
                                )}
                              </span>


                              {/* SUBTOTAL */}

                              <strong>
                                {formatCurrency(
                                  item.subtotal
                                )}
                              </strong>

                            </div>

                          )

                        })}

                      </div>

                    </div>

                  )}

                </div>

              )

            })}

          </section>

        )}


      {/* ======================================================
          EMPTY SEARCH / FILTER RESULT
          ====================================================== */}

      {!error &&
        filteredOrders.length === 0 && (

          <section className="seller-orders-empty">

            <div className="seller-orders-empty-icon">
              <Search size={25} />
            </div>

            <h2>
              No orders found
            </h2>

            <p>
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="seller-orders-empty-button"
            >
              Clear Filters
            </button>

          </section>

        )}


      {/* ======================================================
          PAGINATION
          ====================================================== */}

      {!error &&
        filteredOrders.length > 0 && (

          <div className="seller-orders-pagination">

            <span>
              Showing{' '}
              {((currentPage - 1) *
                ORDERS_PER_PAGE) + 1}
              {' '}
              to{' '}
              {Math.min(
                currentPage *
                  ORDERS_PER_PAGE,
                filteredOrders.length
              )}
              {' '}
              of{' '}
              {filteredOrders.length}
              {' '}
              orders
            </span>


            <div className="seller-pagination-buttons">

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                ←
              </button>


              {Array.from(
                { length: totalPages },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  type="button"
                  key={page}
                  className={
                    currentPage === page
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>

              ))}


              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                →
              </button>

            </div>

          </div>

        )}

    </main>
  )
}


export default SellerOrders