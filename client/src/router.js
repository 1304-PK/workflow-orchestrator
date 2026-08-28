import { createElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import DashboardPage from './DashboardPage.jsx'
import WorkflowsPage from './WorkflowsPage.jsx'

const router = createBrowserRouter([
  { path: '/', element: createElement(App) },
  { path: '/dashboard', element: createElement(DashboardPage) },
  { path: '/workflows', element: createElement(WorkflowsPage) },
])

export default router
