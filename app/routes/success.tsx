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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.svg"
                alt="Motion Export"
                className="w-8 h-8 transition-transform group-hover:scale-110"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(59%) sepia(94%) saturate(1165%) hue-rotate(201deg) brightness(101%) contrast(96%)',
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Motion Export
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            Thank you for purchasing Motion Export Pro
          </p>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-500/20">
            <h2 className="text-lg font-semibold text-green-400 mb-3">
              What happens next?
            </h2>
            <ul className="space-y-3 text-gray-300 text-left">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  You'll receive your license key via email within a few minutes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  The email includes instructions on how to activate your
                  license
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  Your license works on up to 5 devices with lifetime updates
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>Unlimited exports are now unlocked for your account</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
            <p className="text-gray-400 mb-2">Didn't receive your email?</p>
            <p className="text-gray-300">
              Check your spam folder or contact{' '}
              <a
                href="mailto:support@motionexport.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                support@motionexport.com
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.figma.com/community/plugin/1543550763369836937"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
            >
              Open in Figma
            </a>
            <Link
              to="/docs"
              className="px-8 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
