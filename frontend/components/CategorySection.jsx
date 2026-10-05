import {
  ArrowRight,
  Gamepad2,
  Headphones,
  Home,
  Laptop,
  Shirt,
  Watch,
  Smartphone,
  Package,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import { productApi } from '../services/api'

import './CategorySection.css'


/*
 * Dynamic categories displayed on the Home page.
 *
 * Only the first 6 categories are displayed here.
 *
 * All categories are loaded from Product Service.
 *
 * Product Service:
 *
 * http://localhost:8081/api/categories
 *
 * Products are also loaded so that the actual number
 * of products belonging to each category can be shown.
 */


// ============================================================
// CATEGORY DESCRIPTION
// ============================================================

const getCategoryDescription = (categoryName) => {

  const name = categoryName.toLowerCase()


  if (
    name.includes('electronic')
  ) {

    return 'Smart devices, audio & accessories'
  }


  if (
    name.includes('fashion') ||
    name.includes('cloth')
  ) {

    return 'Trendy clothing, shoes & accessories'
  }


  if (
    name.includes('home') ||
    name.includes('living')
  ) {

    return 'Everything for your modern home'
  }


  if (
    name.includes('computer') ||
    name.includes('laptop')
  ) {

    return 'Laptops, desktops & accessories'
  }


  if (
    name.includes('wearable') ||
    name.includes('watch')
  ) {

    return 'Smart watches & fitness technology'
  }


  if (
    name.includes('gaming') ||
    name.includes('game')
  ) {

    return 'Gaming consoles, gear & accessories'
  }


  if (
    name.includes('mobile') ||
    name.includes('phone') ||
    name.includes('smartphone')
  ) {

    return 'Smartphones, devices & accessories'
  }


  return 'Explore products from this category'
}


// ============================================================
// CATEGORY ICON
// ============================================================

const getCategoryIcon = (categoryName) => {

  const name = categoryName.toLowerCase()


  if (
    name.includes('electronic')
  ) {

    return Headphones
  }


  if (
    name.includes('fashion') ||
    name.includes('cloth')
  ) {

    return Shirt
  }


  if (
    name.includes('home') ||
    name.includes('living')
  ) {

    return Home
  }


  if (
    name.includes('computer') ||
    name.includes('laptop')
  ) {

    return Laptop
  }


  if (
    name.includes('wearable') ||
    name.includes('watch')
  ) {

    return Watch
  }


  if (
    name.includes('gaming') ||
    name.includes('game')
  ) {

    return Gamepad2
  }


  if (
    name.includes('mobile') ||
    name.includes('phone') ||
    name.includes('smartphone')
  ) {

    return Smartphone
  }


  return Package
}


// ============================================================
// CATEGORY SECTION
// ============================================================

function CategorySection() {


  // ============================================================
  // STATE
  // ============================================================

  // Store categories received from Product Service.
  const [categories, setCategories] = useState([])

  // Store products so we can calculate real category counts.
  const [products, setProducts] = useState([])

  // Track loading state.
  const [loading, setLoading] = useState(true)

  // Store API error.
  const [error, setError] = useState('')


  // ============================================================
  // FETCH CATEGORIES + PRODUCTS
  // ============================================================

  useEffect(() => {

    const fetchCategoryData = async () => {

      try {

        // Clear previous error.
        setError('')


        // Request categories and products together.
        const [
          categoryResponse,
          productResponse,
        ] = await Promise.all([

          productApi.get(
            '/api/categories'
          ),

          productApi.get(
            '/api/products'
          ),

        ])


        // Store real categories.
        setCategories(
          categoryResponse.data
        )


        // Store real products.
        setProducts(
          productResponse.data
        )


      } catch (error) {

        console.error(
          'Category Fetch Error:',
          error
        )


        // Backend returned an HTTP error.
        if (error.response) {

          setError(
            `Unable to load categories. Server returned ${error.response.status}.`
          )

        }

        // Product Service did not respond.
        else if (error.request) {

          setError(
            'Unable to connect to Product Service.'
          )

        }

        // Unexpected error.
        else {

          setError(
            'Something went wrong while loading categories.'
          )

        }


      } finally {

        // Stop loading.
        setLoading(false)

      }

    }


    fetchCategoryData()

  }, [])


  // ============================================================
  // GET PRODUCT COUNT
  // ============================================================

  const getProductCount = (category) => {

    return products.filter((product) => {

      // Product category can be returned as an object.
      if (
        product.category &&
        typeof product.category === 'object'
      ) {

        return (
          product.category.categoryId ===
          category.categoryId
        )

      }


      // Product category can also be returned
      // as a simple string.
      if (
        typeof product.category === 'string'
      ) {

        return (
          product.category.toLowerCase() ===
          category.categoryName.toLowerCase()
        )

      }


      return false

    }).length

  }


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <section
      id="categories"
      className="category-section"
    >

      {/* =================================
          BACKGROUND DECORATION
      ================================== */}

      <div className="category-glow category-glow-left"></div>

      <div className="category-glow category-glow-right"></div>


      {/* Decorative dots */}

      <div className="category-dots category-dots-top">

        <span></span>

        <span></span>

        <span></span>

        <span></span>

        <span></span>

        <span></span>

        <span></span>

        <span></span>

      </div>


      <div className="category-container">


        {/* =================================
            SECTION HEADER
        ================================== */}

        <div className="category-header">

          <p className="category-label">

            EXPLORE CATEGORIES

          </p>


          <h2>

            Find what you're

            <span> looking for.</span>

          </h2>


          <p className="category-description">

            Explore our product categories and quickly discover
            the things you need for work, lifestyle, entertainment,
            and everyday shopping.

          </p>

        </div>


        {/* =================================
            LOADING STATE
        ================================== */}

        {loading && (

          <div
            className="category-message"
            style={{
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >

            <p>

              Loading categories...

            </p>

          </div>

        )}


        {/* =================================
            ERROR STATE
        ================================== */}

        {!loading && error && (

          <div
            className="category-message"
            style={{
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#64748b',
            }}
          >

            <p>

              {error}

            </p>

          </div>

        )}


        {/* =================================
            EMPTY STATE
        ================================== */}

        {!loading &&
          !error &&
          categories.length === 0 && (

            <div
              className="category-message"
              style={{
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#64748b',
              }}
            >

              <p>

                No categories are currently available.

              </p>

            </div>

          )}


        {/* =================================
            CATEGORY GRID
        ================================== */}

        {!loading &&
          !error &&
          categories.length > 0 && (

            <div className="category-grid">

              {categories
                .slice(0, 6)
                .map((category, index) => {

                  // Select icon according to category name.
                  const Icon = getCategoryIcon(
                    category.categoryName
                  )


                  // Get actual product count.
                  const productCount =
                    getProductCount(category)


                  // Get description.
                  const description =
                    getCategoryDescription(
                      category.categoryName
                    )


                  return (

                    <article
                      className="category-card"
                      key={category.categoryId}
                    >

                      {/* Decorative card glow */}

                      <div className="category-card-glow"></div>


                      {/* =================================
                          CARD TOP
                      ================================== */}

                      <div className="category-card-top">

                        <div className="category-icon">

                          <Icon size={28} />

                        </div>


                        <span className="category-number">

                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}

                        </span>

                      </div>


                      {/* =================================
                          CARD CONTENT
                      ================================== */}

                      <div className="category-content">

                        <h3>

                          {category.categoryName}

                        </h3>


                        <p>

                          {description}

                        </p>

                      </div>


                      {/* =================================
                          CARD FOOTER
                      ================================== */}

                      <div className="category-footer">

                        <span>

                          {productCount}{' '}

                          {productCount === 1
                            ? 'Product'
                            : 'Products'}

                        </span>


                        <Link
                          to="/products"
                          className="category-explore-button"
                          aria-label={`Explore ${category.categoryName}`}
                        >

                          <span>

                            Explore

                          </span>


                          <ArrowRight size={16} />

                        </Link>

                      </div>


                    </article>

                  )

                })}

            </div>

          )}


        {/* =================================
            BOTTOM ACTION
        ================================== */}

        <div className="category-action">

          <Link
            to="/categories"
            className="category-view-all"
          >

            <span>

              Browse All Categories

            </span>


            <ArrowRight size={18} />

          </Link>

        </div>


      </div>

    </section>

  )

}


export default CategorySection