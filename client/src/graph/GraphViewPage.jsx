import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useWorkflowGraph } from './useWorkflowGraph.js'
import { useElkLayout } from './useElkLayout.js'
import GraphCanvas from './GraphCanvas.jsx'

/**
 * /graph-view page component.
 * Orchestrates data loading, ELK layout, and renders the graph.
 */
function GraphViewPage() {
  const { workflow, rawNodes, edges, isLoading, error } = useWorkflowGraph()
  const { layoutNodes, isLayoutReady } = useElkLayout(rawNodes, edges)

  return (
    <div className="graph-view">
      {/* Navigation bar */}
      <nav className="graph-nav" aria-label="Graph view navigation">
        <div className="graph-nav__left">
          <Link to="/workflows" className="graph-nav__back">
            ← Workflows
          </Link>
          <span className="graph-nav__separator" aria-hidden="true">/</span>
          <span className="graph-nav__workflow-name">
            {workflow?.title ?? 'Customer Onboarding'}
          </span>
        </div>

        <div className="graph-nav__meta">
          {workflow && (
            <span className="graph-nav__badge">
              <span className="graph-nav__badge-dot" aria-hidden="true" />
              {workflow.jobs.length} tasks
            </span>
          )}
        </div>
      </nav>

      {/* Graph area */}
      {isLoading && (
        <div className="graph-state">
          <div className="graph-state__spinner" />
          <p className="graph-state__text">Loading workflow…</p>
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
            workflow={workflow}
            layoutNodes={layoutNodes}
            edges={edges}
            isLayoutReady={isLayoutReady}
          />
        </ReactFlowProvider>
      )}
    </div>
  )
}

export default GraphViewPage
