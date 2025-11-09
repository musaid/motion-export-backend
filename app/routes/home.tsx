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
      <nav className="border-b-[3px] border-black dark:border-white">
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
                className="px-8 py-3 bg-plum hover:bg-plum-dark text-white dark:text-black font-bold rounded-full border-[3px] border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Get Pro
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 sm:py-32 border-b-[3px] border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-full mb-12">
              <span className="w-2 h-2 bg-plum rounded-full" />
              <span className="font-bold text-sm">Now with 6 framework exports</span>
            </div>

            {/* Heading */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 leading-none">
              Export Figma
              <br />
              <span className="text-plum">Animations to Code</span>
            </h1>

            <p className="text-xl sm:text-2xl font-medium mb-12 max-w-3xl mx-auto">
              The first plugin that perfectly extracts your prototype
              animations. Ship pixel-perfect motion in seconds, not hours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 bg-white dark:bg-black border-[3px] border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold text-lg transition-all hover:translate-y-[-2px]"
              >
                Try Free in Figma →
              </a>
              <a
                href="/checkout"
                className="px-10 py-4 bg-plum hover:bg-plum-dark text-white dark:text-black rounded-full font-bold text-lg border-[3px] border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Unlock Pro - $9.99
              </a>
            </div>

            <p className="text-base font-medium opacity-60">
              Free tier includes 5 lifetime exports • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-b-[3px] border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-plum mb-3">87%</div>
              <p className="text-sm font-bold">
                Animations fail without proper tooling
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-plum mb-3">4hrs</div>
              <p className="text-sm font-bold">
                Average time saved per project
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-plum mb-3">1,034%</div>
              <p className="text-sm font-bold">
                ROI on first animation export
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-plum mb-3">30sec</div>
              <p className="text-sm font-bold">
                From Figma to production code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-b-[3px] border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6">
              Everything you need
            </h2>
            <p className="text-xl font-medium">
              Professional animation export with zero learning curve
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] hover:border-plum transition-all hover:translate-y-[-4px]">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-2xl font-black mb-4">Smart Detection</h3>
              <p className="font-medium leading-relaxed">
                Automatically finds all animations. Smart Animate, dissolve,
                slide - we catch everything including nested elements.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] hover:border-plum transition-all hover:translate-y-[-4px]">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-2xl font-black mb-4">6 Frameworks</h3>
              <p className="font-medium leading-relaxed">
                CSS, React, Vue, Vanilla JS, Framer Motion, React Spring. One
                click, perfect code for your stack.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] hover:border-plum transition-all hover:translate-y-[-4px]">
              <div className="text-5xl mb-6">✨</div>
              <h3 className="text-2xl font-black mb-4">Pixel Perfect</h3>
              <p className="font-medium leading-relaxed">
                Exact timing, easing, spring physics. Your animations look
                identical to your Figma prototypes.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] hover:border-plum transition-all hover:translate-y-[-4px]">
              <div className="text-5xl mb-6">🔄</div>
              <h3 className="text-2xl font-black mb-4">Child Elements</h3>
              <p className="font-medium leading-relaxed">
                Industry-first nested animation support. Complex hierarchies
                export flawlessly.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] hover:border-plum transition-all hover:translate-y-[-4px]">
              <div className="text-5xl mb-6">🎛️</div>
              <h3 className="text-2xl font-black mb-4">Full Control</h3>
              <p className="font-medium leading-relaxed">
                Units, colors, variables, minification. Customize everything to
                match your codebase.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] hover:border-plum transition-all hover:translate-y-[-4px]">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-2xl font-black mb-4">Production Ready</h3>
              <p className="font-medium leading-relaxed">
                Clean, maintainable, performant code. TypeScript ready, properly
                structured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950 border-b-[3px] border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6">
                Beautiful code output
              </h2>
              <p className="text-xl font-medium">
                Clean, optimized, ready to ship
              </p>
            </div>

            {/* Code Window */}
            <div className="bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b-[3px] border-black dark:border-white">
                <div className="w-4 h-4 rounded-full bg-red-500 border-[2px] border-black dark:border-white" />
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-[2px] border-black dark:border-white" />
                <div className="w-4 h-4 rounded-full bg-green-500 border-[2px] border-black dark:border-white" />
                <span className="ml-4 font-bold text-sm">AnimatedCard.tsx</span>
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
            <div className="flex flex-wrap gap-4 justify-center mt-12">
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
                  className="px-6 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-full font-bold"
                >
                  {framework}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 border-b-[3px] border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6">
              Simple pricing
            </h2>
            <p className="text-xl font-medium">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-3xl font-black mb-3">Free</h3>
              <p className="font-medium mb-8 opacity-70">
                Perfect for trying it out
              </p>

              <div className="mb-10">
                <span className="text-6xl font-black">$0</span>
                <span className="text-xl font-bold opacity-60">/forever</span>
              </div>

              <ul className="space-y-4 mb-10">
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
                    <span className="font-bold">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-8 py-4 bg-white dark:bg-black border-[3px] border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold text-lg transition-all hover:translate-y-[-2px]"
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="relative p-10 bg-plum/10 dark:bg-plum/20 border-[3px] border-plum rounded-[24px] shadow-[8px_8px_0px_0px_rgba(235,163,237,1)]">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-6 py-2 bg-plum text-white dark:text-black text-sm rounded-full font-black border-[3px] border-black dark:border-white">
                  MOST POPULAR
                </span>
              </div>

              <h3 className="text-3xl font-black mb-3">Pro</h3>
              <p className="font-medium mb-8 opacity-70">
                For professional developers
              </p>

              <div className="mb-10">
                <span className="text-2xl font-black line-through opacity-50">
                  $29
                </span>
                <span className="text-6xl font-black ml-3">$9.99</span>
                <span className="text-xl font-bold opacity-60">/lifetime</span>
                <div className="text-base text-plum font-black mt-2">
                  Launch Special 🎉
                </div>
              </div>

              <ul className="space-y-4 mb-10">
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
                    <span className="font-bold">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/checkout"
                className="block w-full text-center px-8 py-4 bg-plum hover:bg-plum-dark text-white dark:text-black rounded-full font-bold text-lg border-[3px] border-black dark:border-white transition-all hover:translate-y-[-2px]"
              >
                Get Pro License
              </a>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="mt-16 text-center p-10 bg-white dark:bg-black border-[3px] border-plum rounded-[24px] max-w-3xl mx-auto shadow-[8px_8px_0px_0px_rgba(235,163,237,1)]">
            <p className="text-sm font-bold opacity-60 mb-3">
              Quick ROI calculation
            </p>
            <p className="text-3xl font-black mb-3">
              Save 4 hours × $75/hour = <span className="text-plum">$300 saved</span>
            </p>
            <p className="text-lg font-bold">
              That's a <span className="text-plum">1,034% return</span> on
              your first project
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 border-b-[3px] border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8">
              Ship animations <span className="text-plum">faster</span>
            </h2>
            <p className="text-xl font-medium mb-12">
              Join thousands of developers who've already saved hundreds of hours
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 bg-white dark:bg-black border-[3px] border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold text-lg transition-all hover:translate-y-[-2px]"
              >
                Install Free Plugin
              </a>
              <a
                href="/checkout"
                className="px-10 py-4 bg-plum hover:bg-plum-dark text-white dark:text-black rounded-full font-bold text-lg border-[3px] border-black dark:border-white transition-all hover:translate-y-[-2px]"
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
            <p className="font-medium opacity-60">© 2025 Motion Export. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/privacy" className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all">
                Privacy
              </Link>
              <Link to="/terms" className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
