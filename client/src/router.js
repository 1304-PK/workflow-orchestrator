import { createElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import DashboardPage from './DashboardPage.jsx'
import WorkflowsPage from './WorkflowsPage.jsx'
import LandingPage from './LandingPage.jsx'
import GraphViewPage from './graph/GraphViewPage.jsx'
import WorkflowStatusPage from './WorkflowStatusPage.jsx'

const router = createBrowserRouter([
  { path: '/', element: createElement(LandingPage) },
  { path: '/dashboard', element: createElement(DashboardPage) },
  { path: '/workflows', element: createElement(WorkflowsPage) },
  { path: '/graph-view', element: createElement(GraphViewPage) },
  { path: '/workflows/status/:id', element: createElement(WorkflowStatusPage) },
])

export default router
