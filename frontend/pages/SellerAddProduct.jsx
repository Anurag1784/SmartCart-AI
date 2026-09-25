import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  PlusCircle,
  Package,
  LoaderCircle,
  Upload,
  X,
} from 'lucide-react'

import { productApi } from '../services/api'
import './SellerAddProduct.css'


function SellerAddProduct() {

  // Used to navigate the seller after product creation.
  const navigate = useNavigate()


  // ============================================================
  // FORM STATE
  // ============================================================

  // Product name entered by the seller.
  const [productName, setProductName] = useState('')

  // Product SKU entered by the seller.
  const [sku, setSku] = useState('')

  // Product price entered by the seller.
  const [price, setPrice] = useState('')

  // Optional product description.
  const [description, setDescription] = useState('')

  // Optional product brand.
  const [brand, setBrand] = useState('')

  // Selected image file.
  const [imageFile, setImageFile] = useState(null)

  // Temporary browser preview URL for the selected image.
  const [imagePreview, setImagePreview] = useState('')

  // Product status.
  const [status, setStatus] = useState('ACTIVE')

  // Selected category ID.
  const [categoryId, setCategoryId] = useState('')


  // ============================================================
  // CATEGORY STATE
  // ============================================================

  // Store categories returned by Product Service.
  const [categories, setCategories] = useState([])

  // Track category loading state.
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Store category loading error.
  const [categoryError, setCategoryError] = useState('')


  // ============================================================
  // SUBMISSION STATE
  // ============================================================

  // Track whether product creation is running.
  const [submitting, setSubmitting] = useState(false)

  // Store product creation error.
  const [error, setError] = useState('')

  // Store successful creation message.
  const [success, setSuccess] = useState('')


  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {

    // Fetch all available categories from Product Service.
    const fetchCategories = async () => {

      try {

        // Clear any previous category error.
        setCategoryError('')

        // Request categories from Product Service.
        const response = await productApi.get(
          '/api/categories'
        )

        // Store the returned categories.
        setCategories(response.data)

      } catch (error) {

        // Log the technical error for development.
        console.error(
          'Category Loading Error:',
          error
        )

        // Display a user-friendly message.
        setCategoryError(
          'Unable to load categories. Please try again.'
        )

      } finally {

        // Stop the category loading state.
        setCategoriesLoading(false)
      }
    }

    // Run category request when the page opens.
    fetchCategories()

  }, [])


  // ============================================================
  // IMAGE SELECTION
  // ============================================================

  const handleImageChange = (event) => {

    // Get the first selected file.
    const selectedFile = event.target.files?.[0]

    // Clear previous image error.
    setError('')

    // If the seller cancelled the file picker,
    // keep the existing image selection.
    if (!selectedFile) {
      return
    }

    // Allowed image MIME types.
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    // Maximum allowed size: 5 MB.
    const maxFileSize = 5 * 1024 * 1024

    // Validate image type.
    if (!allowedTypes.includes(selectedFile.type)) {

      setError(
        'Only JPG, PNG and WEBP images are allowed.'
      )

      // Reset the file input.
      event.target.value = ''

      return
    }

    // Validate image size.
    if (selectedFile.size > maxFileSize) {

      setError(
        'Product image must not exceed 5 MB.'
      )

      // Reset the file input.
      event.target.value = ''

      return
    }

    // Release the previous preview URL if one exists.
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    // Store the selected file.
    setImageFile(selectedFile)

    // Create a temporary browser preview.
    const previewUrl =
      URL.createObjectURL(selectedFile)

    setImagePreview(previewUrl)
  }


  // ============================================================
  // REMOVE SELECTED IMAGE
  // ============================================================

  const handleRemoveImage = () => {

    // Release the temporary browser object URL.
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    // Remove selected file.
    setImageFile(null)

    // Remove preview.
    setImagePreview('')

    // Reset the actual file input.
    const imageInput =
      document.getElementById('productImage')

    if (imageInput) {
      imageInput.value = ''
    }
  }


  // ============================================================
  // UPLOAD IMAGE
  // ============================================================

  const uploadProductImage = async () => {

    // Make sure an image has been selected.
    if (!imageFile) {

      throw new Error(
        'Please select a product image.'
      )
    }

    // Create multipart form data.
    const formData = new FormData()

    // The key MUST match:
    //
    // @RequestParam("image")
    //
    // in ProductController.
    formData.append(
      'image',
      imageFile
    )

    /*
     * IMPORTANT:
     *
     * productApi has a default Content-Type:
     *
     * application/json
     *
     * That is correct for normal product API requests,
     * but it is NOT correct for image upload.
     *
     * Here we remove the JSON Content-Type for this
     * particular request.
     *
     * The browser/Axios will then automatically create:
     *
     * multipart/form-data;
     * boundary=...
     */

    const response = await productApi.post(
      '/api/products/upload-image',
      formData,
      {
        transformRequest: [
          (data, headers) => {

            // Remove the default JSON Content-Type.
            delete headers['Content-Type']

            // Also handle lowercase header name if present.
            delete headers['content-type']

            // Return FormData unchanged.
            return data
          },
        ],
      }
    )

    // Backend returns the generated public image URL.
    return response.data
  }


  // ============================================================
  // CREATE PRODUCT
  // ============================================================

  const handleSubmit = async (event) => {

    // Prevent the browser from refreshing the page.
    event.preventDefault()

    // Clear previous messages.
    setError('')
    setSuccess('')

    // Make sure a category was selected.
    if (!categoryId) {
      setError('Please select a category.')
      return
    }

    // Make sure an image was selected.
    if (!imageFile) {
      setError('Please select a product image.')
      return
    }

    // Start submitting state.
    setSubmitting(true)

    try {

      // ========================================================
      // STEP 1: UPLOAD IMAGE
      // ========================================================

      /*
       * Upload the actual image first.
       *
       * Backend returns something like:
       *
       * http://localhost:8081/uploads/products/abc.jpg
       */

      const uploadedImageUrl =
        await uploadProductImage()


      // ========================================================
      // STEP 2: CREATE PRODUCT
      // ========================================================

      // Create the product request body.
      //
      // IMPORTANT:
      // sellerId is intentionally NOT included.
      //
      // Product Service gets sellerId from the
      // authenticated JWT.

      const productData = {
        productName: productName.trim(),
        sku: sku.trim(),
        price: Number(price),
        description: description.trim(),
        brand: brand.trim(),

        // Save the URL returned by the image upload API.
        imageUrl: uploadedImageUrl,

        status: status,

        category: {
          categoryId: Number(categoryId),
        },
      }

      // Send the product creation request.
      const response = await productApi.post(
        '/api/products',
        productData
      )

      // Show success message.
      setSuccess(
        `Product "${response.data.productName}" was created successfully.`
      )

      // Clear the form after successful creation.
      setProductName('')
      setSku('')
      setPrice('')
      setDescription('')
      setBrand('')
      setImageFile(null)

      // Release the preview URL before clearing it.
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setImagePreview('')
      setStatus('ACTIVE')
      setCategoryId('')

      // Reset the actual file input.
      const imageInput =
        document.getElementById('productImage')

      if (imageInput) {
        imageInput.value = ''
      }

      // Wait briefly so the seller can see the
      // successful creation message.
      setTimeout(() => {
        navigate('/seller/products')
      }, 900)

    } catch (error) {

      // Log technical error for development.
      console.error(
        'Create Product Error:',
        error
      )

      // Handle backend validation errors.
      if (error.response?.data?.errors) {

        // Convert backend validation errors into readable text.
        const validationMessages = Object.values(
          error.response.data.errors
        ).join(' ')

        setError(validationMessages)

      } else if (error.response?.data?.message) {

        // Use the backend's message when available.
        setError(error.response.data.message)

      } else if (error.response?.status === 400) {

        // Backend rejected the uploaded image or request.
        setError(
          typeof error.response?.data === 'string'
            ? error.response.data
            : 'The uploaded image or product data is invalid.'
        )

      } else if (error.response?.status === 403) {

        // Seller does not have permission.
        setError(
          'You do not have permission to create products.'
        )

      } else if (error.message) {

        // Use readable frontend/upload error.
        setError(error.message)

      } else {

        // Generic fallback error.
        setError(
          'Unable to create the product. Please try again.'
        )
      }

    } finally {

      // Stop submitting state.
      setSubmitting(false)
    }
  }


  // ============================================================
  // RETURN TO SELLER DASHBOARD
  // ============================================================

  const handleBackToDashboard = () => {

    // REPLACE the current Add Product page in browser history.
    //
    // This prevents:
    //
    // Seller Home
    //      ↓
    // Add Product
    //      ↓
    // Dashboard
    //
    // from creating an unnecessary extra history entry.
    //
    // After going to Dashboard:
    //
    // Browser Back
    //      ↓
    // Previous page before Add Product

    navigate('/seller', { replace: true })
  }


  // ============================================================
  // CANCEL PRODUCT CREATION
  // ============================================================

  const handleCancel = () => {

    // Cancel should also return to Seller Dashboard
    // without adding another browser-history entry.
    navigate('/seller', { replace: true })
  }


  return (
    <main className="seller-add-product-page">

      {/* ========================================================
          PAGE HEADER
          ======================================================== */}

      <header className="seller-add-product-header">

        <div>

          {/* Return to Seller Dashboard */}
          <button
            type="button"
            className="seller-add-product-back"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <span className="seller-add-product-eyebrow">
            SELLER WORKSPACE
          </span>

          <h1>
            Add Product
          </h1>

          <p>
            Add a new product to your SmartCart store.
          </p>

        </div>

      </header>


      {/* ========================================================
          FORM CONTAINER
          ======================================================== */}

      <section className="seller-add-product-card">

        <div className="seller-add-product-card-header">

          <div className="seller-add-product-icon">
            <Package size={25} />
          </div>

          <div>

            <h2>
              Product Information
            </h2>

            <p>
              Enter the details of the product you want to list.
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

          {/* Product Name */}
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


          {/* SKU */}
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


          {/* Price */}
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


          {/* Category */}
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


          {/* Brand */}
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


          {/* Status */}
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


          {/* ====================================================
              PRODUCT IMAGE UPLOAD
              ==================================================== */}

          <div className="seller-form-group seller-form-full">

            <label htmlFor="productImage">
              Product Image <span>*</span>
            </label>

            {!imagePreview ? (

              <label
                htmlFor="productImage"
                className="seller-product-image-upload"
              >

                <Upload size={28} />

                <strong>
                  Choose Product Image
                </strong>

                <span>
                  JPG, PNG or WEBP • Maximum 5 MB
                </span>

                <input
                  type="file"
                  id="productImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />

              </label>

            ) : (

              <div className="seller-product-image-preview">

                <img
                  src={imagePreview}
                  alt="Selected product preview"
                />

                <div className="seller-product-image-preview-info">

                  <strong>
                    {imageFile?.name}
                  </strong>

                  <span>
                    {imageFile
                      ? `${(
                          imageFile.size /
                          (1024 * 1024)
                        ).toFixed(2)} MB`
                      : ''}
                  </span>

                  <button
                    type="button"
                    className="seller-product-image-remove"
                    onClick={handleRemoveImage}
                  >
                    <X size={17} />
                    Remove Image
                  </button>

                </div>

              </div>

            )}

            <small>
              Select a clear product image. The image will be
              uploaded securely when you create the product.
            </small>

          </div>


          {/* Description */}
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

            <button
              type="button"
              className="seller-add-product-cancel"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>

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
                  Creating Product...
                </>
              ) : (
                <>
                  <PlusCircle size={19} />
                  Create Product
                </>
              )}

            </button>

          </div>

        </form>

      </section>

    </main>
  )
}


export default SellerAddProduct