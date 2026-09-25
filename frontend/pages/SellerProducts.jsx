import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SellerNavLink from '../components/SellerNavLink'

import {
  Package,
  PlusCircle,
  ArrowLeft,
  Pencil,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { productApi } from '../services/api'

import './SellerProducts.css'


function SellerProducts() {

  // ============================================================
  // STATE
  // ============================================================

  // Store products belonging to the logged-in seller.
  const [products, setProducts] = useState([])

  // Track loading state.
  const [loading, setLoading] = useState(true)

  // Store error messages.
  const [error, setError] = useState('')

  // Store the product currently being deleted.
  const [deletingProductId, setDeletingProductId] = useState(null)

  // Search text.
  const [searchTerm, setSearchTerm] = useState('')

  // Category filter.
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Product status filter.
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Current pagination page.
  const [currentPage, setCurrentPage] = useState(1)

  // Number of products shown on each page.
  const ITEMS_PER_PAGE = 8


  // ============================================================
  // LOAD SELLER PRODUCTS
  // ============================================================

  useEffect(() => {

    const fetchSellerProducts = async () => {

      try {

        setLoading(true)

        setError('')

        /*
         * Fetch only products belonging to the
         * authenticated seller.
         *
         * Backend identifies the seller using JWT.
         */
        const response = await productApi.get(
          '/api/products/my-products'
        )

        // Store products returned by backend.
        setProducts(response.data || [])

      } catch (error) {

        console.error(
          'Seller Products Error:',
          error
        )

        // Handle forbidden access.
        if (error.response?.status === 403) {

          setError(
            'You do not have permission to view seller products.'
          )

        } else {

          // Handle other errors.
          setError(
            'Unable to load your products. Please try again.'
          )
        }

      } finally {

        setLoading(false)

      }
    }


    // Load products when page opens.
    fetchSellerProducts()

  }, [])


  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const handleDeleteProduct = async (product) => {

    /*
     * DELETE is destructive.
     * Ask seller for confirmation first.
     */
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.productName}"?`
    )


    // Stop if seller cancels.
    if (!confirmed) {
      return
    }


    try {

      // Store product currently being deleted.
      setDeletingProductId(product.productId)

      setError('')


      /*
       * Delete product through Product Service.
       *
       * JWT is automatically attached by api.js.
       */
      await productApi.delete(
        `/api/products/${product.productId}`
      )


      /*
       * Remove deleted product from frontend state.
       *
       * No additional GET request is required here.
       */
      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            currentProduct.productId !== product.productId
        )
      )

    } catch (error) {

      console.error(
        'Delete Product Error:',
        error
      )


      // Permission error.
      if (error.response?.status === 403) {

        setError(
          'You are not authorized to delete this product.'
        )

      }

      // Product not found.
      else if (error.response?.status === 404) {

        setError(
          'Product was not found. It may have already been deleted.'
        )

      }

      // Other errors.
      else {

        setError(
          'Unable to delete the product. Please try again.'
        )
      }

    } finally {

      // Reset deleting state.
      setDeletingProductId(null)

    }
  }


  // ============================================================
  // CATEGORY LIST
  // ============================================================

  const categories = useMemo(() => {

    /*
     * Get category names from products.
     */
    const categoryNames = products
      .map(
        (product) =>
          product.category?.categoryName
      )
      .filter(Boolean)


    /*
     * Remove duplicate category names
     * and sort them alphabetically.
     */
    return [
      ...new Set(categoryNames)
    ].sort()

  }, [products])


  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filteredProducts = useMemo(() => {

    // Convert search text to lowercase.
    const search = searchTerm
      .trim()
      .toLowerCase()


    return products.filter((product) => {

      // ========================================================
      // SEARCH
      // ========================================================

      const matchesSearch =
        !search ||

        String(product.productName || '')
          .toLowerCase()
          .includes(search) ||

        String(product.sku || '')
          .toLowerCase()
          .includes(search) ||

        String(product.brand || '')
          .toLowerCase()
          .includes(search) ||

        String(product.category?.categoryName || '')
          .toLowerCase()
          .includes(search)


      // ========================================================
      // CATEGORY FILTER
      // ========================================================

      const productCategory =
        product.category?.categoryName || ''


      const matchesCategory =
        categoryFilter === 'ALL' ||
        productCategory === categoryFilter


      // ========================================================
      // STATUS FILTER
      // ========================================================

      const productStatus =
        String(product.status || 'ACTIVE')
          .toUpperCase()


      const matchesStatus =
        statusFilter === 'ALL' ||
        productStatus === statusFilter


      // Product must satisfy all filters.
      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      )

    })

  }, [
    products,
    searchTerm,
    categoryFilter,
    statusFilter,
  ])


  // ============================================================
  // PAGINATION
  // ============================================================

  // Calculate total number of pages.
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / ITEMS_PER_PAGE
    )
  )


  /*
   * If filtering removes enough products
   * that the current page no longer exists,
   * move back to the last valid page.
   */
  useEffect(() => {

    if (currentPage > totalPages) {

      setCurrentPage(totalPages)

    }

  }, [
    currentPage,
    totalPages,
  ])


  /*
   * Whenever search/category/status changes,
   * return to page 1.
   */
  useEffect(() => {

    setCurrentPage(1)

  }, [
    searchTerm,
    categoryFilter,
    statusFilter,
  ])


  // Get only products belonging to current page.
  const paginatedProducts = useMemo(() => {

    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE


    return filteredProducts.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    )

  }, [
    filteredProducts,
    currentPage,
  ])


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {

    return (

      <main className="seller-products-page">

        <div className="seller-products-state">

          <Package size={32} />

          <h2>
            Loading Products
          </h2>

          <p>
            Loading your products...
          </p>

        </div>

      </main>

    )
  }


  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <main className="seller-products-page">


      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <header className="seller-products-header">

        <div>

          {/* Back to Seller Dashboard */}

          <SellerNavLink
            to="/seller"
            className="seller-products-back-button"
          >
            ← Dashboard
          </SellerNavLink>


          {/* Page label */}

          <span className="seller-products-eyebrow">
            SELLER WORKSPACE
          </span>


          {/* Page title */}

          <h1>
            My Products
          </h1>


          {/* Page description */}

          <p>
            View and manage the products listed in your store.
          </p>

        </div>


        {/* Add Product */}

        <SellerNavLink
          to="/seller/add-product"
          className="seller-products-add-button"
        >
         + Add Product
        </SellerNavLink>

      </header>


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (

        <div className="seller-products-error-message">

          <Package size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="seller-products-summary">


        {/* TOTAL PRODUCTS */}

        <div className="seller-products-summary-card">

          <Package size={18} />

          <div>

            <span>
              Total Products
            </span>

            <strong>
              {products.length}
            </strong>

          </div>

        </div>


        {/* ACTIVE PRODUCTS */}

        <div className="seller-products-summary-card">

          <Package size={18} />

          <div>

            <span>
              Active
            </span>

            <strong>

              {
                products.filter(
                  (product) =>
                    String(
                      product.status || 'ACTIVE'
                    ).toUpperCase() === 'ACTIVE'
                ).length
              }

            </strong>

          </div>

        </div>


        {/* TOTAL CATEGORIES */}

        <div className="seller-products-summary-card">

          <Package size={18} />

          <div>

            <span>
              Categories
            </span>

            <strong>
              {categories.length}
            </strong>

          </div>

        </div>

      </div>


      {/* ======================================================
          SEARCH + FILTER TOOLBAR
      ====================================================== */}

      {products.length > 0 && (

        <div className="seller-products-toolbar">


          {/* SEARCH */}

          <div className="seller-products-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search product, SKU, brand or category..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

          </div>


          {/* CATEGORY FILTER */}

          <div className="seller-products-filter">

            <Filter size={16} />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >

              <option value="ALL">
                All Categories
              </option>


              {categories.map((category) => (

                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>

              ))}

            </select>

          </div>


          {/* STATUS FILTER */}

          <div className="seller-products-filter">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>

          </div>

        </div>

      )}


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {products.length === 0 && (

        <div className="seller-products-state">

          <div className="seller-products-empty-icon">

            <Package size={40} />

          </div>

          <h2>
            No products yet
          </h2>

          <p>
            Start building your store by adding your first product.
          </p>


          <Link
            to="/seller/add-product"
            className="seller-products-empty-button"
          >

            <PlusCircle size={18} />

            Add Your First Product

          </Link>

        </div>

      )}


      {/* ======================================================
          NO FILTER RESULTS
      ====================================================== */}

      {products.length > 0 &&
        filteredProducts.length === 0 && (

          <div className="seller-products-state">

            <Search size={34} />

            <h2>
              No Matching Products
            </h2>

            <p>
              Try changing your search text or filters.
            </p>

          </div>

        )}


      {/* ======================================================
          PRODUCT TABLE
      ====================================================== */}

      {filteredProducts.length > 0 && (

        <>

          <div className="seller-products-table-wrapper">

            <table className="seller-products-table">

              <thead>

                <tr>

                  <th>
                    PRODUCT
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    CATEGORY
                  </th>

                  <th>
                    PRICE
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTIONS
                  </th>

                </tr>

              </thead>


              <tbody>

                {paginatedProducts.map((product) => {

                  // Normalize status.
                  const status =
                    String(
                      product.status || 'ACTIVE'
                    ).toUpperCase()


                  // Check whether this product is being deleted.
                  const isDeleting =
                    deletingProductId ===
                    product.productId


                  return (

                    <tr
                      key={product.productId}
                    >


                      {/* ==================================================
                          PRODUCT
                      ================================================== */}

                      <td>

                        <div className="seller-products-table-product">


                          {/* PRODUCT IMAGE */}

                          <div className="seller-products-table-image">

                            {product.imageUrl ? (

                              <img
                                src={product.imageUrl}
                                alt={product.productName}
                              />

                            ) : (

                              <Package size={20} />

                            )}

                          </div>


                          {/* PRODUCT INFORMATION */}

                          <div className="seller-products-table-info">

                            <strong
                              title={product.productName}
                            >
                              {product.productName}
                            </strong>


                            <span>
                              {product.brand || 'No brand'}
                            </span>


                            <small
                              title={product.description}
                            >
                              {product.description ||
                                'No description available.'}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* ==================================================
                          SKU
                      ================================================== */}

                      <td>

                        <span className="seller-products-sku-value">

                          {product.sku || 'N/A'}

                        </span>

                      </td>


                      {/* ==================================================
                          CATEGORY
                      ================================================== */}

                      <td>

                        <span className="seller-products-category">

                          {product.category?.categoryName ||
                            'Uncategorized'}

                        </span>

                      </td>


                      {/* ==================================================
                          PRICE
                      ================================================== */}

                      <td>

                        <strong className="seller-products-price">

                          ₹{product.price}

                        </strong>

                      </td>


                      {/* ==================================================
                          STATUS
                      ================================================== */}

                      <td>

                        <span
                          className={`seller-products-status seller-products-status-${status.toLowerCase()}`}
                        >

                          {status}

                        </span>

                      </td>


                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <td>

                        <div className="seller-products-actions">


                          {/* EDIT */}

                          <Link
                            to={`/seller/products/edit/${product.productId}`}
                            className="seller-products-edit-button"
                            title="Edit Product"
                          >

                            <Pencil size={15} />

                            Edit

                          </Link>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="seller-products-delete-button"
                            onClick={() =>
                              handleDeleteProduct(product)
                            }
                            disabled={isDeleting}
                            title="Delete Product"
                          >

                            <Trash2 size={15} />

                            {isDeleting
                              ? 'Deleting...'
                              : 'Delete'}

                          </button>

                        </div>

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </div>


          {/* ======================================================
              PAGINATION
          ====================================================== */}

          <div className="seller-products-pagination">


            {/* PAGINATION INFORMATION */}

            <div className="seller-products-pagination-info">

              Showing{" "}

              <strong>
                {Math.min(
                  (currentPage - 1) *
                    ITEMS_PER_PAGE + 1,
                  filteredProducts.length
                )}
              </strong>

              {" "}–{" "}

              <strong>
                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  filteredProducts.length
                )}
              </strong>

              {" "}of{" "}

              <strong>
                {filteredProducts.length}
              </strong>

            </div>


            {/* PAGINATION BUTTONS */}

            <div className="seller-products-pagination-buttons">


              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                disabled={currentPage === 1}
              >

                <ChevronLeft size={16} />

                Previous

              </button>


              {/* CURRENT PAGE */}

              <span>
                Page {currentPage} of {totalPages}
              </span>


              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={currentPage === totalPages}
              >

                Next

                <ChevronRight size={16} />

              </button>

            </div>

          </div>

        </>

      )}

    </main>
  )
}


export default SellerProducts