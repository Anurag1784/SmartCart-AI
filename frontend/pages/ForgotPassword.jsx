import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function ForgotPassword() {

  // Used to navigate back to Login/Home
  const navigate = useNavigate()

  // =========================================================
  // FORM DATA
  // =========================================================

  // Email entered by the user
  const [email, setEmail] = useState('')

  // OTP entered by the user
  const [otp, setOtp] = useState('')

  // New password entered by the user
  const [newPassword, setNewPassword] = useState('')

  // Confirm password entered by the user
  const [confirmPassword, setConfirmPassword] = useState('')

  // =========================================================
  // PAGE STATE
  // =========================================================

  /*
   * step = 1
   * Enter email and request OTP
   *
   * step = 2
   * Enter and verify OTP
   *
   * step = 3
   * Enter new password
   */
  const [step, setStep] = useState(1)

  // Error message
  const [error, setError] = useState('')

  // Success message
  const [success, setSuccess] = useState('')

  // Loading state
  const [loading, setLoading] = useState(false)

  // =========================================================
  // STEP 1 - SEND OTP
  // =========================================================

  const handleSendOtp = async (event) => {

    event.preventDefault()

    // Clear previous messages
    setError('')
    setSuccess('')

    // Validate email format
    const emailPattern =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/

    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    try {

      // Start loading
      setLoading(true)

      /*
       * Call backend to generate and send OTP.
       */
      const response = await axios.post(
        'http://localhost:8080/api/auth/forgot-password',
        {
          email: email
        }
      )

      /*
       * Backend successfully accepted the request.
       */
      setSuccess(response.data)

      /*
       * Move to OTP verification screen.
       */
      setStep(2)

    } catch (err) {

      /*
       * Display backend error if available.
       */
      if (err.response?.data?.message) {

        setError(err.response.data.message)

      } else {

        setError(
          'Unable to send verification code. Please try again.'
        )
      }

    } finally {

      // Stop loading
      setLoading(false)
    }
  }

  // =========================================================
  // STEP 2 - VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async (event) => {

    event.preventDefault()

    // Clear previous messages
    setError('')
    setSuccess('')

    // Validate OTP
    if (!/^[0-9]{6}$/.test(otp)) {

      setError('OTP must contain exactly 6 digits.')

      return
    }

    try {

      // Start loading
      setLoading(true)

      /*
       * Verify OTP with Auth Service.
       */
      const response = await axios.post(
        'http://localhost:8080/api/auth/verify-otp',
        {
          email: email,
          otp: otp
        }
      )

        /*
          * OTP verification was successful.
          * Clear the OTP success message before showing
           * the password reset form.
        */
         setSuccess('')

        /* 
          * Move to password reset screen.
        */
        setStep(3)
    } catch (err) {

      /*
       * Display backend error.
       */
      if (err.response?.data?.message) {

        setError(err.response.data.message)

      } else {

        setError(
          'Unable to verify the OTP. Please try again.'
        )
      }

    } finally {

      // Stop loading
      setLoading(false)
    }
  }

  // =========================================================
  // STEP 3 - RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (event) => {

    event.preventDefault()

    // Clear previous messages
    setError('')
    setSuccess('')

    // Check password length
    if (newPassword.length < 8) {

      setError(
        'Password must be at least 8 characters long.'
      )

      return
    }

    // Check whether both passwords match
    if (newPassword !== confirmPassword) {

      setError('Passwords do not match.')

      return
    }

    try {

      // Start loading
      setLoading(true)

      /*
       * Send the new password to the backend.
       *
       * Backend will verify that:
       * - OTP was verified
       * - reset request is still valid
       * - reset request has not already been used
       */
      const response = await axios.post(
        'http://localhost:8080/api/auth/reset-password',
        {
          email: email,
          newPassword: newPassword
        }
      )

      /*
       * Password reset successful.
       */
      setSuccess(response.data)

      /*
       * Clear password fields.
       */
      setNewPassword('')
      setConfirmPassword('')

    } catch (err) {

      /*
       * Display backend error.
       */
      if (err.response?.data?.message) {

        setError(err.response.data.message)

      } else {

        setError(
          'Unable to reset your password. Please try again.'
        )
      }

    } finally {

      // Stop loading
      setLoading(false)
    }
  }

  // =========================================================
  // RETURN TO LOGIN
  // =========================================================

  const handleBackToLogin = () => {

    navigate('/login')
  }

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="auth-header">

          <p className="auth-label">
            PASSWORD RECOVERY
          </p>

          <h1>
            Forgot <span>Password?</span>
          </h1>

          <p className="auth-description">

            {step === 1 &&
              'Enter your registered email address and we will help you reset your password.'
            }

            {step === 2 &&
              'Enter the 6-digit verification code sent to your email address.'
            }

            {step === 3 &&
              'Create a new password for your SmartCart AI account.'
            }

          </p>

        </div>

        {/* =================================================
            ERROR MESSAGE
            ================================================= */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS MESSAGE
            ================================================= */}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        {/* =================================================
            STEP 1 - EMAIL
            ================================================= */}

        {step === 1 && (

          <form
            className="auth-form"
            onSubmit={handleSendOtp}
          >

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading
                ? 'Sending OTP...'
                : 'Send OTP'
              }

            </button>

          </form>
        )}

        {/* =================================================
            STEP 2 - OTP
            ================================================= */}

        {step === 2 && (

          <form
            className="auth-form"
            onSubmit={handleVerifyOtp}
          >

            <div className="form-group">

              <label htmlFor="otp">
                Verification Code
              </label>

              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                maxLength="6"
                inputMode="numeric"
                autoComplete="one-time-code"
                onChange={(event) => {

                  /*
                   * Allow only numbers.
                   */
                  const value =
                    event.target.value.replace(/\D/g, '')

                  setOtp(value)
                }}
                required
              />

            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading
                ? 'Verifying...'
                : 'Verify OTP'
              }

            </button>

          </form>
        )}

        {/* =================================================
            STEP 3 - RESET PASSWORD
            ================================================= */}

        {step === 3 && (

          <form
            className="auth-form"
            onSubmit={handleResetPassword}
          >

            <div className="form-group">

              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                minLength="8"
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength="8"
                required
              />

            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading
                ? 'Resetting Password...'
                : 'Reset Password'
              }

            </button>

          </form>
        )}

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="auth-footer">

          {step === 3 && success ? (

            <button
              type="button"
              onClick={handleBackToLogin}
              className="forgot-password-link"
            >
              Go to Login
            </button>

          ) : (

            <>

              <p>
                Remember your password?

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="forgot-password-link"
                >
                  Login
                </button>
              </p>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="forgot-password-link back-home"
              >
                ← Back to Home
              </button>

            </>

          )}

        </div>

      </div>

    </main>
  )
}

export default ForgotPassword