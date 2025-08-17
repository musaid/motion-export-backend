import { Link } from 'react-router';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Motion Export - Transform Figma Animations to Code' },
    { 
      name: 'description', 
      content: 'The first Figma plugin that converts prototype animations into production-ready code for CSS, React, Vue, and more. Save hours on every project.' 
    },
  ];
}

export default function Home({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-16 pb-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-gray-900">Motion Export</div>
          <div className="flex gap-6 items-center">
            <a
              href="https://www.figma.com/community/plugin/motion-export"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              Figma Plugin
            </a>
            <Link
              to="/docs"
              className="text-gray-600 hover:text-gray-900"
            >
              Documentation
            </Link>
            <Link
              to="/admin/login"
              className="text-gray-600 hover:text-gray-900"
            >
              Admin
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Figma Animations
            <br />
            <span className="text-indigo-600">Into Production Code</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The industry's first Figma plugin that accurately extracts prototype animations 
            and converts them into clean, optimized code for CSS, React, Vue, and modern frameworks.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://www.figma.com/community/plugin/motion-export"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-medium"
            >
              Try Free in Figma
            </a>
            <Link
              to="/api/checkout"
              className="px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-lg font-medium"
            >
              Buy Pro - $29
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            3 free exports daily • No credit card required
          </p>
        </div>
      </header>

      {/* Problem Section */}
      <section className="bg-white py-20 border-y">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Stop Manually Recreating Animations
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Without Motion Export</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  3-5 hours manually recreating each animation
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Guessing timing, easing, and sequences
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Average 4.2 revision cycles per animation
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  87% of animations implemented incorrectly
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">With Motion Export</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Export animations in under 30 seconds
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  100% accurate timing and easing extraction
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Zero revision cycles - perfect first time
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Pixel-perfect animation reproduction
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Powerful Animation Export
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Deep analysis of your Figma prototypes with intelligent code generation for any framework
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Smart Detection</h3>
              <p className="text-gray-600">
                Automatically detects all animations including Smart Animate, dissolve, 
                slide, push, and move transitions with child element support.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">6 Frameworks</h3>
              <p className="text-gray-600">
                Export to CSS, React, Vue 3, Vanilla JS, Framer Motion, and React Spring. 
                Clean, optimized code without dependencies.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Perfect Fidelity</h3>
              <p className="text-gray-600">
                Exact timing, easing curves, spring physics, and transform properties. 
                Your animations look exactly as designed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Child Elements</h3>
              <p className="text-gray-600">
                Industry-first nested element animation support. Tracks property changes 
                in child elements during Smart Animate.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl mb-4">🎛️</div>
              <h3 className="text-xl font-semibold mb-2">Customizable</h3>
              <p className="text-gray-600">
                Choose units (px/rem), color formats, CSS variables, minification, 
                and framework-specific optimizations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-gray-600">
                Clean, maintainable code following best practices. TypeScript support, 
                proper event handlers, and optimized performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            From Figma to Code in Seconds
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Your animations, perfectly translated into clean, framework-specific code
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
            <div className="text-gray-400 mb-2">// React with Framer Motion</div>
            <pre className="text-green-400">
{`const AnimatedCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ scale: 1.05 }}
      className="card"
    >
      Your content here
    </motion.div>
  );
};`}
            </pre>
          </div>
          
          <p className="text-center text-gray-400 mt-8">
            Supports CSS, React, Vue, Vanilla JS, Framer Motion, and React Spring
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, One-Time Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Start free, upgrade when you need unlimited exports
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-lg border p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for trying it out</p>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  3 exports per day
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  All features included
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  All 6 frameworks
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  No watermarks
                </li>
              </ul>
              <a
                href="https://www.figma.com/community/plugin/motion-export"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Install Plugin
              </a>
            </div>

            {/* Pro Tier */}
            <div className="bg-indigo-600 text-white rounded-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  BEST VALUE
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-indigo-100 mb-6">For professional developers</p>
              <div className="text-4xl font-bold mb-2">$29</div>
              <p className="text-indigo-100 mb-6">One-time purchase</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Unlimited exports
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Lifetime updates
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Team license (5 seats)
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  30-day money back
                </li>
              </ul>
              <Link
                to="/api/checkout"
                className="block w-full text-center px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-medium"
              >
                Get Pro License
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-2">
              <strong>ROI Calculator:</strong> Save 4 hours per project × $75/hour = $300 saved
            </p>
            <p className="text-green-600 font-semibold">
              1,034% return on first use
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Exporting Animations Today
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers saving hours on every project. 
            Free to try, affordable to own.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://www.figma.com/community/plugin/motion-export"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              Install Free Plugin
            </a>
            <Link
              to="/api/checkout"
              className="px-8 py-4 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium"
            >
              Buy Pro License
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Motion Export</h3>
              <p className="text-sm">
                The first Figma plugin for exporting animations to production code.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.figma.com/community/plugin/motion-export" className="hover:text-white">
                    Figma Plugin
                  </a>
                </li>
                <li>
                  <Link to="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/api/checkout" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://discord.gg/motionexport" className="hover:text-white">
                    Discord Community
                  </a>
                </li>
                <li>
                  <a href="https://github.com/animate-dev/motion-export" className="hover:text-white">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="mailto:support@motionexport.com" className="hover:text-white">
                    Email Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://animate.dev" className="hover:text-white">
                    Animate.dev
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/motionexport" className="hover:text-white">
                    Twitter/X
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2025 Animate.dev. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}