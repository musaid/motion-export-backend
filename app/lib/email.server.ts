import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLicenseEmail(
  email: string,
  licenseKey: string,
  recoveryCodes: string[],
) {
  try {
    await resend.emails.send({
      from: 'Motion Export <noreply@motionexport.com>',
      to: email,
      subject: 'Your Motion Export Pro License',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 40px;">
            <img
              src="https://motionexport.com/logo.svg"
              alt="Motion Export"
              width="64"
              height="64"
              style="display: block; margin: 0 auto 20px; filter: brightness(0) saturate(100%) invert(38%) sepia(69%) saturate(1841%) hue-rotate(225deg) brightness(97%) contrast(96%);"
            />
            <h1 style="color: #1f2937; margin-top: 20px; font-size: 28px;">Welcome to Motion Export Pro!</h1>
          </div>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Thank you for your purchase. Your license key is:</p>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <code style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: white; font-family: 'Courier New', monospace;">
              ${licenseKey}
            </code>
          </div>

          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">How to activate:</h2>
            <ol style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              <li>Open the Motion Export plugin in Figma</li>
              <li>Click "Activate License" in the header</li>
              <li>Enter your license key</li>
              <li>Enjoy unlimited exports!</li>
            </ol>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #92400e; font-size: 18px; margin-top: 0;">🔐 Recovery Codes</h3>
            <p style="color: #78350f; line-height: 1.6; margin-bottom: 12px;">
              <strong>Important:</strong> Save these recovery codes in a safe place. You can use them to recover your license key if you lose access to this email.
            </p>
            <div style="background: white; border-radius: 6px; padding: 16px; margin-top: 12px;">
              ${recoveryCodes
                .map(
                  (code) => `
                <code style="display: block; font-family: 'Courier New', monospace; font-size: 14px; color: #1f2937; padding: 8px; margin: 4px 0; background: #f9fafb; border-radius: 4px;">
                  ${code}
                </code>
              `,
                )
                .join('')}
            </div>
            <p style="color: #78350f; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
              Each recovery code can only be used once. Visit <a href="https://motionexport.com/recover" style="color: #f59e0b; text-decoration: none;"><strong>motionexport.com/recover</strong></a> to use them.
            </p>
          </div>

          <div style="border-left: 4px solid #6366f1; padding-left: 20px; margin: 30px 0;">
            <p style="color: #4b5563; line-height: 1.6; margin: 0;">
              <strong>Your Pro license includes:</strong><br>
              ✓ Unlimited exports<br>
              ✓ Unlimited devices (per Figma user)<br>
              ✓ Lifetime updates<br>
              ✓ Priority support
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            If you have any questions, reply to this email or visit our documentation at
            <a href="https://motionexport.com/docs" style="color: #6366f1; text-decoration: none;">motionexport.com/docs</a>
          </p>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #4b5563;">The Motion Export Team</strong>
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
