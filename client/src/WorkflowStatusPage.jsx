import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'

import { useElkLayout } from './graph/useElkLayout.js'
import GraphCanvas from './graph/GraphCanvas.jsx'
import { transformLiveTasks } from './graph/graphTransform.js'
import './graph/graph.css'

function statusColor(status) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'rgba(74, 222, 128, 0.2)'
  if (s === 'failed') return 'rgba(248, 113, 113, 0.2)'
  if (s === 'pending' || s === 'running') return 'rgba(250, 204, 21, 0.2)'
  if (s === 'waiting') return 'rgba(156, 163, 175, 0.2)'
  return 'rgba(156, 163, 175, 0.1)'
}

function statusBorderColor(status) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'rgba(74, 222, 128, 0.8)'
  if (s === 'failed') return 'rgba(248, 113, 113, 0.8)'
  if (s === 'pending' || s === 'running') return 'rgba(250, 204, 21, 0.8)'
  if (s === 'waiting') return 'rgba(156, 163, 175, 0.6)'
  return 'rgba(255, 255, 255, 0.2)'
}

function WorkflowStatusPage() {
  const { id } = useParams()
  
  const [workflow, setWorkflow] = useState(null)
  const [rawNodes, setRawNodes] = useState([])
  const [edges, setEdges] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { layoutNodes, isLayoutReady } = useElkLayout(rawNodes, edges)

  async function fetchStatus(showRefreshing = false) {
    if (showRefreshing) setIsRefreshing(true)
    
    try {
      const response = await fetch(`http://localhost:3000/api/workflows/status/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.errMsg || `Request failed with status ${response.status}`)
      }
      
      setWorkflow(data.workflow)
      
      const { nodes, edges } = transformLiveTasks(data.tasks)
      setRawNodes(nodes)
      setEdges(edges)
      
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Poll every 5 seconds without triggering the refreshing animation

    const pollInterval = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 5000

    const intervalId = setInterval(() => {
      fetchStatus(false)
    }, pollInterval)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [id])

  return (
    <div className="graph-view">
      {/* Navigation bar */}
      <nav className="graph-nav" aria-label="Graph view navigation">
        <div className="graph-nav__left">
          <Link to="/dashboard" className="graph-nav__back">
            ← Dashboard
          </Link>
          <span className="graph-nav__separator" aria-hidden="true">/</span>
          <span className="graph-nav__workflow-name">
            {workflow ? workflow.title : `Workflow #${id}`}
          </span>
        </div>

        <div className="graph-nav__meta">
          {workflow && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: statusColor(workflow.status),
                color: statusBorderColor(workflow.status),
                border: `1px solid ${statusBorderColor(workflow.status)}`,
                textTransform: 'uppercase'
              }}>
                {workflow.status}
              </span>
              <span className="graph-nav__badge">
                <span className="graph-nav__badge-dot" aria-hidden="true" />
                {rawNodes.length} tasks
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Graph area */}
      {isLoading && (
        <div className="graph-state">
          <div className="graph-state__spinner" />
          <p className="graph-state__text">Loading workflow status…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="graph-state">
          <p className="graph-state__error">⚠ {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <ReactFlowProvider>
          <GraphCanvas
            layoutNodes={layoutNodes}
            edges={edges}
            isLayoutReady={isLayoutReady}
            onRefresh={() => fetchStatus(true)}
            isRefreshing={isRefreshing}
            hideMiniMap={true}
          />
        </ReactFlowProvider>
      )}
    </div>
  )
}

export default WorkflowStatusPage
