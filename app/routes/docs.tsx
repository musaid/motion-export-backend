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
  | 'api'
  | 'frameworks'
  | 'troubleshooting';

export default function Docs({}: Route.ComponentProps) {
  const [activeSection, setActiveSection] = useState<Section>('quickstart');

  const sections = [
    { id: 'quickstart', label: 'Quick Start', icon: '🚀' },
    { id: 'installation', label: 'Installation', icon: '📦' },
    { id: 'usage', label: 'Usage Guide', icon: '📖' },
    { id: 'api', label: 'API Reference', icon: '🔧' },
    { id: 'frameworks', label: 'Frameworks', icon: '⚡' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <img 
                  src="/logo.svg" 
                  alt="Motion Export" 
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                  style={{ filter: 'brightness(0) saturate(100%) invert(59%) sepia(94%) saturate(1165%) hue-rotate(201deg) brightness(101%) contrast(96%)' }}
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Motion Export
                </span>
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400">Documentation</span>
            </div>
            <div className="flex gap-6 items-center">
              <a
                href="https://www.figma.com/community/plugin/1543550763369836937"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Plugin
              </a>
              <a
                href="/checkout"
                className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Get Pro
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar Navigation - Fixed */}
        <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-white/10 bg-black/50 backdrop-blur-sm">
          <nav className="p-4 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors outline-none focus:outline-none ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {activeSection === 'quickstart' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Quick Start
                </h1>

                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
                  <p className="text-gray-300 m-0">
                    Get started with Motion Export in less than 2 minutes.
                    Export your first animation from Figma to production-ready
                    code.
                  </p>
                </div>

                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                      <span className="text-3xl">1️⃣</span> Install the Plugin
                    </h2>
                    <ol className="space-y-3 text-gray-400 ml-12">
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>Open Figma and go to the Community tab</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>Search for "Motion Export"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>Click "Try it out" to install the plugin</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>The plugin will appear in your Plugins menu</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                      <span className="text-3xl">2️⃣</span> Create Your Animation
                    </h2>
                    <ol className="space-y-3 text-gray-400 ml-12">
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">→</span>
                        <span>
                          Design your frames with the elements you want to
                          animate
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">→</span>
                        <span>Connect frames using Prototype mode</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">→</span>
                        <span>
                          Choose your animation type (Smart Animate, Dissolve,
                          etc.)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">→</span>
                        <span>Set duration and easing</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                      <span className="text-3xl">3️⃣</span> Export to Code
                    </h2>
                    <ol className="space-y-3 text-gray-400 ml-12">
                      <li className="flex items-start gap-3">
                        <span className="text-pink-400 mt-1">→</span>
                        <span>Run Motion Export from Plugins menu</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-pink-400 mt-1">→</span>
                        <span>Click "Scan for Animations"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-pink-400 mt-1">→</span>
                        <span>Select the animations you want to export</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-pink-400 mt-1">→</span>
                        <span>Choose your target framework</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-pink-400 mt-1">→</span>
                        <span>Click "Export" and copy the generated code</span>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 mt-12 border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-3 text-lg">
                    💡 Pro Tip
                  </h3>
                  <p className="text-gray-300 m-0">
                    Name your layers consistently when using Smart Animate.
                    Motion Export matches elements by name to track property
                    changes.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'installation' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Installation
                </h1>

                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Figma Plugin Installation
                    </h2>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
                      <h3 className="text-lg font-medium mb-4 text-blue-400">
                        Method 1: Figma Community
                      </h3>
                      <ol className="space-y-3 text-gray-400">
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-1">1.</span>
                          <span>
                            Visit the{' '}
                            <a
                              href="https://www.figma.com/community/plugin/1543550763369836937"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Motion Export plugin page
                            </a>
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-1">2.</span>
                          <span>Click the "Try it out" button</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-1">3.</span>
                          <span>
                            The plugin will be added to your Figma account
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-1">4.</span>
                          <span>
                            Access it from Plugins → Motion Export in any file
                          </span>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-medium mb-4 text-purple-400">
                        Method 2: From Within Figma
                      </h3>
                      <ol className="space-y-3 text-gray-400">
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">1.</span>
                          <span>Open any Figma file</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">2.</span>
                          <span>
                            Go to Plugins → Browse plugins in Community
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">3.</span>
                          <span>Search for "Motion Export"</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">4.</span>
                          <span>Click "Try it out"</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      System Requirements
                    </h2>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>Figma desktop app or web browser</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>Active internet connection</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>
                          At least one frame with prototype connections
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      License Activation
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Motion Export offers 3 free exports per day. To unlock
                      unlimited exports:
                    </p>
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <ol className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-sm">
                            1
                          </span>
                          <span>Purchase a Pro license for $29</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-sm">
                            2
                          </span>
                          <span>You'll receive a license key via email</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-sm">
                            3
                          </span>
                          <span>Open Motion Export in Figma</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-sm">
                            4
                          </span>
                          <span>
                            Click the settings icon and enter your license key
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-sm">
                            5
                          </span>
                          <span>Enjoy unlimited exports!</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 mt-12 border border-yellow-500/20">
                  <h3 className="font-semibold text-yellow-400 mb-3 text-lg">
                    📝 Note
                  </h3>
                  <p className="text-gray-300 m-0">
                    The free version includes all features and frameworks. The
                    only limitation is the number of daily exports.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'usage' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Usage Guide
                </h1>

                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Creating Animations in Figma
                    </h2>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
                      <h3 className="text-xl font-medium mb-4 text-purple-400">
                        Smart Animate
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Smart Animate is the most powerful animation type. It
                        automatically animates matching layers between frames.
                      </p>
                      <ul className="space-y-3 text-gray-400">
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Use identical layer names for elements you want to
                            animate
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Motion Export tracks position, size, rotation, and
                            opacity changes
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Nested elements are fully supported (industry
                            first!)
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-medium mb-4 text-blue-400">
                        Supported Transitions
                      </h3>
                      <div className="grid gap-3">
                        {[
                          {
                            name: 'Smart Animate',
                            desc: 'Morphs between matching elements',
                          },
                          { name: 'Dissolve', desc: 'Fades between frames' },
                          {
                            name: 'Move In/Out',
                            desc: 'Slides frames in from edges',
                          },
                          {
                            name: 'Push',
                            desc: 'Pushes one frame out while bringing another in',
                          },
                          {
                            name: 'Slide In/Out',
                            desc: 'Slides frames over each other',
                          },
                        ].map((transition, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-blue-400 font-semibold min-w-[120px]">
                              {transition.name}:
                            </span>
                            <span className="text-gray-400">
                              {transition.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Using Motion Export
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-medium mb-4 text-pink-400">
                          Scanning for Animations
                        </h3>
                        <ol className="space-y-3 text-gray-400">
                          <li className="flex items-start gap-3">
                            <span className="text-pink-400">1.</span>
                            <span>
                              Open Motion Export from the Plugins menu
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-pink-400">2.</span>
                            <span>Click "Scan for Animations"</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-pink-400">3.</span>
                            <span>
                              The plugin will detect all prototype connections
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-pink-400">4.</span>
                            <span>
                              Review the detected animations in the list
                            </span>
                          </li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xl font-medium mb-4 text-orange-400">
                          Export Options
                        </h3>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                          <div className="grid gap-4">
                            <div className="flex items-start gap-3">
                              <span className="text-orange-400 font-semibold min-w-[100px]">
                                Framework:
                              </span>
                              <span className="text-gray-400">
                                CSS, React, Vue, Vanilla JS, Framer Motion,
                                React Spring
                              </span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-orange-400 font-semibold min-w-[100px]">
                                Units:
                              </span>
                              <span className="text-gray-400">
                                Pixels (px) or REM
                              </span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-orange-400 font-semibold min-w-[100px]">
                                Variables:
                              </span>
                              <span className="text-gray-400">
                                Enable CSS variables for theming
                              </span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-orange-400 font-semibold min-w-[100px]">
                                Minification:
                              </span>
                              <span className="text-gray-400">
                                Reduce code size
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Best Practices
                    </h2>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>Test animations in Figma before exporting</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>
                          Use component variants for reusable micro-interactions
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>Group related animations in the same frame</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>Keep layer names consistent and descriptive</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">✓</span>
                        <span>Use Auto Layout for responsive animations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 mt-12 border border-blue-500/20">
                  <h3 className="font-semibold text-blue-400 mb-3 text-lg">
                    🎯 Advanced Tip
                  </h3>
                  <p className="text-gray-300 m-0">
                    For complex multi-step animations, create intermediate
                    frames and chain them with "After Delay" triggers.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'api' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  API Reference
                </h1>

                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      License Validation API
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Validate license keys and check usage limits
                      programmatically.
                    </p>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          POST
                        </span>
                        <span className="text-gray-400 font-mono text-sm">
                          /api/validate
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceId": "unique-device-identifier"
}`}
                        </code>
                      </pre>
                    </div>

                    <h3 className="text-xl font-medium mt-6 mb-4 text-gray-300">
                      Response
                    </h3>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`{
  "valid": true,
  "licenseType": "pro",
  "remainingExports": "unlimited",
  "expiresAt": null
}`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Tracking API
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Track usage analytics and export events.
                    </p>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          POST
                        </span>
                        <span className="text-gray-400 font-mono text-sm">
                          /api/track
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`{
  "event": "export_completed",
  "deviceId": "unique-device-identifier",
  "properties": {
    "framework": "react",
    "animationType": "smart-animate",
    "duration": 300
  }
}`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Error Codes
                    </h2>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-gray-400 font-medium">
                              Code
                            </th>
                            <th className="px-4 py-3 text-left text-gray-400 font-medium">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          <tr>
                            <td className="px-4 py-3 font-mono text-sm text-purple-400">
                              INVALID_LICENSE
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              License key is invalid or not found
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-sm text-purple-400">
                              LIMIT_EXCEEDED
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              Daily export limit reached (free tier)
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-sm text-purple-400">
                              LICENSE_REVOKED
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              License has been revoked
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-sm text-purple-400">
                              MAX_DEVICES
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              Maximum device activations reached (5)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'frameworks' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Framework Support
                </h1>

                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      CSS / SCSS
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Pure CSS animations using @keyframes. Perfect for any
                      project.
                    </p>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-xs text-gray-500">
                          styles.css
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
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
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      React
                    </h2>
                    <p className="text-gray-400 mb-6">
                      React components with inline styles and state management.
                    </p>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-xs text-gray-500">
                          AnimatedComponent.jsx
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`const AnimatedComponent = () => {
  const [isAnimated, setIsAnimated] = useState(false);

  return (
    <div
      className="element"
      style={{
        transition: 'all 0.3s ease-out',
        opacity: isAnimated ? 1 : 0,
        transform: \`scale(\${isAnimated ? 1 : 0.9})\`
      }}
      onClick={() => setIsAnimated(!isAnimated)}
    >
      Content
    </div>
  );
};`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Vue 3
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Vue 3 Composition API with reactive animations.
                    </p>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-xs text-gray-500">
                          AnimatedComponent.vue
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`<template>
  <transition name="fade">
    <div v-if="show" class="element">
      Content
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Framer Motion
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Advanced React animations with spring physics and
                      gestures.
                    </p>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-xs text-gray-500">
                          AnimatedCard.tsx
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 20
  }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Content
</motion.div>`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      React Spring
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Physics-based animations with React hooks.
                    </p>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-xs text-gray-500">
                          SpringAnimation.jsx
                        </span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {`const styles = useSpring({
  from: { opacity: 0, transform: 'scale(0.9)' },
  to: { opacity: 1, transform: 'scale(1)' },
  config: { tension: 300, friction: 20 }
});

return (
  <animated.div style={styles}>
    Content
  </animated.div>
);`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'troubleshooting' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Troubleshooting
                </h1>

                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Common Issues
                    </h2>

                    <div className="space-y-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-medium mb-3 text-red-400">
                          No animations detected
                        </h3>
                        <p className="text-gray-400 mb-4">
                          <span className="text-gray-500">Problem:</span> The
                          plugin doesn't find any animations after scanning.
                        </p>
                        <div>
                          <p className="text-gray-500 mb-2">Solution:</p>
                          <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Ensure frames are connected with prototype
                                connections
                              </span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Check that you're in a file with prototypes, not
                                a library
                              </span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Verify that frames contain actual content to
                                animate
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-medium mb-3 text-yellow-400">
                          Smart Animate not working correctly
                        </h3>
                        <p className="text-gray-400 mb-4">
                          <span className="text-gray-500">Problem:</span>{' '}
                          Elements aren't animating smoothly between frames.
                        </p>
                        <div>
                          <p className="text-gray-500 mb-2">Solution:</p>
                          <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Ensure layer names match exactly between frames
                              </span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Check that layer structure is consistent
                              </span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Avoid changing layer types (e.g., frame to
                                group)
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-medium mb-3 text-orange-400">
                          License key not working
                        </h3>
                        <p className="text-gray-400 mb-4">
                          <span className="text-gray-500">Problem:</span> Pro
                          license key is rejected.
                        </p>
                        <div>
                          <p className="text-gray-500 mb-2">Solution:</p>
                          <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>Copy the entire key including dashes</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Check for extra spaces before or after the key
                              </span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>
                                Verify you're using the key from your purchase
                                email
                              </span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-green-400 mt-1">→</span>
                              <span>Contact support if issue persists</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Performance Tips
                    </h2>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400">💡</span>
                        <span>
                          Limit the number of elements in complex animations
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400">💡</span>
                        <span>
                          Use transform properties instead of position changes
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400">💡</span>
                        <span>
                          Enable hardware acceleration with will-change CSS
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400">💡</span>
                        <span>
                          Avoid animating box-shadow and filters on mobile
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-400">💡</span>
                        <span>
                          Test on actual devices, not just desktop browsers
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-white">
                      Getting Help
                    </h2>
                    <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/20">
                      <h3 className="font-semibold text-indigo-400 mb-4 text-lg">
                        Support Channels
                      </h3>
                      <div className="space-y-3">
                        <a
                          href="mailto:support@motionexport.com"
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                        >
                          <span className="text-2xl">📧</span>
                          <span>support@motionexport.com</span>
                        </a>
                        <a
                          href="https://discord.gg/U9JxpKnBhe"
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                        >
                          <span className="text-2xl">💬</span>
                          <span>Join our Discord</span>
                        </a>
                      </div>
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
