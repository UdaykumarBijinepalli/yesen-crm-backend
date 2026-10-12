import Joi from 'joi';
import { PIPELINE_STAGES, INQUIRY_SOURCES } from '../config/pipeline.js';

const objectId = Joi.string().hex().length(24);

export const listQuery = Joi.object({
  board: Joi.string().valid('true', 'false', '1', '0'),
  tag: Joi.string().trim(),
  source: Joi.string().valid(...INQUIRY_SOURCES),
  q: Joi.string().trim().max(200),
  // ObjectId for a user, or "unassigned" for cards with no owner
  assignedTo: Joi.alternatives().try(objectId, Joi.string().valid('unassigned')),
});

export const idParam = Joi.object({
  id: objectId.required(),
});

export const updateInquiry = Joi.object({
  clientName: Joi.string().trim().min(1),
  email: Joi.string().trim().email().allow(''),
  phone: Joi.string().trim().allow(''),
  company: Joi.string().trim().allow(''),
  message: Joi.string().trim().allow(''),
  value: Joi.number().min(0).allow(null),
  assignedTo: objectId.allow(null),
  vesselType: Joi.string().valid('Ferry', 'Tour boat', 'House boat', 'Trawler', 'Yatch', 'Workboat', 'Patrol boat', 'other').allow('', null),
  retrofitStatus: Joi.string().valid('retrofit existing', 'new build', 'not decided yet').allow('', null),
  vesselLength: Joi.string().trim().allow('', null),
  operatingArea: Joi.string().trim().allow('', null),
  dailyOperatingHours: Joi.string().trim().allow('', null),
  timeLine: Joi.string().trim().allow('', null),
}).min(1);

export const moveStage = Joi.object({
  stage: Joi.string()
    .valid(...PIPELINE_STAGES)
    .required(),
  lostReason: Joi.string().trim().allow(''),
});

export const tagBody = Joi.object({
  tag: Joi.string().trim().min(1).required(),
});

export const tagParam = Joi.object({
  id: objectId.required(),
  tag: Joi.string().trim().min(1).required(),
});

export const quotationStatus = Joi.object({
  sent: Joi.boolean().required(),
});
