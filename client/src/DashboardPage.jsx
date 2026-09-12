import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

function formatResult(result) {
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}

function DashboardPage() {
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')



  async function handleDeleteWorkflow(event, workflow) {
    event.stopPropagation()

    const shouldDelete = window.confirm(`Delete "${workflow.title}"?`)
    if (!shouldDelete) return

    const { error: tasksError } = await supabase
      .from('tasks_queue')
      .delete()
      .eq('workflow_id', workflow.id)

    if (tasksError) {
      setErrorMessage(tasksError.message)
      return
    }

    const { error: workflowError } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflow.id)

    if (workflowError) {
      setErrorMessage(workflowError.message)
      return
    }

    setWorkflows((currentWorkflows) => currentWorkflows.filter((item) => item.id !== workflow.id))
    setSelectedWorkflow((currentWorkflow) => currentWorkflow?.id === workflow.id ? null : currentWorkflow)
    setErrorMessage('')
  }

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
          .select('id, workflow_id, task_type, status, result, error')
          .in('workflow_id', workflowIds)
          .order('id', { ascending: true })

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
    <main className="min-h-screen bg-[#2d3037] p-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Live operations</p>
          <h1 className="text-white text-3xl font-bold">Dashboard</h1>
        </div>
        <Link to="/workflows" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition-colors">
          Go to workflows
        </Link>
      </div>

      <div className={workflows.length > 0 ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        {isLoading && <p className="text-white">Loading workflows...</p>}
        {!isLoading && errorMessage && <p className="text-red-400">{errorMessage}</p>}
        {!isLoading && !errorMessage && workflows.length === 0 && <p className="text-white">No current workflows.</p>}
        {!isLoading && !errorMessage && workflows.length > 0 && (
          workflows.map((workflow) => (
            <div 
              key={workflow.id}
              className="flex flex-col bg-[#21242d] border border-black p-5 text-white rounded-lg gap-4 cursor-pointer hover:border-gray-500 hover:bg-[#252833] transition-all relative group"
              onClick={() => navigate(`/workflows/status/${workflow.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${workflow.status?.toLowerCase() === 'completed' ? 'bg-green-500' : workflow.status?.toLowerCase() === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{workflow.status}</span>
                </div>
                <button
                  type="button"
                  className="text-gray-500 hover:text-red-500 text-3xl leading-none transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Delete ${workflow.title}`}
                  title="Delete workflow"
                  onClick={(event) => handleDeleteWorkflow(event, workflow)}
                >
                  ×
                </button>
              </div>
              
              <div className="flex flex-col flex-1 mt-1">
                <span className="text-xl font-bold mb-1">{workflow.title}</span>
                <span className="text-sm text-gray-400 mb-4">{workflow.type}</span>
                <span className="text-sm text-gray-300 leading-relaxed">{workflow.description}</span>
              </div>
              
              <div className="flex justify-end pt-2">
                <span className="text-xl text-gray-500 group-hover:text-indigo-400 transition-colors" aria-hidden="true">↗</span>
              </div>
            </div>
          ))
        )}
      </div>

    </main>
  )
}

export default DashboardPage
