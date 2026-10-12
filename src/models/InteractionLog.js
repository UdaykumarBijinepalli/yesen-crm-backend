import mongoose from 'mongoose';

const interactionLogSchema = new mongoose.Schema(
  {
    inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, index: true },
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'whatsapp', 'meeting', 'stage_change', 'system'],
      default: 'note',
    },
    message: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { from: 'Inquired', to: 'Contacted' }
  },
  { timestamps: true }
);

export default mongoose.model('InteractionLog', interactionLogSchema);
