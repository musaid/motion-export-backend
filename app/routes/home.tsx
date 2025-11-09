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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation */}
      <nav className="">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Motion Export</span>
            </Link>
            <div className="flex gap-6 items-center">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium hover:text-plum transition-colors"
              >
                Plugin
              </a>
              <Link
                to="/docs"
                className="text-base font-medium hover:text-plum transition-colors"
              >
                Docs
              </Link>
              <a
                href="/checkout"
                className="px-8 py-3 bg-plum hover:bg-plum-dark text-white dark:text-black font-bold rounded-full border-2 border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Get Pro
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-plum/10 dark:bg-plum/20 rounded-full mb-8">
              <span className="w-2 h-2 bg-plum rounded-full animate-pulse" />
              <span className="font-semibold text-sm">
                Now with 6 framework exports
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              Export Figma
              <br />
              <span className="text-plum">Animations to Code</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The first plugin that perfectly extracts your prototype
              animations. Ship pixel-perfect motion in seconds, not hours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold transition-all hover:translate-y-[-2px]"
              >
                Try Free in Figma →
              </a>
              <a
                href="/checkout"
                className="px-8 py-3 bg-plum hover:bg-plum-dark text-white dark:text-black font-bold rounded-full border-2 border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Unlock Pro - $9.99
              </a>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500">
              Free tier includes 5 lifetime exports • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-plum mb-2">
                87%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Animations fail without proper tooling
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-plum mb-2">
                4hrs
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average time saved per project
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-plum mb-2">
                1,034%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ROI on first animation export
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-plum mb-2">
                30sec
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                From Figma to production code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Professional animation export with zero learning curve
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">⚡</div>
              <h3 className="text-xl font-bold mb-3">Smart Detection</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Automatically finds all animations. Smart Animate, dissolve,
                slide - we catch everything including nested elements.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🎯</div>
              <h3 className="text-xl font-bold mb-3">6 Frameworks</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                CSS, React, Vue, Vanilla JS, Framer Motion, React Spring. One
                click, perfect code for your stack.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">✨</div>
              <h3 className="text-xl font-bold mb-3">Pixel Perfect</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Exact timing, easing, spring physics. Your animations look
                identical to your Figma prototypes.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🔄</div>
              <h3 className="text-xl font-bold mb-3">Child Elements</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Industry-first nested animation support. Complex hierarchies
                export flawlessly.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🎛️</div>
              <h3 className="text-xl font-bold mb-3">Full Control</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Units, colors, variables, minification. Customize everything to
                match your codebase.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🚀</div>
              <h3 className="text-xl font-bold mb-3">Production Ready</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Clean, maintainable, performant code. TypeScript ready, properly
                structured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Beautiful code output
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Clean, optimized, ready to ship
              </p>
            </div>

            {/* Code Window */}
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b-2 border-black dark:border-white">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 font-semibold text-sm">
                  AnimatedCard.tsx
                </span>
              </div>

              {/* Code Content */}
              <pre className="p-8 text-sm overflow-x-auto font-mono">
                <code className="font-medium">
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

            {/* Framework Pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-12">
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
                  className="px-5 py-2.5 bg-white dark:bg-black border-2 border-black dark:border-white rounded-full font-semibold text-sm"
                >
                  {framework}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Perfect for trying it out
              </p>

              <div className="mb-10">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-lg text-gray-500 dark:text-gray-500">
                  /forever
                </span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  '3 exports per day',
                  'All features included',
                  'All 6 frameworks',
                  'No watermarks',
                  'Community support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <svg
                      className="w-6 h-6 text-plum flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-8 py-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold transition-all hover:translate-y-[-2px]"
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="relative p-10 bg-plum/10 dark:bg-plum/20 border-2 border-plum rounded-2xl shadow-[4px_4px_0px_0px_rgba(235,163,237,1)] flex flex-col">
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1.5 bg-plum text-white dark:text-black text-xs rounded-full font-bold">
                  MOST POPULAR
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                For professional developers
              </p>

              <div className="mb-10">
                <span className="text-xl line-through text-gray-400">$29</span>
                <span className="text-5xl font-bold ml-3">$9.99</span>
                <span className="text-lg text-gray-500 dark:text-gray-500">
                  /lifetime
                </span>
                <div className="text-sm text-plum font-semibold mt-2">
                  Launch Special 🎉
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Unlimited exports',
                  'Lifetime updates',
                  'Priority support',
                  'Team license (5 seats)',
                  '30-day money back',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <svg
                      className="w-6 h-6 text-plum flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/checkout"
                className="block w-full text-center px-8 py-3 bg-plum hover:bg-plum-dark text-white dark:text-black font-bold rounded-full border-2 border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Get Pro License
              </a>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="mt-12 text-center p-8 bg-plum/5 dark:bg-plum/10 border-2 border-plum/30 rounded-2xl max-w-3xl mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Quick ROI calculation
            </p>
            <p className="text-2xl font-bold mb-2">
              Save 4 hours × $75/hour ={' '}
              <span className="text-plum">$300 saved</span>
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              That's a{' '}
              <span className="text-plum font-semibold">1,034% return</span> on
              your first project
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ship animations <span className="text-plum">faster</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
              Join thousands of developers who've already saved hundreds of
              hours
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold transition-all hover:translate-y-[-2px]"
              >
                Install Free Plugin
              </a>
              <a
                href="/checkout"
                className="px-8 py-3 bg-plum hover:bg-plum-dark text-white dark:text-black font-bold rounded-full border-2 border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Buy Pro License
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            <div className="col-span-2">
              <div className="mb-4">
                <span className="text-2xl font-black">Motion Export</span>
              </div>
              <p className="font-medium opacity-70">
                The first Figma plugin for exporting animations to
                production-ready code.
              </p>
            </div>

            <div>
              <h4 className="font-black mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.figma.com/community/plugin/1543550763369836937"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Figma Plugin
                  </a>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href="/checkout"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black mb-4">Community</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://discord.gg/U9JxpKnBhe"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/motionexport"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:support@motionexport.com"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Email
                  </a>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t-[3px] border-black dark:border-white flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-medium opacity-60">
              © 2025 Motion Export. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link
                to="/privacy"
                className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
