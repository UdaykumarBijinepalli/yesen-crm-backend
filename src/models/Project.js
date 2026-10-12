import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    originalName: String,
    storedFilename: String,
    mimeType: String,
    sizeBytes: Number,
  },
  { _id: false }
);

const PROJECT_STATUSES = ['live', 'ongoing', 'completed'];

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    type: { type: String, default: '' },
    deployed: { type: String, default: '' },
    technology: { type: String, default: '' },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: 'ongoing',
    },
    image: imageSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

projectSchema.index({ createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });

export { PROJECT_STATUSES };

export default mongoose.model('Project', projectSchema);
