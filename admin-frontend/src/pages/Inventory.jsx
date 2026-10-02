import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  Search,
  RefreshCw,
  Package,
  Eye,
  X,
  Hash,
  Boxes,
  LockKeyhole,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'

import {
  getInventory,
  getLowStockInventory,
} from '../api/inventoryApi'

import './Inventory.css'


function Inventory() {
  const token = useSelector((state) => state.auth.token)

  const [inventory, setInventory] = useState([])
  const [lowStockInventory, setLowStockInventory] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('ALL')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState('')

  const [selectedInventory, setSelectedInventory] =
    useState(null)


  // =========================================================
  // LOAD INVENTORY DATA
  // =========================================================

  const loadInventory = async (isRefresh = false) => {
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
        inventoryResponse,
        lowStockResponse,
      ] = await Promise.all([
        getInventory(token),
        getLowStockInventory(token),
      ])

      setInventory(
        Array.isArray(inventoryResponse)
          ? inventoryResponse
          : []
      )

      setLowStockInventory(
        Array.isArray(lowStockResponse)
          ? lowStockResponse
          : []
      )

    } catch (err) {
      console.error(
        'Failed to load inventory:',
        err
      )

      if (err.response?.status === 401) {
        setError(
          'Your session has expired. Please login again.'
        )
      } else if (err.response?.status === 403) {
        setError(
          'You are not authorized to view inventory.'
        )
      } else {
        setError(
          'Unable to load inventory. Please try again.'
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
    loadInventory()
  }, [token])


  // =========================================================
  // LOW STOCK IDS
  // =========================================================

  const lowStockIds = useMemo(() => {
    return new Set(
      lowStockInventory.map(
        (item) => item.inventoryId
      )
    )
  }, [lowStockInventory])


  // =========================================================
  // INVENTORY SUMMARY
  // =========================================================

  const totalAvailableQuantity = useMemo(() => {
    return inventory.reduce(
      (total, item) =>
        total +
        Number(item.availableQuantity || 0),
      0
    )
  }, [inventory])


  const totalReservedQuantity = useMemo(() => {
    return inventory.reduce(
      (total, item) =>
        total +
        Number(item.reservedQuantity || 0),
      0
    )
  }, [inventory])


  // =========================================================
  // FILTER INVENTORY
  // =========================================================

  const filteredInventory = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim()

    return inventory.filter((item) => {

      const matchesSearch =
        !normalizedSearch ||
        String(item.inventoryId)
          .includes(normalizedSearch) ||
        String(item.productId)
          .includes(normalizedSearch)

      const isLowStock =
        lowStockIds.has(item.inventoryId)

      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW' && isLowStock) ||
        (stockFilter === 'AVAILABLE' &&
          !isLowStock)

      return (
        matchesSearch &&
        matchesStock
      )
    })
  }, [
    inventory,
    searchTerm,
    stockFilter,
    lowStockIds,
  ])


  // =========================================================
  // INVENTORY STATUS
  // =========================================================

  const getInventoryStatus = (item) => {
    if (
      lowStockIds.has(item.inventoryId)
    ) {
      return 'LOW STOCK'
    }

    return 'HEALTHY'
  }


  const getInventoryStatusClass = (item) => {
    if (
      lowStockIds.has(item.inventoryId)
    ) {
      return 'inventory-status-warning'
    }

    return 'inventory-status-success'
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
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="inventory-page">

        <div className="inventory-loading-card">

          <div className="inventory-loading-spinner">
            <RefreshCw size={24} />
          </div>

          <h2>
            Loading Inventory
          </h2>

          <p>
            Fetching the latest inventory
            information from the Inventory Service.
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
      <div className="inventory-page">

        <div className="inventory-error-card">

          <div className="inventory-error-icon">
            <Package size={24} />
          </div>

          <h2>
            Unable to Load Inventory
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="inventory-retry-button"
            onClick={() => loadInventory()}
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    )
  }


  return (
    <div className="inventory-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="inventory-header">

        <div>

          <span className="inventory-eyebrow">
            STOCK OPERATIONS
          </span>

          <h1>
            Inventory Management
          </h1>

          <p>
            Monitor product stock, reservations
            and low-stock inventory.
          </p>

        </div>

        <button
          type="button"
          className="inventory-refresh-button"
          onClick={() =>
            loadInventory(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? 'inventory-spin'
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

      <section className="inventory-summary-grid">

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon">
            <Package size={21} />
          </div>

          <div>

            <span>
              Total Inventory
            </span>

            <strong>
              {inventory.length}
            </strong>

            <small>
              Inventory records in the system
            </small>

          </div>

        </div>


        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-warning">
            <AlertTriangle size={21} />
          </div>

          <div>

            <span>
              Low Stock
            </span>

            <strong>
              {lowStockInventory.length}
            </strong>

            <small>
              Products requiring attention
            </small>

          </div>

        </div>


        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-blue">
            <Boxes size={21} />
          </div>

          <div>

            <span>
              Available Quantity
            </span>

            <strong>
              {totalAvailableQuantity}
            </strong>

            <small>
              Units currently available
            </small>

          </div>

        </div>


        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-purple">
            <LockKeyhole size={21} />
          </div>

          <div>

            <span>
              Reserved Quantity
            </span>

            <strong>
              {totalReservedQuantity}
            </strong>

            <small>
              Units currently reserved
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <section className="inventory-toolbar">

        <div className="inventory-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by inventory ID or product ID..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={stockFilter}
          onChange={(event) =>
            setStockFilter(
              event.target.value
            )
          }
          className="inventory-filter-select"
        >

          <option value="ALL">
            All Inventory
          </option>

          <option value="LOW">
            Low Stock
          </option>

          <option value="AVAILABLE">
            Healthy Stock
          </option>

        </select>

      </section>


      {/* =====================================================
          INVENTORY TABLE
      ====================================================== */}

      <section className="inventory-table-card">

        <div className="inventory-table-header">

          <div>

            <h2>
              All Inventory
            </h2>

            <p>
              {filteredInventory.length}{' '}
              inventory record
              {filteredInventory.length !== 1
                ? 's'
                : ''}{' '}
              displayed
            </p>

          </div>

        </div>


        {filteredInventory.length === 0 ? (

          <div className="inventory-empty-state">

            <div className="inventory-empty-icon">
              <Package size={25} />
            </div>

            <h3>
              No inventory found
            </h3>

            <p>
              No inventory records match your
              current search or filter criteria.
            </p>

          </div>

        ) : (

          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>

                <tr>

                  <th>
                    Inventory
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Available
                  </th>

                  <th>
                    Reserved
                  </th>

                  <th>
                    Reorder Level
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Updated
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInventory.map(
                  (item) => (

                    <tr
                      key={
                        item.inventoryId
                      }
                    >

                      <td>

                        <div className="inventory-id-cell">

                          <span className="inventory-id-icon">
                            <Hash size={14} />
                          </span>

                          <strong>
                            #{item.inventoryId}
                          </strong>

                        </div>

                      </td>


                      <td>

                        <div className="inventory-product-cell">

                          <Package size={15} />

                          <span>
                            #{item.productId}
                          </span>

                        </div>

                      </td>


                      <td>

                        <strong className="inventory-quantity">
                          {item.availableQuantity}
                        </strong>

                      </td>


                      <td>

                        <span className="inventory-reserved">
                          {item.reservedQuantity}
                        </span>

                      </td>


                      <td>

                        <span className="inventory-reorder">
                          {item.reorderLevel}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`inventory-status-badge ${getInventoryStatusClass(
                            item
                          )}`}
                        >
                          {getInventoryStatus(
                            item
                          )}
                        </span>

                      </td>


                      <td>

                        <span className="inventory-date">
                          {formatDate(
                            item.updatedAt
                          )}
                        </span>

                      </td>


                      <td>

                        <button
                          type="button"
                          className="inventory-view-button"
                          onClick={() =>
                            setSelectedInventory(
                              item
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
          INVENTORY DETAILS MODAL
      ====================================================== */}

      {selectedInventory && (

        <div
          className="inventory-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedInventory(null)
            }

          }}
        >

          <div className="inventory-modal">

            <div className="inventory-modal-header">

              <div>

                <span className="inventory-eyebrow">
                  INVENTORY DETAILS
                </span>

                <h2>
                  Inventory #{selectedInventory.inventoryId}
                </h2>

              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={() =>
                  setSelectedInventory(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="inventory-details-content">

              {/* -------------------------------------------------
                  BASIC INFORMATION
              -------------------------------------------------- */}

              <div className="inventory-detail-grid">

                <div className="inventory-detail-item">

                  <span>
                    <Hash size={15} />
                    Inventory ID
                  </span>

                  <strong>
                    #{selectedInventory.inventoryId}
                  </strong>

                </div>


                <div className="inventory-detail-item">

                  <span>
                    <Package size={15} />
                    Product ID
                  </span>

                  <strong>
                    #{selectedInventory.productId}
                  </strong>

                </div>


                <div className="inventory-detail-item">

                  <span>
                    <Boxes size={15} />
                    Available Quantity
                  </span>

                  <strong>
                    {selectedInventory.availableQuantity}
                  </strong>

                </div>


                <div className="inventory-detail-item">

                  <span>
                    <LockKeyhole size={15} />
                    Reserved Quantity
                  </span>

                  <strong>
                    {selectedInventory.reservedQuantity}
                  </strong>

                </div>


                <div className="inventory-detail-item">

                  <span>
                    Reorder Level
                  </span>

                  <strong>
                    {selectedInventory.reorderLevel}
                  </strong>

                </div>


                <div className="inventory-detail-item">

                  <span>
                    Inventory Status
                  </span>

                  <strong>

                    <span
                      className={`inventory-status-badge ${getInventoryStatusClass(
                        selectedInventory
                      )}`}
                    >
                      {getInventoryStatus(
                        selectedInventory
                      )}
                    </span>

                  </strong>

                </div>

              </div>


              {/* -------------------------------------------------
                  STOCK INFORMATION
              -------------------------------------------------- */}

              <div className="inventory-detail-section">

                <div className="inventory-detail-section-title">

                  <AlertTriangle size={18} />

                  <div>

                    <h3>
                      Stock Information
                    </h3>

                    <p>
                      Current inventory condition
                    </p>

                  </div>

                </div>


                <div className="inventory-stock-summary">

                  <div>

                    <span>
                      Available
                    </span>

                    <strong>
                      {selectedInventory.availableQuantity}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Reserved
                    </span>

                    <strong>
                      {selectedInventory.reservedQuantity}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Reorder Level
                    </span>

                    <strong>
                      {selectedInventory.reorderLevel}
                    </strong>

                  </div>

                </div>

              </div>


              {/* -------------------------------------------------
                  LAST UPDATED
              -------------------------------------------------- */}

              <div className="inventory-detail-footer">

                <div>

                  <span>
                    <CalendarDays size={14} />
                    Last Updated
                  </span>

                  <strong>
                    {formatDate(
                      selectedInventory.updatedAt
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


export default Inventory