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

  const fetchStatus = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`http://localhost:3000/api/workflows/status/${id}`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log("data", data)

        setWorkflow(data.workflow)

        const { nodes, edges } = transformLiveTasks(data.tasks)
        setRawNodes(nodes)
        setEdges(edges)

        setError(null)
        setIsRefreshing(false)


      } catch (err) {
        console.error("Failed to fetch workflow status:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
  }

  useEffect(() => {
    fetchStatus()
  }, [id])

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3000/api/workflows/status/${id}/events`
    );

    eventSource.onopen = () => {
      console.log("SSE connected");
    };

    eventSource.onmessage = (event) => {

      try {
        const message = JSON.parse(event.data);
        console.log("Received SSE message:", message);

        const changedTasks = Array.isArray(message.tasks) ? message.tasks : [];
        const changedWorkflow = message.workflow && Object.keys(message.workflow).length > 0
          ? message.workflow
          : null;

        if (changedTasks.length === 0 && !changedWorkflow) {
          console.warn("Received SSE message without task or workflow changes:", message);
          return;
        }

        if (changedWorkflow) {
          setWorkflow((currentWorkflow) => ({
            ...currentWorkflow,
            ...changedWorkflow,
          }));
        }

        setRawNodes((currentNodes) => {
          const changedTasksById = new Map(
            changedTasks
              .filter((task) => task?.id !== undefined)
              .map((task) => [String(task.id), task]),
          );

          const updatedNodes = currentNodes.map((node) => {
            const task = changedTasksById.get(String(node.data.id));

            if (!task) {
              return node;
            }

            return {
              ...node,
              data: {
                ...node.data,
                ...(task.title !== undefined && { title: task.title }),
                ...(task.description !== undefined && { description: task.description }),
                ...(task.depends_on !== undefined && { dependsOn: task.depends_on }),
                ...(task.status !== undefined && { status: task.status }),
                ...(task.result !== undefined && { result: task.result }),
                ...(task.error !== undefined && { error: task.error }),
                ...(task.attempt_count !== undefined && {
                  attemptCount: task.attempt_count,
                }),
                ...(task.worker_id !== undefined && {
                  workerId: task.worker_id,
                }),
                ...(task.lease_expires_at !== undefined && {
                  leaseExpiresAt: task.lease_expires_at,
                }),
                ...(task.updated_at !== undefined && {
                  updatedAt: task.updated_at,
                }),
              },
            };
          });

          return updatedNodes;
        });

        setIsRefreshing(false);
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);

      setError("Failed to connect to workflow status stream");
      setIsLoading(false);
      setIsRefreshing(false);
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [id]);


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
