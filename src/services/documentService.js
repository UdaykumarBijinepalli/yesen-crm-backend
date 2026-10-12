import fs from 'fs';
import path from 'path';
import config from '../config/env.js';
import logger from '../config/logger.js';
import documentRepository from '../repositories/documentRepository.js';
import interactionLogRepository from '../repositories/interactionLogRepository.js';
import inquiryRepository from '../repositories/inquiryRepository.js';
import ApiError from '../utils/ApiError.js';

const uploadDir = path.resolve(process.cwd(), config.uploadDir);

async function uploadDocument(inquiryId, file, type, actingUserId) {
  const inquiry = await inquiryRepository.findById(inquiryId);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  if (!file) throw ApiError.badRequest('file is required (multipart field name: file)');

  const doc = await documentRepository.create({
    inquiry: inquiry._id,
    type: ['invoice', 'quotation'].includes(type) ? type : 'other',
    originalName: file.originalname,
    storedFilename: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    uploadedBy: actingUserId || null,
  });

  await interactionLogRepository.create({
    inquiry: inquiry._id,
    type: 'system',
    message: `Document uploaded: ${file.originalname}`,
    createdBy: actingUserId || null,
  });

  return doc;
}

function listDocuments(inquiryId) {
  return documentRepository.findByInquiry(inquiryId);
}

async function getDocumentFilePath(docId) {
  const doc = await documentRepository.findById(docId);
  if (!doc) throw ApiError.notFound('Document not found');

  const filePath = path.join(uploadDir, doc.storedFilename);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(410, 'File is missing from storage');
  }
  return { doc, filePath };
}

async function deleteDocument(docId) {
  const doc = await documentRepository.deleteById(docId);
  if (!doc) throw ApiError.notFound('Document not found');

  const filePath = path.join(uploadDir, doc.storedFilename);
  fs.promises.unlink(filePath).catch((err) => {
    logger.warn({ err, filePath }, 'Failed to remove document file from disk during delete');
  });
}

export default { uploadDocument, listDocuments, getDocumentFilePath, deleteDocument };
