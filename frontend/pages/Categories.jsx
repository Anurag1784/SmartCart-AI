import {
  ArrowRight,
  Gamepad2,
  Headphones,
  Home as HomeIcon,
  Laptop,
  Shirt,
  Watch,
  Smartphone,
  Package,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import { productApi } from '../services/api'

import './Categories.css'


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

    return HomeIcon
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
// CATEGORIES PAGE
// ============================================================

function Categories() {


  // ============================================================
  // STATE
  // ============================================================

  // Store all categories received from Product Service.
  const [categories, setCategories] = useState([])

  // Store products so real category counts can be calculated.
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


        // Fetch categories and products together.
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


        // Store all categories.
        setCategories(
          categoryResponse.data
        )


        // Store all products.
        setProducts(
          productResponse.data
        )


      } catch (error) {

        console.error(
          'Categories Page Fetch Error:',
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

    <main className="categories-page">


      {/* =================================
          PAGE HEADER
      ================================== */}

      <section className="categories-hero">

        <div className="categories-hero-content">

          <p className="categories-label">

            ALL CATEGORIES

          </p>


          <h1>

            Explore all our

            <span> categories.</span>

          </h1>


          <p className="categories-description">

            Browse every product category available on SmartCart AI
            and discover products that match your needs.

          </p>

        </div>

      </section>


      {/* =================================
          CATEGORY CONTENT
      ================================== */}

      <section className="categories-content">

        <div className="categories-container">


          {/* =================================
              LOADING STATE
          ================================== */}

          {loading && (

            <div className="categories-message">

              <p>

                Loading categories...

              </p>

            </div>

          )}


          {/* =================================
              ERROR STATE
          ================================== */}

          {!loading && error && (

            <div className="categories-message">

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

              <div className="categories-message">

                <p>

                  No categories are currently available.

                </p>

              </div>

            )}


          {/* =================================
              ALL CATEGORIES GRID
          ================================== */}

          {!loading &&
            !error &&
            categories.length > 0 && (

              <div className="categories-grid">

                {categories.map((category, index) => {

                  // Select icon according to category name.
                  const Icon = getCategoryIcon(
                    category.categoryName
                  )


                  // Calculate real product count.
                  const productCount =
                    getProductCount(category)


                  // Get category description.
                  const description =
                    getCategoryDescription(
                      category.categoryName
                    )


                  return (

                    <article
                      className="categories-card"
                      key={category.categoryId}
                    >


                      {/* Decorative card glow */}

                      <div className="categories-card-glow"></div>


                      {/* =================================
                          CARD TOP
                      ================================== */}

                      <div className="categories-card-top">

                        <div className="categories-icon">

                          <Icon size={28} />

                        </div>


                        <span className="categories-number">

                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}

                        </span>

                      </div>


                      {/* =================================
                          CARD CONTENT
                      ================================== */}

                      <div className="categories-card-content">

                        <h2>

                          {category.categoryName}

                        </h2>


                        <p>

                          {description}

                        </p>

                      </div>


                      {/* =================================
                          CARD FOOTER
                      ================================== */}

                      <div className="categories-card-footer">

                        <span>

                          {productCount}{' '}

                          {productCount === 1
                            ? 'Product'
                            : 'Products'}

                        </span>


                        <Link
                          to="/products"
                          className="categories-explore-button"
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
              BACK TO PRODUCTS
          ================================== */}

          {!loading && !error && (

            <div className="categories-bottom-action">

              <Link
                to="/products"
                className="categories-products-button"
              >

                <span>

                  Browse All Products

                </span>


                <ArrowRight size={18} />

              </Link>

            </div>

          )}

        </div>

      </section>

    </main>

  )

}


export default Categories