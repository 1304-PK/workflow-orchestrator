const customer_onboarding = require("./customer_onboarding.js")
const daily_sales_report = require("./daily_sales_report.js")
const order_fulfillment = require("./order_fulfillment.js")
const software_release_pipeline = require("./software_release_pipeline.js")
const travel_booking = require("./travel_booking.js")

const TASKS = {
  ...customer_onboarding,
  ...daily_sales_report,
  ...order_fulfillment,
  ...software_release_pipeline,
  ...travel_booking,
}

module.exports = TASKS