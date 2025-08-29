import type { Route } from './+types/privacy';
import { Link } from 'react-router';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';

export default function PrivacyPolicy({}: Route.ComponentProps) {
  return (
    <div className="relative isolate flex min-h-svh w-full flex-col bg-white dark:bg-zinc-900">
      <main className="flex flex-1 flex-col">
        <div className="grow p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <Link
              to="/"
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← Back to Home
            </Link>
            <Heading className="text-4xl font-semibold text-center mb-6 mt-8">
              Privacy Policy
            </Heading>
            <Text className="text-center mb-12 max-w-2xl mx-auto">
              This Privacy Policy explains how Motion Export (referred to as
              "Motion Export") collects, uses, and protects your information.
              The column on the right provides a simplified explanation of each
              section and is not legally binding.
            </Text>

            {/* Introduction */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  1. INTRODUCTION
                </Heading>
                <Text className="text-sm">
                  This Privacy Policy explains how Motion Export ("Motion
                  Export," "we," "us," or "our") collects, uses, and protects
                  your personal information. We are committed to protecting your
                  privacy and ensuring the security of your personal data when
                  you purchase and use our Figma-to-code export service.
                </Text>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We care about your privacy and will explain how we handle your
                  information when you use our Figma export tool.
                </Text>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  2. INFORMATION WE COLLECT
                </Heading>
                <div className="text-sm">
                  <Heading level={3} className="text-md mb-2">
                    2.1 Personal Information
                  </Heading>
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Email address</li>
                    <li>Payment information (processed by Stripe)</li>
                    <li>License key</li>
                    <li>Device ID for activation</li>
                  </ul>
                  <Heading level={3} className="text-md mb-2">
                    2.2 Automatically Collected Information
                  </Heading>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Operating system</li>
                    <li>Usage statistics</li>
                    <li>Export counts</li>
                    <li>Error logs</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We collect your email, payment info (via Stripe), and basic
                  usage data to provide our service. We never access your Figma
                  designs.
                </Text>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  3. HOW WE USE YOUR INFORMATION
                </Heading>
                <div className="text-sm">
                  <Text className="mb-2">We use your information to:</Text>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Process your license purchase</li>
                    <li>Validate your license key</li>
                    <li>Send purchase confirmations and license keys</li>
                    <li>Provide customer support</li>
                    <li>Prevent fraud and abuse</li>
                    <li>Improve our service</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We use your information to deliver our service, provide
                  support, and keep things secure. We don't sell your data.
                </Text>
              </div>
            </div>

            {/* Data Storage and Security */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  4. DATA STORAGE AND SECURITY
                </Heading>
                <div className="text-sm">
                  <Heading level={3} className="text-md mb-2">
                    4.1 Storage Location
                  </Heading>
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Data is stored securely in the cloud</li>
                    <li>Payment processing handled by Stripe</li>
                    <li>Encrypted database storage</li>
                  </ul>
                  <Heading level={3} className="text-md mb-2">
                    4.2 Security Measures
                  </Heading>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Encryption of sensitive data</li>
                    <li>Hashed license keys using bcrypt</li>
                    <li>Regular security updates</li>
                    <li>Secure HTTPS connections</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Your data is encrypted and stored securely. Payment info goes
                  directly to Stripe, never touching our servers.
                </Text>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  5. DATA SHARING
                </Heading>
                <div className="text-sm">
                  <Text className="mb-2">
                    We may share your information with:
                  </Text>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Stripe (for payment processing)</li>
                    <li>Email service providers (for transactional emails)</li>
                    <li>Analytics services (anonymized data only)</li>
                    <li>Law enforcement (when required by law)</li>
                  </ul>
                  <Text className="mt-2 font-semibold">
                    We NEVER sell your personal information.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We only share your info with services needed to run our
                  business (like Stripe). We never sell your data.
                </Text>
              </div>
            </div>

            {/* Your Rights */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  6. YOUR RIGHTS
                </Heading>
                <div className="text-sm">
                  <Text className="mb-2">You have the right to:</Text>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Export your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Revoke your license</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  You're in control of your data. You can access it, change it,
                  delete it, or take it with you. Just let us know what you
                  need.
                </Text>
              </div>
            </div>

            {/* Cookies and Tracking */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  7. COOKIES AND TRACKING
                </Heading>
                <div className="text-sm">
                  <Text className="mb-2">
                    We use cookies and similar technologies to:
                  </Text>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Remember your preferences</li>
                    <li>Authenticate your session</li>
                    <li>Analyze site usage</li>
                    <li>Improve user experience</li>
                  </ul>
                  <Text className="mt-2">
                    We do not use third-party advertising cookies.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We use cookies to keep you logged in and make the site work
                  better. No creepy ad tracking.
                </Text>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  8. CHILDREN'S PRIVACY
                </Heading>
                <div className="text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Motion Export is not intended for children under 18</li>
                    <li>We do not knowingly collect data from minors</li>
                    <li>Parents should monitor children's online activities</li>
                    <li>Contact us if you believe we have data from a minor</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Motion Export is for adults only. We don't collect information
                  from children under 18.
                </Text>
              </div>
            </div>

            {/* Updates to Privacy Policy */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  9. CHANGES TO PRIVACY POLICY
                </Heading>
                <div className="text-sm">
                  <Text>
                    We may update this Privacy Policy periodically. We will
                    notify you of significant changes through:
                  </Text>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Email notifications</li>
                    <li>Website announcements</li>
                  </ul>
                  <Text className="mt-2">
                    Continued use of Motion Export after changes constitutes
                    acceptance of the updated Privacy Policy.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  If we make important changes to this policy, we'll let you
                  know. By continuing to use Motion Export, you agree to any
                  updates.
                </Text>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  10. CONTACT INFORMATION
                </Heading>
                <div className="text-sm">
                  <Text>For privacy-related inquiries:</Text>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Email: support@motionexport.com</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Have questions about your privacy? We're here to help. Just
                  reach out to us.
                </Text>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
              <Text className="text-sm text-center">
                Last Updated: January 1, 2025
              </Text>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
