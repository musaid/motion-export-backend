import { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from './+types/recover';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Input } from '~/components/input';
import { Button } from '~/components/button';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Recover License - Motion Export' },
    {
      name: 'description',
      content:
        'Recover your Motion Export Pro license key using your email address.',
    },
  ];
}

export default function Recover() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/recover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Recovery failed',
        });
      }
    } catch {
      setResult({
        success: false,
        error: 'Failed to recover license. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Motion Export</span>
            </Link>
            <div className="flex gap-4 items-center">
              <Link
                to="/docs"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                to="/checkout"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <Heading className="text-4xl font-bold mb-4">
            Recover Your License
          </Heading>
          <Text className="text-lg text-zinc-600 dark:text-zinc-400">
            Enter your email address to receive your license key
          </Text>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 p-8 mb-8">
          {!result?.success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Enter the email address you used when purchasing
                </Text>
              </div>

              {result?.error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <Text className="text-sm text-red-800 dark:text-red-200">
                    {result.error}
                  </Text>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send License Key'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
                <div className="text-4xl mb-2">✓</div>
                <Text className="text-green-800 dark:text-green-200 font-medium">
                  {result.message || 'License key sent successfully!'}
                </Text>
              </div>

              <Text className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Check your email inbox for your license key. Don't forget to
                check your spam folder.
              </Text>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  onClick={() => {
                    setResult(null);
                    setEmail('');
                  }}
                  outline
                  className="w-full"
                >
                  Recover Another License
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              How License Recovery Works
            </h2>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <span className="text-purple-500 font-bold">1.</span>
                <span>
                  Enter the email address you used when purchasing Motion Export
                  Pro
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-500 font-bold">2.</span>
                <span>We'll send your license key to that email address</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-500 font-bold">3.</span>
                <span>Use the license key to activate the plugin in Figma</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6">
            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
              Troubleshooting
            </h2>
            <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
              <div>
                <strong>Email not arriving?</strong>
                <p className="mt-1">
                  Check your spam/junk folder. Emails are sent from
                  noreply@motionexport.com
                </p>
              </div>
              <div>
                <strong>Can't remember which email you used?</strong>
                <p className="mt-1">
                  Try all your email addresses. The system will let you know if
                  no license is found.
                </p>
              </div>
              <div>
                <strong>Still having issues?</strong>
                <p className="mt-1">
                  Contact support at support@motionexport.com with your purchase
                  details and we'll help you out.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
              Need help?{' '}
              <a
                href="mailto:support@motionexport.com"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                Contact Support
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
