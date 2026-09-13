import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { workflowFields, workflowSchemas } from './schemas/workflow.schemas.js'
import { zodErrorParser } from './util/zodErrorParser.js'

function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [workflowForm, setWorkflowForm] = useState({})
  const [validationError, setValidationError] = useState('')

  function openWorkflowForm(type) {
    setSelectedWorkflow(workflows.find((workflow) => workflow.type === type) ?? { type, title: type })
    setWorkflowForm(
      Object.fromEntries((workflowFields[type] ?? []).map(({ name }) => [name, ''])),
    )
    setValidationError('')
  }

  function handleWorkflowFormChange(event) {
    const { name, value } = event.target
    setWorkflowForm((currentForm) => ({ ...currentForm, [name]: value }))
    setValidationError('')
  }

  async function submitWorkflow(event) {
    event.preventDefault()
    const schema = workflowSchemas[selectedWorkflow.type]
    const validation = schema?.safeParse(workflowForm)

    if (!validation?.success) {
      setValidationError(
        validation
          ? zodErrorParser(validation.error)
          : 'This workflow does not have a validation schema.',
      )
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/workflows/${selectedWorkflow.type}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowForm),
      })

      if (response.ok) {
        setWorkflowForm({})
        setSelectedWorkflow(null)
        setValidationError('')
      } else {
        console.error(`Failed to start workflow ${selectedWorkflow.type}: ${response.status}`)
      }
    } catch (error) {
      console.error(`Failed to start workflow ${selectedWorkflow.type}:`, error)
    }
  }

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
    <main className="min-h-screen bg-[#2d3037] p-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-bold">Workflows</h1>
        <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition-colors">
          Go to dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.type ?? workflow.id ?? workflow.title}
            className="flex flex-col bg-[#21242d] border border-black p-5 text-white rounded-lg gap-4"
          >
            <div className="flex flex-col flex-1 mt-1">
              <span className="text-xl font-bold mb-1">{workflow.title}</span>
              <span className="text-sm text-gray-400 mb-4">{workflow.type}</span>
              <span className="text-sm text-gray-300 leading-relaxed">{workflow.description}</span>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-700 mt-auto">
              <button
                type="button"
                className="bg-[#f47a3d] text-[#202027] px-6 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity"
                onClick={() => openWorkflowForm(workflow.type)}
              >
                Create
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="presentation" onMouseDown={() => setSelectedWorkflow(null)}>
          <section
            className="bg-[#2d3037] text-white p-6 rounded-lg w-full max-w-2xl border border-black max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-400">Create workflow</p>
                <h2 id="order-form-title" className="text-2xl font-bold">{selectedWorkflow.title}</h2>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-white text-3xl leading-none"
                aria-label="Close form"
                onClick={() => setSelectedWorkflow(null)}
              >
                ×
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={submitWorkflow}>
              {workflowFields[selectedWorkflow.type]?.map(({ name, label, type = 'text' }) => (
                <label key={name} className="flex flex-col gap-1">
                  {label}
                  <input className="bg-[#21242d] border border-black p-2 rounded text-white" type={type} name={name} value={workflowForm[name] ?? ''} onChange={handleWorkflowFormChange} />
                </label>
              ))}
              {validationError && (
                <p className="text-sm text-red-300" role="alert">
                  {validationError}
                </p>
              )}
              <button className="bg-[#f47a3d] text-[#202027] font-semibold py-3 rounded-md mt-4 hover:opacity-90 transition-opacity" type="submit">Submit <span aria-hidden="true">→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default WorkflowsPage