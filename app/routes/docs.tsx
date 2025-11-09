import { Link } from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/docs';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Documentation - Motion Export' },
    {
      name: 'description',
      content:
        'Complete documentation for Motion Export Figma plugin. Learn how to export animations to code.',
    },
  ];
}

type Section =
  | 'quickstart'
  | 'installation'
  | 'usage'
  | 'frameworks'
  | 'troubleshooting';

export default function Docs({}: Route.ComponentProps) {
  const [activeSection, setActiveSection] = useState<Section>('quickstart');

  const sections = [
    { id: 'quickstart', label: 'Quick Start', icon: '🚀' },
    { id: 'installation', label: 'Installation', icon: '📦' },
    { id: 'usage', label: 'Usage Guide', icon: '📖' },
    { id: 'frameworks', label: 'Frameworks', icon: '⚡' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl font-bold">Motion Export</span>
              </Link>
              <span className="text-2xl font-black opacity-30">/</span>
              <span className="font-bold opacity-60">Documentation</span>
            </div>
            <div className="flex gap-6 items-center">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium hover:text-plum transition-colors"
              >
                Plugin
              </a>
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

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-80 min-h-[calc(100vh-5rem)] border-r border-gray-200 dark:border-gray-800">
          <nav className="p-8 space-y-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`w-full text-left px-5 py-3.5 rounded-xl flex items-center gap-3 transition-colors font-semibold border-2 ${
                  activeSection === section.id
                    ? 'bg-plum/10 dark:bg-plum/20 border-plum text-black dark:text-white'
                    : 'border-transparent hover:border-plum hover:bg-plum/5'
                }`}
              >
                <span className="text-2xl">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-5rem)]">
          <div className="max-w-4xl mx-auto px-12 py-16">
            {activeSection === 'quickstart' && (
              <div>
                <h1 className="text-4xl font-bold mb-8">Quick Start</h1>

                <div className="bg-plum/10 dark:bg-plum/20 rounded-2xl p-8 mb-12 border-2 border-plum">
                  <p className="text-lg font-medium">
                    Get started with Motion Export in less than 2 minutes.
                    Export your first animation from Figma to production-ready
                    code.
                  </p>
                </div>

                <div className="space-y-16">
                  <div>
                    <h2 className="text-4xl font-black mb-8 flex items-center gap-4">
                      <span className="text-5xl">1️⃣</span> Install the Plugin
                    </h2>
                    <ol className="space-y-4 ml-16">
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Open Figma and go to the Community tab</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Search for "Motion Export"</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Click "Try it out" to install the plugin</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">The plugin will appear in your Plugins menu</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-4xl font-black mb-8 flex items-center gap-4">
                      <span className="text-5xl">2️⃣</span> Create Your Animation
                    </h2>
                    <ol className="space-y-4 ml-16">
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">
                          Design your frames with the elements you want to
                          animate
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Connect frames using Prototype mode</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">
                          Choose your animation type (Smart Animate, Dissolve,
                          etc.)
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Set duration and easing</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-4xl font-black mb-8 flex items-center gap-4">
                      <span className="text-5xl">3️⃣</span> Export to Code
                    </h2>
                    <ol className="space-y-4 ml-16">
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Run Motion Export from Plugins menu</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Click "Scan for Animations"</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Select the animations you want to export</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Choose your target framework</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">Click "Export" and copy the generated code</span>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-white dark:bg-black rounded-2xl p-8 mt-16 border-2 border-plum shadow-[4px_4px_0px_0px_rgba(235,163,237,1)]">
                  <h3 className="font-black text-plum mb-4 text-2xl">
                    💡 Pro Tip
                  </h3>
                  <p className="font-medium text-lg">
                    Name your layers consistently when using Smart Animate.
                    Motion Export matches elements by name to track property
                    changes.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'installation' && (
              <div>
                <h1 className="text-4xl font-bold mb-8">Installation</h1>

                <div className="space-y-16">
                  <div>
                    <h2 className="text-4xl font-black mb-8">
                      Figma Plugin Installation
                    </h2>

                    <div className="bg-white dark:bg-black rounded-2xl p-8 mb-8 border-2 border-black dark:border-white">
                      <h3 className="text-2xl font-black mb-6 text-plum">
                        Method 1: Figma Community
                      </h3>
                      <ol className="space-y-4">
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">1.</span>
                          <span className="font-medium text-lg">
                            Visit the{' '}
                            <a
                              href="https://www.figma.com/community/plugin/1543550763369836937"
                              className="text-plum underline hover:no-underline font-bold"
                            >
                              Motion Export plugin page
                            </a>
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">2.</span>
                          <span className="font-medium text-lg">Click the "Try it out" button</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">3.</span>
                          <span className="font-medium text-lg">
                            The plugin will be added to your Figma account
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">4.</span>
                          <span className="font-medium text-lg">
                            Access it from Plugins → Motion Export in any file
                          </span>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-white dark:bg-black rounded-2xl p-8 border-2 border-black dark:border-white">
                      <h3 className="text-2xl font-black mb-6 text-plum">
                        Method 2: From Within Figma
                      </h3>
                      <ol className="space-y-4">
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">1.</span>
                          <span className="font-medium text-lg">Open any Figma file</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">2.</span>
                          <span className="font-medium text-lg">
                            Go to Plugins → Browse plugins in Community
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">3.</span>
                          <span className="font-medium text-lg">Search for "Motion Export"</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="font-black text-plum text-xl">4.</span>
                          <span className="font-medium text-lg">Click "Try it out"</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-4xl font-black mb-8">
                      System Requirements
                    </h2>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">Figma desktop app or web browser</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">Active internet connection</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">
                          At least one frame with prototype connections
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'usage' && (
              <div>
                <h1 className="text-4xl font-bold mb-8">Usage Guide</h1>

                <div className="space-y-16">
                  <div>
                    <h2 className="text-4xl font-black mb-8">
                      Creating Animations in Figma
                    </h2>

                    <div className="bg-plum/10 dark:bg-plum/20 rounded-2xl p-8 mb-8 border-2 border-plum">
                      <h3 className="text-3xl font-black mb-6">
                        Smart Animate
                      </h3>
                      <p className="font-medium text-lg mb-6">
                        Smart Animate is the most powerful animation type. It
                        automatically animates matching layers between frames.
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                          <span className="text-plum font-black text-xl">•</span>
                          <span className="font-medium text-lg">
                            Use identical layer names for elements you want to
                            animate
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="text-plum font-black text-xl">•</span>
                          <span className="font-medium text-lg">
                            Motion Export tracks position, size, rotation, and
                            opacity changes
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="text-plum font-black text-xl">•</span>
                          <span className="font-medium text-lg">
                            Nested elements are fully supported (industry
                            first!)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-4xl font-black mb-8">
                      Best Practices
                    </h2>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">Test animations in Figma before exporting</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">
                          Use component variants for reusable micro-interactions
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">Group related animations in the same frame</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">Keep layer names consistent and descriptive</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum text-2xl font-black">✓</span>
                        <span className="font-medium text-lg">Use Auto Layout for responsive animations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'frameworks' && (
              <div>
                <h1 className="text-4xl font-bold mb-8">Framework Support</h1>

                <div className="space-y-12">
                  <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-3xl font-black">CSS / SCSS</h2>
                    </div>
                    <pre className="p-8 text-sm overflow-x-auto font-mono">
                      <code className="font-medium">
                        {`.animated-element {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}`}
                      </code>
                    </pre>
                  </div>

                  <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-3xl font-black">Framer Motion</h2>
                    </div>
                    <pre className="p-8 text-sm overflow-x-auto font-mono">
                      <code className="font-medium">
                        {`<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 20
  }}
>
  Content
</motion.div>`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'troubleshooting' && (
              <div>
                <h1 className="text-4xl font-bold mb-8">Troubleshooting</h1>

                <div className="space-y-8">
                  <div className="bg-white dark:bg-black rounded-2xl p-8 border-2 border-black dark:border-white">
                    <h3 className="text-2xl font-black mb-4 text-plum">
                      No animations detected
                    </h3>
                    <div className="space-y-4">
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">
                          Ensure frames are connected with prototype
                          connections
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">
                          Check that you're in a file with prototypes, not
                          a library
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-plum mt-1 font-black text-xl">→</span>
                        <span className="font-medium text-lg">
                          Verify that frames contain actual content to
                          animate
                        </span>
                      </li>
                    </div>
                  </div>

                  <div className="bg-plum/10 dark:bg-plum/20 rounded-2xl p-8 border-2 border-plum">
                    <h3 className="font-black text-2xl mb-4">
                      Need Help?
                    </h3>
                    <div className="space-y-4">
                      <a
                        href="mailto:support@motionexport.com"
                        className="flex items-center gap-4 font-bold text-lg hover:text-plum transition-colors"
                      >
                        <span className="text-3xl">📧</span>
                        <span>support@motionexport.com</span>
                      </a>
                      <a
                        href="https://discord.gg/U9JxpKnBhe"
                        className="flex items-center gap-4 font-bold text-lg hover:text-plum transition-colors"
                      >
                        <span className="text-3xl">💬</span>
                        <span>Join our Discord</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
