import { useEffect, useMemo, useState } from 'react'

import { useSelector } from 'react-redux'

import {
  Search,
  RefreshCw,
  ShoppingCart,
  Eye,
  X,
  Package,
  UserRound,
  CreditCard,
  CalendarDays,
  MapPin,
  Hash,
  IndianRupee,
} from 'lucide-react'

import {
  getOrderCount,
  getOrders,
  getOrderById,
} from '../api/ordersApi'

import './Orders.css'


function Orders() {
  const token = useSelector((state) => state.auth.token)

  const [orders, setOrders] = useState([])

  const [totalOrders, setTotalOrders] = useState(0)

  const [searchTerm, setSearchTerm] = useState('')

  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState('ALL')

  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState('')

  const [selectedOrder, setSelectedOrder] = useState(null)

  const [detailsLoading, setDetailsLoading] = useState(false)

  const [detailsError, setDetailsError] = useState('')


  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadOrders = async (isRefresh = false) => {
    if (!token) {
      setError('Admin authentication token is missing.')
      setLoading(false)
      return
    }

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const [countResponse, ordersResponse] =
        await Promise.all([
          getOrderCount(token),
          getOrders(token),
        ])

      setTotalOrders(
        countResponse?.totalOrders ??
        countResponse ??
        0
      )

      setOrders(
        Array.isArray(ordersResponse)
          ? ordersResponse
          : []
      )

    } catch (err) {
      console.error('Failed to load orders:', err)

      if (err.response?.status === 401) {
        setError(
          'Your session has expired. Please login again.'
        )
      } else if (err.response?.status === 403) {
        setError(
          'You are not authorized to view orders.'
        )
      } else {
        setError(
          'Unable to load orders. Please try again.'
        )
      }

    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadOrders()
  }, [token])


  // =========================================================
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim()

    return orders.filter((order) => {

      const matchesOrderStatus =
        orderStatusFilter === 'ALL' ||
        order.orderStatus === orderStatusFilter

      const matchesPaymentStatus =
        paymentStatusFilter === 'ALL' ||
        order.paymentStatus === paymentStatusFilter

      const matchesSearch =
        !normalizedSearch ||
        String(order.orderId)
          .includes(normalizedSearch) ||
        String(order.customerId)
          .includes(normalizedSearch)

      return (
        matchesOrderStatus &&
        matchesPaymentStatus &&
        matchesSearch
      )
    })
  }, [
    orders,
    searchTerm,
    orderStatusFilter,
    paymentStatusFilter,
  ])


  // =========================================================
  // ORDER STATUS OPTIONS
  // =========================================================

  const orderStatuses = useMemo(() => {
    return [
      ...new Set(
        orders
          .map((order) => order.orderStatus)
          .filter(Boolean)
      ),
    ]
  }, [orders])


  // =========================================================
  // PAYMENT STATUS OPTIONS
  // =========================================================

  const paymentStatuses = useMemo(() => {
    return [
      ...new Set(
        orders
          .map((order) => order.paymentStatus)
          .filter(Boolean)
      ),
    ]
  }, [orders])


  // =========================================================
  // VIEW ORDER DETAILS
  // =========================================================

  const handleViewOrder = async (orderId) => {
    if (!token) {
      return
    }

    try {
      setDetailsLoading(true)
      setDetailsError('')
      setSelectedOrder(null)

      const order =
        await getOrderById(orderId, token)

      setSelectedOrder(order)

    } catch (err) {
      console.error(
        'Failed to load order details:',
        err
      )

      if (err.response?.status === 404) {
        setDetailsError(
          'Order not found.'
        )
      } else if (err.response?.status === 403) {
        setDetailsError(
          'You are not authorized to view this order.'
        )
      } else {
        setDetailsError(
          'Unable to load order details.'
        )
      }

    } finally {
      setDetailsLoading(false)
    }
  }


  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }
    ).format(amount ?? 0)
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return '—'
    }

    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }


  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return 'status-neutral'
    }

    const normalized =
      status.toLowerCase()

    if (
      normalized === 'completed' ||
      normalized === 'delivered' ||
      normalized === 'confirmed'
    ) {
      return 'status-success'
    }

    if (
      normalized === 'processing' ||
      normalized === 'shipped'
    ) {
      return 'status-info'
    }

    if (
      normalized === 'pending' ||
      normalized === 'pending_payment'
    ) {
      return 'status-warning'
    }

    if (
      normalized === 'cancelled' ||
      normalized === 'failed' ||
      normalized === 'refunded'
    ) {
      return 'status-danger'
    }

    return 'status-neutral'
  }


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="orders-page">

        <div className="orders-loading-card">

          <div className="orders-loading-spinner">
            <RefreshCw size={24} />
          </div>

          <h2>Loading Orders</h2>

          <p>
            Fetching the latest order information
            from the Order Service.
          </p>

        </div>

      </div>
    )
  }


  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="orders-page">

        <div className="orders-error-card">

          <div className="orders-error-icon">
            <ShoppingCart size={24} />
          </div>

          <h2>Unable to Load Orders</h2>

          <p>{error}</p>

          <button
            type="button"
            className="orders-retry-button"
            onClick={() => loadOrders()}
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    )
  }


  return (
    <div className="orders-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="orders-header">

        <div>

          <span className="orders-eyebrow">
            ORDER OPERATIONS
          </span>

          <h1>Orders Management</h1>

          <p>
            Monitor customer orders, fulfillment status,
            payment status and order details.
          </p>

        </div>

        <button
          type="button"
          className="orders-refresh-button"
          onClick={() => loadOrders(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? 'orders-spin'
                : ''
            }
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </section>


      {/* =====================================================
          SUMMARY CARD
      ====================================================== */}

      <section className="orders-summary-grid">

        <div className="orders-summary-card">

          <div className="orders-summary-icon">
            <ShoppingCart size={21} />
          </div>

          <div>

            <span>Total Orders</span>

            <strong>
              {totalOrders}
            </strong>

            <small>
              Orders recorded in the system
            </small>

          </div>

        </div>


        <div className="orders-summary-card">

          <div className="orders-summary-icon orders-summary-icon-blue">
            <Package size={21} />
          </div>

          <div>

            <span>Displayed Orders</span>

            <strong>
              {filteredOrders.length}
            </strong>

            <small>
              Matching current filters
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <section className="orders-toolbar">

        <div className="orders-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by order ID or customer ID..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>


        <select
          value={orderStatusFilter}
          onChange={(event) =>
            setOrderStatusFilter(event.target.value)
          }
          className="orders-filter-select"
        >

          <option value="ALL">
            All Order Statuses
          </option>

          {orderStatuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}

        </select>


        <select
          value={paymentStatusFilter}
          onChange={(event) =>
            setPaymentStatusFilter(event.target.value)
          }
          className="orders-filter-select"
        >

          <option value="ALL">
            All Payment Statuses
          </option>

          {paymentStatuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}

        </select>

      </section>


      {/* =====================================================
          ORDERS TABLE
      ====================================================== */}

      <section className="orders-table-card">

        <div className="orders-table-header">

          <div>

            <h2>All Orders</h2>

            <p>
              {filteredOrders.length} order
              {filteredOrders.length !== 1
                ? 's'
                : ''}{' '}
              displayed
            </p>

          </div>

        </div>


        {filteredOrders.length === 0 ? (

          <div className="orders-empty-state">

            <div className="orders-empty-icon">
              <ShoppingCart size={25} />
            </div>

            <h3>No orders found</h3>

            <p>
              No orders match your current
              search or filter criteria.
            </p>

          </div>

        ) : (

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>Order</th>

                  <th>Customer</th>

                  <th>Total</th>

                  <th>Order Status</th>

                  <th>Payment</th>

                  <th>Created</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.map((order) => (

                  <tr key={order.orderId}>

                    <td>

                      <div className="order-id-cell">

                        <span className="order-id-icon">
                          <Hash size={14} />
                        </span>

                        <strong>
                          #{order.orderId}
                        </strong>

                      </div>

                    </td>


                    <td>

                      <div className="customer-cell">

                        <span className="customer-icon">
                          <UserRound size={15} />
                        </span>

                        <span>
                          Customer #{order.customerId}
                        </span>

                      </div>

                    </td>


                    <td>

                      <strong className="order-total">
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </strong>

                    </td>


                    <td>

                      <span
                        className={`order-status-badge ${getStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus || '—'}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`order-status-badge ${getStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus || '—'}
                      </span>

                    </td>


                    <td>

                      <span className="order-date">
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </td>


                    <td>

                      <button
                        type="button"
                        className="order-view-button"
                        onClick={() =>
                          handleViewOrder(
                            order.orderId
                          )
                        }
                      >
                        <Eye size={15} />
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          ORDER DETAILS MODAL
      ====================================================== */}

      {(detailsLoading || detailsError || selectedOrder) && (

        <div
          className="order-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget &&
              !detailsLoading
            ) {
              setSelectedOrder(null)
              setDetailsError('')
            }

          }}
        >

          <div className="order-modal">

            <div className="order-modal-header">

              <div>

                <span className="orders-eyebrow">
                  ORDER DETAILS
                </span>

                <h2>
                  {selectedOrder
                    ? `Order #${selectedOrder.orderId}`
                    : 'Order Details'}
                </h2>

              </div>

              <button
                type="button"
                className="order-modal-close"
                onClick={() => {
                  setSelectedOrder(null)
                  setDetailsError('')
                }}
                disabled={detailsLoading}
              >
                <X size={20} />
              </button>

            </div>


            {detailsLoading && (

              <div className="order-modal-loading">

                <RefreshCw
                  size={25}
                  className="orders-spin"
                />

                <p>
                  Loading order details...
                </p>

              </div>

            )}


            {detailsError && !detailsLoading && (

              <div className="order-modal-error">

                <ShoppingCart size={24} />

                <p>{detailsError}</p>

              </div>

            )}


            {selectedOrder && !detailsLoading && !detailsError && (

              <div className="order-details-content">

                {/* -------------------------------------------------
                    BASIC ORDER INFORMATION
                -------------------------------------------------- */}

                <div className="order-detail-grid">

                  <div className="order-detail-item">

                    <span>
                      <Hash size={15} />
                      Order ID
                    </span>

                    <strong>
                      #{selectedOrder.orderId}
                    </strong>

                  </div>


                  <div className="order-detail-item">

                    <span>
                      <UserRound size={15} />
                      Customer
                    </span>

                    <strong>
                      #{selectedOrder.customerId}
                    </strong>

                  </div>


                  <div className="order-detail-item">

                    <span>
                      Order Status
                    </span>

                    <strong>
                      <span
                        className={`order-status-badge ${getStatusClass(
                          selectedOrder.orderStatus
                        )}`}
                      >
                        {selectedOrder.orderStatus}
                      </span>
                    </strong>

                  </div>


                  <div className="order-detail-item">

                    <span>
                      <CreditCard size={15} />
                      Payment Status
                    </span>

                    <strong>
                      <span
                        className={`order-status-badge ${getStatusClass(
                          selectedOrder.paymentStatus
                        )}`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </strong>

                  </div>


                  <div className="order-detail-item">

                    <span>
                      <IndianRupee size={15} />
                      Total Amount
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedOrder.totalAmount
                      )}
                    </strong>

                  </div>


                  <div className="order-detail-item">

                    <span>
                      <CalendarDays size={15} />
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        selectedOrder.createdAt
                      )}
                    </strong>

                  </div>

                </div>


                {/* -------------------------------------------------
                    ADDRESS
                -------------------------------------------------- */}

                {selectedOrder.address && (

                  <div className="order-detail-section">

                    <div className="order-detail-section-title">

                      <MapPin size={18} />

                      <div>

                        <h3>
                          Delivery Address
                        </h3>

                        <p>
                          Address used for this order
                        </p>

                      </div>

                    </div>


                    <div className="order-address">

                      <strong>
                        {selectedOrder.address.addressLine1}
                      </strong>

                      {selectedOrder.address.addressLine2 && (
                        <span>
                          {selectedOrder.address.addressLine2}
                        </span>
                      )}

                      <span>
                        {selectedOrder.address.city},{' '}
                        {selectedOrder.address.state}{' '}
                        {selectedOrder.address.postalCode}
                      </span>

                      <span>
                        {selectedOrder.address.country}
                      </span>

                    </div>

                  </div>

                )}


                {/* -------------------------------------------------
                    ORDER ITEMS
                -------------------------------------------------- */}

                <div className="order-detail-section">

                  <div className="order-detail-section-title">

                    <Package size={18} />

                    <div>

                      <h3>
                        Order Items
                      </h3>

                      <p>
                        Products included in this order
                      </p>

                    </div>

                  </div>


                  {selectedOrder.orderItems?.length > 0 ? (

                    <div className="order-items-table-wrapper">

                      <table className="order-items-table">

                        <thead>

                          <tr>

                            <th>Product</th>

                            <th>Seller</th>

                            <th>Quantity</th>

                            <th>Unit Price</th>

                            <th>Subtotal</th>

                          </tr>

                        </thead>

                        <tbody>

                          {selectedOrder.orderItems.map(
                            (item, index) => (

                              <tr
                                key={
                                  item.orderItemId ??
                                  `${item.productId}-${index}`
                                }
                              >

                                <td>
                                  #{item.productId}
                                </td>

                                <td>
                                  #{item.sellerId}
                                </td>

                                <td>
                                  {item.quantity}
                                </td>

                                <td>
                                  {formatCurrency(
                                    item.unitPrice
                                  )}
                                </td>

                                <td>
                                  <strong>
                                    {formatCurrency(
                                      item.subtotal
                                    )}
                                  </strong>
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  ) : (

                    <div className="order-items-empty">
                      No order items available.
                    </div>

                  )}

                </div>


                {/* -------------------------------------------------
                    UPDATED / CANCELLED INFORMATION
                -------------------------------------------------- */}

                <div className="order-detail-footer">

                  <div>

                    <span>
                      Last Updated
                    </span>

                    <strong>
                      {formatDate(
                        selectedOrder.updatedAt
                      )}
                    </strong>

                  </div>


                  {selectedOrder.cancelledAt && (

                    <div>

                      <span>
                        Cancelled At
                      </span>

                      <strong>
                        {formatDate(
                          selectedOrder.cancelledAt
                        )}
                      </strong>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  )
}


export default Orders