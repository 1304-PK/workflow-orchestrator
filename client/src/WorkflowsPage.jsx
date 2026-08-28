import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const initialOrderForm = {
  fullName: 'name',
  emailAddress: 'email@gmail.com',
  phoneNumber: '9090909090',
  selectedItems: 'cat',
  itemQuantity: '100',
  shippingAddress: 'my island',
  recipientName: 'mr robot',
  shippingMethod: 'standard',
  paymentMethod: 'card',
  paymentAuthorization: 'idk',
  confirmationMethod: 'email',
}

function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orderForm, setOrderForm] = useState(initialOrderForm)

  function openWorkflowForm(type) {
    if (type === 'order_fulfillment') {
      setIsOrderFormOpen(true)
    }
  }

  function handleOrderFormChange(event) {
    const { name, value } = event.target
    setOrderForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function submitWorkflow(event) {
    event.preventDefault()

    try {
      const response = await fetch('http://localhost:3000/api/workflows/order_fulfillment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm),
      })

      if (response.ok) {
        setOrderForm(initialOrderForm)
        setIsOrderFormOpen(false)
      } else {
        console.error(`Failed to start workflow order_fulfillment: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to start workflow order_fulfillment:', error)
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
    <main className="workflows-page">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" to="/">
          Flow<span>line</span>
        </Link>
        <Link className="nav-link" to="/">
          Back home <span aria-hidden="true">↗</span>
        </Link>
      </nav>
      <h1>Workflows.</h1>
      <section className="workflow-list" aria-label="Available workflows">
        {workflows.map((workflow) => (
          <div
            className="workflow-row"
            key={workflow.type ?? workflow.id ?? workflow.title}
          >
            <span>{workflow.title}</span>
            <button
              type="button"
              className="create-button"
              onClick={() => openWorkflowForm(workflow.type)}
            >
              Create
            </button>
          </div>
        ))}
      </section>

      {isOrderFormOpen && (
        <div className="workflow-overlay" role="presentation" onMouseDown={() => setIsOrderFormOpen(false)}>
          <section
            className="workflow-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Create workflow</p>
                <h2 id="order-form-title">Order Fulfillment</h2>
              </div>
              <button
                type="button"
                className="close-button"
                aria-label="Close form"
                onClick={() => setIsOrderFormOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="workflow-form" onSubmit={submitWorkflow}>
              <div className="form-row form-row--two">
                <label>Full name<input name="fullName" value={orderForm.fullName} onChange={handleOrderFormChange} required /></label>
                <label>Email address<input type="email" name="emailAddress" value={orderForm.emailAddress} onChange={handleOrderFormChange} required /></label>
              </div>
              <div className="form-row form-row--two">
                <label>Phone number<input type="tel" name="phoneNumber" value={orderForm.phoneNumber} onChange={handleOrderFormChange} required /></label>
                <label>Recipient name<input name="recipientName" value={orderForm.recipientName} onChange={handleOrderFormChange} required /></label>
              </div>
              <div className="form-row form-row--two">
                <label>Selected products/items<input name="selectedItems" value={orderForm.selectedItems} onChange={handleOrderFormChange} required /></label>
                <label>Quantity for each item<input name="itemQuantity" value={orderForm.itemQuantity} onChange={handleOrderFormChange} required /></label>
              </div>
              <label>Shipping address<textarea name="shippingAddress" value={orderForm.shippingAddress} onChange={handleOrderFormChange} rows="3" required /></label>
              <div className="form-row form-row--two">
                <label>Preferred shipping method<select name="shippingMethod" value={orderForm.shippingMethod} onChange={handleOrderFormChange} required><option value="">Select method</option><option value="standard">Standard</option><option value="express">Express</option></select></label>
                <label>Payment method<select name="paymentMethod" value={orderForm.paymentMethod} onChange={handleOrderFormChange} required><option value="">Select method</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option></select></label>
              </div>
              <label>Secure payment token or payment authorization details<input name="paymentAuthorization" value={orderForm.paymentAuthorization} onChange={handleOrderFormChange} required /></label>
              <label>Preferred confirmation method (email or SMS)<select name="confirmationMethod" value={orderForm.confirmationMethod} onChange={handleOrderFormChange} required><option value="">Select method</option><option value="email">Email</option><option value="sms">SMS</option></select></label>
              <button className="submit-button" type="submit">Submit <span aria-hidden="true">→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default WorkflowsPage