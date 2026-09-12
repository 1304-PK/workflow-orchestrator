import { useEffect, useState } from 'react'
import { runElkLayout } from './elkLayout.js'

/**
 * Runs ELK layout on the provided raw nodes and edges.
 * Returns the positioned nodes once layout completes.
 *
 * @param {import('@xyflow/react').Node[]} rawNodes - Unpositioned nodes
 * @param {import('@xyflow/react').Edge[]} edges
 * @returns {{ layoutNodes: import('@xyflow/react').Node[], isLayoutReady: boolean }}
 */
export function useElkLayout(rawNodes, edges) {
  const [layoutNodes, setLayoutNodes] = useState([])
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  useEffect(() => {
    if (rawNodes.length === 0) return
    

    runElkLayout(rawNodes, edges)
      .then((positioned) => {
        setLayoutNodes(positioned)
        setIsLayoutReady(true)
      })
      .catch((err) => {
        console.error('ELK layout failed:', err)
      })
  }, [rawNodes, edges])

  return { layoutNodes, isLayoutReady }
}
