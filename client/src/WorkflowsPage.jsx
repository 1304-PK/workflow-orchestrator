import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const response = await fetch('http://localhost:3000/api/workflows/get-workflow')

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log(data)
        setWorkflows(data)
      } catch (error) {
        console.error('Failed to fetch workflows:', error)
      }
    }

    loadWorkflows()
  }, [])

  return (
    <main className="workflows-page">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" to="/">
          Flow<span>line</span>
        </Link>
        <Link className="nav-link" to="/">
          Back home <span aria-hidden="true">↗</span>
        </Link>
      </nav>
      <h1>Workflows.</h1>
      <section className="workflow-list" aria-label="Available workflows">
        {workflows.map((workflow) => (
          <div className="workflow-row" key={workflow}>
            <span>{workflow}</span>
            <button type="button" className="open-button">Open</button>
          </div>
        ))}
      </section>
    </main>
  )
}

export default WorkflowsPage
