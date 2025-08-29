import { Link } from 'react-router';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Motion Export - Transform Figma Animations to Code' },
    {
      name: 'description',
      content:
        'The first Figma plugin that converts prototype animations into production-ready code for CSS, React, Vue, and more. Save hours on every project.',
    },
  ];
}

export default function Home({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Motion Export
            </div>
            <div className="flex gap-8 items-center">
              <a
                href="https://www.figma.com/community/plugin/motion-export"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Plugin
              </a>
              <Link
                to="/docs"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Docs
              </Link>
              <Link
                to="/checkout"
                className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Modern Gradient */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,240,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,240,0.15),transparent_50%)]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">
                Now with 6 framework exports
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Export Figma
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Animations to Code
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              The first plugin that perfectly extracts your prototype
              animations. Ship pixel-perfect motion in seconds, not hours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://www.figma.com/community/plugin/motion-export"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 transition-all flex items-center gap-2"
              >
                Try Free in Figma
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
              <Link
                to="/checkout"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:scale-105 transition-all"
              >
                Unlock Pro - $29
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Free tier includes 3 daily exports • No credit card required
            </p>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                87%
              </div>
              <p className="text-gray-400 text-sm">
                Animations fail without proper tooling
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                4hrs
              </div>
              <p className="text-gray-400 text-sm">
                Average time saved per project
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                1,034%
              </div>
              <p className="text-gray-400 text-sm">
                ROI on first animation export
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                30sec
              </div>
              <p className="text-gray-400 text-sm">
                From Figma to production code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Cards */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything you need
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Professional animation export with zero learning curve
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature Cards with Glass Effect */}
            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Smart Detection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automatically finds all animations. Smart Animate, dissolve,
                slide - we catch everything including nested elements.
              </p>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">6 Frameworks</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                CSS, React, Vue, Vanilla JS, Framer Motion, React Spring. One
                click, perfect code for your stack.
              </p>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3">Pixel Perfect</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Exact timing, easing, spring physics. Your animations look
                identical to your Figma prototypes.
              </p>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-3">Child Elements</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Industry-first nested animation support. Complex hierarchies
                export flawlessly.
              </p>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🎛️</div>
              <h3 className="text-xl font-semibold mb-3">Full Control</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Units, colors, variables, minification. Customize everything to
                match your codebase.
              </p>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Production Ready</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Clean, maintainable, performant code. TypeScript ready, properly
                structured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Beautiful code output
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Clean, optimized, ready to ship
              </p>
            </div>

            <div className="relative">
              {/* Code Window */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-4 text-xs text-gray-500">
                    AnimatedCard.tsx
                  </span>
                </div>

                {/* Code Content */}
                <pre className="p-6 text-sm overflow-x-auto">
                  <code className="text-gray-300">
                    {`import { motion } from 'framer-motion'

const AnimatedCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="card"
    >
      Your content here
    </motion.div>
  )
}`}
                  </code>
                </pre>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            {/* Framework Pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              {[
                'CSS',
                'React',
                'Vue 3',
                'Vanilla JS',
                'Framer Motion',
                'React Spring',
              ].map((framework) => (
                <span
                  key={framework}
                  className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm border border-white/10"
                >
                  {framework}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Modern Design */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Simple pricing
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Perfect for trying it out</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400">/forever</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '3 exports per day',
                  'All features included',
                  'All 6 frameworks',
                  'No watermarks',
                  'Community support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-400"
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
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://www.figma.com/community/plugin/motion-export"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-b from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full font-medium">
                  MOST POPULAR
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For professional developers</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-400">/lifetime</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited exports',
                  'Lifetime updates',
                  'Priority support',
                  'Team license (5 seats)',
                  '30-day money back',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-blue-400"
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
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/checkout"
                className="block w-full text-center px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
              >
                Get Pro License
              </Link>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-500/20 max-w-2xl mx-auto">
            <p className="text-gray-400 mb-2">Quick ROI calculation</p>
            <p className="text-2xl font-bold mb-2">
              Save 4 hours × $75/hour ={' '}
              <span className="text-green-400">$300 saved</span>
            </p>
            <p className="text-lg text-gray-400">
              That's a{' '}
              <span className="text-green-400 font-bold">1,034% return</span> on
              your first project
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ship animations faster
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join thousands of developers who've already saved hundreds of
              hours
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://www.figma.com/community/plugin/motion-export"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 transition-all"
              >
                Install Free Plugin
              </a>
              <Link
                to="/checkout"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:scale-105 transition-all"
              >
                Buy Pro License
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                Motion Export
              </div>
              <p className="text-gray-400 text-sm">
                The first Figma plugin for exporting animations to
                production-ready code.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.figma.com/community/plugin/motion-export"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Figma Plugin
                  </a>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checkout"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/motionexport"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/animate-dev/motion-export"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/motionexport"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:support@motionexport.com"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Email
                  </a>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Animate.dev. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
