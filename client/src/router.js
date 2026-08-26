import { createElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import WorkflowsPage from './WorkflowsPage.jsx'

const router = createBrowserRouter([
  { path: '/', element: createElement(App) },
  { path: '/workflows', element: createElement(WorkflowsPage) },
])

export default router
