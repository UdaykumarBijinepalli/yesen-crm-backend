import InteractionLog from '../models/InteractionLog.js';

const interactionLogRepository = {
  create(data) {
    return InteractionLog.create(data);
  },

  findByInquiry(inquiryId) {
    return InteractionLog.find({ inquiry: inquiryId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name username');
  },

  deleteByInquiry(inquiryId) {
    return InteractionLog.deleteMany({ inquiry: inquiryId });
  },
};

export default interactionLogRepository;
