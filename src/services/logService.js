import interactionLogRepository from '../repositories/interactionLogRepository.js';
import inquiryRepository from '../repositories/inquiryRepository.js';
import ApiError from '../utils/ApiError.js';

async function addLog(inquiryId, type, message, actingUserId) {
  const inquiry = await inquiryRepository.findById(inquiryId);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');

  return interactionLogRepository.create({
    inquiry: inquiry._id,
    type: type || 'note',
    message: message.trim(),
    createdBy: actingUserId || null,
  });
}

function listLogs(inquiryId) {
  return interactionLogRepository.findByInquiry(inquiryId);
}

export default { addLog, listLogs };
