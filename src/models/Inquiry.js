import mongoose from 'mongoose';
import { PIPELINE_STAGES, INQUIRY_SOURCES } from '../config/pipeline.js';

const inquirySchema = new mongoose.Schema(
  {
    // Client info*
    clientName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    message: { type: String, trim: true },

 
    vesselType: {
      type: String,
      enum: ["Ferry", "Tour boat", "House boat", "Trawler", "Yatch", "Workboat", "Patrol boat", "other"]
    },
    retrofitStatus: {type:String,enum:["retrofit existing","new build","not decided yet"]},
    vesselLength: {type:String},
    operatingArea: {type:String},
    dailyOperatingHours: {type:String},
   
    timeLine: {type:String},
    

    // Where it came from
    source: { type: String, enum: INQUIRY_SOURCES, required: true },
    sourcePage: { type: String, trim: true }, // e.g. exact page URL/slug it was submitted from
    productOrServiceName: { type: String, trim: true }, // what they asked about, if applicable

    // Kanban stage - hard-coded pipeline, no custom stages
    stage: { type: String, enum: PIPELINE_STAGES, default: 'Inquired' },

    // Estimated deal value in the account's base currency. Optional -
    // often unknown at initial inquiry, filled in by staff once a
    // quotation is prepared.
    value: { type: Number, default: null, min: 0 },

    // Tags: auto-tagged on creation (product/service name, or "Open" for
    // general contact-page leads), administrators can add more manually.
    tags: [{ type: String, trim: true }],

    // Quotation tracking (lightweight — full invoice/quote generation is
    // out of scope for now per MOM)
    quotation: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lost: {
      reason: { type: String, trim: true, default: null },
    },
  },
  { timestamps: true }
);

inquirySchema.index({ stage: 1, createdAt: -1 });
inquirySchema.index({ tags: 1 });
inquirySchema.index({ source: 1 });

export default mongoose.model('Inquiry', inquirySchema);
