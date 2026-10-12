import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_PERMISSIONS } from '../config/permissions.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'staff' },
    permissions: {
      type: [{ type: String, enum: ALL_PERMISSIONS }],
      default: [],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { passwordHash, ...safe } = ret;
    return safe;
  },
});

export default mongoose.model('User', userSchema);
