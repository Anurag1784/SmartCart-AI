import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Search,
  Users as UsersIcon,
  RefreshCw,
  UserRound,
  Store,
  ShieldCheck,
  Mail,
  Phone,
  X,
  CalendarDays,
  Hash,
  Power,
} from 'lucide-react'
import {
  getUsersByRole,
  updateUserStatus,
} from '../api/usersApi'
import './Users.css'

function Users() {
  const token = useSelector((state) => state.auth.token)

  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)

  // Controls the activate/deactivate confirmation dialog.
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)

  // Controls the status update loading state.
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Stores any status-update error.
  const [statusError, setStatusError] = useState('')

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    if (!token) {
      setError('Admin authentication token is missing.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const [customers, sellers, admins] = await Promise.all([
        getUsersByRole('CUSTOMER', token),
        getUsersByRole('SELLER', token),
        getUsersByRole('ADMIN', token),
      ])

      setUsers([
        ...customers,
        ...sellers,
        ...admins,
      ])
    } catch (err) {
      console.error('Failed to load users:', err)

      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.')
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view users.')
      } else {
        setError('Unable to load users. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token])

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()

    return users.filter((user) => {
      const matchesRole =
        roleFilter === 'ALL' || user.role === roleFilter

      const fullName =
        `${user.firstName || ''} ${user.lastName || ''}`
          .trim()
          .toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.phone?.toLowerCase().includes(normalizedSearch) ||
        String(user.userId).includes(normalizedSearch)

      return matchesRole && matchesSearch
    })
  }, [users, searchTerm, roleFilter])

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const customerCount = users.filter(
    (user) => user.role === 'CUSTOMER'
  ).length

  const sellerCount = users.filter(
    (user) => user.role === 'SELLER'
  ).length

  const adminCount = users.filter(
    (user) => user.role === 'ADMIN'
  ).length

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return '—'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getUserName = (user) => {
    const fullName =
      `${user.firstName || ''} ${user.lastName || ''}`.trim()

    return fullName || 'Unknown User'
  }

  const getInitial = (user) => {
    const name = getUserName(user)

    return name.charAt(0).toUpperCase()
  }

  const getRoleIcon = (role) => {
    if (role === 'SELLER') {
      return <Store size={16} />
    }

    if (role === 'ADMIN') {
      return <ShieldCheck size={16} />
    }

    return <UserRound size={16} />
  }

  // =========================================================
  // USER DETAILS
  // =========================================================

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setStatusError('')
    setShowStatusConfirm(false)
  }

  const closeUserDetails = () => {
    if (statusUpdating) {
      return
    }

    setSelectedUser(null)
    setShowStatusConfirm(false)
    setStatusError('')
  }

  // =========================================================
  // STATUS CONFIRMATION
  // =========================================================

  const openStatusConfirmation = () => {
    setStatusError('')
    setShowStatusConfirm(true)
  }

  const closeStatusConfirmation = () => {
    if (statusUpdating) {
      return
    }

    setShowStatusConfirm(false)
    setStatusError('')
  }

  // =========================================================
  // UPDATE USER STATUS
  // =========================================================

  const handleStatusUpdate = async () => {
    if (!selectedUser || !token) {
      console.error(
        'Cannot update status: selected user or token is missing.'
      )
      return
    }

    const currentStatus =
      selectedUser.accountStatus?.toUpperCase()

    const newStatus =
      currentStatus === 'ACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE'

    console.log(
      `Updating user #${selectedUser.userId} status: ${currentStatus} → ${newStatus}`
    )

    try {
      setStatusUpdating(true)
      setStatusError('')

      const response = await updateUserStatus(
        selectedUser.userId,
        newStatus,
        token
      )

      console.log(
        'User status update successful:',
        response
      )

      // Update the user in the main users list.
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.userId === selectedUser.userId
            ? {
                ...user,
                accountStatus: newStatus,
              }
            : user
        )
      )

      // Update the currently opened user details.
      setSelectedUser((currentUser) => ({
        ...currentUser,
        accountStatus: newStatus,
      }))

      // Close confirmation dialog.
      setShowStatusConfirm(false)

    } catch (err) {
      console.error(
        'Failed to update user status:',
        err
      )

      if (err.response?.status === 401) {
        setStatusError(
          'Your session has expired. Please login again.'
        )
      } else if (err.response?.status === 403) {
        setStatusError(
          'You are not authorized to change user status.'
        )
      } else {
        setStatusError(
          'Unable to update account status. Please try again.'
        )
      }
    } finally {
      setStatusUpdating(false)
    }
  }

  const selectedUserIsActive =
    selectedUser?.accountStatus?.toUpperCase() === 'ACTIVE'

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="users-page">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="users-page-header">
        <div>
          <span className="page-eyebrow">
            USER MANAGEMENT
          </span>

          <h1>Users</h1>

          <p>
            Manage customers, sellers and administrators across
            the SmartCart AI platform.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? 'spinning' : ''}
          />

          Refresh
        </button>
      </div>

      {/* =========================================
          SUMMARY CARDS
          ========================================= */}

      <div className="users-summary-grid">

        <div className="user-summary-card">
          <div className="summary-icon total">
            <UsersIcon size={22} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="summary-icon customer">
            <UserRound size={22} />
          </div>

          <div>
            <span>Customers</span>
            <strong>{customerCount}</strong>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="summary-icon seller">
            <Store size={22} />
          </div>

          <div>
            <span>Sellers</span>
            <strong>{sellerCount}</strong>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="summary-icon admin">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Administrators</span>
            <strong>{adminCount}</strong>
          </div>
        </div>

      </div>

      {/* =========================================
          USERS TABLE
          ========================================= */}

      <div className="users-table-card">

        <div className="users-table-header">

          <div className="users-table-title">

            <div className="table-title-icon">
              <UsersIcon size={21} />
            </div>

            <div>
              <h2>Platform Users</h2>
              <span>{filteredUsers.length} users</span>
            </div>

          </div>

          <div className="users-toolbar">

            <div className="users-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <select
              className="users-role-filter"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="CUSTOMER">
                Customers
              </option>

              <option value="SELLER">
                Sellers
              </option>

              <option value="ADMIN">
                Administrators
              </option>
            </select>

          </div>

        </div>

        {/* =========================================
            LOADING
            ========================================= */}

        {loading ? (

          <div className="users-state">

            <RefreshCw
              size={28}
              className="spinning"
            />

            <p>
              Loading users...
            </p>

          </div>

        ) : error ? (

          /* =========================================
             ERROR
             ========================================= */

          <div className="users-state error">

            <ShieldCheck size={28} />

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={loadUsers}
              className="users-retry-button"
            >
              Try Again
            </button>

          </div>

        ) : filteredUsers.length === 0 ? (

          /* =========================================
             EMPTY
             ========================================= */

          <div className="users-state">

            <UsersIcon size={32} />

            <h3>
              No users found
            </h3>

            <p>
              Try changing your search term or role filter.
            </p>

          </div>

        ) : (

          /* =========================================
             TABLE
             ========================================= */

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>

                <tr>
                  <th>USER</th>
                  <th>CONTACT</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user.userId}
                    onClick={() => handleUserClick(user)}
                    className="user-row-clickable"
                  >

                    <td>

                      <div className="user-cell">

                        <div className="user-avatar">
                          {getInitial(user)}
                        </div>

                        <div className="user-main-info">

                          <strong>
                            {getUserName(user)}
                          </strong>

                          <span>
                            ID #{user.userId}
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="user-contact">

                        <span>
                          <Mail size={16} />
                          {user.email || '—'}
                        </span>

                        <span>
                          <Phone size={16} />
                          {user.phone || '—'}
                        </span>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`user-role-badge ${
                          user.role?.toLowerCase()
                        }`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`user-status-badge ${
                          user.accountStatus?.toLowerCase() ||
                          'unknown'
                        }`}
                      >
                        <span className="status-dot"></span>

                        {user.accountStatus || 'UNKNOWN'}
                      </span>

                    </td>

                    <td>

                      <span className="user-joined-date">
                        {formatDate(user.createdAt)}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =========================================
          USER DETAILS MODAL
          ========================================= */}

      {selectedUser && (

        <div
          className="user-details-overlay"
          onClick={closeUserDetails}
        >

          <div
            className="user-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="user-details-header">

              <div>

                <span className="modal-eyebrow">
                  USER DETAILS
                </span>

                <h2>
                  Account Information
                </h2>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeUserDetails}
                disabled={statusUpdating}
                aria-label="Close user details"
              >
                <X size={20} />
              </button>

            </div>

            {/* PROFILE */}

            <div className="user-profile-section">

              <div className="user-details-avatar">
                {getInitial(selectedUser)}
              </div>

              <div>

                <h3>
                  {getUserName(selectedUser)}
                </h3>

                <span
                  className={`user-role-badge ${
                    selectedUser.role?.toLowerCase()
                  }`}
                >
                  {getRoleIcon(selectedUser.role)}
                  {selectedUser.role}
                </span>

              </div>

            </div>

            {/* DETAILS GRID */}

            <div className="user-details-grid">

              <div className="user-detail-item">

                <span>
                  <Hash size={16} />
                  User ID
                </span>

                <strong>
                  #{selectedUser.userId}
                </strong>

              </div>

              <div className="user-detail-item">

                <span>
                  <ShieldCheck size={16} />
                  Status
                </span>

                <strong>
                  {selectedUser.accountStatus ||
                    'UNKNOWN'}
                </strong>

              </div>

              <div className="user-detail-item">

                <span>
                  <Mail size={16} />
                  Email Address
                </span>

                <strong>
                  {selectedUser.email || '—'}
                </strong>

              </div>

              <div className="user-detail-item">

                <span>
                  <Phone size={16} />
                  Phone Number
                </span>

                <strong>
                  {selectedUser.phone || '—'}
                </strong>

              </div>

              <div className="user-detail-item">

                <span>
                  <UserRound size={16} />
                  Role
                </span>

                <strong>
                  {selectedUser.role || '—'}
                </strong>

              </div>

              <div className="user-detail-item">

                <span>
                  <CalendarDays size={16} />
                  Joined
                </span>

                <strong>
                  {formatDate(
                    selectedUser.createdAt
                  )}
                </strong>

              </div>

            </div>

            {/* STATUS ERROR */}

            {statusError && (

              <div className="user-status-error">

                <ShieldCheck size={17} />

                <span>
                  {statusError}
                </span>

              </div>

            )}

            {/* FOOTER */}

            <div className="user-details-footer">

              <button
                type="button"
                className="modal-close-action"
                onClick={closeUserDetails}
                disabled={statusUpdating}
              >
                Close
              </button>

              <button
                type="button"
                className={`user-status-action ${
                  selectedUserIsActive
                    ? 'deactivate'
                    : 'activate'
                }`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()

                  console.log(
                    'STATUS ACTION CLICKED'
                  )

                  openStatusConfirmation()
                }}
                disabled={statusUpdating}
              >

                <Power size={17} />

                {selectedUserIsActive
                  ? 'Deactivate User'
                  : 'Activate User'}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================
          STATUS CONFIRMATION MODAL
          ========================================= */}

      {showStatusConfirm && selectedUser && (

        <div
          className="status-confirm-overlay"
          onClick={closeStatusConfirmation}
        >

          <div
            className="status-confirm-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ICON */}

            <div
              className={`status-confirm-icon ${
                selectedUserIsActive
                  ? 'deactivate'
                  : 'activate'
              }`}
            >
              <Power size={25} />
            </div>

            {/* TITLE */}

            <h3>

              {selectedUserIsActive
                ? 'Deactivate User?'
                : 'Activate User?'}

            </h3>

            {/* MESSAGE */}

            <p>

              Are you sure you want to{' '}

              <strong>
                {selectedUserIsActive
                  ? 'deactivate'
                  : 'activate'}
              </strong>{' '}

              <strong>
                {getUserName(selectedUser)}
              </strong>
              ?

            </p>

            {/* NOTE */}

            {selectedUserIsActive ? (

              <span className="status-confirm-note">
                This user will no longer be able to
                log in until the account is activated
                again.
              </span>

            ) : (

              <span className="status-confirm-note">
                This user will be allowed to log in
                again.
              </span>

            )}

            {/* ERROR */}

            {statusError && (

              <div className="confirm-status-error">
                {statusError}
              </div>

            )}

            {/* ACTIONS */}

            <div className="status-confirm-actions">

              <button
                type="button"
                className="confirm-cancel-button"
                onClick={closeStatusConfirmation}
                disabled={statusUpdating}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`confirm-status-button ${
                  selectedUserIsActive
                    ? 'deactivate'
                    : 'activate'
                }`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()

                  console.log(
                    'CONFIRM STATUS UPDATE CLICKED'
                  )

                  handleStatusUpdate()
                }}
                disabled={statusUpdating}
              >

                {statusUpdating ? (

                  <>
                    <RefreshCw
                      size={16}
                      className="spinning"
                    />

                    Updating...
                  </>

                ) : (

                  <>
                    <Power size={16} />

                    {selectedUserIsActive
                      ? 'Deactivate'
                      : 'Activate'}
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

export default Users