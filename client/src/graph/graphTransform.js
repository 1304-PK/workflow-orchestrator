/**
 * Pure transform: converts workflow jobs into React Flow nodes and edges.
 * No positions are assigned here — ELK handles layout.
 *
 * @param {Object} workflow - A single workflow object from workflows.json
 * @returns {{ nodes: import('@xyflow/react').Node[], edges: import('@xyflow/react').Edge[] }}
 */
export function transformWorkflow(workflow) {
  const nodes = workflow.jobs.map((job) => ({
    id: job.type,
    type: 'workflowNode',
    position: { x: 0, y: 0 }, // placeholder; overwritten by ELK layout
    data: {
      title: job.title,
      jobType: job.type,
      description: job.description,
      dependsOn: job.depends_on,
      retryPolicy: job.retry_policy,
    },
  }))

  const edges = []
  for (const job of workflow.jobs) {
    for (const dep of job.depends_on) {
      edges.push({
        id: `${dep}→${job.type}`,
        source: dep,
        target: job.type,
        type: 'smoothstep',
      })
    }
  }

  return { nodes, edges }
}

/**
 * Pure transform: converts live workflow tasks into React Flow nodes and edges.
 *
 * @param {Object[]} tasks - Array of task objects from Supabase
 * @returns {{ nodes: import('@xyflow/react').Node[], edges: import('@xyflow/react').Edge[] }}
 */
export function transformLiveTasks(tasks) {
  const nodes = tasks.map((task) => ({
    id: task.task_type,
    type: 'workflowNode',
    position: { x: 0, y: 0 },
    data: {
      id: task.id,
      title: task.title || task.task_type,
      jobType: task.task_type,
      description: task.description,
      dependsOn: task.depends_on || [],
      status: task.status,
      result: task.result,
      error: task.error,
    },
  }))

  const edges = []
  for (const task of tasks) {
    if (Array.isArray(task.depends_on)) {
      for (const dep of task.depends_on) {
        edges.push({
          id: `${dep}→${task.task_type}`,
          source: dep,
          target: task.task_type,
          type: 'smoothstep',
        })
      }
    }
  }

  return { nodes, edges }
}
