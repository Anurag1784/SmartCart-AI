import { useEffect, useMemo, useState } from 'react'

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
} from 'lucide-react'

import { useSelector } from 'react-redux'

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoriesApi'

import './Categories.css'


function Categories() {

  const token = useSelector((state) => state.auth.token)


  // =========================================================
  // Categories State
  // =========================================================

  const [categories, setCategories] = useState([])

  const [searchTerm, setSearchTerm] = useState('')

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  // =========================================================
  // Category Modal State
  // =========================================================

  const [showCategoryModal, setShowCategoryModal] =
    useState(false)

  /*
   * null  = Add Category mode
   * object = Edit Category mode
   */
  const [editingCategory, setEditingCategory] =
    useState(null)


  // =========================================================
  // Delete Modal State
  // =========================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false)

  const [deletingCategory, setDeletingCategory] =
    useState(null)

  const [deleting, setDeleting] =
    useState(false)

  const [deleteError, setDeleteError] =
    useState('')


  // =========================================================
  // Category Form State
  // =========================================================

  const [categoryName, setCategoryName] =
    useState('')

  const [description, setDescription] =
    useState('')


  // =========================================================
  // Form State
  // =========================================================

  const [savingCategory, setSavingCategory] =
    useState(false)

  const [formError, setFormError] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')


  // =========================================================
  // Load Categories
  // =========================================================

  const loadCategories = async () => {

    try {

      setLoading(true)

      setError('')


      const data = await getCategories(token)


      setCategories(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {

      console.error(
        'Failed to load categories:',
        err
      )


      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to load categories.'
      )

    } finally {

      setLoading(false)

    }
  }


  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(() => {

    if (token) {

      loadCategories()

    }

  }, [token])


  // =========================================================
  // Search
  // =========================================================

  const filteredCategories = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase()


    if (!search) {

      return categories

    }


    return categories.filter(
      (category) =>
        category.categoryName
          ?.toLowerCase()
          .includes(search)
    )

  }, [categories, searchTerm])


  // =========================================================
  // Open ADD Category Modal
  // =========================================================

  const handleOpenAddModal = () => {

    // Clear edit mode.
    setEditingCategory(null)

    // Clear form.
    setCategoryName('')

    setDescription('')

    // Clear messages.
    setFormError('')

    setSuccessMessage('')

    // Open modal.
    setShowCategoryModal(true)
  }


  // =========================================================
  // Open EDIT Category Modal
  // =========================================================

  const handleOpenEditModal = (category) => {

    // Store the category currently being edited.
    setEditingCategory(category)

    // Load existing category name.
    setCategoryName(
      category.categoryName || ''
    )

    // Load existing description.
    setDescription(
      category.description || ''
    )

    // Clear previous messages.
    setFormError('')

    setSuccessMessage('')

    // Open modal.
    setShowCategoryModal(true)
  }


  // =========================================================
  // Close Category Modal
  // =========================================================

  const handleCloseCategoryModal = () => {

    // Don't allow closing while saving.
    if (savingCategory) {

      return

    }


    setShowCategoryModal(false)

    setEditingCategory(null)

    setCategoryName('')

    setDescription('')

    setFormError('')

    setSuccessMessage('')
  }


  // =========================================================
  // CREATE / UPDATE CATEGORY
  // =========================================================

  const handleSaveCategory = async (event) => {

    event.preventDefault()


    setFormError('')

    setSuccessMessage('')


    // -------------------------------------------------------
    // Trim Values
    // -------------------------------------------------------

    const trimmedName =
      categoryName.trim()

    const trimmedDescription =
      description.trim()


    // -------------------------------------------------------
    // Name Validation
    // -------------------------------------------------------

    if (!trimmedName) {

      setFormError(
        'Category name is required.'
      )

      return
    }


    if (trimmedName.length > 100) {

      setFormError(
        'Category name must not exceed 100 characters.'
      )

      return
    }


    // -------------------------------------------------------
    // Description Validation
    // -------------------------------------------------------

    if (trimmedDescription.length > 500) {

      setFormError(
        'Description must not exceed 500 characters.'
      )

      return
    }


    // -------------------------------------------------------
    // Duplicate Category Check
    // -------------------------------------------------------

    const duplicateCategory =
      categories.some((category) => {

        // When editing, ignore the current category itself.
        if (
          editingCategory &&
          category.categoryId ===
            editingCategory.categoryId
        ) {

          return false
        }


        return (
          category.categoryName
            ?.trim()
            .toLowerCase() ===
          trimmedName.toLowerCase()
        )
      })


    if (duplicateCategory) {

      setFormError(
        `Category "${trimmedName}" already exists.`
      )

      return
    }


    // -------------------------------------------------------
    // API Operation
    // -------------------------------------------------------

    try {

      setSavingCategory(true)


      const categoryRequest = {

        categoryName: trimmedName,

        description:
          trimmedDescription || null,

      }


      // =====================================================
      // EDIT CATEGORY
      // =====================================================

      if (editingCategory) {

        const updatedCategory =
          await updateCategory(
            editingCategory.categoryId,
            categoryRequest,
            token
          )


        // Update category inside local state.
        setCategories(
          (previousCategories) =>
            previousCategories.map(
              (category) =>
                category.categoryId ===
                editingCategory.categoryId
                  ? updatedCategory
                  : category
            )
        )


        setSuccessMessage(
          `Category "${trimmedName}" updated successfully.`
        )


        // Close after successful update.
        setTimeout(() => {

          setShowCategoryModal(false)

          setEditingCategory(null)

          setCategoryName('')

          setDescription('')

          setSuccessMessage('')

        }, 700)


      }

      // =====================================================
      // CREATE CATEGORY
      // =====================================================

      else {

        const newCategory =
          await createCategory(
            categoryRequest,
            token
          )


        // Add new category to local state.
        setCategories(
          (previousCategories) => [
            ...previousCategories,
            newCategory,
          ]
        )


        setSuccessMessage(
          `Category "${trimmedName}" created successfully.`
        )


        // Close after successful creation.
        setTimeout(() => {

          setShowCategoryModal(false)

          setCategoryName('')

          setDescription('')

          setSuccessMessage('')

        }, 700)

      }


    } catch (err) {

      console.error(
        editingCategory
          ? 'Failed to update category:'
          : 'Failed to create category:',
        err
      )


      let message =
        editingCategory
          ? 'Failed to update category.'
          : 'Failed to create category.'


      // Backend message.
      if (err.response?.data?.message) {

        message =
          err.response.data.message

      }

      // Plain text backend response.
      else if (
        typeof err.response?.data ===
        'string'
      ) {

        message =
          err.response.data

      }

      // Validation errors.
      else if (
        err.response?.data?.errors
      ) {

        const validationErrors =
          Object.values(
            err.response.data.errors
          ).flat()


        if (
          validationErrors.length > 0
        ) {

          message =
            validationErrors.join(' ')

        }
      }


      setFormError(message)

    } finally {

      setSavingCategory(false)

    }
  }


  // =========================================================
  // OPEN DELETE CONFIRMATION
  // =========================================================

  const handleOpenDeleteModal = (category) => {

    // Store selected category.
    setDeletingCategory(category)

    // Clear previous delete error.
    setDeleteError('')

    // Open confirmation modal.
    setShowDeleteModal(true)
  }


  // =========================================================
  // CLOSE DELETE CONFIRMATION
  // =========================================================

  const handleCloseDeleteModal = () => {

    // Don't close while deletion is running.
    if (deleting) {

      return

    }


    setShowDeleteModal(false)

    setDeletingCategory(null)

    setDeleteError('')
  }


  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  const handleDeleteCategory = async () => {

    if (!deletingCategory) {

      return

    }


    try {

      setDeleting(true)

      setDeleteError('')


      // -------------------------------------------------------
      // Send DELETE request to Admin Service.
      // -------------------------------------------------------

      await deleteCategory(
        deletingCategory.categoryId,
        token
      )


      // -------------------------------------------------------
      // Remove deleted category from UI.
      // -------------------------------------------------------

      setCategories(
        (previousCategories) =>
          previousCategories.filter(
            (category) =>
              category.categoryId !==
              deletingCategory.categoryId
          )
      )


      // -------------------------------------------------------
      // Close modal.
      // -------------------------------------------------------

      setShowDeleteModal(false)

      setDeletingCategory(null)

    } catch (err) {

      console.error(
        'Failed to delete category:',
        err
      )


      let message =
        'Failed to delete category.'


      // -------------------------------------------------------
      // Backend message.
      // -------------------------------------------------------

      if (err.response?.data?.message) {

        message =
          err.response.data.message

      }

      // -------------------------------------------------------
      // Plain text response.
      // -------------------------------------------------------

      else if (
        typeof err.response?.data ===
        'string'
      ) {

        message =
          err.response.data

      }

      // -------------------------------------------------------
      // Validation / error collection.
      // -------------------------------------------------------

      else if (
        err.response?.data?.errors
      ) {

        const validationErrors =
          Object.values(
            err.response.data.errors
          ).flat()


        if (
          validationErrors.length > 0
        ) {

          message =
            validationErrors.join(' ')

        }
      }


      setDeleteError(message)

    } finally {

      setDeleting(false)

    }
  }


  return (

    <div className="categories-page">


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="categories-header">

        <div>

          <p className="categories-eyebrow">
            PRODUCT MANAGEMENT
          </p>


          <h1>
            Categories
          </h1>


          <p className="categories-subtitle">
            Manage the product categories available across SmartCart AI.
          </p>

        </div>


        <button
          className="category-add-button"
          type="button"
          onClick={handleOpenAddModal}
        >

          <Plus size={18} />

          Add Category

        </button>

      </div>


      {/* =====================================================
          SUMMARY CARD
          ===================================================== */}

      <div className="category-summary-card">

        <div className="category-summary-icon">

          <span>
            {categories.length}
          </span>

        </div>


        <div>

          <p>
            Total Categories
          </p>


          <h2>
            {categories.length}
          </h2>

        </div>

      </div>


      {/* =====================================================
          CATEGORIES CARD
          ===================================================== */}

      <section className="categories-card">


        {/* ===================================================
            CARD HEADER
            =================================================== */}

        <div className="categories-card-header">

          <div>

            <h2>
              All Categories
            </h2>


            <p>

              {filteredCategories.length}{' '}

              categor
              {filteredCategories.length === 1
                ? 'y'
                : 'ies'}

              {' '}displayed

            </p>

          </div>


          <button
            className="category-refresh-button"
            type="button"
            onClick={loadCategories}
            disabled={loading}
            title="Refresh categories"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? 'refresh-spinning'
                  : ''
              }
            />

            Refresh

          </button>

        </div>


        {/* ===================================================
            SEARCH
            =================================================== */}

        <div className="category-search-wrapper">

          <Search size={18} />


          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        {/* ===================================================
            ERROR
            =================================================== */}

        {error && (

          <div className="category-error">
            {error}
          </div>

        )}


        {/* ===================================================
            LOADING / EMPTY / TABLE
            =================================================== */}

        {loading ? (

          <div className="category-state">

            <RefreshCw
              size={24}
              className="refresh-spinning"
            />

            <p>
              Loading categories...
            </p>

          </div>

        ) : filteredCategories.length === 0 ? (

          <div className="category-state">

            <p>

              {searchTerm
                ? 'No categories match your search.'
                : 'No categories found.'}

            </p>

          </div>

        ) : (

          <div className="categories-table-wrapper">

            <table className="categories-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>


                  <th>
                    Category Name
                  </th>


                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredCategories.map(
                  (category) => (

                    <tr
                      key={
                        category.categoryId
                      }
                    >


                      {/* ID */}

                      <td>

                        <span className="category-id">

                          #
                          {category.categoryId}

                        </span>

                      </td>


                      {/* CATEGORY NAME */}

                      <td>

                        <div className="category-name-cell">

                          <div className="category-name-icon">

                            {category.categoryName
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </div>


                          <span>
                            {category.categoryName}
                          </span>

                        </div>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="category-actions">


                          {/* EDIT */}

                          <button
                            type="button"
                            className="category-action-button edit"
                            title="Edit category"
                            onClick={() =>
                              handleOpenEditModal(
                                category
                              )
                            }
                          >

                            <Pencil size={16} />

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="category-action-button delete"
                            title="Delete category"
                            onClick={() =>
                              handleOpenDeleteModal(
                                category
                              )
                            }
                          >

                            <Trash2 size={16} />

                          </button>

                        </div>

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
          ADD / EDIT CATEGORY MODAL
          ===================================================== */}

      {showCategoryModal && (

        <div
          className="category-modal-overlay"

          onMouseDown={(event) => {

            if (
              event.target ===
                event.currentTarget &&
              !savingCategory
            ) {

              handleCloseCategoryModal()

            }

          }}
        >

          <div className="category-modal">


            {/* =================================================
                MODAL HEADER
                ================================================= */}

            <div className="category-modal-header">

              <div>

                <p className="category-modal-eyebrow">
                  CATEGORY MANAGEMENT
                </p>


                <h2>

                  {editingCategory
                    ? 'Edit Category'
                    : 'Add Category'}

                </h2>


                <p>

                  {editingCategory
                    ? 'Update the product category details.'
                    : 'Create a new product category.'}

                </p>

              </div>


              <button
                type="button"
                className="category-modal-close"
                onClick={
                  handleCloseCategoryModal
                }
                disabled={
                  savingCategory
                }
                title="Close"
              >

                <X size={20} />

              </button>

            </div>


            {/* =================================================
                FORM
                ================================================= */}

            <form
              className="category-form"
              onSubmit={
                handleSaveCategory
              }
            >


              {/* CATEGORY NAME */}

              <div className="category-form-group">

                <label htmlFor="categoryName">

                  Category Name

                  <span>
                    *
                  </span>

                </label>


                <input
                  id="categoryName"
                  type="text"
                  value={categoryName}

                  onChange={(event) =>
                    setCategoryName(
                      event.target.value
                    )
                  }

                  placeholder="e.g. Electronics"

                  maxLength={100}

                  disabled={
                    savingCategory
                  }

                  autoFocus
                />


                <div className="category-character-count">

                  {categoryName.length}/100

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="category-form-group">

                <label htmlFor="categoryDescription">

                  Description

                </label>


                <textarea
                  id="categoryDescription"

                  value={description}

                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }

                  placeholder="Enter a short description for this category..."

                  maxLength={500}

                  rows={5}

                  disabled={
                    savingCategory
                  }
                />


                <div className="category-character-count">

                  {description.length}/500

                </div>

              </div>


              {/* FORM ERROR */}

              {formError && (

                <div className="category-form-error">

                  {formError}

                </div>

              )}


              {/* FORM SUCCESS */}

              {successMessage && (

                <div className="category-form-success">

                  {successMessage}

                </div>

              )}


              {/* MODAL FOOTER */}

              <div className="category-modal-footer">


                <button
                  type="button"
                  className="category-modal-cancel"
                  onClick={
                    handleCloseCategoryModal
                  }
                  disabled={
                    savingCategory
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="category-modal-submit"
                  disabled={
                    savingCategory
                  }
                >

                  {savingCategory ? (

                    <>

                      <RefreshCw
                        size={16}
                        className="refresh-spinning"
                      />

                      {editingCategory
                        ? 'Updating...'
                        : 'Creating...'}

                    </>

                  ) : (

                    <>

                      {editingCategory ? (
                        <Pencil size={16} />
                      ) : (
                        <Plus size={17} />
                      )}


                      {editingCategory
                        ? 'Update Category'
                        : 'Create Category'}

                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION MODAL
          ===================================================== */}

      {showDeleteModal && deletingCategory && (

        <div
          className="category-modal-overlay"

          onMouseDown={(event) => {

            if (
              event.target ===
                event.currentTarget &&
              !deleting
            ) {

              handleCloseDeleteModal()

            }

          }}
        >

          <div className="category-delete-modal">


            {/* =================================================
                DELETE ICON
                ================================================= */}

            <div className="category-delete-icon">

              <AlertTriangle size={25} />

            </div>


            {/* =================================================
                DELETE CONTENT
                ================================================= */}

            <div className="category-delete-content">

              <h2>
                Delete Category?
              </h2>


              <p>

                Are you sure you want to delete{' '}

                <strong>
                  {deletingCategory.categoryName}
                </strong>

                ?

              </p>


              <p className="category-delete-warning">

                This action cannot be undone.

              </p>


              {/* =================================================
                  DELETE ERROR
                  ================================================= */}

              {deleteError && (

                <div className="category-form-error">

                  {deleteError}

                </div>

              )}

            </div>


            {/* =================================================
                DELETE FOOTER
                ================================================= */}

            <div className="category-delete-footer">

              <button
                type="button"
                className="category-modal-cancel"
                onClick={
                  handleCloseDeleteModal
                }
                disabled={
                  deleting
                }
              >

                Cancel

              </button>


              <button
                type="button"
                className="category-delete-confirm"
                onClick={
                  handleDeleteCategory
                }
                disabled={
                  deleting
                }
              >

                {deleting ? (

                  <>

                    <RefreshCw
                      size={16}
                      className="refresh-spinning"
                    />

                    Deleting...

                  </>

                ) : (

                  <>

                    <Trash2 size={16} />

                    Delete Category

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )
}


export default Categories