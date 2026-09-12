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
    <main className="min-h-screen bg-[#2d3037] p-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-bold">Workflows</h1>
        <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition-colors">
          Go to dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.type ?? workflow.id ?? workflow.title}
            className="flex flex-col bg-[#21242d] border border-black p-5 text-white rounded-lg gap-4"
          >
            <div className="flex flex-col flex-1 mt-1">
              <span className="text-xl font-bold mb-1">{workflow.title}</span>
              <span className="text-sm text-gray-400 mb-4">{workflow.type}</span>
              <span className="text-sm text-gray-300 leading-relaxed">{workflow.description}</span>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-700 mt-auto">
              <button
                type="button"
                className="bg-[#f47a3d] text-[#202027] px-6 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity"
                onClick={() => openWorkflowForm(workflow.type)}
              >
                Create
              </button>
            </div>
          </div>
        ))}
      </div>

      {isOrderFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="presentation" onMouseDown={() => setIsOrderFormOpen(false)}>
          <section
            className="bg-[#2d3037] text-white p-6 rounded-lg w-full max-w-2xl border border-black max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-400">Create workflow</p>
                <h2 id="order-form-title" className="text-2xl font-bold">Order Fulfillment</h2>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-white text-3xl leading-none"
                aria-label="Close form"
                onClick={() => setIsOrderFormOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={submitWorkflow}>
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 flex flex-col gap-1">Full name<input className="bg-[#21242d] border border-black p-2 rounded text-white" name="fullName" value={orderForm.fullName} onChange={handleOrderFormChange} required /></label>
                <label className="flex-1 flex flex-col gap-1">Email address<input className="bg-[#21242d] border border-black p-2 rounded text-white" type="email" name="emailAddress" value={orderForm.emailAddress} onChange={handleOrderFormChange} required /></label>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 flex flex-col gap-1">Phone number<input className="bg-[#21242d] border border-black p-2 rounded text-white" type="tel" name="phoneNumber" value={orderForm.phoneNumber} onChange={handleOrderFormChange} required /></label>
                <label className="flex-1 flex flex-col gap-1">Recipient name<input className="bg-[#21242d] border border-black p-2 rounded text-white" name="recipientName" value={orderForm.recipientName} onChange={handleOrderFormChange} required /></label>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 flex flex-col gap-1">Selected products/items<input className="bg-[#21242d] border border-black p-2 rounded text-white" name="selectedItems" value={orderForm.selectedItems} onChange={handleOrderFormChange} required /></label>
                <label className="flex-1 flex flex-col gap-1">Quantity for each item<input className="bg-[#21242d] border border-black p-2 rounded text-white" name="itemQuantity" value={orderForm.itemQuantity} onChange={handleOrderFormChange} required /></label>
              </div>
              <label className="flex flex-col gap-1">Shipping address<textarea className="bg-[#21242d] border border-black p-2 rounded text-white" name="shippingAddress" value={orderForm.shippingAddress} onChange={handleOrderFormChange} rows="3" required /></label>
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 flex flex-col gap-1">Preferred shipping method<select className="bg-[#21242d] border border-black p-2 rounded text-white" name="shippingMethod" value={orderForm.shippingMethod} onChange={handleOrderFormChange} required><option value="">Select method</option><option value="standard">Standard</option><option value="express">Express</option></select></label>
                <label className="flex-1 flex flex-col gap-1">Payment method<select className="bg-[#21242d] border border-black p-2 rounded text-white" name="paymentMethod" value={orderForm.paymentMethod} onChange={handleOrderFormChange} required><option value="">Select method</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option></select></label>
              </div>
              <label className="flex flex-col gap-1">Secure payment token or payment authorization details<input className="bg-[#21242d] border border-black p-2 rounded text-white" name="paymentAuthorization" value={orderForm.paymentAuthorization} onChange={handleOrderFormChange} required /></label>
              <label className="flex flex-col gap-1">Preferred confirmation method (email or SMS)<select className="bg-[#21242d] border border-black p-2 rounded text-white" name="confirmationMethod" value={orderForm.confirmationMethod} onChange={handleOrderFormChange} required><option value="">Select method</option><option value="email">Email</option><option value="sms">SMS</option></select></label>
              <button className="bg-[#f47a3d] text-[#202027] font-semibold py-3 rounded-md mt-4 hover:opacity-90 transition-opacity" type="submit">Submit <span aria-hidden="true">→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default WorkflowsPage