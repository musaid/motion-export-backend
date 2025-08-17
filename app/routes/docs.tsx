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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Motion Export
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-xl font-semibold">Documentation</span>
            </div>
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
                to="/api/checkout"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <main className="bg-white rounded-lg p-8 min-h-[600px]">
            {activeSection === 'quickstart' && (
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6">Quick Start</h1>

                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8">
                  <p className="text-gray-700">
                    Get started with Motion Export in less than 2 minutes.
                    Export your first animation from Figma to production-ready
                    code.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  1. Install the Plugin
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>Open Figma and go to the Community tab</li>
                  <li>Search for "Motion Export"</li>
                  <li>Click "Try it out" to install the plugin</li>
                  <li>The plugin will appear in your Plugins menu</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  2. Create Your Animation
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>
                    Design your frames with the elements you want to animate
                  </li>
                  <li>Connect frames using Prototype mode</li>
                  <li>
                    Choose your animation type (Smart Animate, Dissolve, etc.)
                  </li>
                  <li>Set duration and easing</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  3. Export to Code
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>Run Motion Export from Plugins menu</li>
                  <li>Click "Scan for Animations"</li>
                  <li>Select the animations you want to export</li>
                  <li>Choose your target framework</li>
                  <li>Click "Export" and copy the generated code</li>
                </ol>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
                  <h3 className="font-semibold text-green-900 mb-2">Pro Tip</h3>
                  <p className="text-green-700">
                    Name your layers consistently when using Smart Animate.
                    Motion Export matches elements by name to track property
                    changes.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'installation' && (
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6">Installation</h1>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Figma Plugin Installation
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  Method 1: Figma Community
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>
                    Visit the{' '}
                    <a
                      href="https://www.figma.com/community/plugin/motion-export"
                      className="text-indigo-600 hover:underline"
                    >
                      Motion Export plugin page
                    </a>
                  </li>
                  <li>Click the "Try it out" button</li>
                  <li>The plugin will be added to your Figma account</li>
                  <li>Access it from Plugins → Motion Export in any file</li>
                </ol>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  Method 2: From Within Figma
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>Open any Figma file</li>
                  <li>Go to Plugins → Browse plugins in Community</li>
                  <li>Search for "Motion Export"</li>
                  <li>Click "Try it out"</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  System Requirements
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Figma desktop app or web browser</li>
                  <li>Active internet connection</li>
                  <li>At least one frame with prototype connections</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  License Activation
                </h2>
                <p className="text-gray-600 mb-4">
                  Motion Export offers 3 free exports per day. To unlock
                  unlimited exports:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>Purchase a Pro license for $29</li>
                  <li>You'll receive a license key via email</li>
                  <li>Open Motion Export in Figma</li>
                  <li>Click the settings icon and enter your license key</li>
                  <li>Enjoy unlimited exports!</li>
                </ol>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
                  <h3 className="font-semibold text-yellow-900 mb-2">Note</h3>
                  <p className="text-yellow-700">
                    The free version includes all features and frameworks. The
                    only limitation is the number of daily exports.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'usage' && (
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6">Usage Guide</h1>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Creating Animations in Figma
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">Smart Animate</h3>
                <p className="text-gray-600 mb-4">
                  Smart Animate is the most powerful animation type. It
                  automatically animates matching layers between frames.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    Use identical layer names for elements you want to animate
                  </li>
                  <li>
                    Motion Export tracks position, size, rotation, and opacity
                    changes
                  </li>
                  <li>Nested elements are fully supported (industry first!)</li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  Supported Transitions
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    <strong>Smart Animate:</strong> Morphs between matching
                    elements
                  </li>
                  <li>
                    <strong>Dissolve:</strong> Fades between frames
                  </li>
                  <li>
                    <strong>Move In/Out:</strong> Slides frames in from edges
                  </li>
                  <li>
                    <strong>Push:</strong> Pushes one frame out while bringing
                    another in
                  </li>
                  <li>
                    <strong>Slide In/Out:</strong> Slides frames over each other
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Using Motion Export
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  Scanning for Animations
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>Open Motion Export from the Plugins menu</li>
                  <li>Click "Scan for Animations"</li>
                  <li>The plugin will detect all prototype connections</li>
                  <li>Review the detected animations in the list</li>
                </ol>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  Configuring Export Options
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    <strong>Framework:</strong> CSS, React, Vue, Vanilla JS,
                    Framer Motion, React Spring
                  </li>
                  <li>
                    <strong>Units:</strong> Pixels (px) or REM
                  </li>
                  <li>
                    <strong>CSS Variables:</strong> Enable for themeable
                    animations
                  </li>
                  <li>
                    <strong>Minification:</strong> Reduce code size
                  </li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  Best Practices
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Test animations in Figma before exporting</li>
                  <li>
                    Use component variants for reusable micro-interactions
                  </li>
                  <li>Group related animations in the same frame</li>
                  <li>Keep layer names consistent and descriptive</li>
                  <li>Use Auto Layout for responsive animations</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Advanced Tip
                  </h3>
                  <p className="text-blue-700">
                    For complex multi-step animations, create intermediate
                    frames and chain them with "After Delay" triggers.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'api' && (
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6">API Reference</h1>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  License Validation API
                </h2>
                <p className="text-gray-600 mb-4">
                  Validate license keys and check usage limits programmatically.
                </p>

                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <div className="text-gray-600 mb-2">POST /api/validate</div>
                  <pre className="text-gray-800">
                    {`{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceId": "unique-device-identifier"
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-medium mt-6 mb-3">Response</h3>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <pre className="text-gray-800">
                    {`{
  "valid": true,
  "licenseType": "pro",
  "remainingExports": "unlimited",
  "expiresAt": null
}`}
                  </pre>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Tracking API
                </h2>
                <p className="text-gray-600 mb-4">
                  Track usage analytics and export events.
                </p>

                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <div className="text-gray-600 mb-2">POST /api/track</div>
                  <pre className="text-gray-800">
                    {`{
  "event": "export_completed",
  "deviceId": "unique-device-identifier",
  "properties": {
    "framework": "react",
    "animationType": "smart-animate",
    "duration": 300
  }
}`}
                  </pre>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Error Codes
                </h2>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Code
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">
                        INVALID_LICENSE
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        License key is invalid or not found
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">
                        LIMIT_EXCEEDED
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Daily export limit reached (free tier)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">
                        LICENSE_REVOKED
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        License has been revoked
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">
                        MAX_DEVICES
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Maximum device activations reached (5)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'frameworks' && (
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6">Framework Support</h1>

                <h2 className="text-2xl font-semibold mt-8 mb-4">CSS / SCSS</h2>
                <p className="text-gray-600 mb-4">
                  Pure CSS animations using @keyframes. Perfect for any project.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <pre className="text-gray-800">
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
                  </pre>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">React</h2>
                <p className="text-gray-600 mb-4">
                  React components with inline styles and state management.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <pre className="text-gray-800">
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
                  </pre>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Vue 3</h2>
                <p className="text-gray-600 mb-4">
                  Vue 3 Composition API with reactive animations.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <pre className="text-gray-800">
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
                  </pre>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Framer Motion
                </h2>
                <p className="text-gray-600 mb-4">
                  Advanced React animations with spring physics and gestures.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <pre className="text-gray-800">
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
                  </pre>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  React Spring
                </h2>
                <p className="text-gray-600 mb-4">
                  Physics-based animations with React hooks.
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-6">
                  <pre className="text-gray-800">
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
                  </pre>
                </div>
              </div>
            )}

            {activeSection === 'troubleshooting' && (
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6">Troubleshooting</h1>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Common Issues
                </h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-xl font-medium mb-2">
                      No animations detected
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Problem:</strong> The plugin doesn't find any
                      animations after scanning.
                    </p>
                    <p className="text-gray-600">
                      <strong>Solution:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>
                        Ensure frames are connected with prototype connections
                      </li>
                      <li>
                        Check that you're in a file with prototypes, not a
                        library
                      </li>
                      <li>
                        Verify that frames contain actual content to animate
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-xl font-medium mb-2">
                      Smart Animate not working correctly
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Problem:</strong> Elements aren't animating
                      smoothly between frames.
                    </p>
                    <p className="text-gray-600">
                      <strong>Solution:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>Ensure layer names match exactly between frames</li>
                      <li>Check that layer structure is consistent</li>
                      <li>Avoid changing layer types (e.g., frame to group)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-xl font-medium mb-2">
                      License key not working
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Problem:</strong> Pro license key is rejected.
                    </p>
                    <p className="text-gray-600">
                      <strong>Solution:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>Copy the entire key including dashes</li>
                      <li>Check for extra spaces before or after the key</li>
                      <li>
                        Verify you're using the key from your purchase email
                      </li>
                      <li>Contact support if issue persists</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-xl font-medium mb-2">
                      Generated code not working
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Problem:</strong> Exported animation code doesn't
                      work in your project.
                    </p>
                    <p className="text-gray-600">
                      <strong>Solution:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>Ensure you've selected the correct framework</li>
                      <li>
                        Check that all required dependencies are installed
                      </li>
                      <li>Verify CSS is properly imported/included</li>
                      <li>Test in isolation before integrating</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Performance Tips
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Limit the number of elements in complex animations</li>
                  <li>Use transform properties instead of position changes</li>
                  <li>Enable hardware acceleration with will-change CSS</li>
                  <li>Avoid animating box-shadow and filters on mobile</li>
                  <li>Test on actual devices, not just desktop browsers</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">
                  Getting Help
                </h2>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 mb-2">
                    Support Channels
                  </h3>
                  <ul className="space-y-2 text-indigo-700">
                    <li>
                      📧 Email:{' '}
                      <a
                        href="mailto:support@motionexport.com"
                        className="underline"
                      >
                        support@motionexport.com
                      </a>
                    </li>
                    <li>
                      💬 Discord:{' '}
                      <a
                        href="https://discord.gg/motionexport"
                        className="underline"
                      >
                        discord.gg/motionexport
                      </a>
                    </li>
                    <li>
                      🐛 GitHub:{' '}
                      <a
                        href="https://github.com/animate-dev/motion-export/issues"
                        className="underline"
                      >
                        Report issues
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
