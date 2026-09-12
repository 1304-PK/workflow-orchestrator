import ELK from 'elkjs/lib/elk.bundled.js'

const elk = new ELK()

const NODE_WIDTH = 220
const NODE_HEIGHT = 56

/**
 * ELK layout options for a top-to-bottom layered DAG.
 */
const ELK_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.spacing.nodeNode': '40',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.edgeRouting': 'ORTHOGONAL',
}

/**
 * Runs ELK layout on the given React Flow nodes and edges.
 * Returns a new array of nodes with `position` populated from ELK output.
 *
 * @param {import('@xyflow/react').Node[]} nodes
 * @param {import('@xyflow/react').Edge[]} edges
 * @returns {Promise<import('@xyflow/react').Node[]>}
 */
export async function runElkLayout(nodes, edges) {
  const elkGraph = {
    id: 'root',
    layoutOptions: ELK_OPTIONS,
    children: nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  }

  const layoutedGraph = await elk.layout(elkGraph)

  return nodes.map((node) => {
    const elkNode = layoutedGraph.children.find((n) => n.id === node.id)
    return {
      ...node,
      position: {
        x: elkNode.x,
        y: elkNode.y,
      },
    }
  })
}

export { NODE_WIDTH, NODE_HEIGHT }
