import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  RefreshCw,
  Search,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock3,
  FileText,
} from 'lucide-react'

import { useSelector } from 'react-redux'

import { getAuditLogs } from '../api/auditApi'

import './AuditLogs.css'

function AuditLogs() {
  const token = useSelector((state) => state.auth.token)

  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [resourceFilter, setResourceFilter] = useState('ALL')
  const [resultFilter, setResultFilter] = useState('ALL')

  const loadAuditLogs = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setErrorMessage('')

      const data = await getAuditLogs(token)

      setAuditLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load audit logs:', error)

      setErrorMessage(
        error.response?.data?.message ||
        'Failed to load audit logs. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadAuditLogs()
    }
  }, [token])

  const actionOptions = useMemo(() => {
    return [
      ...new Set(
        auditLogs
          .map((log) => log.action)
          .filter(Boolean)
      ),
    ].sort()
  }, [auditLogs])

  const resourceOptions = useMemo(() => {
    return [
      ...new Set(
        auditLogs
          .map((log) => log.resource)
          .filter(Boolean)
      ),
    ].sort()
  }, [auditLogs])

  const resultOptions = useMemo(() => {
    return [
      ...new Set(
        auditLogs
          .map((log) => log.result)
          .filter(Boolean)
      ),
    ].sort()
  }, [auditLogs])

  const filteredLogs = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase()

    return auditLogs.filter((log) => {
      const matchesSearch =
        !normalizedSearch ||
        String(log.auditId ?? '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(log.adminEmail ?? '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(log.action ?? '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(log.resource ?? '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(log.resourceId ?? '')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesAction =
        actionFilter === 'ALL' ||
        log.action === actionFilter

      const matchesResource =
        resourceFilter === 'ALL' ||
        log.resource === resourceFilter

      const matchesResult =
        resultFilter === 'ALL' ||
        log.result === resultFilter

      return (
        matchesSearch &&
        matchesAction &&
        matchesResource &&
        matchesResult
      )
    })
  }, [
    auditLogs,
    searchTerm,
    actionFilter,
    resourceFilter,
    resultFilter,
  ])

  const successCount = auditLogs.filter(
    (log) =>
      String(log.result).toUpperCase() === 'SUCCESS'
  ).length

  const failureCount = auditLogs.filter(
    (log) =>
      String(log.result).toUpperCase() === 'FAILED' ||
      String(log.result).toUpperCase() === 'FAILURE'
  ).length

  const uniqueAdmins = new Set(
    auditLogs
      .map((log) => log.adminEmail)
      .filter(Boolean)
  ).size

  const formatDateTime = (timestamp) => {
    if (!timestamp) {
      return '—'
    }

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) {
      return timestamp
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getResultClass = (result) => {
    const normalizedResult =
      String(result || '').toUpperCase()

    if (normalizedResult === 'SUCCESS') {
      return 'audit-result success'
    }

    if (
      normalizedResult === 'FAILED' ||
      normalizedResult === 'FAILURE'
    ) {
      return 'audit-result failed'
    }

    return 'audit-result neutral'
  }

  const getResultIcon = (result) => {
    const normalizedResult =
      String(result || '').toUpperCase()

    if (normalizedResult === 'SUCCESS') {
      return <CheckCircle size={14} />
    }

    if (
      normalizedResult === 'FAILED' ||
      normalizedResult === 'FAILURE'
    ) {
      return <XCircle size={14} />
    }

    return <Clock3 size={14} />
  }

  return (
    <div className="audit-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <div className="audit-header">

        <div>
          <p className="audit-eyebrow">
            ADMIN SECURITY
          </p>

          <h1>Audit Logs</h1>

          <p className="audit-subtitle">
            Track administrative actions performed across SmartCart AI.
          </p>
        </div>

        <button
          type="button"
          className="audit-refresh-btn"
          onClick={() => loadAuditLogs(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? 'audit-refresh-spinning'
                : ''
            }
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="audit-summary-grid">

        <div className="audit-summary-card">

          <div className="audit-summary-icon blue">
            <Activity size={21} />
          </div>

          <div>
            <span>Total Logs</span>
            <strong>{auditLogs.length}</strong>
          </div>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-icon green">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>Successful Actions</span>
            <strong>{successCount}</strong>
          </div>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-icon red">
            <XCircle size={21} />
          </div>

          <div>
            <span>Failed Actions</span>
            <strong>{failureCount}</strong>
          </div>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-icon purple">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>Admin Accounts</span>
            <strong>{uniqueAdmins}</strong>
          </div>

        </div>

      </div>

      {/* =========================================
          CONTENT CARD
      ========================================== */}

      <div className="audit-content-card">

        {/* =======================================
            TOOLBAR
        ======================================== */}

        <div className="audit-toolbar">

          <div className="audit-search-wrapper">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search admin, action, resource or ID..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

          </div>

          <select
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(event.target.value)
            }
            className="audit-filter"
          >
            <option value="ALL">
              All Actions
            </option>

            {actionOptions.map((action) => (
              <option
                key={action}
                value={action}
              >
                {action}
              </option>
            ))}
          </select>

          <select
            value={resourceFilter}
            onChange={(event) =>
              setResourceFilter(event.target.value)
            }
            className="audit-filter"
          >
            <option value="ALL">
              All Resources
            </option>

            {resourceOptions.map((resource) => (
              <option
                key={resource}
                value={resource}
              >
                {resource}
              </option>
            ))}
          </select>

          <select
            value={resultFilter}
            onChange={(event) =>
              setResultFilter(event.target.value)
            }
            className="audit-filter"
          >
            <option value="ALL">
              All Results
            </option>

            {resultOptions.map((result) => (
              <option
                key={result}
                value={result}
              >
                {result}
              </option>
            ))}
          </select>

        </div>

        {/* =======================================
            RESULT COUNT
        ======================================== */}

        {!loading && !errorMessage && (
          <div className="audit-result-count">
            Showing{' '}
            <strong>{filteredLogs.length}</strong>{' '}
            of{' '}
            <strong>{auditLogs.length}</strong>{' '}
            audit logs
          </div>
        )}

        {/* =======================================
            ERROR
        ======================================== */}

        {errorMessage && (
          <div className="audit-error">
            <XCircle size={18} />

            <span>{errorMessage}</span>
          </div>
        )}

        {/* =======================================
            LOADING
        ======================================== */}

        {loading && (
          <div className="audit-loading">

            <RefreshCw
              size={23}
              className="audit-refresh-spinning"
            />

            <p>
              Loading audit logs...
            </p>

          </div>
        )}

        {/* =======================================
            EMPTY
        ======================================== */}

        {!loading &&
          !errorMessage &&
          filteredLogs.length === 0 && (

          <div className="audit-empty">

            <div className="audit-empty-icon">
              <FileText size={25} />
            </div>

            <h3>No audit logs found</h3>

            <p>
              Try changing your search or filter criteria.
            </p>

          </div>
        )}

        {/* =======================================
            TABLE
        ======================================== */}

        {!loading &&
          !errorMessage &&
          filteredLogs.length > 0 && (

          <div className="audit-table-wrapper">

            <table className="audit-table">

              <thead>
                <tr>
                  <th>AUDIT ID</th>
                  <th>ADMIN</th>
                  <th>ACTION</th>
                  <th>RESOURCE</th>
                  <th>RESOURCE ID</th>
                  <th>RESULT</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>

              <tbody>

                {filteredLogs.map((log) => (

                  <tr key={log.auditId}>

                    <td>
                      <span className="audit-id">
                        #{log.auditId}
                      </span>
                    </td>

                    <td>
                      <div className="audit-admin">

                        <div className="audit-admin-avatar">
                          {String(
                            log.adminEmail || 'A'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          {log.adminEmail || '—'}
                        </span>

                      </div>
                    </td>

                    <td>
                      <span className="audit-action">
                        {log.action || '—'}
                      </span>
                    </td>

                    <td>
                      <span className="audit-resource">
                        {log.resource || '—'}
                      </span>
                    </td>

                    <td>
                      {log.resourceId !== null &&
                      log.resourceId !== undefined ? (
                        <span className="audit-resource-id">
                          #{log.resourceId}
                        </span>
                      ) : (
                        <span className="audit-null">
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={getResultClass(
                          log.result
                        )}
                      >
                        {getResultIcon(log.result)}

                        {log.result || 'UNKNOWN'}
                      </span>
                    </td>

                    <td>
                      <div className="audit-timestamp">
                        <Clock3 size={14} />

                        <span>
                          {formatDateTime(
                            log.timestamp
                          )}
                        </span>
                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  )
}

export default AuditLogs