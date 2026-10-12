// Hard-coded Kanban pipeline for inquiries.
// Per MOM: no dynamic pipeline customization — these stages are fixed.
export const PIPELINE_STAGES = [
  'Inquired',
  'Contacted',
  'Quotation Provided',
  'Negotiation',
  'Completed',
  'Lost',
];

// Where an inquiry can come from — matches the forms wired up on the website.
export const INQUIRY_SOURCES = ['product', 'service', 'contact'];