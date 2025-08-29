import type { Route } from './+types/terms';
import { Link } from 'react-router';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';

export default function TermsOfService({}: Route.ComponentProps) {
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
              Terms of Service
            </Heading>
            <Text className="text-center mb-12 max-w-2xl mx-auto">
              The following document outlines the terms of use of Motion Export
              (referred to as "Motion Export"). Before using our Figma-to-code
              export service, you are required to read, understand, and agree to
              these terms.
            </Text>

            {/* Introduction */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  1. INTRODUCTION
                </Heading>
                <Text className="text-sm">
                  Welcome to Motion Export. We provide a premium Figma-to-code
                  export service that converts your designs into
                  production-ready code. By purchasing and using our service,
                  you agree to these Terms of Service ("Terms").
                </Text>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We help you export Figma designs to code. By using Motion
                  Export, you agree to follow our rules.
                </Text>
              </div>
            </div>

            {/* Service Usage */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  2. SERVICE USAGE
                </Heading>
                <div className="text-sm">
                  <Heading level={3} className="text-md mb-2">
                    2.1 License Grant
                  </Heading>
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>One license per individual user</li>
                    <li>Non-transferable and non-sublicensable</li>
                    <li>Lifetime access to current version</li>
                    <li>Includes minor updates and bug fixes</li>
                  </ul>
                  <Heading level={3} className="text-md mb-2">
                    2.2 Permitted Use
                  </Heading>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Commercial and personal projects</li>
                    <li>Unlimited exports</li>
                    <li>Modify exported code as needed</li>
                    <li>Use on multiple devices (same user)</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  One license = one person. Use it for any project, export as
                  much as you want, but don't share your license.
                </Text>
              </div>
            </div>

            {/* Pricing and Refunds */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  3. PRICING AND REFUNDS
                </Heading>
                <div className="text-sm">
                  <Heading level={3} className="text-md mb-2">
                    3.1 Pricing
                  </Heading>
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>One-time payment of $29 USD</li>
                    <li>Lifetime access to current version</li>
                    <li>All payments processed through Stripe</li>
                    <li>Prices subject to change for new purchases</li>
                  </ul>
                  <Heading level={3} className="text-md mb-2">
                    3.2 Refund Policy
                  </Heading>
                  <ul className="list-disc list-inside space-y-1">
                    <li>30-day money-back guarantee</li>
                    <li>Full refund within 30 days of purchase</li>
                    <li>No questions asked</li>
                    <li>After 30 days, all sales are final</li>
                    <li>Refunds processed within 5-10 business days</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  $29 one-time payment. Not happy? Get a full refund within 30
                  days. After that, all sales are final.
                </Text>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  4. PROHIBITED ACTIVITIES
                </Heading>
                <div className="text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sharing or selling your license key</li>
                    <li>Using the service for illegal purposes</li>
                    <li>Reverse engineering the plugin</li>
                    <li>Creating competing products</li>
                    <li>Circumventing license validation</li>
                    <li>Using one license for multiple users</li>
                    <li>Abusing the refund policy</li>
                    <li>Automated or bot usage</li>
                  </ul>
                  <Text className="mt-2 font-semibold">
                    Violations result in immediate termination without refund.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Don't share your license, don't hack our service, don't do
                  illegal stuff. Break the rules = lose your license.
                </Text>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  5. INTELLECTUAL PROPERTY
                </Heading>
                <div className="text-sm">
                  <Heading level={3} className="text-md mb-2">
                    5.1 Our Property
                  </Heading>
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Motion Export plugin and technology</li>
                    <li>Conversion algorithms</li>
                    <li>Documentation and branding</li>
                  </ul>
                  <Heading level={3} className="text-md mb-2">
                    5.2 Your Property
                  </Heading>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your Figma designs</li>
                    <li>All exported code (you own it fully)</li>
                    <li>Modifications to exported code</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We own the plugin. You own your designs and all code we export
                  for you.
                </Text>
              </div>
            </div>

            {/* Liability and Disclaimer */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  6. LIABILITY AND DISCLAIMER
                </Heading>
                <div className="text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Service provided "as is" without warranties</li>
                    <li>
                      Not responsible for design quality or code output issues
                    </li>
                    <li>Total liability limited to amount paid ($29)</li>
                    <li>No liability for indirect or consequential damages</li>
                    <li>You indemnify us from claims arising from your use</li>
                    <li>We may experience service interruptions</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  We'll do our best to provide reliable service, but can't
                  guarantee perfection. Our liability is limited to what you
                  paid.
                </Text>
              </div>
            </div>

            {/* Support */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  7. SUPPORT
                </Heading>
                <div className="text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Email support included with purchase</li>
                    <li>Response within 48 hours (business days)</li>
                    <li>Bug fixes and updates included</li>
                    <li>Documentation and tutorials available</li>
                    <li>Support in English only</li>
                    <li>No phone support</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Email us if you need help. We'll respond within 2 business
                  days.
                </Text>
              </div>
            </div>

            {/* Termination */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  8. TERMINATION
                </Heading>
                <div className="text-sm">
                  <Text className="mb-2">
                    We may terminate your license if you:
                  </Text>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Violate these terms</li>
                    <li>Engage in fraudulent activity</li>
                    <li>Share or sell your license</li>
                    <li>Abuse the refund policy</li>
                  </ul>
                  <Text className="mt-2">
                    Termination results in immediate license revocation without
                    refund.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Break the rules = lose access. No refund for rule breakers.
                </Text>
              </div>
            </div>

            {/* Governing Law */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  9. GOVERNING LAW
                </Heading>
                <div className="text-sm">
                  <Text>
                    These Terms are governed by the laws of the United States.
                    Any disputes shall be resolved through binding arbitration,
                    not in court. By using our service, you waive your right to
                    a jury trial or class action lawsuit.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  US law applies. Disputes go to arbitration, not court.
                </Text>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  10. CHANGES TO TERMS
                </Heading>
                <div className="text-sm">
                  <Text>
                    We may update these terms at any time. We'll notify you of
                    significant changes via email. Your continued use after
                    changes constitutes acceptance of updated terms.
                  </Text>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">
                  Terms might change. We'll email you about big changes.
                </Text>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Heading level={2} className="mb-4">
                  11. CONTACT INFORMATION
                </Heading>
                <div className="text-sm">
                  <Text>For support and inquiries:</Text>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Email: support@motionexport.com</li>
                  </ul>
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-4">
                  BASICALLY,
                </Heading>
                <Text className="text-sm">Need help? Email us.</Text>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
              <Text className="text-sm text-center">
                Last Updated: January 1, 2025
              </Text>
              <Text className="text-xs text-center mt-4 text-zinc-500 dark:text-zinc-400">
                By purchasing Motion Export, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </Text>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
