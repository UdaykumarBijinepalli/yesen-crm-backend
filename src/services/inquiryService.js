import fs from 'fs';
import path from 'path';
import config from '../config/env.js';
import logger from '../config/logger.js';
import inquiryRepository from '../repositories/inquiryRepository.js';
import interactionLogRepository from '../repositories/interactionLogRepository.js';
import documentRepository from '../repositories/documentRepository.js';
import ApiError from '../utils/ApiError.js';
import { PIPELINE_STAGES } from '../config/pipeline.js';

const uploadDir = path.resolve(process.cwd(), config.uploadDir);

function buildFilter({ tag, source, q, assignedTo }) {
  const filter = {};
  if (tag) filter.tags = tag;
  if (source) filter.source = source;
  if (assignedTo === 'unassigned') {
    filter.assignedTo = null;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }
  if (q) {
    const re = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { clientName: re },
      { email: re },
      { phone: re },
      { company: re },
      { productOrServiceName: re },
      { tags: re },
    ];
  }
  return filter;
}

async function getBoard(filters) {
  const inquiries = await inquiryRepository.find(buildFilter(filters));

  return PIPELINE_STAGES.map((stage) => ({
    stage,
    cards: inquiries.filter((i) => i.stage === stage),
  }));
}

async function listInquiries(filters) {
  return inquiryRepository.find(buildFilter(filters));
}

async function getInquiryDetail(id) {
  const inquiry = await inquiryRepository.findByIdPopulated(id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');

  const [logs, documents] = await Promise.all([
    interactionLogRepository.findByInquiry(inquiry._id),
    documentRepository.findByInquiry(inquiry._id),
  ]);

  return { inquiry, logs, documents };
}

async function updateInquiry(id, updates) {
  const inquiry = await inquiryRepository.updateById(id, updates);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  return inquiry;
}

async function moveStage(id, stage, lostReason, actingUserId) {
  if (!PIPELINE_STAGES.includes(stage)) {
    throw ApiError.badRequest(
      `stage must be one of: ${PIPELINE_STAGES.join(', ')}`
    );
  }

  const inquiry = await inquiryRepository.findById(id);

  if (!inquiry) {
    throw ApiError.notFound('Inquiry not found');
  }

  const fromStage = inquiry.stage;

  inquiry.stage = stage;

  if (stage === 'Lost' && lostReason) {
    inquiry.lost.reason = lostReason;
  }

  await inquiry.save();

  await interactionLogRepository.create({
    inquiry: inquiry._id,
    type: 'stage_change',
    message: `Stage changed from "${fromStage}" to "${stage}".`,
    createdBy: actingUserId || null,
    meta: {
      from: fromStage,
      to: stage,
    },
  });

  return inquiry;
}
async function addTag(id, tag) {
  const inquiry = await inquiryRepository.addTag(id, tag.trim());
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  return inquiry;
}

async function removeTag(id, tag) {
  const inquiry = await inquiryRepository.removeTag(id, tag);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  return inquiry;
}

async function setQuotationStatus(id, sent, actingUserId) {
  const inquiry = await inquiryRepository.findById(id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');

  inquiry.quotation.sent = sent;
  inquiry.quotation.sentAt = sent ? new Date() : null;
  inquiry.quotation.sentBy = sent ? actingUserId || null : null;
  await inquiry.save();

  await interactionLogRepository.create({
    inquiry: inquiry._id,
    type: 'system',
    message: sent ? 'Quotation marked as sent.' : 'Quotation marked as not sent.',
    createdBy: actingUserId || null,
  });

  return inquiry;
}

async function deleteInquiry(id) {
  const inquiry = await inquiryRepository.deleteById(id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');

  // Remove upload files from disk before wiping Document rows, otherwise
  // orphaned invoice/quotation files accumulate under UPLOAD_DIR.
  const docs = await documentRepository.findByInquiry(inquiry._id);
  await Promise.all(
    docs.map((doc) => {
      const filePath = path.join(uploadDir, doc.storedFilename);
      return fs.promises.unlink(filePath).catch((err) => {
        logger.warn({ err, filePath }, 'Failed to remove document file while deleting inquiry');
      });
    })
  );

  await Promise.all([
    interactionLogRepository.deleteByInquiry(inquiry._id),
    documentRepository.deleteByInquiry(inquiry._id),
  ]);
}

export default {
  getBoard,
  listInquiries,
  getInquiryDetail,
  updateInquiry,
  moveStage,
  addTag,
  removeTag,
  setQuotationStatus,
  deleteInquiry,
};
