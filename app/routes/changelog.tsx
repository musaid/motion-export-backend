import { Link } from 'react-router';
import type { Route } from './+types/changelog';

const PLUGIN_URL =
  'https://www.figma.com/community/plugin/1543550763369836937';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Changelog - Motion Export' },
    {
      name: 'description',
      content:
        "What's new in Motion Export — new features, improvements, and fixes for the Figma animation export plugin.",
    },
  ];
}

type Tag = 'New' | 'Improved' | 'Fixed';

type Release = {
  version: string;
  title: string;
  date: string;
  entries: { tag: Tag; text: string }[];
};

const RELEASES: Release[] = [
  {
    version: '9.0',
    title: 'Figma Motion support',
    date: '2026',
    entries: [
      {
        tag: 'New',
        text: 'Reads the new Figma Motion timeline (open beta) directly — every keyframe, per-property track, and per-keyframe easing, not flattened to a start/end state.',
      },
      {
        tag: 'New',
        text: 'Export a Figma Motion animation to CSS @keyframes or Framer Motion, or render it straight to GIF/WebM.',
      },
      {
        tag: 'Improved',
        text: 'Scan now detects both classic prototype transitions and Figma Motion animations in the same file.',
      },
    ],
  },
  {
    version: '8.1',
    title: 'Free video exports',
    date: '2026',
    entries: [
      {
        tag: 'New',
        text: 'Every free user now gets 2 GIF/WebM video exports — no Pro needed to try video.',
      },
      {
        tag: 'New',
        text: 'Export cards show how many free video exports you have left.',
      },
      {
        tag: 'Improved',
        text: 'Code and video each have their own free pool, so trying one never uses up the other.',
      },
    ],
  },
  {
    version: '8.0',
    title: 'Sequence export + smarter rendering',
    date: '2026',
    entries: [
      {
        tag: 'New',
        text: 'Export an entire prototype flow as a single GIF or WebM, with each frame’s auto-advance delay preserved (Pro).',
      },
      {
        tag: 'Improved',
        text: 'Smart Animate now composites per layer with real spring physics — overshoot and bounce are reproduced exactly in Framer Motion and video, and closely approximated in CSS.',
      },
      {
        tag: 'Fixed',
        text: 'Direction inversion on Move In, a mid-transition dimming artifact, and a black flash between chained frames.',
      },
    ],
  },
  {
    version: '7.0',
    title: 'GIF + WebM export',
    date: '2025',
    entries: [
      {
        tag: 'New',
        text: 'Export any prototype animation as a GIF or transparent WebM in one click.',
      },
      {
        tag: 'Improved',
        text: 'Exports loop cleanly with a hold on the start and end states, and encoding progress shows on the button.',
      },
    ],
  },
  {
    version: '6.0',
    title: 'Account-based licensing',
    date: '2025',
    entries: [
      {
        tag: 'Improved',
        text: 'Pro licenses follow your Figma account across devices, with clearer activation and error messages.',
      },
    ],
  },
  {
    version: '4.0',
    title: 'Performance',
    date: '2025',
    entries: [
      {
        tag: 'Improved',
        text: 'Faster exports with caching, instant re-exports when settings change, and better search.',
      },
    ],
  },
];

const TAG_STYLES: Record<Tag, string> = {
  New: 'bg-plum text-white dark:text-black border-black dark:border-white',
  Improved:
    'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white',
  Fixed:
    'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white',
};

export default function Changelog({}: Route.ComponentProps) {
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
              <span className="font-bold opacity-60">Changelog</span>
            </div>
            <div className="flex gap-6 items-center">
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

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Changelog</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            New features, improvements, and fixes. Updates ship free to everyone
            who owns Pro.
          </p>
        </div>

        <div className="space-y-16">
          {RELEASES.map((release) => (
            <div key={release.version}>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="px-3 py-1 bg-plum/10 dark:bg-plum/20 border-2 border-plum rounded-full font-black text-sm">
                  v{release.version}
                </span>
                <h2 className="text-2xl font-bold">{release.title}</h2>
              </div>

              <ul className="space-y-4 border-l-2 border-black dark:border-white pl-6">
                {release.entries.map((entry, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 px-2.5 py-0.5 rounded-full border-2 font-bold text-xs whitespace-nowrap ${TAG_STYLES[entry.tag]}`}
                    >
                      {entry.tag}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                      {entry.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 bg-plum/10 dark:bg-plum/20 border-2 border-plum rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-3">Get every update</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Install the plugin free, or unlock everything for $9.99 once.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
        </div>
      </div>
    </div>
  );
}
