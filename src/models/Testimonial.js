import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    testimonial: { type: String, default: '' },
    designation: { type: String, default: '' },
    location: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

testimonialSchema.index({ createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);
