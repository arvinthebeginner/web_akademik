import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter (configure via environment variables)
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

/**
 * Send an email notification.
 * Returns true if sent successfully, false otherwise (e.g. SMTP not configured).
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();

    // Skip if SMTP is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email skipped: SMTP credentials not configured');
      return false;
    }

    await transporter.sendMail({
      from: `"School.id" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send new message notification email
 */
export async function sendMessageNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="background: #e8def8; padding: 20px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; color: #1d1b20;">School.id - Pesan Baru</h2>
      </div>
      <div style="padding: 24px; background: #fef7ff; border: 1px solid #e8def8; border-top: 0; border-radius: 0 0 12px 12px;">
        <p style="color: #1d1b20;">Halo <strong>${recipientName}</strong>,</p>
        <p style="color: #49454f;">Anda menerima pesan baru dari <strong>${senderName}</strong>:</p>
        <div style="background: #f3edf7; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #1d1b20; margin: 0;">${messagePreview}</p>
        </div>
        <p style="color: #49454f; font-size: 13px;">Silakan buka aplikasi School.id untuk membalas pesan ini.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Pesan baru dari ${senderName} - School.id`,
    html,
  });
}
