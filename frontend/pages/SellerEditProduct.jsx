import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Package,
  LoaderCircle,
} from 'lucide-react'

import { productApi } from '../services/api'
import './SellerAddProduct.css'


function SellerEditProduct() {

  // Used to navigate back to the seller product page.
  const navigate = useNavigate()

  // Gets the productId from the URL.
  //
  // Example:
  // /seller/products/edit/7
  //
  // productId will be "7".
  const { productId } = useParams()


  // ============================================================
  // FORM STATE
  // ============================================================

  // Product name.
  const [productName, setProductName] = useState('')

  // Product SKU.
  const [sku, setSku] = useState('')

  // Product price.
  const [price, setPrice] = useState('')

  // Product description.
  const [description, setDescription] = useState('')

  // Product brand.
  const [brand, setBrand] = useState('')

  // Product status.
  const [status, setStatus] = useState('ACTIVE')

  // Selected category.
  const [categoryId, setCategoryId] = useState('')


  // ============================================================
  // PRODUCT STATE
  // ============================================================

  // Used while loading the existing product.
  const [productLoading, setProductLoading] = useState(true)

  // Used when the product cannot be loaded.
  const [productError, setProductError] = useState('')


  // ============================================================
  // CATEGORY STATE
  // ============================================================

  // Stores categories returned by Product Service.
  const [categories, setCategories] = useState([])

  // Tracks category loading.
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Stores category loading errors.
  const [categoryError, setCategoryError] = useState('')


  // ============================================================
  // SUBMISSION STATE
  // ============================================================

  // Tracks update request.
  const [submitting, setSubmitting] = useState(false)

  // Stores update error.
  const [error, setError] = useState('')

  // Stores successful update message.
  const [success, setSuccess] = useState('')


  // ============================================================
  // LOAD PRODUCT + CATEGORIES
  // ============================================================

  useEffect(() => {

    // This function loads both the existing product
    // and the available categories.
    const fetchData = async () => {

      try {

        setProductLoading(true)
        setCategoriesLoading(true)

        setProductError('')
        setCategoryError('')


        // --------------------------------------------------------
        // LOAD EXISTING PRODUCT
        // --------------------------------------------------------

        const productResponse = await productApi.get(
          `/api/products/${productId}`
        )

        const product = productResponse.data


        // Fill the form with the existing product information.
        setProductName(product.productName || '')
        setSku(product.sku || '')
        setPrice(product.price ?? '')
        setDescription(product.description || '')
        setBrand(product.brand || '')
        setStatus(product.status || 'ACTIVE')

        // Product response contains the complete Category object.
        setCategoryId(
          product.category?.categoryId
            ? String(product.category.categoryId)
            : ''
        )


        // --------------------------------------------------------
        // LOAD CATEGORIES
        // --------------------------------------------------------

        const categoryResponse = await productApi.get(
          '/api/categories'
        )

        setCategories(categoryResponse.data)

      } catch (error) {

        // Log technical information for development.
        console.error(
          'Edit Product Loading Error:',
          error
        )


        // Product loading error.
        if (error.response?.status === 403) {

          setProductError(
            'You do not have permission to edit this product.'
          )

        } else if (error.response?.status === 404) {

          setProductError(
            'Product not found.'
          )

        } else if (error.response?.data?.message) {

          setProductError(
            error.response.data.message
          )

        } else {

          setProductError(
            'Unable to load the product. Please try again.'
          )
        }

      } finally {

        setProductLoading(false)
        setCategoriesLoading(false)
      }
    }


    // Only run when productId is available.
    if (productId) {
      fetchData()
    }

  }, [productId])


  // ============================================================
  // UPDATE PRODUCT
  // ============================================================

  const handleSubmit = async (event) => {

    // Prevent browser page refresh.
    event.preventDefault()

    // Clear previous messages.
    setError('')
    setSuccess('')


    // Make sure category exists.
    if (!categoryId) {

      setError(
        'Please select a category.'
      )

      return
    }


    // Start submitting state.
    setSubmitting(true)


    try {

      // --------------------------------------------------------
      // UPDATE PRODUCT REQUEST
      // --------------------------------------------------------
      //
      // IMPORTANT:
      // sellerId is NOT included.
      //
      // Product Service identifies the seller from
      // the authenticated JWT.
      //
      // imageUrl is also NOT included because the current
      // ProductService.updateProduct() does not update it.
      //
      const productData = {

        productName: productName.trim(),

        sku: sku.trim(),

        price: Number(price),

        description: description.trim(),

        brand: brand.trim(),

        status: status,

        category: {
          categoryId: Number(categoryId),
        },
      }


      // Send PUT request to Product Service.
      const response = await productApi.put(
        `/api/products/${productId}`,
        productData
      )


      // Show success message.
      setSuccess(
        `Product "${response.data.productName}" was updated successfully.`
      )


      // Wait briefly so seller can see the success message.
      setTimeout(() => {

        navigate('/seller/products')

      }, 900)


    } catch (error) {

      // Log technical error for development.
      console.error(
        'Update Product Error:',
        error
      )


      // Handle Spring Boot validation errors.
      if (error.response?.data?.errors) {

        const validationMessages =
          Object.values(
            error.response.data.errors
          ).join(' ')

        setError(validationMessages)


      } else if (error.response?.data?.message) {

        setError(
          error.response.data.message
        )


      } else if (error.response?.status === 403) {

        setError(
          'You do not have permission to update this product.'
        )


      } else {

        setError(
          'Unable to update the product. Please try again.'
        )
      }


    } finally {

      // Stop submitting state.
      setSubmitting(false)
    }
  }


  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (productLoading) {

    return (
      <main className="seller-add-product-page">

        <section className="seller-add-product-card">

          <div
            style={{
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >

            <LoaderCircle
              size={42}
              className="seller-submit-spinner"
            />

            <h2>
              Loading Product...
            </h2>

            <p>
              Please wait while we load the product information.
            </p>

          </div>

        </section>

      </main>
    )
  }


  // ============================================================
  // PRODUCT LOADING ERROR
  // ============================================================

  if (productError) {

    return (
      <main className="seller-add-product-page">

        <section className="seller-add-product-card">

          <div className="seller-add-product-error">
            {productError}
          </div>

          <div className="seller-add-product-actions">

            <button
              type="button"
              className="seller-add-product-cancel"
              onClick={() => navigate('/seller/products')}
            >
              <ArrowLeft size={18} />
              Back to Products
            </button>

          </div>

        </section>

      </main>
    )
  }


  // ============================================================
  // PAGE UI
  // ============================================================

  return (
    <main className="seller-add-product-page">

      {/* ========================================================
          PAGE HEADER
          ======================================================== */}

      <header className="seller-add-product-header">

        <div>

          {/* Back to Seller Products */}
          <button
            type="button"
            className="seller-add-product-back"
            onClick={() => navigate('/seller/products')}
          >
            <ArrowLeft size={18} />
            Back to Products
          </button>


          <span className="seller-add-product-eyebrow">
            SELLER WORKSPACE
          </span>


          <h1>
            Edit Product
          </h1>


          <p>
            Update the information of your existing product.
          </p>

        </div>

      </header>


      {/* ========================================================
          FORM CONTAINER
          ======================================================== */}

      <section className="seller-add-product-card">

        {/* Card header */}
        <div className="seller-add-product-card-header">

          <div className="seller-add-product-icon">
            <Package size={25} />
          </div>


          <div>

            <h2>
              Product Information
            </h2>

            <p>
              Update the details of your product.
            </p>

          </div>

        </div>


        {/* ======================================================
            SUCCESS MESSAGE
            ====================================================== */}

        {success && (
          <div className="seller-add-product-success">
            {success}
          </div>
        )}


        {/* ======================================================
            ERROR MESSAGE
            ====================================================== */}

        {error && (
          <div className="seller-add-product-error">
            {error}
          </div>
        )}


        {/* ======================================================
            CATEGORY ERROR
            ====================================================== */}

        {categoryError && (
          <div className="seller-add-product-error">
            {categoryError}
          </div>
        )}


        {/* ======================================================
            PRODUCT FORM
            ====================================================== */}

        <form
          className="seller-add-product-form"
          onSubmit={handleSubmit}
        >

          {/* ----------------------------------------------------
              PRODUCT NAME
              ---------------------------------------------------- */}

          <div className="seller-form-group">

            <label htmlFor="productName">
              Product Name <span>*</span>
            </label>


            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
              placeholder="Enter product name"
              maxLength={200}
              required
            />

          </div>


          {/* ----------------------------------------------------
              SKU
              ---------------------------------------------------- */}

          <div className="seller-form-group">

            <label htmlFor="sku">
              SKU <span>*</span>
            </label>


            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(event) =>
                setSku(event.target.value)
              }
              placeholder="Example: LAPTOP-DELL-001"
              maxLength={100}
              required
            />

          </div>


          {/* ----------------------------------------------------
              PRICE
              ---------------------------------------------------- */}

          <div className="seller-form-group">

            <label htmlFor="price">
              Price (₹) <span>*</span>
            </label>


            <input
              type="number"
              id="price"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="Enter product price"
              min="0.01"
              step="0.01"
              required
            />

          </div>


          {/* ----------------------------------------------------
              CATEGORY
              ---------------------------------------------------- */}

          <div className="seller-form-group">

            <label htmlFor="category">
              Category <span>*</span>
            </label>


            <select
              id="category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              disabled={categoriesLoading}
              required
            >

              <option value="">
                {categoriesLoading
                  ? 'Loading categories...'
                  : 'Select a category'}
              </option>


              {categories.map((category) => (

                <option
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.categoryName}
                </option>

              ))}

            </select>

          </div>


          {/* ----------------------------------------------------
              BRAND
              ---------------------------------------------------- */}

          <div className="seller-form-group">

            <label htmlFor="brand">
              Brand
            </label>


            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
              placeholder="Enter brand name"
              maxLength={100}
            />

          </div>


          {/* ----------------------------------------------------
              STATUS
              ---------------------------------------------------- */}

          <div className="seller-form-group">

            <label htmlFor="status">
              Status
            </label>


            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >

              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="INACTIVE">
                INACTIVE
              </option>

            </select>

          </div>


          {/* ----------------------------------------------------
              DESCRIPTION
              ---------------------------------------------------- */}

          <div className="seller-form-group seller-form-full">

            <label htmlFor="description">
              Description
            </label>


            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe your product..."
              maxLength={2000}
              rows={6}
            />


            <small>
              Maximum 2000 characters.
            </small>

          </div>


          {/* ====================================================
              FORM ACTIONS
              ==================================================== */}

          <div className="seller-add-product-actions">

            {/* Cancel button */}
            <button
              type="button"
              className="seller-add-product-cancel"
              onClick={() => navigate('/seller/products')}
              disabled={submitting}
            >
              Cancel
            </button>


            {/* Update button */}
            <button
              type="submit"
              className="seller-add-product-submit"
              disabled={
                submitting ||
                categoriesLoading
              }
            >

              {submitting ? (

                <>
                  <LoaderCircle
                    size={19}
                    className="seller-submit-spinner"
                  />

                  Updating Product...
                </>

              ) : (

                <>
                  <Save size={19} />

                  Update Product
                </>

              )}

            </button>

          </div>

        </form>

      </section>

    </main>
  )
}


export default SellerEditProduct