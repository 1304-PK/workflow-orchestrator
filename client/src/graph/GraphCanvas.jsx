import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react'
import WorkflowNode from './WorkflowNode.jsx'
import TaskInspector from './TaskInspector.jsx'

/**
 * Node type registry — tells React Flow which component to use for 'workflowNode'.
 */
const NODE_TYPES = {
  workflowNode: WorkflowNode,
}

/**
 * Inner graph component — must be a child of ReactFlowProvider
 * to access the useReactFlow hook.
 */
function GraphCanvas({ layoutNodes, edges, isLayoutReady, onRefresh, isRefreshing, hideMiniMap }) {
  const { fitView } = useReactFlow()
  const [selectedJob, setSelectedJob] = useState(null)

  // Update selected job if data changes on refresh (for live status)
  useEffect(() => {
    if (selectedJob && layoutNodes.length > 0) {
      const updatedJob = layoutNodes.find(n => n.id === (selectedJob.jobType || selectedJob.type))
      if (updatedJob) {
        setSelectedJob(updatedJob.data)
      }
    }
  }, [layoutNodes])

  const handleNodeClick = useCallback((_event, node) => {
    setSelectedJob(node.data)
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedJob(null)
  }, [])

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 400 })
  }, [fitView])

  const styledEdges = useMemo(() =>
    edges.map((edge) => ({
      ...edge,
      animated: false,
      markerEnd: {
        type: 'arrowclosed',
        width: 12,
        height: 12,
        color: 'rgba(99,102,241,0.5)',
      },
    })),
    [edges]
  )

  return (
    <div className="graph-workspace">
      <div className="graph-canvas">
        {isLayoutReady ? (
          <>
            <ReactFlow
              nodes={layoutNodes}
              edges={styledEdges}
              nodeTypes={NODE_TYPES}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onInit={() => fitView({ padding: 0.15, duration: 0 })}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.25}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="rgba(255,255,255,0.05)"
              />
              <Controls showInteractive={false} />
              {!hideMiniMap && (
                <MiniMap
                  nodeColor={() => 'rgba(99,102,241,0.5)'}
                  maskColor="rgba(13,15,20,0.7)"
                  pannable
                  zoomable
                />
              )}
            </ReactFlow>

            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5, display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="graph-fit-btn"
                style={{ position: 'relative', top: 0, right: 0 }}
                onClick={handleFitView}
                title="Reset view"
              >
                ⊡ Fit view
              </button>
              {onRefresh && (
                <button
                  type="button"
                  className="graph-fit-btn"
                  style={{ position: 'relative', top: 0, right: 0, backgroundColor: isRefreshing ? '#1e2230' : '#161922', color: isRefreshing ? '#e2e8f0' : '#64748b' }}
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  title="Refresh status"
                >
                  {isRefreshing ? '↻ Refreshing...' : '↻ Refresh'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="graph-state">
            <div className="graph-state__spinner" />
            <p className="graph-state__text">Calculating layout…</p>
          </div>
        )}
      </div>

      <TaskInspector job={selectedJob} onClose={() => setSelectedJob(null)} onRefresh={onRefresh} />
    </div>
  )
}

export default GraphCanvas
