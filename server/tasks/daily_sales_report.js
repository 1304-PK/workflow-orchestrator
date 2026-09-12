const getTaskStatus = require("./shared/taskStatus");

// Client must provide: report_date, region

async function extract_sales_data(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Data extraction failed: source system unreachable" };
  }
  return { success: true, result: { raw_record_count: 1500 } };
}

async function validate_clean_data(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Data validation failed: malformed records detected" };
  }
  // uses payload.raw_record_count
  return { success: true, result: { clean_record_count: 1432 } };
}

async function transform_data(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Data transformation failed: calculation error" };
  }
  // uses payload.clean_record_count
  return { success: true, result: { total_revenue: 48213.75 } };
}

async function generate_report(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Report generation failed: template rendering error" };
  }
  // uses payload.total_revenue
  return { success: true, result: { report_id: `rpt_${Date.now()}` } };
}

async function publish_report(payload) {
  const result = await getTaskStatus();
  if (!result) {
    return { success: false, error: "Report publishing failed: storage upload error" };
  }
  // uses payload.report_id
  return { success: true, result: { published_url: `https://reports.example.com/${Date.now()}` } };
}

module.exports = {
  extract_sales_data,
  validate_clean_data,
  transform_data,
  generate_report,
  publish_report,
};