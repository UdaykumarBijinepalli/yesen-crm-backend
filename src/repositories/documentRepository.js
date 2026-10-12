import Document from '../models/Document.js';

const documentRepository = {
  create(data) {
    return Document.create(data);
  },

  findById(id) {
    return Document.findById(id);
  },

  findByInquiry(inquiryId) {
    return Document.find({ inquiry: inquiryId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name username');
  },

  deleteById(id) {
    return Document.findByIdAndDelete(id);
  },

  deleteByInquiry(inquiryId) {
    return Document.deleteMany({ inquiry: inquiryId });
  },
};

export default documentRepository;
