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

/**
 * Right-side inspector panel for a selected workflow job.
 * Slides in when a node is selected, displays full job details.
 *
 * @param {{ job: Object | null, onClose: () => void, onRefresh?: () => void }} props
 */
function TaskInspector({ job, onClose, onRefresh }) {
  const isOpen = job !== null

  return (
    <aside className={`task-inspector${isOpen ? ' task-inspector--open' : ''}`} aria-label="Task details">
      {job && (
        <>
          <div className="task-inspector__header">
            <div className="task-inspector__header-text">
              <p className="task-inspector__label">Task details</p>
              <h2 className="task-inspector__title">{job.title}</h2>
            </div>
            <button
              type="button"
              className="task-inspector__close"
              aria-label="Close inspector"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="task-inspector__body">
            {job.status !== undefined && (
              <section className="task-inspector__section">
                <h3 className="task-inspector__section-label">Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: statusColor(job.status),
                    color: statusBorderColor(job.status),
                    textTransform: 'uppercase'
                  }}>
                    {job.status || 'WAITING'}
                  </span>
                  
                  {job.status === 'FAILED' && onRefresh && (
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#f47a3d',
                        color: '#202027',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={async () => {
                        try {
                          const response = await fetch(`http://localhost:3000/api/task/${job.id}/retry`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                          })
                          if (response.ok) {
                            onRefresh()
                          }
                        } catch (err) {
                          console.error('Retry failed', err)
                        }
                      }}
                    >
                      ↻ Retry
                    </button>
                  )}
                </div>
              </section>
            )}

            <section className="task-inspector__section">
              <h3 className="task-inspector__section-label">Description</h3>
              <p className="task-inspector__text">{job.description}</p>
            </section>

            <section className="task-inspector__section">
              <h3 className="task-inspector__section-label">Task type</h3>
              <code className="task-inspector__code">{job.jobType}</code>
            </section>

            {job.error && (
              <section className="task-inspector__section">
                <h3 className="task-inspector__section-label" style={{ color: '#f87171' }}>Error</h3>
                <p className="task-inspector__text" style={{ color: '#f87171' }}>{job.error}</p>
              </section>
            )}

            {job.result && (
              <section className="task-inspector__section">
                <h3 className="task-inspector__section-label">Result</h3>
                <pre style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#d1d5db',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  border: '1px solid rgba(0,0,0,0.5)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {typeof job.result === 'string' ? job.result : JSON.stringify(job.result, null, 2)}
                </pre>
              </section>
            )}

            {!job.status && job.retryPolicy && (
              <section className="task-inspector__section">
                <h3 className="task-inspector__section-label">Retry policy</h3>
                <div className="task-inspector__pill">
                  Max attempts: <strong>{job.retryPolicy?.max_attempts ?? 1}</strong>
                </div>
              </section>
            )}

            <section className="task-inspector__section">
              <h3 className="task-inspector__section-label">
                Dependencies
                <span className="task-inspector__count">{job.dependsOn.length}</span>
              </h3>
              {job.dependsOn.length === 0 ? (
                <p className="task-inspector__muted">No dependencies — entry point</p>
              ) : (
                <ul className="task-inspector__dep-list">
                  {job.dependsOn.map((dep) => (
                    <li key={dep} className="task-inspector__dep-item">
                      <span className="task-inspector__dep-arrow">↳</span>
                      <code>{dep}</code>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </aside>
  )
}

export default TaskInspector
