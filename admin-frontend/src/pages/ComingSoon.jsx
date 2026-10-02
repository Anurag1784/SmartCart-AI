import { Construction } from 'lucide-react'
import './ComingSoon.css'

function ComingSoon({ title }) {
  return (
    <div className="coming-soon-page">

      <div className="coming-soon-card">

        <div className="coming-soon-icon">
          <Construction size={30} />
        </div>

        <h1>{title}</h1>

        <p>
          This module is planned for the SmartCart AI Admin Panel.
          Implementation will be added in the upcoming development phase.
        </p>

        <span className="coming-soon-badge">
          Coming Soon
        </span>

      </div>

    </div>
  )
}

export default ComingSoon