import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './Register.css'
import api from '../services/api'

function Register() {
  // Used to navigate the user after successful registration
  const navigate = useNavigate()

  // Store form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'CUSTOMER',
  })

  // Store registration error message
  const [error, setError] = useState('')

  // Store successful registration message
  const [success, setSuccess] = useState('')

  // Track whether registration request is running
  const [loading, setLoading] = useState(false)

  // Handle changes in all input fields
  const handleChange = (event) => {
    const { name, value } = event.target

    // Phone number should contain numbers only.
    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '')

      // Do not allow more than 10 digits.
      if (numbersOnly.length > 10) {
        return
      }

      setFormData((previousData) => ({
        ...previousData,
        [name]: numbersOnly,
      }))

      return
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  // Handle registration form submission
  const handleSubmit = async (event) => {
    event.preventDefault()

    // Clear previous messages
    setError('')
    setSuccess('')

    // Validate email format before sending request
    const emailPattern =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/

    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Phone number must contain exactly 10 digits.')
      return
    }

    // Check whether passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Show loading state
    setLoading(true)

    try {
      // Send registration request through our central Axios instance
      const response = await api.post('/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      })

      // Show backend success message
      setSuccess(
        response.data || 'User registered successfully.'
      )

      // Clear the form after successful registration
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'CUSTOMER',
      })

      // Redirect to Login after a short delay
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      // Show error in browser console
      console.error('Registration Error:', error)

      // Backend returned an HTTP error response
      if (error.response) {
        if (error.response.data?.message) {
          setError(error.response.data.message)
        } else if (typeof error.response.data === 'string') {
          setError(error.response.data)
        } else {
          setError('Registration failed. Please try again.')
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
          <p className="auth-label">CREATE ACCOUNT</p>

          <h1>
            Join <span>SmartCart AI</span>
          </h1>

          <p className="auth-description">
            Create your account and start your smarter shopping experience.
          </p>
        </div>

        {/* Display registration error */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Display registration success */}
        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Account Type */}
          <div className="form-group">
            <label htmlFor="role">Account Type</label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="CUSTOMER">
                Customer
              </option>

              <option value="SELLER">
                Seller
              </option>
            </select>
          </div>

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>

            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>

            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>

            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter 10 digit phone number"
              value={formData.phone}
              onChange={handleChange}
              inputMode="numeric"
              maxLength="10"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?
            <a href="/login"> Login</a>
          </p>

          <a href="/" className="back-home">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}

export default Register