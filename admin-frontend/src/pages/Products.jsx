import { useEffect, useMemo, useState } from 'react'

import {
  Search,
  RefreshCw,
  Package,
  X,
  Eye,
  Filter,
} from 'lucide-react'

import { useSelector } from 'react-redux'

import { getProducts } from '../api/productsApi'

import './Products.css'


function Products() {

  const token = useSelector(
    (state) => state.auth.token
  )


  // =========================================================
  // PRODUCTS STATE
  // =========================================================

  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  // =========================================================
  // SEARCH / FILTER STATE
  // =========================================================

  const [searchTerm, setSearchTerm] = useState('')

  const [selectedCategory, setSelectedCategory] =
    useState('ALL')


  // =========================================================
  // PRODUCT DETAILS MODAL
  // =========================================================

  const [selectedProduct, setSelectedProduct] =
    useState(null)

  const [showDetailsModal, setShowDetailsModal] =
    useState(false)


  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {

    try {

      setLoading(true)

      setError('')


      const data = await getProducts(token)


      setProducts(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {

      console.error(
        'Failed to load products:',
        err
      )


      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to load products.'
      )

    } finally {

      setLoading(false)

    }
  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    if (token) {

      loadProducts()

    }

  }, [token])


  // =========================================================
  // CATEGORY LIST
  // =========================================================

  const categories = useMemo(() => {

    const categoryNames =
      products
        .map(
          (product) =>
            product.category?.categoryName
        )
        .filter(Boolean)


    return [
      ...new Set(categoryNames),
    ]

  }, [products])


  // =========================================================
  // FILTERED PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase()


    return products.filter(
      (product) => {

        const productName =
          product.productName
            ?.toLowerCase() || ''


        const brand =
          product.brand
            ?.toLowerCase() || ''


        const sku =
          product.sku
            ?.toLowerCase() || ''


        const categoryName =
          product.category
            ?.categoryName
            ?.toLowerCase() || ''


        const matchesSearch =
          !search ||
          productName.includes(search) ||
          brand.includes(search) ||
          sku.includes(search) ||
          categoryName.includes(search)


        const matchesCategory =
          selectedCategory === 'ALL' ||
          product.category
            ?.categoryName ===
            selectedCategory


        return (
          matchesSearch &&
          matchesCategory
        )
      }
    )

  }, [
    products,
    searchTerm,
    selectedCategory,
  ])


  // =========================================================
  // OPEN DETAILS MODAL
  // =========================================================

  const handleOpenDetails = (product) => {

    setSelectedProduct(product)

    setShowDetailsModal(true)
  }


  // =========================================================
  // CLOSE DETAILS MODAL
  // =========================================================

  const handleCloseDetails = () => {

    setShowDetailsModal(false)

    setSelectedProduct(null)
  }


  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {

    const numericPrice =
      Number(price)


    if (Number.isNaN(numericPrice)) {

      return '₹0.00'
    }


    return numericPrice.toLocaleString(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }
    )
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {

      return '—'
    }


    const parsedDate =
      new Date(date)


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—'
    }


    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }


  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {

    const normalizedStatus =
      status
        ?.toLowerCase()


    if (
      normalizedStatus === 'active' ||
      normalizedStatus === 'available'
    ) {

      return 'active'
    }


    if (
      normalizedStatus === 'inactive' ||
      normalizedStatus === 'disabled'
    ) {

      return 'inactive'
    }


    return 'neutral'
  }


  return (

    <div className="products-page">


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="products-header">

        <div>

          <p className="products-eyebrow">
            PRODUCT MANAGEMENT
          </p>


          <h1>
            Products
          </h1>


          <p className="products-subtitle">
            View and monitor all products available across SmartCart AI.
          </p>

        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="products-summary-grid">


        {/* TOTAL PRODUCTS */}

        <div className="product-summary-card">

          <div className="product-summary-icon">

            <Package size={22} />

          </div>


          <div>

            <p>
              Total Products
            </p>


            <h2>
              {products.length}
            </h2>

          </div>

        </div>


        {/* DISPLAYED PRODUCTS */}

        <div className="product-summary-card">

          <div className="product-summary-icon">

            <Eye size={22} />

          </div>


          <div>

            <p>
              Displayed
            </p>


            <h2>
              {filteredProducts.length}
            </h2>

          </div>

        </div>


        {/* CATEGORIES */}

        <div className="product-summary-card">

          <div className="product-summary-icon">

            <Filter size={21} />

          </div>


          <div>

            <p>
              Categories
            </p>


            <h2>
              {categories.length}
            </h2>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN PRODUCTS CARD
          ===================================================== */}

      <section className="products-card">


        {/* ===================================================
            CARD HEADER
            =================================================== */}

        <div className="products-card-header">

          <div>

            <h2>
              All Products
            </h2>


            <p>

              {filteredProducts.length}{' '}

              product
              {filteredProducts.length === 1
                ? ''
                : 's'}

              {' '}displayed

            </p>

          </div>


          <button
            type="button"
            className="product-refresh-button"
            onClick={loadProducts}
            disabled={loading}
            title="Refresh products"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? 'products-refresh-spinning'
                  : ''
              }
            />

            Refresh

          </button>

        </div>


        {/* ===================================================
            SEARCH + FILTER
            =================================================== */}

        <div className="products-toolbar">


          {/* SEARCH */}

          <div className="products-search-wrapper">

            <Search size={18} />


            <input
              type="text"
              placeholder="Search products, brand, SKU or category..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>


          {/* CATEGORY FILTER */}

          <div className="products-filter-wrapper">

            <Filter size={17} />


            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All Categories
              </option>


              {categories
                .sort((a, b) =>
                  a.localeCompare(b)
                )
                .map((category) => (

                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>

                ))}

            </select>

          </div>

        </div>


        {/* ===================================================
            ERROR
            =================================================== */}

        {error && (

          <div className="products-error">

            {error}

          </div>

        )}


        {/* ===================================================
            LOADING
            =================================================== */}

        {loading ? (

          <div className="products-state">

            <RefreshCw
              size={25}
              className="products-refresh-spinning"
            />


            <p>
              Loading products...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          /* =================================================
             EMPTY
             ================================================= */

          <div className="products-state">

            <Package size={30} />


            <p>

              {searchTerm ||
              selectedCategory !== 'ALL'
                ? 'No products match your search or filter.'
                : 'No products found.'}

            </p>

          </div>

        ) : (

          /* =================================================
             PRODUCT TABLE
             ================================================= */

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>


                  <th>
                    Brand
                  </th>


                  <th>
                    Category
                  </th>


                  <th>
                    Seller
                  </th>


                  <th>
                    Price
                  </th>


                  <th>
                    Status
                  </th>


                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product) => (

                    <tr
                      key={
                        product.productId
                      }
                    >


                      {/* PRODUCT */}

                      <td>

                        <div className="product-name-cell">


                          {product.imageUrl ? (

                            <img
                              src={
                                product.imageUrl
                              }
                              alt={
                                product.productName
                              }
                              className="product-table-image"
                            />

                          ) : (

                            <div className="product-table-placeholder">

                              <Package
                                size={17}
                              />

                            </div>

                          )}


                          <div>

                            <strong>
                              {product.productName}
                            </strong>


                            <span>

                              SKU:{' '}

                              {product.sku || '—'}

                            </span>

                          </div>

                        </div>

                      </td>


                      {/* BRAND */}

                      <td>

                        {product.brand || '—'}

                      </td>


                      {/* CATEGORY */}

                      <td>

                        <span className="product-category-badge">

                          {product.category
                            ?.categoryName ||
                            'Uncategorized'}

                        </span>

                      </td>


                      {/* SELLER */}

                      <td>

                        <span className="product-seller-id">

                          #{product.sellerId}

                        </span>

                      </td>


                      {/* PRICE */}

                      <td>

                        <strong className="product-price">

                          {formatPrice(
                            product.price
                          )}

                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`product-status ${getStatusClass(
                            product.status
                          )}`}
                        >

                          {product.status ||
                            'Unknown'}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="product-view-button"
                          title="View product details"
                          onClick={() =>
                            handleOpenDetails(
                              product
                            )
                          }
                        >

                          <Eye size={16} />

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
          PRODUCT DETAILS MODAL
          ===================================================== */}

      {showDetailsModal &&
        selectedProduct && (

          <div
            className="product-details-overlay"

            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {

                handleCloseDetails()

              }

            }}
          >

            <div className="product-details-modal">


              {/* =================================================
                  MODAL HEADER
                  ================================================= */}

              <div className="product-details-header">

                <div>

                  <p className="product-details-eyebrow">
                    PRODUCT DETAILS
                  </p>


                  <h2>
                    {selectedProduct.productName}
                  </h2>

                </div>


                <button
                  type="button"
                  className="product-details-close"
                  onClick={
                    handleCloseDetails
                  }
                  title="Close"
                >

                  <X size={20} />

                </button>

              </div>


              {/* =================================================
                  PRODUCT CONTENT
                  ================================================= */}

              <div className="product-details-body">


                {/* IMAGE */}

                <div className="product-details-image-wrapper">

                  {selectedProduct.imageUrl ? (

                    <img
                      src={
                        selectedProduct.imageUrl
                      }
                      alt={
                        selectedProduct.productName
                      }
                      className="product-details-image"
                    />

                  ) : (

                    <div className="product-details-image-placeholder">

                      <Package size={42} />

                    </div>

                  )}

                </div>


                {/* INFORMATION */}

                <div className="product-details-info">


                  <div className="product-detail-item">

                    <span>
                      Product ID
                    </span>

                    <strong>
                      #{selectedProduct.productId}
                    </strong>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      Brand
                    </span>

                    <strong>
                      {selectedProduct.brand ||
                        '—'}
                    </strong>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      Category
                    </span>

                    <strong>
                      {selectedProduct.category
                        ?.categoryName ||
                        'Uncategorized'}
                    </strong>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      Seller ID
                    </span>

                    <strong>
                      #{selectedProduct.sellerId}
                    </strong>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      SKU
                    </span>

                    <strong>
                      {selectedProduct.sku ||
                        '—'}
                    </strong>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      Price
                    </span>

                    <strong className="product-detail-price">

                      {formatPrice(
                        selectedProduct.price
                      )}

                    </strong>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      Status
                    </span>

                    <span
                      className={`product-status ${getStatusClass(
                        selectedProduct.status
                      )}`}
                    >

                      {selectedProduct.status ||
                        'Unknown'}

                    </span>

                  </div>


                  <div className="product-detail-item">

                    <span>
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        selectedProduct.createdAt
                      )}
                    </strong>

                  </div>

                </div>


                {/* DESCRIPTION */}

                <div className="product-details-description">

                  <span>
                    Description
                  </span>


                  <p>

                    {selectedProduct.description ||
                      'No description available.'}

                  </p>

                </div>

              </div>


              {/* =================================================
                  MODAL FOOTER
                  ================================================= */}

              <div className="product-details-footer">

                <button
                  type="button"
                  className="product-details-close-button"
                  onClick={
                    handleCloseDetails
                  }
                >

                  Close

                </button>

              </div>

            </div>

          </div>

        )}

    </div>

  )
}


export default Products