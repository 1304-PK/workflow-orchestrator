async function validate_order(payload) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const success = Math.random() >= 0.3;

  if (!success) {
    return {
      success: false,
      error: "validate_order failed",
    };
  }

  return {
    success: true,
    result: {
      orderId: 10010,
      valid: true,
      customerDetailsValid: true,
      itemsValid: true,
      validationStatus: "approved",
    },
  };
}

async function reserve_inventory(payload) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const success = Math.random() >= 0.3;

  if (!success) {
    return {
      success: false,
      error: "reserve_inventory failed",
    };
  }

  return {
    success: true,
    result: {
      orderId: 10010,
      inventoryReserved: true,
      reservationId: "RES-78421",
      reservedItems: "Aeroplane",
      reservationStatus: "successful",
    },
  };
}

async function process_payment(payload) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const success = Math.random() >= 0.3;

  if (!success) {
    return {
      success: false,
      error: "process_payment failed",
    };
  }

  return {
    success: true,
    result: {
      orderId: 10010,
      paymentSuccessful: true,
      paymentId: "PAY-982341",
      amountCharged: 500,
      currency: "USD",
      paymentMethod: "Card",
      paymentStatus: "completed",
    },
  };
}

async function create_shipment(payload) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const success = Math.random() >= 0.3;

  if (!success) {
    return {
      success: false,
      error: "create_shipment failed",
    };
  }

  return {
    success: true,
    result: {
      orderId: 10010,
      reservationId: 10991,
      shipmentCreated: true,
      shipmentId: "SHP-445821",
      trackingNumber: "TRK-IND-789456",
      shippingLabelCreated: true,
      shippingMethod: "Standard",
      shipmentStatus: "ready_to_ship",
    },
  };
}

async function send_confirmation(payload) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const success = Math.random() >= 0.3;

  if (!success) {
    return {
      success: false,
      error: "send_confirmation failed",
    };
  }

  return {
    success: true,
    result: {
      orderId: 10010,
      confirmationSent: true,
      notificationId: "NOTIF-8821",
      deliveryChannel: "email",
      recipient: "temp@gmail.com",
      paymentId: 10091,
      shipmentId: 10010,
      trackingNumber: 78787878,
      status: "sent",
    },
  };
}

module.exports = {
  validate_order,
  reserve_inventory,
  process_payment,
  create_shipment,
  send_confirmation,
};