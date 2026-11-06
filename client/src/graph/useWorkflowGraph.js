import { useEffect, useState } from 'react'
import { transformWorkflow } from './graphTransform.js'

const TARGET_WORKFLOW_TYPE = 'customer_onboarding'

/**
 * Loads the target workflow definition from the server API
 * and transforms it into raw (unpositioned) React Flow nodes and edges.
 *
 * @param {string} [workflowType=TARGET_WORKFLOW_TYPE]
 * @returns {{
 *   workflow: Object | null,
 *   rawNodes: import('@xyflow/react').Node[],
 *   edges: import('@xyflow/react').Edge[],
 *   isLoading: boolean,
 *   error: string | null,
 * }}
 */
export function useWorkflowGraph(workflowType = TARGET_WORKFLOW_TYPE) {
  const [workflow, setWorkflow] = useState(null)
  const [rawNodes, setRawNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchWorkflow() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:3000/api/workflows/${workflowType}/definition`)
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.errMsg || `Failed to fetch workflow: ${response.statusText}`)
        }

        const data = await response.json()
        if (!isMounted) return

        const { nodes, edges } = transformWorkflow(data)
        setWorkflow(data)
        setRawNodes(nodes)
        setEdges(edges)
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchWorkflow()

    return () => {
      isMounted = false
    }
  }, [workflowType])

  return { workflow, rawNodes, edges, isLoading, error }
}
