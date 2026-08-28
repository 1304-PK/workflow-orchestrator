import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

function formatResult(result) {
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}

function DashboardPage() {
  const [workflows, setWorkflows] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadWorkflows() {
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('id, type, title, description, status')
        .order('created_at', { ascending: false })

      if (workflowError) {
        setErrorMessage(workflowError.message)
        setIsLoading(false)
        return
      }

      const workflowIds = workflowData.map((workflow) => workflow.id)
      let taskData = []

      if (workflowIds.length > 0) {
        const { data, error: taskError } = await supabase
          .from('tasks_queue')
          .select('id, workflow_id, task_type, status, result, error, sequence_order')
          .in('workflow_id', workflowIds)
          .order('sequence_order', { ascending: true })

        if (taskError) {
          setErrorMessage(taskError.message)
          setIsLoading(false)
          return
        }
        taskData = data
      }

      const tasksByWorkflow = taskData.reduce((groupedTasks, task) => {
        if (!groupedTasks[task.workflow_id]) groupedTasks[task.workflow_id] = []
        groupedTasks[task.workflow_id].push(task)
        return groupedTasks
      }, {})

      setWorkflows(workflowData.map((workflow) => ({
        ...workflow,
        tasks: tasksByWorkflow[workflow.id] || [],
      })))
      setIsLoading(false)
    }

    loadWorkflows()
  }, [])

  return (
    <main className="dashboard-page">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" to="/">
          Flow<span>line</span>
        </Link>
        <Link className="nav-link" to="/workflows">
          Workflows <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <section className="dashboard-heading">
        <p className="eyebrow">Live operations</p>
        <h1>Dashboard.</h1>
      </section>

      <section className="dashboard-content" aria-label="Current workflows">
        {isLoading && <p className="dashboard-message">Loading workflows...</p>}
        {!isLoading && errorMessage && <p className="dashboard-message dashboard-message--error">{errorMessage}</p>}
        {!isLoading && !errorMessage && workflows.length === 0 && <p className="dashboard-message">No current workflows.</p>}
        {!isLoading && !errorMessage && workflows.length > 0 && (
          <div className="workflow-dashboard-list">
            {workflows.map((workflow) => (
              <button type="button" className="workflow-dashboard-card" key={workflow.id} onClick={() => setSelectedWorkflow(workflow)}>
                <span className={`status-dot status-dot--${workflow.status?.toLowerCase()}`} />
                <span className="workflow-dashboard-card__body">
                  <span className="workflow-dashboard-card__title">{workflow.title}</span>
                  <span className="workflow-dashboard-card__type">{workflow.type}</span>
                  <span className="workflow-dashboard-card__description">{workflow.description}</span>
                </span>
                <span className="workflow-status">{workflow.status}</span>
                <span className="workflow-dashboard-card__arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedWorkflow && (
        <div className="workflow-overlay" role="presentation" onMouseDown={() => setSelectedWorkflow(null)}>
          <section className="workflow-modal workflow-detail-modal" role="dialog" aria-modal="true" aria-labelledby="workflow-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Workflow steps</p>
                <h2 id="workflow-detail-title">{selectedWorkflow.title}</h2>
                <p className="modal-description">{selectedWorkflow.description}</p>
              </div>
              <button type="button" className="close-button" aria-label="Close workflow details" onClick={() => setSelectedWorkflow(null)}>×</button>
            </div>
            <div className="task-steps">
              {selectedWorkflow.tasks.length === 0 && <p className="dashboard-message">No tasks found.</p>}
              {selectedWorkflow.tasks.map((task, index) => (
                <article className="task-step" key={task.id}>
                  <div className="task-step__number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="task-step__content">
                    <div className="task-step__heading">
                      <h3>{task.task_type}</h3>
                      <span className={`workflow-status workflow-status--${task.status?.toLowerCase()}`}>{task.status}</span>
                    </div>
                    {task.status === 'COMPLETED' && task.result != null && <pre className="task-detail">{formatResult(task.result)}</pre>}
                    {task.status === 'FAILED' && task.error && <p className="task-error">{task.error}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default DashboardPage
