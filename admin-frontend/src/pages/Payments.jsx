import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  Search,
  RefreshCw,
  CreditCard,
  Eye,
  X,
  ShoppingCart,
  UserRound,
  IndianRupee,
  CalendarDays,
  Hash,
  Receipt,
  AlertCircle,
} from 'lucide-react'

import {
  getPaymentCount,
  getTotalRevenue,
  getPayments,
  getPaymentById,
} from '../api/paymentsApi'

import './Payments.css'


function Payments() {
  const token = useSelector((state) => state.auth.token)

  const [payments, setPayments] = useState([])

  const [successfulPayments, setSuccessfulPayments] =
    useState(0)

  const [totalRevenue, setTotalRevenue] =
    useState(0)

  const [searchTerm, setSearchTerm] =
    useState('')

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState('ALL')

  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState('ALL')

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')

  const [selectedPayment, setSelectedPayment] =
    useState(null)

  const [detailsLoading, setDetailsLoading] =
    useState(false)

  const [detailsError, setDetailsError] =
    useState('')


  // =========================================================
  // LOAD PAYMENT DATA
  // =========================================================

  const loadPayments = async (isRefresh = false) => {
    if (!token) {
      setError(
        'Admin authentication token is missing.'
      )

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

      const [
        countResponse,
        revenueResponse,
        paymentsResponse,
      ] = await Promise.all([
        getPaymentCount(token),
        getTotalRevenue(token),
        getPayments(token),
      ])

      setSuccessfulPayments(
        countResponse?.totalSuccessfulPayments ??
        countResponse ??
        0
      )

      setTotalRevenue(
        revenueResponse?.totalRevenue ??
        revenueResponse ??
        0
      )

      setPayments(
        Array.isArray(paymentsResponse)
          ? paymentsResponse
          : []
      )

    } catch (err) {
      console.error(
        'Failed to load payments:',
        err
      )

      if (err.response?.status === 401) {
        setError(
          'Your session has expired. Please login again.'
        )
      } else if (err.response?.status === 403) {
        setError(
          'You are not authorized to view payments.'
        )
      } else {
        setError(
          'Unable to load payments. Please try again.'
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
    loadPayments()
  }, [token])


  // =========================================================
  // FILTER PAYMENTS
  // =========================================================

  const filteredPayments = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim()

    return payments.filter((payment) => {

      const matchesStatus =
        paymentStatusFilter === 'ALL' ||
        payment.paymentStatus === paymentStatusFilter

      const matchesMethod =
        paymentMethodFilter === 'ALL' ||
        payment.paymentMethod === paymentMethodFilter

      const matchesSearch =
        !normalizedSearch ||
        String(payment.paymentId)
          .includes(normalizedSearch) ||
        String(payment.orderId)
          .includes(normalizedSearch) ||
        String(payment.customerId)
          .includes(normalizedSearch)

      return (
        matchesStatus &&
        matchesMethod &&
        matchesSearch
      )
    })
  }, [
    payments,
    searchTerm,
    paymentStatusFilter,
    paymentMethodFilter,
  ])


  // =========================================================
  // PAYMENT STATUS OPTIONS
  // =========================================================

  const paymentStatuses = useMemo(() => {
    return [
      ...new Set(
        payments
          .map(
            (payment) =>
              payment.paymentStatus
          )
          .filter(Boolean)
      ),
    ]
  }, [payments])


  // =========================================================
  // PAYMENT METHOD OPTIONS
  // =========================================================

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(
        payments
          .map(
            (payment) =>
              payment.paymentMethod
          )
          .filter(Boolean)
      ),
    ]
  }, [payments])


  // =========================================================
  // VIEW PAYMENT DETAILS
  // =========================================================

  const handleViewPayment = async (
    paymentId
  ) => {
    if (!token) {
      return
    }

    try {
      setDetailsLoading(true)
      setDetailsError('')
      setSelectedPayment(null)

      const payment =
        await getPaymentById(
          paymentId,
          token
        )

      setSelectedPayment(payment)

    } catch (err) {
      console.error(
        'Failed to load payment details:',
        err
      )

      if (err.response?.status === 404) {
        setDetailsError(
          'Payment not found.'
        )
      } else if (err.response?.status === 403) {
        setDetailsError(
          'You are not authorized to view this payment.'
        )
      } else {
        setDetailsError(
          'Unable to load payment details.'
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
      return 'payment-status-neutral'
    }

    const normalized =
      status.toLowerCase()

    if (
      normalized === 'success' ||
      normalized === 'completed'
    ) {
      return 'payment-status-success'
    }

    if (
      normalized === 'pending'
    ) {
      return 'payment-status-warning'
    }

    if (
      normalized === 'failed' ||
      normalized === 'refunded'
    ) {
      return 'payment-status-danger'
    }

    return 'payment-status-neutral'
  }


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="payments-page">

        <div className="payments-loading-card">

          <div className="payments-loading-spinner">
            <RefreshCw size={24} />
          </div>

          <h2>
            Loading Payments
          </h2>

          <p>
            Fetching the latest payment
            information from the Payment Service.
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
      <div className="payments-page">

        <div className="payments-error-card">

          <div className="payments-error-icon">
            <CreditCard size={24} />
          </div>

          <h2>
            Unable to Load Payments
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="payments-retry-button"
            onClick={() => loadPayments()}
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    )
  }


  return (
    <div className="payments-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="payments-header">

        <div>

          <span className="payments-eyebrow">
            PAYMENT OPERATIONS
          </span>

          <h1>
            Payments Management
          </h1>

          <p>
            Monitor payment transactions,
            revenue and payment statuses.
          </p>

        </div>

        <button
          type="button"
          className="payments-refresh-button"
          onClick={() =>
            loadPayments(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? 'payments-spin'
                : ''
            }
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </section>


      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <section className="payments-summary-grid">

        <div className="payments-summary-card">

          <div className="payments-summary-icon">
            <CreditCard size={21} />
          </div>

          <div>

            <span>
              Successful Payments
            </span>

            <strong>
              {successfulPayments}
            </strong>

            <small>
              Successfully completed payments
            </small>

          </div>

        </div>


        <div className="payments-summary-card">

          <div className="payments-summary-icon payments-summary-icon-green">
            <IndianRupee size={21} />
          </div>

          <div>

            <span>
              Total Revenue
            </span>

            <strong>
              {formatCurrency(
                totalRevenue
              )}
            </strong>

            <small>
              Revenue from successful payments
            </small>

          </div>

        </div>


        <div className="payments-summary-card">

          <div className="payments-summary-icon payments-summary-icon-blue">
            <Receipt size={21} />
          </div>

          <div>

            <span>
              Total Payments
            </span>

            <strong>
              {payments.length}
            </strong>

            <small>
              Payment records in the system
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <section className="payments-toolbar">

        <div className="payments-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by payment ID, order ID or customer ID..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={paymentStatusFilter}
          onChange={(event) =>
            setPaymentStatusFilter(
              event.target.value
            )
          }
          className="payments-filter-select"
        >

          <option value="ALL">
            All Payment Statuses
          </option>

          {paymentStatuses.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}

        </select>


        <select
          value={paymentMethodFilter}
          onChange={(event) =>
            setPaymentMethodFilter(
              event.target.value
            )
          }
          className="payments-filter-select"
        >

          <option value="ALL">
            All Payment Methods
          </option>

          {paymentMethods.map(
            (method) => (
              <option
                key={method}
                value={method}
              >
                {method}
              </option>
            )
          )}

        </select>

      </section>


      {/* =====================================================
          PAYMENTS TABLE
      ====================================================== */}

      <section className="payments-table-card">

        <div className="payments-table-header">

          <div>

            <h2>
              All Payments
            </h2>

            <p>
              {filteredPayments.length}{' '}
              payment
              {filteredPayments.length !== 1
                ? 's'
                : ''}{' '}
              displayed
            </p>

          </div>

        </div>


        {filteredPayments.length === 0 ? (

          <div className="payments-empty-state">

            <div className="payments-empty-icon">
              <CreditCard size={25} />
            </div>

            <h3>
              No payments found
            </h3>

            <p>
              No payments match your
              current search or filter criteria.
            </p>

          </div>

        ) : (

          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>

                <tr>

                  <th>
                    Payment
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Method
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPayments.map(
                  (payment) => (

                    <tr
                      key={
                        payment.paymentId
                      }
                    >

                      <td>

                        <div className="payment-id-cell">

                          <span className="payment-id-icon">
                            <Hash size={14} />
                          </span>

                          <strong>
                            #{payment.paymentId}
                          </strong>

                        </div>

                      </td>


                      <td>

                        <div className="payment-reference-cell">

                          <ShoppingCart size={14} />

                          <span>
                            #{payment.orderId}
                          </span>

                        </div>

                      </td>


                      <td>

                        <div className="payment-reference-cell">

                          <UserRound size={14} />

                          <span>
                            #{payment.customerId}
                          </span>

                        </div>

                      </td>


                      <td>

                        <strong className="payment-amount">
                          {formatCurrency(
                            payment.amount
                          )}
                        </strong>

                      </td>


                      <td>

                        <span className="payment-method-badge">
                          {payment.paymentMethod ||
                            '—'}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`payment-status-badge ${getStatusClass(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus ||
                            '—'}
                        </span>

                      </td>


                      <td>

                        <span className="payment-date">
                          {formatDate(
                            payment.createdAt
                          )}
                        </span>

                      </td>


                      <td>

                        <button
                          type="button"
                          className="payment-view-button"
                          onClick={() =>
                            handleViewPayment(
                              payment.paymentId
                            )
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          PAYMENT DETAILS MODAL
      ====================================================== */}

      {(detailsLoading ||
        detailsError ||
        selectedPayment) && (

        <div
          className="payment-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
                event.currentTarget &&
              !detailsLoading
            ) {
              setSelectedPayment(null)
              setDetailsError('')
            }

          }}
        >

          <div className="payment-modal">

            <div className="payment-modal-header">

              <div>

                <span className="payments-eyebrow">
                  PAYMENT DETAILS
                </span>

                <h2>
                  {selectedPayment
                    ? `Payment #${selectedPayment.paymentId}`
                    : 'Payment Details'}
                </h2>

              </div>

              <button
                type="button"
                className="payment-modal-close"
                onClick={() => {
                  setSelectedPayment(null)
                  setDetailsError('')
                }}
                disabled={detailsLoading}
              >
                <X size={20} />
              </button>

            </div>


            {detailsLoading && (

              <div className="payment-modal-loading">

                <RefreshCw
                  size={25}
                  className="payments-spin"
                />

                <p>
                  Loading payment details...
                </p>

              </div>

            )}


            {detailsError &&
              !detailsLoading && (

                <div className="payment-modal-error">

                  <AlertCircle size={25} />

                  <p>
                    {detailsError}
                  </p>

                </div>

              )}


            {selectedPayment &&
              !detailsLoading &&
              !detailsError && (

                <div className="payment-details-content">

                  {/* -------------------------------------------------
                      BASIC PAYMENT INFORMATION
                  -------------------------------------------------- */}

                  <div className="payment-detail-grid">

                    <div className="payment-detail-item">

                      <span>
                        <Hash size={15} />
                        Payment ID
                      </span>

                      <strong>
                        #{selectedPayment.paymentId}
                      </strong>

                    </div>


                    <div className="payment-detail-item">

                      <span>
                        <ShoppingCart size={15} />
                        Order ID
                      </span>

                      <strong>
                        #{selectedPayment.orderId}
                      </strong>

                    </div>


                    <div className="payment-detail-item">

                      <span>
                        <UserRound size={15} />
                        Customer ID
                      </span>

                      <strong>
                        #{selectedPayment.customerId}
                      </strong>

                    </div>


                    <div className="payment-detail-item">

                      <span>
                        <IndianRupee size={15} />
                        Amount
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedPayment.amount
                        )}
                      </strong>

                    </div>


                    <div className="payment-detail-item">

                      <span>
                        Payment Method
                      </span>

                      <strong>
                        {selectedPayment.paymentMethod ||
                          '—'}
                      </strong>

                    </div>


                    <div className="payment-detail-item">

                      <span>
                        Payment Status
                      </span>

                      <strong>
                        <span
                          className={`payment-status-badge ${getStatusClass(
                            selectedPayment.paymentStatus
                          )}`}
                        >
                          {selectedPayment.paymentStatus ||
                            '—'}
                        </span>
                      </strong>

                    </div>

                  </div>


                  {/* -------------------------------------------------
                      GATEWAY INFORMATION
                  -------------------------------------------------- */}

                  <div className="payment-detail-section">

                    <div className="payment-detail-section-title">

                      <Receipt size={18} />

                      <div>

                        <h3>
                          Gateway Information
                        </h3>

                        <p>
                          Payment gateway references
                        </p>

                      </div>

                    </div>


                    <div className="payment-gateway-grid">

                      <div>

                        <span>
                          Gateway Order ID
                        </span>

                        <strong>
                          {selectedPayment.gatewayOrderId ||
                            'Not available'}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Gateway Payment ID
                        </span>

                        <strong>
                          {selectedPayment.gatewayPaymentId ||
                            'Not available'}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* -------------------------------------------------
                      FAILURE REASON
                  -------------------------------------------------- */}

                  {selectedPayment.failureReason && (

                    <div className="payment-failure-box">

                      <AlertCircle size={18} />

                      <div>

                        <strong>
                          Failure Reason
                        </strong>

                        <p>
                          {selectedPayment.failureReason}
                        </p>

                      </div>

                    </div>

                  )}


                  {/* -------------------------------------------------
                      TIMESTAMPS
                  -------------------------------------------------- */}

                  <div className="payment-detail-footer">

                    <div>

                      <span>
                        Created
                      </span>

                      <strong>
                        {formatDate(
                          selectedPayment.createdAt
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Last Updated
                      </span>

                      <strong>
                        {formatDate(
                          selectedPayment.updatedAt
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              )}

          </div>

        </div>

      )}

    </div>
  )
}


export default Payments