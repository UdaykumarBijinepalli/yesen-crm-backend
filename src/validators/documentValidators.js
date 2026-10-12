import Joi from 'joi';

export const uploadDocument = Joi.object({
  type: Joi.string().valid('invoice', 'quotation', 'other'),
});
