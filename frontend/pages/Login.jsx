import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './Login.css'
import api from '../services/api'
import { setCredentials } from '../src/store/slices/authSlice'

function Login() {
  // Redux dispatch allows us to store authentication data
  const dispatch = useDispatch()

  // Used to navigate the user after successful login
  const navigate = useNavigate()

  // Store email entered by the user
  const [email, setEmail] = useState('')

  // Store password entered by the user
  const [password, setPassword] = useState('')

  // Store login error message
  const [error, setError] = useState('')

  // Track whether login request is running
  const [loading, setLoading] = useState(false)

  // Handle login form submission
  const handleSubmit = async (event) => {
    event.preventDefault()

    // Clear previous error
    setError('')

    // Show loading state
    setLoading(true)

    try {
      // Send login request through our central Axios instance
      const response = await api.post('/api/auth/login', {
        email: email,
        password: password,
      })

      // Get response data from Auth Service
      const data = response.data

      // Store JWT and user information in Redux
      dispatch(
        setCredentials({
          token: data.token,
          user: {
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
          },
        })
      )

      // Show successful login response in browser console
      console.log('Login Response:', data)

      // Redirect the user according to their role.
      // Sellers go to their separate Seller Workspace.
      // Customers continue to the normal SmartCart homepage.
      if (data.role === 'SELLER') {
        navigate('/seller')
      } else {
        navigate('/')
      }
    } catch (error) {
      // Show error in browser console
      console.error('Login Error:', error)

      // Backend returned an HTTP error response
      if (error.response) {
        // Use backend message if available
        if (error.response.data?.message) {
          setError(error.response.data.message)
        } else {
          setError('Invalid email or password.')
        }
      }

      // Request was sent but no response was received
      else if (error.request) {
        setError(
          'Unable to connect to the server. Please make sure Auth Service is running.'
        )
      }

      // Something else went wrong
      else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      // Stop loading state
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-label">WELCOME BACK</p>

          <h1>
            Login to <span>SmartCart AI</span>
          </h1>

          <p className="auth-description">
            Sign in to continue your smarter shopping experience.
          </p>
        </div>

        {/* Display login error if one exists */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {/* Forgot Password Link */}
            <div className="forgot-password-container">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?
            <a href="/register"> Create Account</a>
          </p>

          <a href="/" className="back-home">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}

export default Login