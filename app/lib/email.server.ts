import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLicenseEmail(email: string, licenseKey: string) {
  try {
    await resend.emails.send({
      from: 'Motion Export <noreply@motionexport.com>',
      to: email,
      subject: 'Your Motion Export Pro License',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Welcome to Motion Export Pro!</h1>

          <p>Thank you for your purchase. Your license key is:</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <code style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">
              ${licenseKey}
            </code>
          </div>

          <h2>How to activate:</h2>
          <ol>
            <li>Open the Motion Export plugin in Figma</li>
            <li>Click "Activate License" in the header</li>
            <li>Enter your license key</li>
            <li>Enjoy unlimited exports!</li>
          </ol>

          <p>Your license works on up to 5 devices and includes all future updates.</p>

          <p>If you have any questions, reply to this email.</p>

          <p>Best regards,<br>The Motion Export Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
