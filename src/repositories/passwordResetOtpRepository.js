import PasswordResetOtp from '../models/PasswordResetOtp.js';

const passwordResetOtpRepository = {
  deleteForUser(userId) {
    return PasswordResetOtp.deleteMany({ userId });
  },

  create(data) {
    return PasswordResetOtp.create(data);
  },

  findLatestForUser(userId) {
    return PasswordResetOtp.findOne({ userId }).sort({ createdAt: -1 });
  },

  deleteById(id) {
    return PasswordResetOtp.findByIdAndDelete(id);
  },
};

export default passwordResetOtpRepository;
