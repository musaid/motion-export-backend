import { Link } from 'react-router';
import type { Route } from './+types/home';

const PLUGIN_URL =
  'https://www.figma.com/community/plugin/1543550763369836937';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Motion Export - Figma Animations to Code & Video' },
    {
      name: 'description',
      content:
        'Export your Figma prototype animations to production-ready code (CSS, React, Vue, and more) or to GIF and WebM video. No after effects, no rebuilding by hand.',
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
                href={PLUGIN_URL}
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
              <Link
                to="/changelog"
                className="text-base font-medium hover:text-plum transition-colors"
              >
                Changelog
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
                Now supports Figma Motion (beta)
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              Figma animations to
              <br />
              <span className="text-plum">code &amp; video</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Works with both classic prototype transitions and the new Figma
              Motion timeline — export either one to production-ready code for
              six frameworks, or straight to GIF and WebM. No After Effects, no
              rebuilding motion by hand.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href={PLUGIN_URL}
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
              Free: 5 code exports + 2 video exports • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Figma Motion band */}
      <section className="py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-5xl mx-auto bg-plum/10 dark:bg-plum/20 border-2 border-plum rounded-2xl shadow-[4px_4px_0px_0px_rgba(235,163,237,1)] p-10 sm:p-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-plum text-white dark:text-black rounded-full font-bold text-xs mb-6">
              NEW · FIGMA MOTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-5 max-w-3xl">
              Built for Figma Motion, the new timeline from Config
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mb-8">
              Figma Motion lets you keyframe animations on a real timeline. We
              read that timeline directly — every keyframe, every per-property
              track, every per-keyframe easing — instead of flattening it to a
              simple start-and-end state. Then we hand it back to you as code or
              video.
            </p>
            <ul className="grid sm:grid-cols-3 gap-6">
              <li>
                <h3 className="font-bold mb-1">Real keyframes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-stop timelines preserved, not reduced to from/to.
                </p>
              </li>
              <li>
                <h3 className="font-bold mb-1">Highest fidelity in Framer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Figma Motion maps almost 1:1 onto Framer Motion’s keyframe
                  model.
                </p>
              </li>
              <li>
                <h3 className="font-bold mb-1">Or render it</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sample the same timeline straight to a GIF or WebM.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Two Ways To Export */}
      <section className="py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Two ways to export
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Same animation — classic prototype or Figma Motion — your choice of
              output
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Code export */}
            <div className="p-10 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col">
              <div className="text-4xl mb-5">⌘</div>
              <h3 className="text-2xl font-bold mb-3">Export to code</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Get clean, ready-to-ship animation code that matches your Figma
                timing and easing — for the framework your project already uses.
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
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
                    className="px-4 py-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-full font-semibold text-sm"
                  >
                    {framework}
                  </span>
                ))}
              </div>
            </div>

            {/* Video export */}
            <div className="p-10 bg-plum/10 dark:bg-plum/20 border-2 border-plum rounded-2xl shadow-[4px_4px_0px_0px_rgba(235,163,237,1)] flex flex-col">
              <div className="text-4xl mb-5">🎬</div>
              <h3 className="text-2xl font-bold mb-3">Export to video</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Render the exact same animation to a GIF or a transparent WebM —
                drop it into a deck, a PR, a changelog, or a marketing post
                without leaving Figma.
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {['GIF', 'WebM', 'Transparent background'].map((format) => (
                  <span
                    key={format}
                    className="px-4 py-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-full font-semibold text-sm"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built to match your prototype
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              It reads what you already designed — nothing to wire up
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">⚡</div>
              <h3 className="text-xl font-bold mb-3">Smart detection</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Finds both classic prototype transitions — Smart Animate,
                dissolve, slide — and Figma Motion timelines, including animated
                child elements.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🎯</div>
              <h3 className="text-xl font-bold mb-3">Six frameworks</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                CSS, React, Vue, Vanilla JS, Framer Motion, and React Spring —
                pick your stack and get the matching code.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🎬</div>
              <h3 className="text-xl font-bold mb-3">GIF &amp; WebM</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Render any animation to video, including a transparent WebM for
                overlaying on top of other content.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">✨</div>
              <h3 className="text-xl font-bold mb-3">Matches your timing</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Duration, easing curves, and spring settings are read straight
                from your prototype so the output lines up.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🔄</div>
              <h3 className="text-xl font-bold mb-3">Child elements</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Nested layers that animate inside a transition are picked up and
                exported alongside their parent.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl hover:border-plum hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
              <div className="text-4xl mb-5">🎛️</div>
              <h3 className="text-xl font-bold mb-3">Output controls</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Tune units, colors, variables, and minification so the code
                drops cleanly into your codebase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Clean code output
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Readable, structured, and ready to drop in
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
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free, pay once if you need more
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
                  '5 code exports (lifetime)',
                  '2 video exports (lifetime)',
                  'All 6 frameworks',
                  'GIF & WebM output',
                  'No watermarks',
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
                href={PLUGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-8 py-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full font-bold transition-all hover:translate-y-[-2px]"
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="relative p-10 bg-plum/10 dark:bg-plum/20 border-2 border-plum rounded-2xl shadow-[4px_4px_0px_0px_rgba(235,163,237,1)] flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                For everyday exporting
              </p>

              <div className="mb-10">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="text-lg text-gray-500 dark:text-gray-500">
                  {' '}
                  /lifetime
                </span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Unlimited code exports',
                  'Unlimited GIF & WebM exports',
                  'Export all animations at once',
                  'Export sequences & full boards',
                  'Lifetime updates — pay once',
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
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Stop rebuilding motion <span className="text-plum">by hand</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
              Install the plugin and export your first animation in a couple of
              minutes — to code or to video.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={PLUGIN_URL}
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
                Export Figma prototype animations to production-ready code or to
                GIF and WebM video.
              </p>
            </div>

            <div>
              <h4 className="font-black mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={PLUGIN_URL}
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
                  <Link
                    to="/changelog"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Changelog
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
                  <Link
                    to="/recover"
                    className="font-medium opacity-70 hover:opacity-100 hover:text-plum transition-all"
                  >
                    Recover License
                  </Link>
                </li>
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
              © 2026 Motion Export. All rights reserved.
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
