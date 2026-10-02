import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  IndianRupee,
  Package,
  PieChart as PieChartIcon,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Warehouse,
} from 'lucide-react'

import { useSelector } from 'react-redux'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import { getAnalytics } from '../api/analyticsApi'
import './Analytics.css'

function Analytics() {
  const token = useSelector((state) => state.auth.token)

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const data = await getAnalytics(token)

      setAnalytics(data)
    } catch (err) {
      console.error('Failed to load analytics:', err)

      setError(
        err.response?.data?.message ||
        'Failed to load analytics data.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadAnalytics()
    }
  }, [token])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(value || 0)
  }

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <RefreshCw
            className="analytics-loading-icon"
            size={30}
          />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <AlertTriangle size={28} />

          <h3>Unable to load analytics</h3>

          <p>{error}</p>

          <button
            className="analytics-retry-btn"
            onClick={() => loadAnalytics()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const {
    overview,
    orderStatusDistribution,
    paymentStatusDistribution,
    paymentMethodDistribution,
    categoryDistribution,
    lowStockInventory,
  } = analytics

  return (
    <div className="analytics-page">

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <div className="analytics-header">
        <div>
          <p className="analytics-eyebrow">
            ADMIN ANALYTICS
          </p>

          <h1>Analytics & Reports</h1>

          <p className="analytics-subtitle">
            Monitor orders, payments, products and inventory performance.
          </p>
        </div>

        <button
          className="analytics-refresh-btn"
          onClick={() => loadAnalytics(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'analytics-spin' : ''}
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* =========================================
          OVERVIEW CARDS
      ========================================== */}

      <div className="analytics-summary-grid">

        <div className="analytics-summary-card">
          <div className="analytics-card-icon orders">
            <ShoppingCart size={21} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>
              {formatNumber(overview.totalOrders)}
            </strong>
          </div>
        </div>

        <div className="analytics-summary-card">
          <div className="analytics-card-icon revenue">
            <IndianRupee size={21} />
          </div>

          <div>
            <span>Total Revenue</span>
            <strong>
              {formatCurrency(overview.totalRevenue)}
            </strong>
          </div>
        </div>

        <div className="analytics-summary-card">
          <div className="analytics-card-icon payments">
            <CreditCard size={21} />
          </div>

          <div>
            <span>Successful Payments</span>
            <strong>
              {formatNumber(overview.successfulPayments)}
            </strong>
          </div>
        </div>

        <div className="analytics-summary-card">
          <div className="analytics-card-icon products">
            <Package size={21} />
          </div>

          <div>
            <span>Total Products</span>
            <strong>
              {formatNumber(overview.totalProducts)}
            </strong>
          </div>
        </div>

        <div className="analytics-summary-card">
          <div className="analytics-card-icon inventory">
            <Warehouse size={21} />
          </div>

          <div>
            <span>Total Inventory</span>
            <strong>
              {formatNumber(overview.totalInventory)}
            </strong>
          </div>
        </div>

        <div className="analytics-summary-card">
          <div className="analytics-card-icon average">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Average Payment</span>
            <strong>
              {formatCurrency(overview.averagePaymentAmount)}
            </strong>
          </div>
        </div>

      </div>

      {/* =========================================
          ORDER STATUS + PAYMENT STATUS
      ========================================== */}

      <div className="analytics-two-column">

        {/* ORDER STATUS CHART */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">
            <div>
              <h2>Order Status</h2>

              <p>
                Current distribution of all orders
              </p>
            </div>

            <BarChart3 size={21} />
          </div>

          <div className="analytics-chart-container">
            <ResponsiveContainer
              width="100%"
              height={310}
            >
              <BarChart
                data={orderStatusDistribution}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="status"
                  tick={{
                    fontSize: 10,
                  }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={55}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Orders"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* PAYMENT STATUS CHART */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">
            <div>
              <h2>Payment Status</h2>

              <p>
                Distribution of payment transactions
              </p>
            </div>

            <PieChartIcon size={21} />
          </div>

          <div className="analytics-chart-container payment-chart">
            <ResponsiveContainer
              width="100%"
              height={310}
            >
              <PieChart>

                <Pie
                  data={paymentStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="45%"
                  outerRadius={92}
                  innerRadius={52}
                  paddingAngle={3}
                  label={({ status, count }) =>
                    `${status}: ${count}`
                  }
                >
                  {paymentStatusDistribution.map(
                    (item, index) => (
                      <Cell
                        key={`payment-status-${index}`}
                        fill={
                          [
                            '#2563eb',
                            '#f59e0b',
                            '#7c3aed',
                            '#dc2626',
                          ][index % 4]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={35}
                />

              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* =========================================
          PAYMENT METHODS + CATEGORIES
      ========================================== */}

      <div className="analytics-two-column">

        {/* PAYMENT METHODS */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">
            <div>
              <h2>Payment Methods</h2>

              <p>
                Transactions and amount by payment method
              </p>
            </div>

            <CreditCard size={21} />
          </div>

          <div className="analytics-chart-container">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={paymentMethodDistribution}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="method"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Transactions"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment amount summary */}

          <div className="analytics-method-summary">

            {paymentMethodDistribution.map((item) => (
              <div
                className="analytics-method-item"
                key={item.method}
              >
                <div>
                  <strong>{item.method}</strong>

                  <span>
                    {item.count} transaction
                    {item.count !== 1 ? 's' : ''}
                  </span>
                </div>

                <strong>
                  {formatCurrency(item.totalAmount)}
                </strong>
              </div>
            ))}

          </div>

        </div>

        {/* PRODUCT CATEGORIES */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">
            <div>
              <h2>Product Categories</h2>

              <p>
                Products grouped by category
              </p>
            </div>

            <Package size={21} />
          </div>

          <div className="analytics-chart-container">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={categoryDistribution}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  width={125}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="productCount"
                  name="Products"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-category-summary">

            {categoryDistribution.map((item) => (
              <div
                className="analytics-category-row"
                key={item.category}
              >
                <div>
                  <strong>{item.category}</strong>

                  <span>
                    {item.productCount} product
                    {item.productCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="analytics-category-count">
                  {item.productCount}
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* =========================================
          INVENTORY OVERVIEW
      ========================================== */}

      <div className="analytics-inventory-panel">

        <div className="analytics-panel-header">
          <div>
            <h2>Inventory Overview</h2>

            <p>
              Current inventory availability
            </p>
          </div>

          <Warehouse size={21} />
        </div>

        <div className="analytics-inventory-stats">

          <div>
            <span>Available Quantity</span>

            <strong>
              {formatNumber(
                overview.totalAvailableQuantity
              )}
            </strong>
          </div>

          <div>
            <span>Reserved Quantity</span>

            <strong>
              {formatNumber(
                overview.totalReservedQuantity
              )}
            </strong>
          </div>

          <div>
            <span>Low Stock Items</span>

            <strong className="low-stock-number">
              {formatNumber(overview.lowStockCount)}
            </strong>
          </div>

        </div>

      </div>

      {/* =========================================
          LOW STOCK TABLE
      ========================================== */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">
          <div>
            <h2>Low Stock Inventory</h2>

            <p>
              Products at or below their configured reorder level
            </p>
          </div>

          <AlertTriangle size={21} />
        </div>

        {lowStockInventory.length === 0 ? (
          <div className="analytics-no-data">
            <Package size={30} />

            <p>
              No low-stock inventory items.
            </p>
          </div>
        ) : (
          <div className="analytics-data-table">

            <div className="analytics-table-head inventory-head">
              <span>Inventory ID</span>
              <span>Product ID</span>
              <span>Available</span>
              <span>Reserved</span>
              <span>Reorder Level</span>
            </div>

            {lowStockInventory.map((item) => (
              <div
                className="analytics-table-row inventory-row"
                key={item.inventoryId}
              >
                <strong>
                  #{item.inventoryId}
                </strong>

                <span>
                  Product #{item.productId}
                </span>

                <span className="stock-danger">
                  {item.availableQuantity}
                </span>

                <span>
                  {item.reservedQuantity}
                </span>

                <span>
                  {item.reorderLevel}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default Analytics