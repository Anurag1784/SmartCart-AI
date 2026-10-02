import React, { useEffect, useState } from 'react'

import {
  Users,
  ShoppingBag,
  Package,
  CreditCard,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import { getDashboardStats } from '../api/dashboardApi'

import './Dashboard.css'


function Dashboard() {

  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardStats = async () => {

    try {

      setLoading(true)
      setError('')

      const data = await getDashboardStats()

      setStats(data)

    } catch (err) {

      console.error(
        'Failed to load dashboard statistics:',
        err
      )

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to load dashboard statistics.'
      )

    } finally {

      setLoading(false)

    }
  }


  // =====================================================
  // LOAD DASHBOARD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    fetchDashboardStats()

  }, [])


  // =====================================================
  // FORMAT REVENUE
  // =====================================================

  const formatRevenue = (value) => {

    if (value === null || value === undefined) {
      return '—'
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)

  }


  // =====================================================
  // FORMAT COMPACT REVENUE
  // =====================================================

  const formatCompactRevenue = (value) => {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return '₹0'
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(value))

  }


  // =====================================================
  // DASHBOARD VALUE HELPER
  // =====================================================

  const getValue = (value) => {

    if (value === null || value === undefined) {
      return '—'
    }

    return value

  }


  // =====================================================
  // REVENUE CHART DATA
  // =====================================================

  const revenueChartData = [
    {
      name: 'Successful Revenue',
      revenue: Number(stats?.totalRevenue ?? 0),
    },
  ]


  // =====================================================
  // ORDERS CHART DATA
  // =====================================================
  //
  // The current Admin Dashboard API provides the aggregate
  // totalOrders value rather than historical daily/monthly
  // order data.
  //
  // Therefore we use the real backend totalOrders value
  // instead of inventing historical order numbers.
  // =====================================================

  const ordersChartData = [
    {
      name: 'Total Orders',
      orders: Number(stats?.totalOrders ?? 0),
    },
  ]


  // =====================================================
  // REVENUE TOOLTIP
  // =====================================================

  const renderRevenueTooltip = ({
    active,
    payload,
  }) => {

    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null
    }

    const revenueValue = payload[0]?.value

    return (
      <div className="dashboard-chart-tooltip">

        <span className="dashboard-chart-tooltip-label">
          Successful Revenue
        </span>

        <strong>
          {formatRevenue(revenueValue)}
        </strong>

      </div>
    )
  }


  // =====================================================
  // ORDERS TOOLTIP
  // =====================================================

  const renderOrdersTooltip = ({
    active,
    payload,
  }) => {

    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null
    }

    const orderValue = payload[0]?.value

    return (
      <div className="dashboard-chart-tooltip">

        <span className="dashboard-chart-tooltip-label">
          Total Orders
        </span>

        <strong>
          {orderValue}
        </strong>

      </div>
    )
  }


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              SMARTCART AI
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Loading your e-commerce platform overview...
            </p>

          </div>

          <div className="dashboard-header-status">

            <RefreshCw
              size={15}
              className="dashboard-loading-icon"
            />

            Loading Dashboard

          </div>

        </div>


        <div className="dashboard-kpi-grid">

          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (

            <div
              className="dashboard-kpi-card dashboard-skeleton-card"
              key={item}
            >

              <div className="dashboard-skeleton-icon"></div>

              <div className="dashboard-skeleton-content">

                <div className="dashboard-skeleton-line"></div>

                <div className="dashboard-skeleton-value"></div>

                <div className="dashboard-skeleton-small"></div>

              </div>

            </div>

          ))}

        </div>


        <div className="dashboard-main-grid">

          <div className="dashboard-panel dashboard-skeleton-panel"></div>

          <div className="dashboard-panel dashboard-skeleton-panel"></div>

        </div>

      </div>

    )

  }


  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              SMARTCART AI
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Something went wrong while loading dashboard data.
            </p>

          </div>

        </div>


        <div className="dashboard-error-panel">

          <div className="dashboard-error-icon">

            <AlertTriangle size={28} />

          </div>


          <div>

            <h2>
              Dashboard data unavailable
            </h2>

            <p>
              {error}
            </p>

            <button
              className="dashboard-retry-button"
              onClick={fetchDashboardStats}
            >

              <RefreshCw size={16} />

              Try Again

            </button>

          </div>

        </div>

      </div>

    )

  }


  // =====================================================
  // REAL DASHBOARD
  // =====================================================

  return (

    <div className="dashboard-page">


      {/* =========================
          DASHBOARD HEADER
      ========================== */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-eyebrow">
            SMARTCART AI
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor your e-commerce platform, operations,
            payments and inventory from one place.
          </p>

        </div>


        <div className="dashboard-header-status">

          <span className="status-dot"></span>

          Live System Data

        </div>

      </div>


      {/* =========================
          KPI CARDS
      ========================== */}

      <section className="dashboard-kpi-grid">


        {/* Customers */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-blue">
            <Users size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Total Customers
            </span>

            <strong>
              {getValue(stats?.totalCustomers)}
            </strong>

            <small>
              Registered customers
            </small>

          </div>

        </div>


        {/* Sellers */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-purple">
            <ShoppingBag size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Total Sellers
            </span>

            <strong>
              {getValue(stats?.totalSellers)}
            </strong>

            <small>
              Registered sellers
            </small>

          </div>

        </div>


        {/* Products */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-green">
            <Package size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Total Products
            </span>

            <strong>
              {getValue(stats?.totalProducts)}
            </strong>

            <small>
              Products in catalog
            </small>

          </div>

        </div>


        {/* Orders */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-orange">
            <ShoppingCart size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Total Orders
            </span>

            <strong>
              {getValue(stats?.totalOrders)}
            </strong>

            <small>
              Orders placed
            </small>

          </div>

        </div>


        {/* Payments */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-teal">
            <CreditCard size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Successful Payments
            </span>

            <strong>
              {getValue(stats?.totalPayments)}
            </strong>

            <small>
              Successful transactions
            </small>

          </div>

        </div>


        {/* Revenue */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-indigo">
            <IndianRupee size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Total Revenue
            </span>

            <strong>
              {formatRevenue(stats?.totalRevenue)}
            </strong>

            <small>
              Successful payment revenue
            </small>

          </div>

        </div>


        {/* Low Stock */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-red">
            <AlertTriangle size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Low Stock
            </span>

            <strong>
              {getValue(
                stats?.lowStockInventoryCount ??
                stats?.lowStockInventory
              )}
            </strong>

            <small>
              Inventory alerts
            </small>

          </div>

        </div>


        {/* Admins */}

        <div className="dashboard-kpi-card">

          <div className="kpi-icon kpi-icon-slate">
            <TrendingUp size={21} />
          </div>

          <div className="kpi-content">

            <span>
              Total Admins
            </span>

            <strong>
              {getValue(stats?.totalAdmins)}
            </strong>

            <small>
              System administrators
            </small>

          </div>

        </div>

      </section>


      {/* =========================
          MAIN ANALYTICS AREA
      ========================== */}

      <section className="dashboard-main-grid">


        {/* =================================================
            REVENUE OVERVIEW
        ================================================== */}

        <div className="dashboard-panel dashboard-revenue-panel">

          <div className="panel-header">

            <div>

              <h2>
                Revenue Overview
              </h2>

              <p>
                Successful payment revenue across the platform
              </p>

            </div>

            <div className="panel-icon">
              <TrendingUp size={19} />
            </div>

          </div>


          {/* Revenue summary */}

          <div className="revenue-summary">

            <div className="revenue-summary-main">

              <span>
                Total Revenue
              </span>

              <strong>
                {formatRevenue(stats?.totalRevenue)}
              </strong>

            </div>


            <div className="revenue-summary-item">

              <span>
                Payments
              </span>

              <strong>
                {getValue(stats?.totalPayments)}
              </strong>

            </div>


            {stats?.averagePaymentAmount !== undefined && (

              <div className="revenue-summary-item">

                <span>
                  Average Payment
                </span>

                <strong>
                  {formatRevenue(
                    stats.averagePaymentAmount
                  )}
                </strong>

              </div>

            )}

          </div>


          {/* Real backend revenue chart */}

          <div className="dashboard-chart-wrapper">

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <BarChart
                data={revenueChartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--admin-border)"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  tickFormatter={formatCompactRevenue}
                  tick={{
                    fill: 'var(--admin-text-muted)',
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke: 'var(--admin-border)',
                  }}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={125}
                  tick={{
                    fill: 'var(--admin-text-secondary)',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={renderRevenueTooltip}
                  cursor={{
                    fill: 'var(--admin-primary-soft)',
                  }}
                />

                <Bar
                  dataKey="revenue"
                  fill="var(--admin-primary)"
                  radius={[0, 8, 8, 0]}
                  barSize={48}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          <div className="revenue-chart-note">

            <TrendingUp size={15} />

            <span>
              This visualization uses the current real
              successful-payment revenue returned by the
              Admin Service.
            </span>

          </div>

        </div>


        {/* =================================================
            REAL ORDERS OVERVIEW
        ================================================== */}

        <div className="dashboard-panel dashboard-orders-panel">

          <div className="panel-header">

            <div>

              <h2>
                Orders Overview
              </h2>

              <p>
                Order activity across the platform
              </p>

            </div>

            <div className="panel-icon">
              <ShoppingCart size={19} />
            </div>

          </div>


          {/* Orders summary */}

          <div className="revenue-summary">

            <div className="revenue-summary-main">

              <span>
                Total Orders
              </span>

              <strong>
                {getValue(stats?.totalOrders)}
              </strong>

            </div>


            <div className="revenue-summary-item">

              <span>
                Orders
              </span>

              <strong>
                {getValue(stats?.totalOrders)}
              </strong>

            </div>


            <div className="revenue-summary-item">

              <span>
                Platform Activity
              </span>

              <strong>
                Active
              </strong>

            </div>

          </div>


          {/* Real backend orders chart */}

          <div className="dashboard-chart-wrapper">

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <BarChart
                data={ordersChartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--admin-border)"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  tick={{
                    fill: 'var(--admin-text-muted)',
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke: 'var(--admin-border)',
                  }}
                  tickLine={false}
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={125}
                  tick={{
                    fill: 'var(--admin-text-secondary)',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={renderOrdersTooltip}
                  cursor={{
                    fill: 'var(--admin-primary-soft)',
                  }}
                />

                <Bar
                  dataKey="orders"
                  fill="var(--admin-primary)"
                  radius={[0, 8, 8, 0]}
                  barSize={48}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          <div className="revenue-chart-note">

            <ShoppingCart size={15} />

            <span>
              This visualization uses the current real
              total order count returned by the Admin Service.
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          LOWER DASHBOARD AREA
      ========================== */}

      <section className="dashboard-lower-grid">


        {/* Payment Statistics */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Payment Statistics
              </h2>

              <p>
                Payment performance and transaction activity
              </p>

            </div>

            <div className="panel-icon">
              <CreditCard size={19} />
            </div>

          </div>


          <div className="dashboard-info-placeholder">

            <CreditCard size={25} />

            <div>

              <h3>
                Payment Insights
              </h3>

              <p>

                Successful payments:{' '}

                <strong>
                  {getValue(stats?.totalPayments)}
                </strong>

              </p>

              <p>

                Total revenue:{' '}

                <strong>
                  {formatRevenue(stats?.totalRevenue)}
                </strong>

              </p>


              {stats?.averagePaymentAmount !== undefined && (

                <p>

                  Average payment:{' '}

                  <strong>
                    {formatRevenue(
                      stats.averagePaymentAmount
                    )}
                  </strong>

                </p>

              )}

            </div>

          </div>

        </div>


        {/* Inventory Health */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Inventory Health
              </h2>

              <p>
                Monitor stock levels and inventory risk
              </p>

            </div>

            <div className="panel-icon">
              <Package size={19} />
            </div>

          </div>


          <div className="dashboard-info-placeholder">

            <AlertTriangle size={25} />

            <div>

              <h3>
                Inventory Monitoring
              </h3>

              <p>

                Low-stock items:{' '}

                <strong>
                  {getValue(
                    stats?.lowStockInventoryCount ??
                    stats?.lowStockInventory
                  )}
                </strong>

              </p>

              <p>
                Inventory status is being monitored
                through the Admin Service.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          RECENT ACTIVITY
      ========================== */}

      <section className="dashboard-panel dashboard-activity-panel">

        <div className="panel-header">

          <div>

            <h2>
              Recent Activity
            </h2>

            <p>
              Latest platform activity and transactions
            </p>

          </div>

        </div>


        <div className="dashboard-activity-empty">

          <div className="activity-empty-icon">
            <ShoppingBag size={25} />
          </div>

          <div>

            <h3>
              Activity Feed
            </h3>

            <p>
              Recent order and payment activity will be
              connected in the upcoming dashboard steps.
            </p>

          </div>

        </div>

      </section>

    </div>

  )

}


export default Dashboard