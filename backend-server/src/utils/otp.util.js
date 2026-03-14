export const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/** Compare OTP after normalizing to string and trimming (DB may return different types). */
export const verifyOtp = (stored, received) => {
  const a = stored != null ? String(stored).trim() : '';
  const b = received != null ? String(received).trim() : '';
  return a.length > 0 && a === b;
};
