import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Boxes,
  ArrowRight,
  LockKeyhole,
} from 'lucide-react'

import { loginAdmin } from '../api/authApi'
import { setCredentials } from '../redux/slices/authSlice'
import './Login.css'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ----------------------------------------------------------
  // Handle Admin Login
  // ----------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    // Basic frontend validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.')
      return
    }

    try {
      setLoading(true)

      // Call existing SmartCart Auth Service
      const response = await loginAdmin(email, password)

      // ------------------------------------------------------
      // IMPORTANT:
      // Only ADMIN users are allowed to enter Admin Frontend.
      // ------------------------------------------------------
      if (response.role !== 'ADMIN') {
        setError(
          'Access denied. Only ADMIN users can access this panel.'
        )
        return
      }

      // ------------------------------------------------------
      // Store authentication information in Redux
      // + sessionStorage
      // ------------------------------------------------------
      dispatch(
        setCredentials({
          token: response.token,

          user: {
            userId: response.userId,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            role: response.role,
          },
        })
      )

      // ------------------------------------------------------
      // Successful Admin login → Dashboard
      // ------------------------------------------------------
      navigate('/dashboard')
    } catch (err) {
      console.error('Admin login failed:', err)

      if (err.response?.status === 401) {
        setError('Invalid email or password.')
      } else if (err.response?.status === 403) {
        setError(
          'You are not authorized to access the Admin Panel.'
        )
      } else {
        setError(
          err.response?.data?.message ||
            'Unable to login. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">

      {/* ======================================================
          Background decorative elements
          ====================================================== */}

      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <div className="admin-login-container">

        {/* ====================================================
            Header / Brand
            ==================================================== */}

        <header className="admin-login-brand">
          <div className="admin-login-brand-mark">
            SC
          </div>

          <div>
            <h1>SmartCart</h1>
            <span>ADMIN CONTROL</span>
          </div>
        </header>

        {/* ====================================================
            Main Login Content
            ==================================================== */}

        <main className="admin-login-content">

          {/* ==================================================
              Left Information Card
              ================================================== */}

          <section className="admin-login-info-card">

            <div className="admin-login-info-badge">
              <ShieldCheck size={17} />
              <span>Administration Portal</span>
            </div>

            <h2>
              Manage SmartCart AI
              <span> from one place.</span>
            </h2>

            <p className="admin-login-info-description">
              SmartCart AI is an intelligent e-commerce platform
              designed to connect customers, sellers and
              administrators through a unified digital ecosystem.
            </p>

            <div className="admin-login-feature-list">

              <div className="admin-login-feature">
                <div className="admin-login-feature-icon">
                  <Users size={18} />
                </div>

                <div>
                  <strong>User Management</strong>
                  <span>Monitor customers and sellers</span>
                </div>
              </div>

              <div className="admin-login-feature">
                <div className="admin-login-feature-icon">
                  <Package size={18} />
                </div>

                <div>
                  <strong>Product Management</strong>
                  <span>Manage products and categories</span>
                </div>
              </div>

              <div className="admin-login-feature">
                <div className="admin-login-feature-icon">
                  <ShoppingCart size={18} />
                </div>

                <div>
                  <strong>Order Operations</strong>
                  <span>Monitor platform orders</span>
                </div>
              </div>

              <div className="admin-login-feature">
                <div className="admin-login-feature-icon">
                  <CreditCard size={18} />
                </div>

                <div>
                  <strong>Payments</strong>
                  <span>Track payment activity</span>
                </div>
              </div>

              <div className="admin-login-feature">
                <div className="admin-login-feature-icon">
                  <Boxes size={18} />
                </div>

                <div>
                  <strong>Inventory</strong>
                  <span>Monitor stock and inventory health</span>
                </div>
              </div>

            </div>

            <div className="admin-login-info-footer">
              <div className="admin-login-footer-icon">
                <LockKeyhole size={16} />
              </div>

              <span>
                Secure access for authorized administrators only.
              </span>
            </div>

          </section>

          {/* ==================================================
              Login Card
              ================================================== */}

          <section className="admin-login-form-card">

            <div className="admin-login-form-header">

              <div className="admin-login-form-icon">
                <ShieldCheck size={24} />
              </div>

              <div>
                <span className="admin-login-eyebrow">
                  ADMIN ACCESS
                </span>

                <h2>Welcome back</h2>

                <p>
                  Sign in to continue to your dashboard.
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}

              <div className="admin-login-field">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />

              </div>

              {/* Password */}

              <div className="admin-login-field">

                <div className="admin-login-password-label">
                  <label htmlFor="password">
                    Password
                  </label>
                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="current-password"
                />

              </div>

              {/* Error */}

              {error && (
                <div
                  className="admin-login-error"
                  role="alert"
                >
                  <ShieldCheck size={17} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                className="admin-login-button"
                disabled={loading}
              >
                <span>
                  {loading ? 'Signing in...' : 'Sign In'}
                </span>

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

            <div className="admin-login-security-note">
              <LockKeyhole size={15} />

              <span>
                Admin access is protected by role-based
                authentication.
              </span>
            </div>

          </section>

        </main>

        {/* ====================================================
            Bottom Footer
            ==================================================== */}

        <footer className="admin-login-footer">
          <span>SmartCart AI</span>
          <span className="admin-login-footer-dot">•</span>
          <span>Administration Portal</span>
          <span className="admin-login-footer-dot">•</span>
          <span>Secure Access</span>
        </footer>

      </div>
    </div>
  )
}

export default Login