import { Link } from 'react-router';
import type { Route } from './+types/cancel';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Payment Cancelled - Motion Export' },
    {
      name: 'description',
      content: 'Your payment was cancelled. You can try again anytime.',
    },
  ];
}

export default function Cancel({}: Route.ComponentProps) {
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
          {/* Cancel Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-orange-400 to-red-600 rounded-full flex items-center justify-center">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Payment Cancelled
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            Your payment was cancelled and you have not been charged.
          </p>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-500/20">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">
              Still interested?
            </h2>
            <p className="text-gray-300 mb-4">
              Motion Export Pro gives you unlimited exports and lifetime updates
              for just $29.
            </p>
            <ul className="space-y-2 text-gray-400 text-left">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span>Unlimited animation exports</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span>All 6 framework exports</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span>Lifetime updates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
            <p className="text-gray-400 mb-2">Questions about pricing?</p>
            <p className="text-gray-300">
              Contact us at{' '}
              <a
                href="mailto:support@motionexport.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                support@motionexport.com
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/checkout"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:scale-105 transition-all"
            >
              Try Again
            </Link>
            <Link
              to="/"
              className="px-8 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            You can still use the free version with 3 exports per day
          </p>
        </div>
      </div>
    </div>
  );
}
