import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, index: true },
    type: { type: String, enum: ['invoice', 'quotation', 'other'], default: 'other' },
    originalName: { type: String, required: true },
    storedFilename: { type: String, required: true },
    mimeType: { type: String },
    sizeBytes: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
