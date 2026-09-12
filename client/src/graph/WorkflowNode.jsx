import { Handle, Position } from '@xyflow/react'



function statusColor(status) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'rgba(74, 222, 128, 0.2)' // green
  if (s === 'failed') return 'rgba(248, 113, 113, 0.2)' // red
  if (s === 'pending' || s === 'running') return 'rgba(250, 204, 21, 0.2)' // yellow
  if (s === 'waiting') return 'rgba(156, 163, 175, 0.2)' // gray
  return 'rgba(156, 163, 175, 0.1)' // default gray
}

function statusBorderColor(status) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'rgba(74, 222, 128, 0.8)'
  if (s === 'failed') return 'rgba(248, 113, 113, 0.8)'
  if (s === 'pending' || s === 'running') return 'rgba(250, 204, 21, 0.8)'
  if (s === 'waiting') return 'rgba(156, 163, 175, 0.6)'
  return 'rgba(255, 255, 255, 0.2)'
}

/**
 * Custom React Flow node for a workflow job.
 * Displays a small icon and the job title in a compact card.
 * Handles selection state via CSS class.
 */
function WorkflowNode({ data, selected }) {
  const isLive = data.status !== undefined

  return (
    <div 
      className={`wf-node${selected ? ' wf-node--selected' : ''}`}
      style={{ 
        border: `2px dashed ${isLive ? statusBorderColor(data.status) : 'rgba(255, 255, 255, 0.08)'}`,
        backgroundColor: selected ? '#1a1e2a' : '#161922'
      }}
    >
      <Handle type="target" position={Position.Top} className="wf-handle" />

      <span className="wf-node__title" style={isLive ? { flex: 1 } : {}}>{data.title}</span>

      {isLive && (
        <span style={{
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: statusColor(data.status),
          color: statusBorderColor(data.status),
          textTransform: 'uppercase'
        }}>
          {data.status || 'WAITING'}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} className="wf-handle" />
    </div>
  )
}

export default WorkflowNode
