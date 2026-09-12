const getTaskStatus = require("./shared/taskStatus");

// Client must provide: traveler_name, origin, destination, departure_date

async function validate_booking_request(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Booking request invalid: missing or malformed details" };
  }
  return { success: true, result: { request_valid: true } };
}

async function check_availability(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "No availability found for requested route/date" };
  }
  // uses payload.request_valid
  return { success: true, result: { available_option_id: `opt_${Date.now()}` } };
}

async function calculate_final_price(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Price calculation failed: pricing service error" };
  }
  // uses payload.available_option_id
  return { success: true, result: { final_price: 452.30 } };
}

async function confirm_reservation(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Reservation confirmation failed: option no longer available" };
  }
  // uses payload.final_price
  return { success: true, result: { reservation_id: `resv_${Date.now()}` } };
}

async function send_itinerary(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Itinerary email failed to send" };
  }
  // uses payload.reservation_id
  return { success: true, result: { itinerary_sent: true } };
}

module.exports = {
  validate_booking_request,
  check_availability,
  calculate_final_price,
  confirm_reservation,
  send_itinerary,
};