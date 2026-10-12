import Joi from 'joi';

export const addLog = Joi.object({
  type: Joi.string().valid('note', 'call', 'email', 'whatsapp', 'meeting'),
  message: Joi.string().trim().min(1).required(),
});
