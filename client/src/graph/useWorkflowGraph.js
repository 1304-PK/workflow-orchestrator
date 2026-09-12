import { useEffect, useState } from 'react'
import { transformWorkflow } from './graphTransform.js'
import workflowsData from '../../../server/data/workflows.json'

const TARGET_WORKFLOW_TYPE = 'customer_onboarding'

/**
 * Loads the target workflow from the static workflows.json data file
 * and transforms it into raw (unpositioned) React Flow nodes and edges.
 *
 * @returns {{
 *   workflow: Object | null,
 *   rawNodes: import('@xyflow/react').Node[],
 *   edges: import('@xyflow/react').Edge[],
 *   isLoading: boolean,
 *   error: string | null,
 * }}
 */
export function useWorkflowGraph() {
  const [workflow, setWorkflow] = useState(null)
  const [rawNodes, setRawNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const found = workflowsData.workflows.find(
        (w) => w.type === TARGET_WORKFLOW_TYPE
      )

      if (!found) {
        throw new Error(`Workflow "${TARGET_WORKFLOW_TYPE}" not found`)
      }

      const { nodes, edges } = transformWorkflow(found)
      setWorkflow(found)
      setRawNodes(nodes)
      setEdges(edges)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { workflow, rawNodes, edges, isLoading, error }
}
