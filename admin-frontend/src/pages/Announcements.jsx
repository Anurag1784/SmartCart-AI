import { useState } from 'react'
import {
  Megaphone,
  Send,
  Users,
  User,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

import { useSelector } from 'react-redux'

import {
  sendAnnouncementToUser,
  sendAnnouncementToAll,
} from '../api/announcementsApi'

import './Announcements.css'

function Announcements() {
  const token = useSelector((state) => state.auth.token)

  const [recipientType, setRecipientType] = useState('all')
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleRecipientChange = (type) => {
    setRecipientType(type)

    if (type === 'all') {
      setUserId('')
    }

    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSuccessMessage('')
    setErrorMessage('')

    const trimmedTitle = title.trim()
    const trimmedMessage = message.trim()

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!trimmedTitle) {
      setErrorMessage('Please enter an announcement title.')
      return
    }

    if (!trimmedMessage) {
      setErrorMessage('Please enter an announcement message.')
      return
    }

    if (recipientType === 'user') {
      if (!userId.trim()) {
        setErrorMessage('Please enter a user ID.')
        return
      }

      if (!/^\d+$/.test(userId.trim())) {
        setErrorMessage('User ID must contain numbers only.')
        return
      }
    }

    try {
      setLoading(true)

      const announcement = {
        title: trimmedTitle,
        message: trimmedMessage,
      }

      // -----------------------------------------
      // SEND TO ONE USER
      // -----------------------------------------

      if (recipientType === 'user') {
        const response = await sendAnnouncementToUser(
          Number(userId),
          announcement,
          token
        )

        setSuccessMessage(
          response.message ||
          'Announcement sent successfully.'
        )
      }

      // -----------------------------------------
      // SEND TO ALL USERS
      // -----------------------------------------

      else {
        const response = await sendAnnouncementToAll(
          announcement,
          token
        )

        setSuccessMessage(
          `${response.message || 'Announcement sent successfully.'} ` +
          `Recipients: ${response.totalRecipients ?? 0}`
        )
      }

      // Clear form after successful submission.
      setTitle('')
      setMessage('')

      if (recipientType === 'user') {
        setUserId('')
      }

    } catch (error) {
      console.error(
        'Failed to send announcement:',
        error
      )

      const backendMessage =
        error.response?.data?.message

      setErrorMessage(
        backendMessage ||
        'Failed to send announcement. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="announcements-page">

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <div className="announcements-header">

        <div>
          <p className="announcements-eyebrow">
            ADMIN COMMUNICATION
          </p>

          <h1>Announcements</h1>

          <p className="announcements-subtitle">
            Send important messages to SmartCart AI users.
          </p>
        </div>

        <div className="announcements-header-icon">
          <Megaphone size={25} />
        </div>

      </div>

      <div className="announcements-layout">

        {/* =========================================
            MAIN FORM
        ========================================== */}

        <div className="announcement-form-card">

          <div className="announcement-card-header">

            <div className="announcement-card-icon">
              <Send size={20} />
            </div>

            <div>
              <h2>Create Announcement</h2>

              <p>
                Compose a message and choose who should receive it.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* =====================================
                RECIPIENT TYPE
            ====================================== */}

            <div className="announcement-form-section">

              <label className="announcement-label">
                Send To
              </label>

              <div className="recipient-options">

                <button
                  type="button"
                  className={`recipient-option ${
                    recipientType === 'all'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    handleRecipientChange('all')
                  }
                >
                  <div className="recipient-option-icon">
                    <Users size={19} />
                  </div>

                  <div>
                    <strong>
                      All Customers & Sellers
                    </strong>

                    <span>
                      Send to every active customer and seller.
                    </span>
                  </div>

                </button>

                <button
                  type="button"
                  className={`recipient-option ${
                    recipientType === 'user'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    handleRecipientChange('user')
                  }
                >
                  <div className="recipient-option-icon">
                    <User size={19} />
                  </div>

                  <div>
                    <strong>
                      Specific User
                    </strong>

                    <span>
                      Send the announcement to one user.
                    </span>
                  </div>

                </button>

              </div>

            </div>

            {/* =====================================
                USER ID
            ====================================== */}

            {recipientType === 'user' && (
              <div className="announcement-form-section">

                <label
                  htmlFor="announcement-user-id"
                  className="announcement-label"
                >
                  User ID
                </label>

                <input
                  id="announcement-user-id"
                  type="text"
                  inputMode="numeric"
                  value={userId}
                  onChange={(event) =>
                    setUserId(
                      event.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="Enter user ID"
                  className="announcement-input"
                  disabled={loading}
                />

                <p className="announcement-helper">
                  Enter the User ID of the customer or seller.
                </p>

              </div>
            )}

            {/* =====================================
                TITLE
            ====================================== */}

            <div className="announcement-form-section">

              <div className="announcement-label-row">

                <label
                  htmlFor="announcement-title"
                  className="announcement-label"
                >
                  Title
                </label>

                <span>
                  {title.length}/100
                </span>

              </div>

              <input
                id="announcement-title"
                type="text"
                maxLength={100}
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter announcement title"
                className="announcement-input"
                disabled={loading}
              />

            </div>

            {/* =====================================
                MESSAGE
            ====================================== */}

            <div className="announcement-form-section">

              <div className="announcement-label-row">

                <label
                  htmlFor="announcement-message"
                  className="announcement-label"
                >
                  Message
                </label>

                <span>
                  {message.length}/500
                </span>

              </div>

              <textarea
                id="announcement-message"
                maxLength={500}
                rows={7}
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Write your announcement message..."
                className="announcement-textarea"
                disabled={loading}
              />

            </div>

            {/* =====================================
                FEEDBACK
            ====================================== */}

            {successMessage && (
              <div className="announcement-feedback success">
                <CheckCircle size={19} />

                <span>
                  {successMessage}
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="announcement-feedback error">
                <AlertTriangle size={19} />

                <span>
                  {errorMessage}
                </span>
              </div>
            )}

            {/* =====================================
                SUBMIT
            ====================================== */}

            <button
              type="submit"
              className="announcement-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="announcement-spinner"
                  />

                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />

                  Send Announcement
                </>
              )}
            </button>

          </form>

        </div>

        {/* =========================================
            INFORMATION PANEL
        ========================================== */}

        <div className="announcement-info-column">

          <div className="announcement-info-card">

            <div className="announcement-info-icon">
              <Megaphone size={21} />
            </div>

            <h2>Admin Communication</h2>

            <p>
              Use announcements to communicate important
              information directly to SmartCart AI users.
            </p>

          </div>

          <div className="announcement-info-card">

            <h3>Recipients</h3>

            <div className="announcement-info-item">
              <Users size={17} />

              <div>
                <strong>
                  All Customers & Sellers
                </strong>

                <span>
                  Broadcast the announcement to all customer
                  and seller accounts.
                </span>
              </div>
            </div>

            <div className="announcement-info-item">
              <User size={17} />

              <div>
                <strong>
                  Specific User
                </strong>

                <span>
                  Target a single customer or seller using
                  their User ID.
                </span>
              </div>
            </div>

          </div>

          <div className="announcement-info-card">

            <h3>What happens when you send?</h3>

            <div className="announcement-flow">

              <div className="announcement-flow-step">
                <span>1</span>
                <p>
                  Admin submits the announcement.
                </p>
              </div>

              <div className="announcement-flow-line" />

              <div className="announcement-flow-step">
                <span>2</span>
                <p>
                  Notification Service creates the notification.
                </p>
              </div>

              <div className="announcement-flow-line" />

              <div className="announcement-flow-step">
                <span>3</span>
                <p>
                  The admin action is recorded in the audit log.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Announcements