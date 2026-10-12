import Inquiry from '../models/Inquiry.js';

const inquiryRepository = {
  create(data) {
    return Inquiry.create(data);
  },

  findById(id) {
    return Inquiry.findById(id);
  },

  findByIdPopulated(id) {
    return Inquiry.findById(id).populate('assignedTo', 'name username');
  },

  find(filter) {
    return Inquiry.find(filter).sort({ createdAt: -1 }).populate('assignedTo', 'name username');
  },

  updateById(id, updates) {
    return Inquiry.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate(
      'assignedTo',
      'name username'
    );
  },

  deleteById(id) {
    return Inquiry.findByIdAndDelete(id);
  },

  addTag(id, tag) {
    return Inquiry.findByIdAndUpdate(id, { $addToSet: { tags: tag } }, { new: true });
  },

  removeTag(id, tag) {
    return Inquiry.findByIdAndUpdate(id, { $pull: { tags: tag } }, { new: true });
  },
};

export default inquiryRepository;
