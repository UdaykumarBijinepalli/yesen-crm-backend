import Testimonial from '../models/Testimonial.js';

const testimonialRepository = {
  create(data) {
    return Testimonial.create(data);
  },

  findById(id) {
    return Testimonial.findById(id).populate('createdBy', 'name username');
  },

  findPaginated({ skip, limit }) {
    return Testimonial.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name username');
  },

  countAll() {
    return Testimonial.countDocuments();
  },

  updateById(id, updates) {
    return Testimonial.findByIdAndUpdate(id, updates, { new: true }).populate(
      'createdBy',
      'name username'
    );
  },

  deleteById(id) {
    return Testimonial.findByIdAndDelete(id);
  },
};

export default testimonialRepository;
