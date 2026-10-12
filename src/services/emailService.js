import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../config/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.smtp.host) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user
      ? {
          user: config.smtp.user,
          pass: config.smtp.pass,
        }
      : undefined,
  });

  return transporter;
}

export async function sendOtpEmail({ to, name, otp }) {
  const expiryMinutes = config.passwordReset.otpExpiryMinutes;
  const displayName = name || 'there';

  const subject = 'Yesen CRM — your password reset code';
  const text = `Hello ${displayName},

Your Yesen CRM password reset code is: ${otp}

This code expires in ${expiryMinutes} minutes.

If you did not request this, you can ignore this email.

— Yesen Technologies`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#1e40af 55%,#0c4a6e 100%);padding:28px 32px;">
              <p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                Yesen CRM
              </p>
              <p style="margin:6px 0 0;font-family:Inter,Arial,sans-serif;font-size:13px;color:rgba(219,234,254,0.9);">
                Password reset verification
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-family:Inter,Arial,sans-serif;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">
                Hello ${displayName},
              </p>
              <p style="margin:0 0 24px;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#475569;">
                Use the one-time code below to reset your Yesen CRM password. Enter it on the verification screen to continue.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #dbeafe;border-radius:16px;">
                <tr>
                  <td style="padding:28px 20px;text-align:center;">
                    <p style="margin:0 0 10px;font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
                      Verification code
                    </p>
                    <p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:36px;font-weight:700;letter-spacing:0.28em;color:#1d4ed8;">
                      ${otp}
                    </p>
                    <p style="margin:14px 0 0;font-family:Inter,Arial,sans-serif;font-size:13px;color:#64748b;">
                      Expires in <strong style="color:#1d4ed8;">${expiryMinutes} minutes</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.6;color:#94a3b8;">
                If you did not request a password reset, you can safely ignore this email. Your account will remain secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:12px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} Yesen Technologies · Secure internal access
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const mailOptions = {
    from: config.smtp.from,
    to,
    subject,
    text,
    html,
  };

  const transport = getTransporter();

  if (!transport) {
    logger.info({ to, otp }, '[email] SMTP not configured — OTP logged for development');
    return { devMode: true };
  }

  await transport.sendMail(mailOptions);
  return { devMode: false };
}
