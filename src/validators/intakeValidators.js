import Joi from 'joi';

// Shared fields for all three website forms. email or phone must be
// present so staff always have a way to follow up.
const baseFields = {
  clientName: Joi.string().trim().min(1),
  name: Joi.string().trim().min(1), // alias for clientName
  email: Joi.string().trim().email(),
  phone: Joi.string().trim().min(5).max(20),
  company: Joi.string().trim().allow(''),
  message: Joi.string().trim().allow(''),
  sourcePage: Joi.string().trim().allow(''),
  value: Joi.number().min(0),
  vesselType: Joi.string().valid('Ferry', 'Tour boat', 'House boat', 'Trawler', 'Yatch', 'Workboat', 'Patrol boat', 'other').allow(''),
  retrofitStatus: Joi.string().valid('retrofit existing', 'new build', 'not decided yet').allow(''),
  vesselLength: Joi.string().trim().allow(''),
  operatingArea: Joi.string().trim().allow(''),
  dailyOperatingHours: Joi.string().trim().allow(''),
  timeLine: Joi.string().trim().allow(''),
};

const contactOrName = (schema) =>
  schema.or('clientName', 'name').or('email', 'phone').messages({
    'object.missing':
      'clientName (or name) is required, and at least one of email or phone is required',
  });

// Contact page — auto-tagged "Open"; product/service name is optional.
export const contactFormIntake = contactOrName(
  Joi.object({
    ...baseFields,
    productOrServiceName: Joi.string().trim().allow(''),
  })
);

// Product / Service pages — productOrServiceName is required so the
// Kanban auto-tag (MOM §4) is always meaningful.
export const productServiceFormIntake = contactOrName(
  Joi.object({
    ...baseFields,
    productOrServiceName: Joi.string().trim().min(1).required().messages({
      'any.required': 'productOrServiceName is required for product/service forms',
      'string.empty': 'productOrServiceName is required for product/service forms',
      'string.min': 'productOrServiceName is required for product/service forms',
    }),
  })
);

// Kept for any callers that still import the generic shape (contact-compatible).
export const formIntake = contactFormIntake;
