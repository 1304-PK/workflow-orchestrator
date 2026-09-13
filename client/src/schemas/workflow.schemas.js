import { z } from 'zod'

const requiredText = (label) => z.string({
  error: `${label} is required`,
}).trim().min(1, `${label} is required`)

const email = z.string({
  error: 'Applicant email is required',
}).trim().min(1, 'Applicant email is required').email('Enter a valid applicant email')

const date = (label) => z.string({
  error: `${label} is required`,
}).trim().min(1, `${label} is required`).regex(/^\d{4}-\d{2}-\d{2}$/, `Enter a valid ${label.toLowerCase()}`)

export const workflowFields = {
  customer_onboarding: [
    { name: 'applicant_name', label: 'Applicant name' },
    { name: 'applicant_email', label: 'Applicant email', type: 'email' },
    { name: 'submitted_documents', label: 'Submitted documents' },
  ],
  daily_sales_report: [
    { name: 'report_date', label: 'Report date', type: 'date' },
    { name: 'region', label: 'Region' },
  ],
  order_fulfillment: [
    { name: 'order_id', label: 'Order ID' },
    { name: 'customer_id', label: 'Customer ID' },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'shipping_address', label: 'Shipping address' },
  ],
  software_release_pipeline: [
    { name: 'repository', label: 'Repository' },
    { name: 'commit_sha', label: 'Commit SHA' },
    { name: 'branch', label: 'Branch' },
  ],
  travel_booking: [
    { name: 'traveler_name', label: 'Traveler name' },
    { name: 'origin', label: 'Origin' },
    { name: 'destination', label: 'Destination' },
    { name: 'departure_date', label: 'Departure date', type: 'date' },
  ],
}

export const workflowSchemas = {
  customer_onboarding: z.object({
    applicant_name: requiredText('Applicant name'),
    applicant_email: email,
    submitted_documents: requiredText('Submitted documents'),
  }),
  daily_sales_report: z.object({
    report_date: date('Report date'),
    region: requiredText('Region'),
  }),
  order_fulfillment: z.object({
    order_id: requiredText('Order ID'),
    customer_id: requiredText('Customer ID'),
    amount: z.string({ error: 'Amount is required' })
      .trim()
      .min(1, 'Amount is required')
      .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, 'Amount must be greater than zero'),
    shipping_address: requiredText('Shipping address'),
  }),
  software_release_pipeline: z.object({
    repository: requiredText('Repository'),
    commit_sha: requiredText('Commit SHA'),
    branch: requiredText('Branch'),
  }),
  travel_booking: z.object({
    traveler_name: requiredText('Traveler name'),
    origin: requiredText('Origin'),
    destination: requiredText('Destination'),
    departure_date: date('Departure date'),
  }),
}
