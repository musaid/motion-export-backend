import { Link } from 'react-router';
import type { Route } from './+types/success';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Payment Successful - Motion Export' },
    {
      name: 'description',
      content: 'Your Motion Export Pro license has been activated!',
    },
  ];
}

export default function Success({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-center items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Motion Export</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Success Card */}
          <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            {/* Success Icon */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-plum rounded-full border-2 border-black dark:border-white mb-6">
                <svg
                  className="w-12 h-12 text-white dark:text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>

              <p className="text-xl font-medium opacity-60">
                Thank you for purchasing Motion Export Pro
              </p>
            </div>

            <div className="bg-plum/10 dark:bg-plum/20 rounded-2xl p-8 mb-8 border-2 border-plum">
              <h2 className="text-2xl font-black text-plum mb-6">
                What happens next?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="text-plum font-black text-2xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="font-medium text-lg">
                    You'll receive your license key via email within a few
                    minutes
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-plum font-black text-2xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="font-medium text-lg">
                    The email includes instructions on how to activate your
                    license
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-plum font-black text-2xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="font-medium text-lg">
                    Your license works on up to 5 devices with lifetime updates
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-plum font-black text-2xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="font-medium text-lg">
                    Unlimited exports are now unlocked for your account
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-black rounded-2xl p-8 mb-8 border-2 border-black dark:border-white">
              <p className="font-bold mb-2 text-center">
                Didn't receive your email?
              </p>
              <p className="font-medium text-center opacity-70">
                Check your spam folder or contact{' '}
                <a
                  href="mailto:support@motionexport.com"
                  className="text-plum underline hover:no-underline font-bold"
                >
                  support@motionexport.com
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-8 py-3.5 bg-plum hover:bg-plum-dark text-white dark:text-black rounded-xl font-semibold transition-colors"
              >
                Open in Figma →
              </a>
              <Link
                to="/docs"
                className="flex-1 text-center px-8 py-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold transition-all hover:translate-y-[-2px]"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
