const getTaskStatus = require("./shared/taskStatus");

// Client must provide: order_id, customer_id, amount, shipping_address

async function validate_order(payload) {
  const result = await getTaskStatus();
  console.log("result", result)
  if (!result) {
    return { success: false, error: "Order validation failed: invalid or unavailable items" };
  }
  return { success: true, result: { order_id: payload.order_id, is_valid: true } };
}

async function reserve_inventory(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Inventory reservation failed: insufficient stock" };
  }
  // uses payload.order_id, payload.is_valid from validate_order
  return { success: true, result: { reservation_id: `res_${Date.now()}` } };
}

async function process_payment(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Payment processing failed: card declined" };
  }
  // uses payload.reservation_id, payload.amount (client-provided)
  return { success: true, result: { transaction_id: `txn_${Date.now()}` } };
}

async function create_shipment(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Shipment creation failed: carrier API error" };
  }
  // uses payload.transaction_id, payload.shipping_address (client-provided)
  return { success: true, result: { shipment_id: `ship_${Date.now()}`, tracking_number: `TRK${Date.now()}` } };
}

async function send_confirmation(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Confirmation email failed to send" };
  }
  // uses payload.shipment_id, payload.tracking_number
  return { success: true, result: { email_sent: true } };
}

module.exports = {
  validate_order,
  reserve_inventory,
  process_payment,
  create_shipment,
  send_confirmation,
};