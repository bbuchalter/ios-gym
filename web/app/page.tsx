'use client';

/* Educational content page with extensive prose - escaping quotes would harm source readability */
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react';

import { Diagram } from '@/components/Diagram';
import { Exercise } from '@/components/Exercise';
import Footer from '@/components/Footer';
import { InfoBox } from '@/components/InfoBox';
import { LessonSection } from '@/components/LessonSection';
import { ProTip } from '@/components/ProTip';
import { SkillCard } from '@/components/SkillCard';
import { LessonCounterProvider } from '@/lib/LessonCounterContext';
import { TerminalRegistryProvider, useTerminalRegistry } from '@/lib/TerminalRegistryContext';
import { useProgressBar } from '@/lib/useProgressBar';

// Import exercises
import lesson01 from '../../src/exercises/lesson-01-setting-hostname-and-saving-configuration.json';
import lesson02 from '../../src/exercises/lesson-02-setting-enable-secret-password.json';
import lesson03 from '../../src/exercises/lesson-03-navigating-modes.json';
import lesson04 from '../../src/exercises/lesson-04-tab-completion.json';
import lesson05 from '../../src/exercises/lesson-05-pagination.json';
import lesson06 from '../../src/exercises/lesson-06-name-lookup-abort.json';
import lesson07 from '../../src/exercises/lesson-07-command-history.json';
import lesson08 from '../../src/exercises/lesson-08-password-entry.json';
import lesson09 from '../../src/exercises/lesson-09-no-command.json';
import lesson10 from '../../src/exercises/lesson-10-sub-config-modes.json';
import lesson11 from '../../src/exercises/lesson-11-logging-synchronous.json';
import lesson12 from '../../src/exercises/lesson-12-show-interfaces.json';
import lesson13 from '../../src/exercises/lesson-13-management-access.json';
import lesson14 from '../../src/exercises/lesson-14-vlan-creation.json';
import lesson15 from '../../src/exercises/lesson-15-svi-basic.json';
import lesson15a from '../../src/exercises/lesson-15a-svi-inter-vlan.json';
import lesson16 from '../../src/exercises/lesson-16-trunk-all-vlans.json';
import lesson17 from '../../src/exercises/lesson-17-trunk-restricted.json';
import lesson18 from '../../src/exercises/lesson-18-ssh-configuration.json';
import lesson19 from '../../src/exercises/lesson-19-routed-port.json';
import lesson20 from '../../src/exercises/lesson-20-multiple-routed-ports.json';
import lesson21 from '../../src/exercises/lesson-21-static-routing.json';
import lesson22 from '../../src/exercises/lesson-22-ospf-basic.json';
import lesson23 from '../../src/exercises/lesson-23-ospf-all-interfaces.json';
import lesson24 from '../../src/exercises/lesson-24-ospf-cost.json';
import lesson25 from '../../src/exercises/lesson-25-capstone.json';

import type { CommandGrammar } from '@src/types';
import type { Exercise as ExerciseType } from '@src/validation/types';

const SCROLL_POSITION_KEY = 'ios-practice-scroll-position';

function PageContent({
  switchGrammar,
  _layer3Grammar,
  routerGrammar,
}: {
  switchGrammar: CommandGrammar;
  _layer3Grammar: CommandGrammar; // Catalyst 3650-24PS for Layer 3 switching lessons (future use)
  routerGrammar: CommandGrammar;
}) {
  // Use switchGrammar for L2 lessons (1-12, 14, 16)
  // Use _layer3Grammar for L3 switch lessons (13, 15, 17-20, 25) - to be wired up
  // Use routerGrammar for routing lessons (21-24)
  const grammar = switchGrammar; // Default to switch for now, will update terminals individually
  const registry = useTerminalRegistry();
  const [contentVisible, setContentVisible] = useState(false);

  // Enable interactivity features
  useProgressBar();

  // Save scroll position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Signal that initial load is complete and handle scroll restoration
  useEffect(() => {
    if (!grammar) return;

    // Signal that all terminals have had a chance to mount
    registry.finishInitialLoad();
  }, [grammar, registry]);

  // Restore scroll position when everything is ready
  useEffect(() => {
    if (!registry.isAllTerminalsReady || !grammar) return;

    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);

      // Use double requestAnimationFrame to ensure DOM is fully painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, position);
          sessionStorage.removeItem(SCROLL_POSITION_KEY);

          // Show content
          setContentVisible(true);
        });
      });
    } else {
      // No saved position, show content after DOM is ready
      requestAnimationFrame(() => {
        setContentVisible(true);
      });
    }
  }, [registry.isAllTerminalsReady, grammar]);

  return (
    <>
      {/* Loading overlay - shown while content is not ready */}
      {!contentVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
          <div className="text-gray-400">Loading terminal...</div>
        </div>
      )}

      {/* Main content - always rendered so terminals can load */}
      <div
        id="top"
        className="min-h-screen bg-gray-900"
        style={{ visibility: contentVisible ? 'visible' : 'hidden' }}
      >
        {/* Header Branding */}
        <header className="border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">💪</div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">IOS Gym</h1>
                <p className="text-sm text-gray-400">Train Your Networking Skills</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-20">
          <div id="lessons">
            <LessonCounterProvider>
              {/* INTRODUCTION */}
              <LessonSection title="Welcome, Future Network Engineer! 👋" isIntro>
                <p className="my-6 text-xl text-white">
                  You're about to learn how to configure real network devices — the computers that
                  make the internet work!
                </p>

                <p className="mb-6 text-gray-300">
                  Think of this like learning to drive, but instead of a car, you're controlling
                  routers and switches that connect the entire world. Pretty cool, right?
                </p>

                <InfoBox variant="info">
                  <h3 className="mb-3 text-lg font-semibold text-blue-300">📚 How This Works</h3>
                  <ul className="ml-5 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">Read</strong> each concept explanation
                    </li>
                    <li>
                      <strong className="text-white">Practice</strong> in the interactive terminal
                    </li>
                    <li>
                      <strong className="text-white">Scroll down</strong> to learn the next concept
                    </li>
                    <li>That's it! No tabs, no clicking around — just scroll and learn</li>
                  </ul>
                </InfoBox>

                <h2 className="mt-12 mb-8 text-3xl font-bold text-white">What You'll Master</h2>
                <div className="my-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <SkillCard
                    icon="🎯"
                    title="CLI Navigation"
                    description="Modes, commands, tab completion"
                  />
                  <SkillCard icon="🔐" title="Security" description="Passwords, SSH, encryption" />
                  <SkillCard
                    icon="🌐"
                    title="IP Addressing"
                    description="IPv4, /30 subnets, gateways"
                  />
                  <SkillCard
                    icon="🏢"
                    title="VLANs & SVIs"
                    description="Access ports, inter-VLAN routing"
                  />
                  <SkillCard
                    icon="🔗"
                    title="Trunk Ports"
                    description="Allow all vs restricted VLANs"
                  />
                  <SkillCard
                    icon="⚡"
                    title="Layer 3 Switching"
                    description="Routed ports, point-to-point links"
                  />
                  <SkillCard
                    icon="🔄"
                    title="OSPF Routing"
                    description="Multiple networks, areas"
                  />
                  <SkillCard
                    icon="⚙️"
                    title="Path Control"
                    description="OSPF costs, primary/backup paths"
                  />
                </div>
              </LessonSection>

              {/* LESSON 1: NAVIGATING MODES */}
              <LessonSection title="Navigating Between Modes">
                <p className="my-6 text-lg text-gray-200">
                  Let's start with the basics. Every network device has different{' '}
                  <strong className="text-white">"modes"</strong> — like different levels of access.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-bold text-blue-400">
                  Understanding the Prompt
                </h2>
                <p className="mb-6 text-gray-300">
                  The prompt (the text before where you type) tells you where you are:
                </p>

                <div className="my-6 space-y-3">
                  <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4 sm:flex-row sm:items-center">
                    <code className="w-full rounded bg-gray-900 px-3 py-2 font-mono text-blue-400 sm:w-auto sm:min-w-[180px]">
                      Switch&gt;
                    </code>
                    <span className="text-sm text-gray-400">User mode — Limited access</span>
                  </div>
                  <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4 sm:flex-row sm:items-center">
                    <code className="w-full rounded bg-gray-900 px-3 py-2 font-mono text-blue-400 sm:w-auto sm:min-w-[180px]">
                      Switch#
                    </code>
                    <span className="text-sm text-gray-400">Privileged mode — More access</span>
                  </div>
                  <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4 sm:flex-row sm:items-center">
                    <code className="w-full rounded bg-gray-900 px-3 py-2 font-mono text-blue-400 sm:w-auto sm:min-w-[180px]">
                      Switch(config)#
                    </code>
                    <span className="text-sm text-gray-400">
                      Configuration mode — Where you make changes
                    </span>
                  </div>
                </div>

                <h2 className="mt-12 mb-4 text-2xl font-bold text-blue-400">
                  Moving Between Modes
                </h2>
                <p className="mb-6 text-gray-300">
                  You'll use these commands constantly to navigate between modes:
                </p>

                <div className="my-6 space-y-3">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <code className="font-mono text-blue-400">enable</code>
                    <p className="mt-2 text-sm text-gray-400">
                      Moves from user mode (<code>&gt;</code>) to privileged mode (<code>#</code>)
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <code className="font-mono text-blue-400">configure terminal</code>
                    <p className="mt-2 text-sm text-gray-400">
                      Moves from privileged mode (<code>#</code>) to configuration mode (
                      <code>(config)#</code>)
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <code className="font-mono text-blue-400">exit</code>
                    <p className="mt-2 text-sm text-gray-400">Goes back one level at a time</p>
                  </div>
                </div>

                <h2 className="mt-12 mb-4 text-2xl font-bold text-blue-400">What is CNTL/Z?</h2>
                <p className="mb-6 text-gray-300">
                  When you enter configuration mode with <code>configure terminal</code>, Cisco IOS
                  displays:
                </p>
                <div className="my-6 overflow-x-auto rounded-lg border border-gray-600 bg-gray-800 p-4 font-mono text-sm text-gray-300">
                  Switch#configure terminal
                  <br />
                  <span className="text-yellow-300">
                    Enter configuration commands, one per line. End with CNTL/Z.
                  </span>
                  <br />
                  Switch(config)#
                </div>
                <p className="mb-6 text-gray-300">
                  <strong className="text-white">CNTL/Z</strong> (also written as Ctrl+Z) is a
                  keyboard shortcut on real Cisco devices that instantly exits configuration mode
                  and returns you to privileged mode.
                </p>

                <InfoBox variant="important">
                  <p className="mb-3 font-semibold text-yellow-200">
                    ⚠️ About CNTL/Z in Simulators
                  </p>
                  <p className="mb-3 text-gray-300">
                    While real Cisco switches support Ctrl+Z, it's{' '}
                    <strong className="text-white">NOT supported</strong> in this simulator or in
                    Cisco Packet Tracer (the most popular network simulator).
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Best Practice:</strong> Use the <code>end</code>{' '}
                    command instead. It does the exact same thing and works everywhere — real
                    devices, Packet Tracer, and this simulator!
                  </p>
                </InfoBox>

                <div className="my-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-blue-600 bg-gray-800 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-blue-300">
                      Using exit (Step by step)
                    </h4>
                    <div className="space-y-1 font-mono text-sm text-gray-300">
                      <div>
                        Switch(config)#<span className="text-green-400">exit</span>
                      </div>
                      <div>Switch#</div>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">Goes back one level at a time</p>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-gray-800 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-green-300">
                      Using end (Recommended ✓)
                    </h4>
                    <div className="space-y-1 font-mono text-sm text-gray-300">
                      <div>
                        Switch(config)#<span className="text-green-400">end</span>
                      </div>
                      <div>Switch#</div>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">Jumps directly to privileged mode</p>
                  </div>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>
                        <strong className="text-green-300">
                          Use <code>end</code>
                        </strong>{' '}
                        to quickly exit any configuration mode and return to privileged mode
                      </li>
                      <li>
                        The <code>end</code> command works from <em>any</em> configuration mode —
                        global config, interface config, router config, etc.
                      </li>
                      <li>
                        Use <code>exit</code> when you want to go back one level at a time (more
                        methodical)
                      </li>
                      <li>
                        Use <code>end</code> when you want to jump straight to privileged mode
                        (faster)
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Try It Now
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Practice moving between modes in the terminal below:
                </p>

                <Exercise exercise={lesson03 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>Notice how the prompt changes as you move between modes</li>
                      <li>Pay attention to the prompt — it tells you exactly where you are!</li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 2: TAB COMPLETION */}
              <LessonSection title="The Magic TAB Key ✨">
                <p className="my-6 text-xl text-gray-200">
                  One of the most powerful tools in your CLI toolkit is the <kbd>TAB</kbd> key. It
                  saves time and prevents mistakes!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What Does TAB Do?</h2>
                <p className="mb-6 text-lg text-gray-300">
                  Pressing <kbd>TAB</kbd> does two amazing things:
                </p>

                <div className="my-8 space-y-4">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 text-lg font-semibold text-white">
                      1. Auto-Completes Commands
                    </h4>
                    <p className="mb-3 text-gray-300">
                      Type part of a command and press <kbd>TAB</kbd> to complete it automatically.
                    </p>
                    <div className="mt-3 rounded bg-gray-900 p-4">
                      <p className="mb-2 text-gray-400">Example:</p>
                      <p className="font-mono text-green-400">Switch# conf{'<TAB>'}</p>
                      <p className="mt-2 text-gray-400">
                        → Completes to: <code className="text-blue-400">configure</code>
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 text-lg font-semibold text-white">
                      2. Shows Available Options
                    </h4>
                    <p className="mb-3 text-gray-300">
                      If multiple commands match, pressing <kbd>TAB</kbd> twice shows all options.
                    </p>
                    <div className="mt-3 rounded bg-gray-900 p-4">
                      <p className="mb-2 text-gray-400">Example:</p>
                      <p className="font-mono text-green-400">Switch# sh{'<TAB><TAB>'}</p>
                      <p className="mt-2 text-gray-400">
                        → Shows: <code className="text-blue-400">show</code>,{' '}
                        <code className="text-blue-400">shutdown</code>, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      Press <kbd>TAB</kbd> at any time to auto-complete commands or see options!
                    </p>
                    <p className="text-gray-300">
                      This is the #1 trick professionals use. It prevents typos and speeds you up.
                    </p>
                  </ProTip>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What If TAB Doesn't Do Anything?
                </h2>
                <p className="mb-6 text-lg text-gray-300">
                  <kbd>TAB</kbd> is also smart about <strong>what mode you're in</strong>. If you
                  try to use a command that's not available in your current mode, <kbd>TAB</kbd>{' '}
                  won't complete it!
                </p>

                <div className="my-8 rounded-lg border border-yellow-500/50 bg-gray-800 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-yellow-400">
                    <span>⚠️</span> TAB as Your Safety Net
                  </h4>
                  <p className="mb-4 text-gray-300">
                    If <kbd>TAB</kbd> doesn't complete your command, it's usually because:
                  </p>
                  <ul className="ml-6 list-disc space-y-3 text-gray-300">
                    <li>
                      <strong>You're in the wrong mode</strong> — The command isn't available where
                      you are
                    </li>
                    <li>
                      <strong>You mistyped</strong> — The command doesn't exist or has a typo
                    </li>
                    <li>
                      <strong>More input is needed</strong> — The command needs additional
                      parameters
                    </li>
                  </ul>
                </div>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-900 p-6">
                  <h4 className="mb-4 text-lg font-semibold text-white">Example: Wrong Mode</h4>
                  <p className="mb-4 text-gray-400">
                    Let's say you forgot to type <code>enable</code> first:
                  </p>
                  <div className="rounded bg-black p-4 font-mono">
                    <p className="text-green-400">
                      Switch&gt; conf<span className="text-gray-500">&lt;TAB&gt;</span>
                    </p>
                    <p className="mt-2 text-gray-500 italic">...nothing happens...</p>
                  </div>
                  <p className="mt-4 text-gray-300">
                    <kbd>TAB</kbd> won't complete <code>configure</code> because that command only
                    works in <strong>privileged mode</strong> (Switch#), not user mode (Switch&gt;).
                    This is <kbd>TAB</kbd> protecting you from making a mistake!
                  </p>

                  <div className="mt-6 rounded bg-black p-4 font-mono">
                    <p className="mb-2 text-gray-400">✅ The correct sequence:</p>
                    <p className="text-green-400">Switch&gt; enable</p>
                    <p className="mt-1 text-green-400">
                      Switch# conf<span className="text-gray-500">&lt;TAB&gt;</span>
                    </p>
                    <p className="mt-1 text-blue-400">
                      Switch# configure <span className="text-gray-500">← Now it works!</span>
                    </p>
                  </div>
                </div>

                <InfoBox variant="warning">
                  <div className="text-gray-300">
                    <p className="mb-2 font-semibold text-yellow-400">💡 Pro Tip</p>
                    <p>
                      Use <kbd>TAB</kbd> as you type to <strong>validate</strong> you're using the
                      right command in the right mode. If it doesn't complete, stop and check your
                      mode prompt!
                    </p>
                  </div>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Try It Now
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Practice using TAB completion in the terminal below:
                </p>

                <Exercise exercise={lesson04 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>
                        Use <kbd>TAB</kbd> liberally — it's not cheating, it's smart!
                      </li>
                      <li>
                        TAB completion works at any mode level — user, privileged, or configuration
                      </li>
                      <li>
                        If <kbd>TAB</kbd> doesn't work, it's telling you something! Check your mode
                        and command.
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 3: PAGINATION IN SHOW COMMANDS */}
              <LessonSection title="Understanding Paginated Output 📄">
                <p className="my-6 text-xl text-gray-200">
                  Some commands display a lot of information — so much that it would scroll off your
                  screen! IOS has a built-in feature called{' '}
                  <strong className="text-blue-300">pagination</strong> to help you read long output
                  one page at a time.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What is Pagination?</h2>
                <p className="mb-6 text-lg text-gray-300">
                  When a command has more than one screen's worth of output, IOS automatically
                  pauses and shows <code>--More--</code> at the bottom. This gives you time to read
                  before continuing.
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-900 p-6">
                  <p className="mb-4 font-semibold text-gray-400">
                    Example: Running a long command
                  </p>
                  <div className="rounded bg-black p-4 font-mono text-sm">
                    <p className="text-green-400">Switch# show running-config</p>
                    <p className="mt-2 text-gray-300">Building configuration...</p>
                    <p className="text-gray-300">!</p>
                    <p className="text-gray-300">hostname Switch</p>
                    <p className="text-gray-300">!</p>
                    <p className="text-gray-300">vlan 1</p>
                    <p className="text-gray-500 italic">...many more lines...</p>
                    <p className="text-gray-300">interface g0/1</p>
                    <p className="text-gray-300"> switchport mode access</p>
                    <p className="text-gray-500 italic">...many more lines...</p>
                    <p className="mt-2 font-bold text-yellow-400">--More--</p>
                  </div>
                  <p className="mt-4 text-gray-400 italic">
                    The <code className="text-yellow-400">--More--</code> prompt means: "There's
                    more to see! What would you like to do?"
                  </p>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Controlling Pagination
                </h2>
                <p className="mb-6 text-lg text-gray-300">
                  When you see <code>--More--</code>, you have three options:
                </p>

                <div className="my-8 space-y-4">
                  <div className="rounded-lg border border-blue-500/50 bg-gray-800 p-6">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-400">
                      <kbd className="rounded bg-gray-700 px-3 py-1">SPACE</kbd> Show Next Page
                    </h4>
                    <p className="text-gray-300">
                      Press the <kbd>SPACE</kbd> bar to display the next full page of output (about
                      20 lines). This is the most common option — you're basically saying "show me
                      more!"
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-500/50 bg-gray-800 p-6">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-green-400">
                      <kbd className="rounded bg-gray-700 px-3 py-1">ENTER</kbd> Show Next Line
                    </h4>
                    <p className="text-gray-300">
                      Press <kbd>ENTER</kbd> to display just one more line of output. Use this when
                      you want to read slowly, line by line.
                    </p>
                  </div>

                  <div className="rounded-lg border border-red-500/50 bg-gray-800 p-6">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-400">
                      <kbd className="rounded bg-gray-700 px-3 py-1">Q</kbd> Quit (Cancel)
                    </h4>
                    <p className="text-gray-300">
                      Press <kbd>Q</kbd> to quit and return to the command prompt immediately. This
                      is useful when you've already found what you're looking for and don't need to
                      see the rest.
                    </p>
                  </div>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-3 text-gray-300">
                      <strong className="text-white">Pro Tip:</strong> The <kbd>SPACE</kbd> bar is
                      your best friend when reading long output!
                    </p>
                    <p className="text-gray-300">
                      Think of pagination like flipping through pages in a book — you control the
                      pace and can stop whenever you want.
                    </p>
                  </ProTip>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Your First Paginated Command
                </h2>
                <p className="mb-6 text-lg text-gray-300">
                  The <code>show running-config</code> command displays your device's complete
                  configuration. It's one of the most important commands in IOS — and it's usually
                  long enough to trigger pagination!
                </p>

                <div className="my-8 rounded-lg border border-blue-500/50 bg-blue-900/30 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-300">
                    <span>💡</span> What You'll See
                  </h4>
                  <p className="mb-4 text-gray-300">
                    When you run <code>show running-config</code>, IOS displays:
                  </p>
                  <ul className="ml-6 list-disc space-y-2 text-gray-300">
                    <li>Your device's hostname</li>
                    <li>Any passwords you've configured</li>
                    <li>All VLANs and their settings</li>
                    <li>All interface configurations</li>
                    <li>Routing settings (if any)</li>
                    <li>...and much more!</li>
                  </ul>
                  <p className="mt-4 text-gray-300">
                    Right now, your device doesn't have much configuration yet, but the output will
                    still be long enough to see pagination in action.
                  </p>
                </div>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Try It Now
                </h3>
                <p className="mb-8 text-lg text-gray-300">Practice navigating paginated output:</p>

                <Exercise exercise={lesson05 as ExerciseType} grammar={grammar} />

                <InfoBox variant="success">
                  <div className="text-gray-300">
                    <p className="mb-3 text-lg font-semibold text-green-400">
                      ✓ You succeeded when:
                    </p>
                    <ul className="ml-6 space-y-2">
                      <li>
                        You saw the <code className="text-yellow-400">--More--</code> prompt appear
                      </li>
                      <li>
                        You were able to control the output using <kbd>SPACE</kbd>, <kbd>ENTER</kbd>
                        , or <kbd>Q</kbd>
                      </li>
                      <li>
                        You understand that pagination helps you read long output without
                        information scrolling away
                      </li>
                    </ul>
                  </div>
                </InfoBox>

                <div className="my-8 rounded-lg border border-yellow-500/50 bg-yellow-900/30 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-yellow-300">
                    <span>⚠️</span> Common Confusion
                  </h4>
                  <p className="mb-3 text-gray-300">
                    <strong>Question:</strong> "Why can't I type commands when I see --More--?"
                  </p>
                  <p className="mb-4 text-gray-300">
                    <strong>Answer:</strong> When <code>--More--</code> is displayed, you're in{' '}
                    <strong>pagination mode</strong>. The CLI is waiting for you to tell it how to
                    continue (SPACE, ENTER, or Q). You can't type regular commands until you exit
                    pagination mode — either by pressing <kbd>Q</kbd> or by viewing all the output.
                  </p>
                  <p className="text-gray-300 italic">
                    Think of it like watching a video: you can pause, play, or skip, but you can't
                    do other things until you're done or you press stop!
                  </p>
                </div>

                <div className="my-8 rounded-lg border border-orange-500/50 bg-orange-900/30 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-300">
                    <span>🖱️</span> Important: No Keyboard Shortcut to Scroll Up!
                  </h4>
                  <p className="mb-4 text-gray-300">
                    <strong>There's no keyboard shortcut to scroll back up</strong> in the terminal
                    once text has scrolled past. If you want to review what you've already seen,
                    you'll need to use your <strong>mouse or trackpad</strong> to scroll up in the
                    terminal window.
                  </p>
                  <p className="mb-4 text-gray-300">
                    This is why it's important to advance through paginated output{' '}
                    <strong>thoughtfully</strong>:
                  </p>
                  <ul className="ml-6 list-disc space-y-2 text-gray-300">
                    <li>
                      Use <kbd>ENTER</kbd> to advance line-by-line when you want to read carefully
                    </li>
                    <li>
                      Use <kbd>SPACE</kbd> for full pages when you're comfortable with the pace
                    </li>
                    <li>
                      If you accidentally scroll too fast, you'll need to use your mouse to scroll
                      back up
                    </li>
                    <li>
                      Or press <kbd>Q</kbd> and run the command again!
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-300 italic">
                    💡 <strong>Pro tip:</strong> When in doubt, go slower with <kbd>ENTER</kbd>{' '}
                    rather than faster with <kbd>SPACE</kbd> — it's easier to speed up than to
                    scroll back!
                  </p>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>
                        <code>show running-config</code> is your window into what's actually
                        configured on the device
                      </li>
                      <li>Get in the habit of running it frequently to verify your changes</li>
                      <li>
                        Many show commands trigger pagination — now you know how to navigate them!
                      </li>
                      <li>
                        If output is too long and annoying, just press <kbd>Q</kbd> to quit
                      </li>
                      <li>
                        <strong>Quick tip:</strong> Use <code>show ip interface brief</code> when
                        you just need to check interface IPs and status without all the config
                        details!
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 4: SETTING HOSTNAME */}
              <LessonSection title="Giving Your Device a Name">
                <p className="my-6 text-xl text-gray-200">
                  Just like you name your phone "Brian's iPhone", network devices need names too!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What's a Hostname?</h2>
                <p className="mb-6 text-lg text-gray-300">
                  The hostname is your device's name. It appears in the prompt and helps identify
                  which device you're working on. In a real network, you might have dozens of
                  switches — good names help you stay organized!
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <Diagram title="Before">
                    {`┌─────────────┐
│   Switch    │  ← Generic
└─────────────┘`}
                  </Diagram>

                  <Diagram title="After">
                    {`┌──────────────────────┐
│  MyFirstSwitch       │  ← Your name!
└──────────────────────┘`}
                  </Diagram>
                </div>

                <h2 className="mt-16 mb-6 text-3xl font-bold text-blue-400">Saving Your Work</h2>

                <InfoBox variant="important">
                  <p className="mb-2 text-lg font-semibold text-red-200">⚠️ CRITICAL:</p>
                  <p className="mb-3 text-gray-200">
                    Changes in Cisco IOS are NOT saved automatically!
                  </p>
                  <p className="text-gray-300">
                    You must use <code>write memory</code> to save, or your changes disappear when
                    the device restarts.
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure your first device - try it with commands shown, then hide them and try
                  again:
                </p>

                <Exercise exercise={lesson01 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <p className="text-gray-300">
                      The <code>show running-config</code> command displays ALL configuration on
                      your device. It's one of the most important commands you'll use — network
                      engineers check it constantly to verify their work!
                    </p>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON: ABORTING NAME LOOKUP */}
              <LessonSection title="What to Do When Things Freeze 🚨">
                <p className="my-6 text-xl text-gray-200">
                  You'll sometimes type a command incorrectly or in the wrong mode, and something
                  unexpected happens — the CLI seems to{' '}
                  <strong className="text-red-300">freeze</strong> for what feels like forever!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">The Mystery Freeze</h2>
                <p className="mb-6 text-lg text-gray-300">
                  Here's what commonly happens to beginners:
                </p>

                <div className="my-8 rounded-lg border border-yellow-600 bg-gray-800 p-6">
                  <p className="mb-3 text-gray-400">You type a command in the wrong place:</p>
                  <Diagram>{`Switch> end`}</Diagram>
                  <p className="mt-4 text-gray-400">Then you see this confusing message:</p>
                  <Diagram>
                    {`Translating "end"...domain server (255.255.255.255)
% Name lookup aborted`}
                  </Diagram>
                  <p className="mt-4 font-semibold text-yellow-300">
                    And your terminal is stuck for 5 seconds! 😰
                  </p>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What's Happening?</h2>
                <p className="mb-6 text-gray-300">
                  When IOS doesn't recognize what you typed as a valid command, it thinks you might
                  be trying to connect to another device by hostname. So it tries to look up that
                  name using <strong className="text-white">DNS</strong> (Domain Name System) — just
                  like your web browser looks up website names.
                </p>

                <div className="my-8 rounded-lg border border-blue-600 bg-blue-900 p-6">
                  <h4 className="mb-3 text-lg font-semibold text-blue-300">
                    Why Does This Happen?
                  </h4>
                  <p className="mb-4 text-gray-300">
                    Cisco devices have a helpful feature: if you type a word that isn't a command,
                    it assumes you want to
                    <strong className="text-cyan-300"> telnet</strong> to another device with that
                    name. But since there's probably no DNS server configured, it has to{' '}
                    <strong className="text-yellow-300">wait until the lookup times out</strong>.
                  </p>
                  <div className="mt-4 rounded-lg bg-gray-800 p-4">
                    <p className="mb-2 text-sm text-gray-400">Common mistakes that trigger this:</p>
                    <ul className="ml-6 space-y-1 text-sm text-gray-300">
                      <li>
                        • Typing <code>end</code> in User mode (it only works in Config mode)
                      </li>
                      <li>
                        • Misspelling commands: <code>cofigure</code> instead of{' '}
                        <code>configure</code>
                      </li>
                      <li>
                        • Typing Linux/Windows commands by mistake: <code>ls</code>,{' '}
                        <code>dir</code>, <code>clear</code>
                      </li>
                    </ul>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-red-400">The Timeout Problem</h2>
                <p className="mb-6 text-gray-300">
                  A <strong className="text-white">timeout</strong> is when your device waits for a
                  response that never comes. In this case, IOS is waiting for a DNS server to
                  respond, but:
                </p>
                <ul className="mb-6 ml-8 list-disc space-y-3 text-gray-300">
                  <li>There probably isn't a DNS server configured</li>
                  <li>Even if there is one, it won't know what "end" or your typo means</li>
                  <li>
                    So IOS waits... and waits... until it gives up (typically 5 seconds in this
                    simulator)
                  </li>
                </ul>

                <InfoBox variant="important">
                  <p className="mb-2 text-lg font-semibold text-red-200">⏱️ Don't Just Wait!</p>
                  <p className="text-gray-300">
                    While 5 seconds doesn't sound like much, it feels like an eternity when you're
                    working. And if you keep making typos, those delays add up fast!
                  </p>
                </InfoBox>

                <h2 className="mt-16 mb-6 text-3xl font-bold text-green-400">
                  The Escape Sequence: CTRL+SHIFT+6
                </h2>
                <p className="mb-6 text-lg text-gray-300">
                  Here's the <strong className="text-green-300">secret trick</strong> every Cisco
                  engineer knows:
                </p>

                <div className="my-8 rounded-lg border-2 border-green-500 bg-green-900 p-8">
                  <div className="mb-6 text-center">
                    <p className="mb-4 text-2xl font-bold text-green-200">
                      Press these keys together:
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <kbd className="rounded-lg border-2 border-gray-600 bg-gray-800 px-6 py-4 font-mono text-3xl text-white shadow-lg">
                        CTRL
                      </kbd>
                      <span className="text-3xl text-white">+</span>
                      <kbd className="rounded-lg border-2 border-gray-600 bg-gray-800 px-6 py-4 font-mono text-3xl text-white shadow-lg">
                        SHIFT
                      </kbd>
                      <span className="text-3xl text-white">+</span>
                      <kbd className="rounded-lg border-2 border-gray-600 bg-gray-800 px-6 py-4 font-mono text-3xl text-white shadow-lg">
                        6
                      </kbd>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-lg text-gray-300">
                    This is called the{' '}
                    <strong className="text-yellow-300">"escape sequence"</strong> — it immediately
                    stops whatever the device is doing and gives you back control!
                  </p>
                </div>

                <div className="my-8 rounded-lg bg-gray-800 p-6">
                  <h4 className="mb-4 text-lg font-semibold text-white">How It Works:</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">1️⃣</span>
                      <div>
                        <p className="text-gray-300">
                          You type a bad command and see "Translating..."
                        </p>
                        <code className="text-sm text-red-400">
                          Translating "end"...domain server (255.255.255.255)
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">2️⃣</span>
                      <div>
                        <p className="text-gray-300">
                          Instead of waiting, press <kbd>CTRL+SHIFT+6</kbd>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">3️⃣</span>
                      <div>
                        <p className="text-gray-300">You immediately see:</p>
                        <code className="text-sm text-yellow-400">% Name lookup aborted</code>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">4️⃣</span>
                      <div>
                        <p className="text-gray-300">
                          The prompt returns and you can keep working! 🎉
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-3 text-gray-300">
                      <strong>Why these specific keys?</strong> <kbd>CTRL+SHIFT+6</kbd> is Cisco's
                      universal "interrupt" signal. It works for aborting not just DNS lookups, but
                      also ping commands, traceroutes, and other operations you want to stop early.
                    </p>
                    <p className="text-gray-300">
                      <strong>Important:</strong> You must press all three keys together —{' '}
                      <kbd>CTRL</kbd>,<kbd>SHIFT</kbd>, and <kbd>6</kbd>. Just <kbd>CTRL+6</kbd>{' '}
                      won't work! This makes it harder to trigger accidentally while you're typing
                      commands.
                    </p>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Try It Now
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Let's deliberately trigger this error so you can practice escaping from it:
                </p>

                <Exercise exercise={lesson06 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-blue-600 bg-blue-900 p-6">
                  <p className="mb-3 text-lg font-semibold text-blue-300">💡 Key Takeaway</p>
                  <p className="mb-3 text-gray-300">
                    When you see "Translating..." appear after typing a command:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>✓ You probably typed the command in the wrong mode or misspelled it</li>
                    <li>✓ IOS is trying to interpret it as a hostname to connect to</li>
                    <li>
                      ✓ Press <kbd>CTRL+SHIFT+6</kbd> immediately to abort the lookup
                    </li>
                    <li>✓ Check your spelling and make sure you're in the right mode!</li>
                  </ul>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">🎯 Real-World Wisdom</p>
                  <p className="text-gray-300">
                    Every network engineer has hit this problem hundreds of times. The mark of a
                    professional isn't avoiding mistakes — it's knowing <kbd>CTRL+SHIFT+6</kbd> by
                    heart so you can recover instantly! This keystroke will become muscle memory
                    very quickly.
                  </p>
                </InfoBox>
              </LessonSection>

              {/* LESSON: COMMAND HISTORY */}
              <LessonSection title="Command History: Never Retype Again! ⬆️">
                <p className="my-6 text-xl text-gray-200">
                  You've learned to abort mistakes with <kbd>CTRL+SHIFT+6</kbd>. Now let's learn how
                  to quickly retry the corrected command without retyping everything!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Power of Arrow Keys
                </h2>
                <p className="mb-6 text-gray-300">
                  Every command you type is automatically saved in your{' '}
                  <strong className="text-white">command history</strong>. You can recall any
                  previous command with just the arrow keys!
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-blue-600 bg-blue-900 p-6">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-300">
                      <kbd className="rounded bg-gray-700 px-3 py-1">↑</kbd> UP Arrow
                    </h4>
                    <p className="text-gray-300">
                      Press <kbd>UP</kbd> to recall your previous command. Press it again to go
                      further back in history.
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-green-300">
                      <kbd className="rounded bg-gray-700 px-3 py-1">↓</kbd> DOWN Arrow
                    </h4>
                    <p className="text-gray-300">
                      Press <kbd>DOWN</kbd> to move forward through history toward more recent
                      commands.
                    </p>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Why This Matters</h2>
                <p className="mb-4 text-gray-300">
                  Imagine you typed a long command but made one small mistake:
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-900 p-6">
                  <p className="mb-3 font-mono text-red-400">
                    Switch(config)# interfce gigabitethernet 1/0/1
                  </p>
                  <p className="mb-3 text-gray-400">
                    Oops! You typed <code className="text-red-400">interfce</code> instead of{' '}
                    <code className="text-green-400">interface</code>
                  </p>
                  <p className="mt-6 mb-2 text-gray-300">
                    <strong className="text-white">Without command history:</strong> Retype the
                    entire thing 😫
                  </p>
                  <p className="mt-4 mb-2 text-gray-300">
                    <strong className="text-white">With command history:</strong> Press{' '}
                    <kbd>UP</kbd>, fix the typo, press <kbd>ENTER</kbd> ✨
                  </p>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>
                        Command history works across all modes — commands from user mode are still
                        available in privileged or config mode!
                      </li>
                      <li>
                        The CLI remembers dozens of commands, so you can go way back if needed
                      </li>
                      <li>
                        This is especially useful for complex commands you'll run multiple times
                        (like configuring multiple interfaces)
                      </li>
                      <li>
                        <strong className="text-white">Pro tip:</strong> Press <kbd>UP</kbd>, edit
                        part of the command, then press <kbd>ENTER</kbd> — much faster than
                        retyping!
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Try It Now
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Practice using command history to save time:
                </p>

                <Exercise exercise={lesson07 as ExerciseType} grammar={grammar} />

                <InfoBox variant="real-world">
                  <h4 className="mb-2 font-semibold text-blue-300">🌍 Real-World Usage</h4>
                  <p className="text-gray-300">
                    Network engineers use command history constantly! When configuring 48 ports with
                    similar settings, you'll press <kbd>UP</kbd> and modify the interface number
                    rather than typing the full command 48 times. It's a massive time-saver!
                  </p>
                </InfoBox>
              </LessonSection>

              {/* LESSON 4: ENABLE SECRET */}
              <LessonSection title="Security: Adding a Password">
                <p className="my-6 text-xl text-gray-200">
                  Without a password, anyone can access and change your device. Let's lock it down!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Why Passwords Matter
                </h2>
                <p className="mb-4 text-gray-300">
                  Imagine if anyone could reconfigure your school's network. They could:
                </p>
                <ul className="ml-8 list-disc space-y-2 text-gray-300">
                  <li>Block internet access for everyone</li>
                  <li>See private traffic</li>
                  <li>Create security holes</li>
                  <li>Cause chaos!</li>
                </ul>

                <p className="mt-6 text-gray-300">
                  The <code>enable secret</code> command sets a password to enter privileged mode.
                  It's encrypted (scrambled) so even if someone sees the configuration file, they
                  can't read your password.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-red-600 bg-red-900 p-6">
                    <h4 className="mb-3 font-semibold text-red-300">❌ Without Password</h4>
                    <Diagram>
                      {`Anyone → Switch → Full access!
      (No protection)`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">✅ With Password</h4>
                    <Diagram>
                      {`You → Password → Switch → Secure!
    (Protected)`}
                    </Diagram>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Password Best Practices
                </h2>

                <InfoBox variant="info">
                  <p className="mb-3 font-semibold text-green-200">Good passwords have:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>Mix of uppercase and lowercase letters</li>
                    <li>Numbers</li>
                    <li>Special characters (!@#$%)</li>
                    <li>At least 8 characters</li>
                  </ul>
                  <p className="mt-4 text-gray-300">
                    Example: <code>C1sc0R0ck$</code> (notice the 1 is number one, 0 is zero)
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">Add security to your device:</p>

                <Exercise exercise={lesson02 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-3 text-gray-300">
                      You can view your configuration with <code>show running-config</code>. Try it!
                    </p>
                    <p className="mb-3 text-gray-300">
                      <strong className="text-yellow-300">In this simulator:</strong> You'll see the
                      password in plain text (e.g., <code>enable secret cisco</code>).
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-green-300">On a real Cisco device:</strong> The
                      password would be encrypted and show as a long scrambled hash like{' '}
                      <code>enable secret 5 $1$mERr$hx5rVt7...</code> — this protects the password
                      even if someone sees your configuration file!
                    </p>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 5: PASSWORD ENTRY EXPERIENCE */}
              <LessonSection title="Understanding Password Entry in IOS">
                <p className="my-6 text-xl text-gray-200">
                  Now that you've set a password, let's experience what it's like to use it. This is
                  where many students get confused!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Big Surprise: You Won't See Anything!
                </h2>
                <p className="mb-6 text-gray-300">
                  When you type a password on a website, you usually see asterisks (
                  <code>********</code>) or dots (<code>••••••••</code>). This gives you feedback
                  that you're typing.
                </p>

                <p className="mb-6 text-gray-300">
                  <strong className="text-white">But IOS is different!</strong> When you type a
                  password in the Cisco CLI, you see absolutely NOTHING. No asterisks, no dots, no
                  indication that you're typing at all.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">
                      Web Password (What you're used to)
                    </h4>
                    <Diagram>
                      {`Username: admin
Password: ••••••••
                    ↑
              You see dots!`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">Visual feedback as you type</p>
                  </div>
                  <div className="rounded-lg border border-blue-600 bg-blue-900 p-6">
                    <h4 className="mb-3 font-semibold text-blue-300">
                      IOS CLI Password (The real thing)
                    </h4>
                    <Diagram>
                      {`Switch> enable
Password: 
          ↑
    You see NOTHING!`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">No visual feedback at all</p>
                  </div>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 text-lg font-semibold text-red-200">⚠️ This is NORMAL!</p>
                  <p className="mb-3 text-gray-300">
                    The screen not showing anything when you type a password is{' '}
                    <strong className="text-white">not a bug</strong> — it's a security feature!
                  </p>
                  <p className="text-gray-300">
                    Someone looking over your shoulder can't even tell how long your password is.
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Why Does IOS Do This?
                </h2>
                <p className="mb-4 text-gray-300">There are two main security reasons:</p>
                <ul className="ml-8 list-disc space-y-3 text-gray-300">
                  <li>
                    <strong className="text-white">Password Length Privacy:</strong> If someone sees
                    asterisks, they can count them and know your password length. With no feedback,
                    they learn nothing!
                  </li>
                  <li>
                    <strong className="text-white">Console History:</strong> If the password
                    appeared on screen (even as dots), it might get saved in logs or screen
                    recordings.
                  </li>
                </ul>

                <Diagram title="Security Comparison">
                  {`With Dots:
Password: ••••••••
         ↑
Attacker sees: "8 characters long"

Without Dots:
Password: 
         ↑
Attacker sees: "Could be any length!"
`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What Happens If You Get It Wrong?
                </h2>
                <p className="mb-6 text-gray-300">
                  If you type the wrong password, IOS will simply say:
                </p>

                <div className="my-8 rounded-lg border border-red-600 bg-gray-800 p-6">
                  <code className="font-mono text-red-400">% Bad secrets</code>
                  <p className="mt-3 text-gray-400">This means: "Wrong password, try again!"</p>
                </div>

                <p className="mb-6 text-gray-300">
                  Don't panic — just type <code>enable</code> again and try entering your password
                  more carefully.
                </p>

                <InfoBox variant="important">
                  <p className="mb-3 font-semibold text-yellow-200">
                    ⚠️ Important: Understanding Password Attempts
                  </p>
                  <p className="mb-3 text-gray-300">
                    Here's something that confuses many students:{' '}
                    <strong className="text-white">
                      when you enter a password correctly, you won't see any feedback at first —
                      you'll just get prompted for the password again!
                    </strong>
                  </p>
                  <p className="mb-3 text-gray-300">
                    IOS gives you <strong className="text-white">three attempts</strong> to enter
                    the password before showing the
                    <code className="text-red-400">% Bad secrets</code> message. This means if you
                    enter the password correctly on your first or second try, you'll simply see
                    another password prompt with no indication whether you were right or wrong.
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Bottom line:</strong> If you see the{' '}
                    <code>#</code> prompt appear, your password was correct! If you see{' '}
                    <code>% Bad secrets</code>, you used up all three attempts with incorrect
                    passwords.
                  </p>
                </InfoBox>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>Type slowly and deliberately when entering passwords</li>
                      <li>
                        Remember: uppercase letters, lowercase letters, numbers, and special
                        characters ALL matter
                      </li>
                      <li>
                        If you make a mistake while typing, press Backspace — even though you can't
                        see it, it works!
                      </li>
                      <li>
                        Passwords are case-sensitive: <code>Cisco123</code> ≠ <code>cisco123</code>
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  First, you'll set up a password, then practice using it with no visual feedback:
                </p>

                <Exercise exercise={lesson08 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ You succeeded when:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      You can successfully enter privileged mode by typing the password without
                      seeing it
                    </li>
                    <li>You understand this is normal CLI behavior, not a bug</li>
                    <li>You've seen what happens when you enter the wrong password</li>
                    <li>
                      <strong className="text-cyan-300">Verify:</strong> Type{' '}
                      <code>show running-config</code> and confirm you see your password configured:
                      <div className="mt-2 ml-4 rounded-lg bg-gray-800 p-3 font-mono text-sm">
                        enable secret C1sc0R0ck$
                      </div>
                      <p className="mt-2 ml-4 text-sm text-gray-400">
                        (In a real Cisco device, this would show as an encrypted hash for security)
                      </p>
                    </li>
                  </ul>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      <strong>Get in the habit:</strong> After configuring any security feature, use{' '}
                      <code>show running-config</code> to verify it was applied correctly.
                    </p>
                    <p className="text-gray-300">
                      Professional network engineers verify everything before moving on to the next
                      task!
                    </p>
                  </ProTip>
                </InfoBox>

                <InfoBox variant="real-world">
                  <h4 className="mb-2 font-semibold text-blue-300">🌍 Real World Note</h4>
                  <p className="text-gray-300">
                    This "no visual feedback" behavior isn't just Cisco — it's common in many
                    Unix/Linux systems, enterprise networking equipment from Juniper, Arista, and
                    others. Once you get used to it, you'll feel like a pro!
                  </p>
                </InfoBox>

                <div className="my-8 rounded-lg border border-blue-600 bg-blue-900 p-6">
                  <p className="mb-3 font-semibold text-blue-200">💡 Coming Up Next</p>
                  <p className="text-gray-300">
                    Now that you know how to set configuration, you'll learn how to{' '}
                    <strong>remove</strong> it using the powerful <code>no</code> command!
                  </p>
                </div>
              </LessonSection>

              {/* LESSON: THE NO COMMAND */}
              <LessonSection title="The 'no' Command: Undoing Configuration">
                <p className="my-6 text-xl text-gray-200">
                  You've learned how to <strong>add</strong> configuration — but what if you make a
                  mistake or need to change something? Enter the{' '}
                  <code className="text-yellow-300">no</code> command: IOS's "undo button"!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">The Power of 'no'</h2>
                <p className="mb-6 text-gray-300">
                  In IOS, almost every configuration command can be reversed by putting{' '}
                  <code>no</code> in front of it. Think of it like a time machine for your device's
                  configuration!
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">Adding Configuration</h4>
                    <Diagram>
                      {`Switch(config)# hostname Router1
Switch(config)# enable secret MyPass123`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">You add settings</p>
                  </div>
                  <div className="rounded-lg border border-red-600 bg-red-900 p-6">
                    <h4 className="mb-3 font-semibold text-red-300">Removing Configuration</h4>
                    <Diagram>
                      {`Router1(config)# no hostname
Router1(config)# no enable secret`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">You remove them with 'no'</p>
                  </div>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">🎯 Key Concept</p>
                  <p className="text-gray-300">
                    The <code>no</code> command doesn't just delete things randomly — it{' '}
                    <strong>reverses specific commands</strong>. If you set something,{' '}
                    <code>no</code> unsets it. If you enabled something, <code>no</code> disables
                    it.
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">How 'no' Works</h2>
                <p className="mb-4 text-gray-300">
                  The pattern is simple: take the command you used to set something, and put{' '}
                  <code>no</code> at the front:
                </p>

                <div className="my-8 space-y-6 rounded-lg bg-gray-800 p-6">
                  <div>
                    <p className="mb-2 font-semibold text-blue-300">Setting a hostname:</p>
                    <code className="text-gray-300">hostname Lab-Router</code>
                    <p className="mt-4 mb-2 font-semibold text-green-300">Removing it:</p>
                    <code className="text-gray-300">no hostname</code>
                    <p className="mt-2 text-sm text-gray-400">→ Resets to default "Switch"</p>
                  </div>

                  <hr className="border-gray-700" />

                  <div>
                    <p className="mb-2 font-semibold text-blue-300">Setting a password:</p>
                    <code className="text-gray-300">enable secret MySecurePass</code>
                    <p className="mt-4 mb-2 font-semibold text-green-300">Removing it:</p>
                    <code className="text-gray-300">no enable secret</code>
                    <p className="mt-2 text-sm text-gray-400">→ Removes the password requirement</p>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What Happens When You Use 'no'?
                </h2>
                <p className="mb-6 text-gray-300">
                  Using <code>no</code> typically does one of two things:
                </p>

                <div className="mb-8 space-y-4">
                  <div className="border-l-4 border-blue-500 bg-gray-800 p-6">
                    <h4 className="mb-2 font-semibold text-blue-300">1. Resets to Default</h4>
                    <p className="mb-3 text-gray-300">
                      Some commands have a default value. Using <code>no</code> brings it back:
                    </p>
                    <code className="text-sm text-gray-400">no hostname</code>
                    <p className="mt-2 text-sm text-gray-400">→ Resets hostname back to "Switch"</p>
                  </div>

                  <div className="border-l-4 border-purple-500 bg-gray-800 p-6">
                    <h4 className="mb-2 font-semibold text-purple-300">2. Completely Removes</h4>
                    <p className="mb-3 text-gray-300">
                      Other commands don't have defaults — using <code>no</code> removes them
                      entirely:
                    </p>
                    <code className="text-sm text-gray-400">no enable secret</code>
                    <p className="mt-2 text-sm text-gray-400">
                      → No password required for enable (back to how it was initially)
                    </p>
                  </div>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="text-gray-300">
                      <strong>Pro Tip:</strong> When you use <code>no</code>, you typically{' '}
                      <strong>don't</strong> include the value you set. For example, use{' '}
                      <code>no hostname</code> instead of <code>no hostname Router1</code>. IOS
                      knows what you configured and will remove it!
                    </p>
                  </ProTip>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Why Is This Useful?</h2>
                <p className="mb-4 text-gray-300">
                  The <code>no</code> command is essential for several scenarios:
                </p>

                <ul className="ml-8 list-disc space-y-4 text-gray-300">
                  <li>
                    <strong className="text-white">Fixing Mistakes:</strong> Typed the wrong
                    hostname?
                    <code>no hostname</code> and start over
                  </li>
                  <li>
                    <strong className="text-white">Changing Configuration:</strong> Need to change a
                    password? Remove the old one with <code>no</code>, then set a new one
                  </li>
                  <li>
                    <strong className="text-white">Troubleshooting:</strong> Something not working?
                    Remove configuration to test if that was causing the problem
                  </li>
                  <li>
                    <strong className="text-white">Decommissioning:</strong> No longer need security
                    on a lab device?
                    <code>no enable secret</code> removes the password
                  </li>
                </ul>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Practice the complete configuration lifecycle — set something, verify it, then
                  remove it:
                </p>

                <Exercise exercise={lesson09 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ You succeeded when:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>You can set a hostname and password, then remove both</li>
                    <li>
                      You used <code>show running-config</code> to verify configuration before and
                      after using <code>no</code> commands
                    </li>
                    <li>
                      You understand that <code>no hostname</code> resets to "Switch" (default)
                    </li>
                    <li>
                      You understand that <code>no enable secret</code> removes password protection
                    </li>
                    <li>
                      You verified the password was removed by using <code>enable</code> without
                      being prompted
                    </li>
                  </ul>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      <strong>Professional Workflow:</strong> Network engineers always verify their
                      changes with <code>show</code> commands before moving on.
                    </p>
                    <p className="text-gray-300">
                      Make it a habit: Configure → Show → Verify → Save!
                    </p>
                  </ProTip>
                </InfoBox>

                <InfoBox variant="real-world">
                  <h4 className="mb-2 font-semibold text-blue-300">🌍 Real World Application</h4>
                  <p className="mb-3 text-gray-300">
                    Network engineers use the <code>no</code> command constantly:
                  </p>
                  <ul className="ml-6 list-disc space-y-2 text-gray-300">
                    <li>Removing old VLANs that are no longer used</li>
                    <li>
                      Disabling interfaces for security (and re-enabling them later with{' '}
                      <code>no shutdown</code>)
                    </li>
                    <li>Cleaning up routing configuration</li>
                    <li>Removing access control lists (ACLs) for testing</li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    Master the <code>no</code> command now, and you'll save yourself hours of
                    frustration later!
                  </p>
                </InfoBox>

                <div className="my-8 rounded-lg border border-blue-600 bg-blue-900 p-6">
                  <p className="mb-3 font-semibold text-blue-200">💡 Coming Up Next</p>
                  <p className="text-gray-300">
                    Now that you can both add and remove configuration, you're ready to learn about
                    sub-configuration modes — configurations within configurations!
                  </p>
                </div>
              </LessonSection>

              {/* LESSON 6: SUB-CONFIGURATION MODES */}
              <LessonSection title="Working with Sub-Configuration Modes">
                <p className="my-6 text-xl text-gray-200">
                  So far you've worked with two modes: privileged (<code>#</code>) and global config
                  (<code>(config)#</code>). Now you'll learn about{' '}
                  <strong className="text-white">sub-configuration modes</strong> — configurations
                  within configurations! There are different kinds of sub-config modes for
                  interfaces, VLANs, routing protocols, and more — each with its own unique prompt.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Understanding Configuration Layers
                </h2>
                <p className="mb-6 text-gray-300">
                  When you configure specific parts of a device (like interfaces, routing protocols,
                  or VTY lines), you enter a{' '}
                  <strong className="text-white">sub-configuration mode</strong>. This creates
                  multiple layers you need to navigate through — like nested folders on your
                  computer!
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-900 p-8">
                  <h4 className="mb-6 text-center font-semibold text-blue-300">
                    Configuration Layers (Think: Nested Boxes)
                  </h4>

                  {/* Layer 1: Privileged Mode */}
                  <div className="rounded-lg border-2 border-blue-500 bg-blue-950 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-3xl">📦</span>
                      <div>
                        <p className="font-mono text-lg text-blue-300">Switch#</p>
                        <p className="text-sm text-gray-400">Layer 1: Privileged Mode</p>
                      </div>
                    </div>

                    <div className="mb-4 ml-8 text-gray-400">
                      <code>configure terminal</code> ↓
                    </div>

                    {/* Layer 2: Global Config Mode */}
                    <div className="ml-8 rounded-lg border-2 border-green-500 bg-green-950 p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-3xl">📦</span>
                        <div>
                          <p className="font-mono text-lg text-green-300">Switch(config)#</p>
                          <p className="text-sm text-gray-400">
                            Layer 2: Global Configuration Mode
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 ml-8 text-gray-400">
                        <code>interface vlan 1</code> ↓
                      </div>

                      {/* Layer 3: Sub-Config Mode */}
                      <div className="ml-8 rounded-lg border-2 border-purple-500 bg-purple-950 p-6">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">📦</span>
                          <div>
                            <p className="font-mono text-lg text-purple-300">Switch(config-if)#</p>
                            <p className="text-sm text-gray-400">
                              Layer 3: Interface Configuration Mode (Deepest!)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 ml-8 text-gray-400">
                        ↑ <code>exit</code> (go back one level)
                      </div>
                    </div>

                    <div className="mt-4 ml-8 text-gray-400">
                      ↑ <code>exit</code> (go back one level)
                    </div>
                  </div>

                  <div className="mt-6 text-center text-gray-300">
                    <span className="font-semibold text-yellow-300">💡 Pro Tip:</span> Use{' '}
                    <code>end</code> from anywhere to jump straight to Layer 1!
                  </div>
                </div>

                <InfoBox variant="info">
                  <p className="mb-3 text-gray-300">
                    <strong className="text-white">
                      Think of it like folders on your computer:
                    </strong>
                  </p>
                  <Diagram>
                    {`[Computer] (Privileged Mode)
   └─ [Settings] (Global Config)
       └─ [Network Adapter] (Interface Config)
           └─ [IP Address Settings] (You configure here!)`}
                  </Diagram>
                  <p className="mt-4 text-gray-300">
                    The prompt <strong className="text-white">ALWAYS</strong> tells you exactly
                    which "folder" (layer) you're in:
                  </p>
                  <ul className="mt-2 ml-6 space-y-1 text-gray-300">
                    <li>
                      <code>#</code> = Top level (Privileged)
                    </li>
                    <li>
                      <code>(config)#</code> = Global settings
                    </li>
                    <li>
                      <code>(config-if)#</code> = Interface settings
                    </li>
                    <li>
                      <code>(config-vlan)#</code> = VLAN settings
                    </li>
                    <li>
                      <code>(config-line)#</code> = Line settings (VTY, console)
                    </li>
                    <li>
                      <code>(config-router)#</code> = Router protocol settings
                    </li>
                  </ul>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Different Types of Sub-Configuration Modes
                </h2>
                <p className="mb-6 text-gray-300">
                  Not all sub-configuration modes are the same! Each type has its own purpose and
                  prompt:
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-900 p-8">
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h4 className="mb-2 font-mono text-lg font-semibold text-purple-300">
                        (config-if)#
                      </h4>
                      <p className="font-semibold text-white">Interface Configuration Mode</p>
                      <p className="mt-2 text-gray-400">
                        For configuring physical or logical interfaces (like g0/1 or vlan 1)
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Example: <code>interface vlan 1</code>
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="mb-2 font-mono text-lg font-semibold text-blue-300">
                        (config-vlan)#
                      </h4>
                      <p className="font-semibold text-white">VLAN Configuration Mode</p>
                      <p className="mt-2 text-gray-400">For creating and naming VLANs</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Example: <code>vlan 100</code>
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="mb-2 font-mono text-lg font-semibold text-green-300">
                        (config-router)#
                      </h4>
                      <p className="font-semibold text-white">Router Configuration Mode</p>
                      <p className="mt-2 text-gray-400">
                        For configuring routing protocols like OSPF
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Example: <code>router ospf 1</code>
                      </p>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-6">
                      <h4 className="mb-2 font-mono text-lg font-semibold text-yellow-300">
                        (config-line)#
                      </h4>
                      <p className="font-semibold text-white">Line Configuration Mode</p>
                      <p className="mt-2 text-gray-400">
                        For configuring console and VTY (remote access) lines
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Example: <code>line console 0</code>
                      </p>
                    </div>
                  </div>
                </div>

                <InfoBox variant="info">
                  <p className="mb-3 text-gray-300">
                    <strong className="text-white">Notice the difference:</strong>
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <code>interface vlan 1</code> → <code>(config-if)#</code> — configuring the
                      interface itself (IP address, shutdown status)
                    </li>
                    <li>
                      <code>vlan 100</code> → <code>(config-vlan)#</code> — creating/naming the VLAN
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    These are different operations with different prompts!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Exit vs End: The Important Difference
                </h2>
                <p className="mb-4 text-gray-300">
                  When you're deep in configuration modes, you have two ways to get back to
                  privileged mode:
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">exit — One Level at a Time</h4>
                    <Diagram>
                      {`Switch(config-if)# exit
Switch(config)# exit
Switch#

Takes 2 exits to get back`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      <strong>Use when:</strong> You want to go back one level
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">end — Jump Directly</h4>
                    <Diagram>
                      {`Switch(config-if)# end
Switch#

Takes 1 command! [✓]`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      <strong>Use when:</strong> You want to jump straight to privileged mode
                    </p>
                  </div>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      Use <code>end</code> when you're deep in configuration and want to get back to
                      privileged mode quickly!
                    </p>
                    <p className="text-gray-300">
                      Use <code>exit</code> when you want to go back just one level (e.g., from
                      interface config back to global config).
                    </p>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Practice navigating different sub-configuration modes:
                </p>

                <Exercise exercise={lesson10 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>
                        Watch how the prompt changes: <code>(config)#</code> →{' '}
                        <code>(config-vlan)#</code> vs <code>(config-if)#</code>
                      </li>
                      <li>
                        Notice that <code>vlan 100</code> and <code>interface vlan 1</code> give you
                        different prompts!
                      </li>
                      <li>
                        You'll use sub-configuration modes for interfaces, VLANs, routing protocols,
                        VTY lines, and more
                      </li>
                      <li>
                        The deeper you go, the more useful <code>end</code> becomes!
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 7: MANAGING CONSOLE MESSAGES */}
              <LessonSection title="Managing Console Messages">
                <p className="my-6 text-xl text-gray-200">
                  You may have noticed something annoying when using the <code>end</code> command —
                  a system message appears! Let's learn how to manage these messages so they don't
                  interrupt your work.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What Are System Messages?
                </h2>
                <p className="mb-6 text-gray-300">
                  When you exit configuration mode using <code>end</code>, Cisco IOS displays a
                  system message like this:
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-900 p-6">
                  <Diagram>
                    {`Switch(config-if)#end
%SYS-5-CONFIG_I: Configured from console by console
Switch#`}
                  </Diagram>
                </div>

                <InfoBox variant="info">
                  <p className="mb-3 text-gray-300">
                    <strong className="text-white">What does this message mean?</strong>
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <code>%SYS-5-CONFIG_I</code> — System message, severity level 5 (notification)
                    </li>
                    <li>
                      <code>Configured from console by console</code> — Someone made configuration
                      changes from the console
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-300">
                    These messages are helpful for tracking what's happening on your device, but
                    they can be disruptive when you're typing commands!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Problem: Interrupted Commands
                </h2>
                <p className="mb-6 text-gray-300">
                  Without proper configuration, system messages can appear{' '}
                  <strong className="text-white">while you're typing</strong>, breaking up your
                  command and making it hard to see what you're doing.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-red-600 bg-red-900 p-6">
                    <h4 className="mb-3 font-semibold text-red-300">
                      ❌ Without logging synchronous
                    </h4>
                    <Diagram>
                      {`Switch#show ru
%SYS-5-CONFIG_I: Configured from console by console
nning-config
                ^ Your typing gets interrupted!`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">Message appears mid-command, confusing!</p>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">
                      ✅ With logging synchronous
                    </h4>
                    <Diagram>
                      {`Switch#show running-config
%SYS-5-CONFIG_I: Configured from console by console
Switch#show running-config
                ^ Your command is redisplayed!`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      Message appears, but your command stays intact
                    </p>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Solution: logging synchronous
                </h2>
                <p className="mb-6 text-gray-300">
                  The <code>logging synchronous</code> command tells the device to{' '}
                  <strong className="text-white">redisplay your command</strong> after a system
                  message appears. This keeps your typing organized and readable!
                </p>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      <strong className="text-white">What is "line console 0"?</strong>
                    </p>
                    <p className="mb-4 text-gray-300">
                      The console is the physical or virtual connection you use to configure the
                      device. "Line console 0" is the first (and usually only) console connection.
                    </p>
                    <p className="text-gray-300">
                      Think of it like configuring the settings for your keyboard and monitor
                      connection!
                    </p>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure logging synchronous and observe the difference:
                </p>

                <Exercise exercise={lesson11 as ExerciseType} grammar={grammar} />

                <InfoBox variant="success">
                  <h3 className="mb-4 text-lg font-semibold text-green-300">🎉 What You Learned</h3>
                  <ul className="ml-6 space-y-3 text-gray-300">
                    <li>
                      <strong className="text-white">System messages</strong> appear when important
                      events happen (like configuration changes)
                    </li>
                    <li>
                      <strong className="text-white">logging synchronous</strong> prevents messages
                      from interrupting your typing
                    </li>
                    <li>
                      <strong className="text-white">line console 0</strong> configures the console
                      connection settings
                    </li>
                    <li>
                      This is a <strong className="text-white">best practice</strong> configuration
                      for all Cisco devices!
                    </li>
                  </ul>
                </InfoBox>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      <strong className="text-white">Real-world tip:</strong>
                    </p>
                    <p className="text-gray-300">
                      Network engineers almost always configure <code>logging synchronous</code> on
                      console and VTY lines (remote access lines) as one of the first steps when
                      setting up a new device. It makes troubleshooting and configuration much
                      easier!
                    </p>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 8: IP ADDRESSING BASICS */}
              <LessonSection title="Understanding IP Addresses">
                <p className="my-6 text-xl text-gray-200">
                  Every device on a network needs an address so others can find it. This is called
                  an IP address.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What's an IP Address?
                </h2>
                <p className="mb-6 text-gray-300">
                  Think of an IP address like a phone number or street address:
                </p>
                <ul className="mb-8 ml-8 list-disc space-y-3 text-gray-300">
                  <li>
                    <strong className="text-white">Phone number:</strong> Lets people call you
                  </li>
                  <li>
                    <strong className="text-white">Street address:</strong> Lets mail reach you
                  </li>
                  <li>
                    <strong className="text-white">IP address:</strong> Lets data reach your device
                  </li>
                </ul>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-8">
                  <h4 className="mb-6 text-center font-semibold text-white">IP Address Format</h4>
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="rounded bg-blue-600 px-6 py-4 text-2xl font-bold text-white">
                      192
                    </div>
                    <div className="text-2xl text-white">.</div>
                    <div className="rounded bg-blue-600 px-6 py-4 text-2xl font-bold text-white">
                      168
                    </div>
                    <div className="text-2xl text-white">.</div>
                    <div className="rounded bg-blue-600 px-6 py-4 text-2xl font-bold text-white">
                      1
                    </div>
                    <div className="text-2xl text-white">.</div>
                    <div className="rounded bg-blue-600 px-6 py-4 text-2xl font-bold text-white">
                      100
                    </div>
                  </div>
                  <p className="mb-4 text-center text-gray-400">
                    Four numbers separated by dots (periods)
                  </p>
                  <p className="text-center font-mono text-xl text-gray-300">192.168.1.100</p>
                </div>

                <InfoBox variant="info">
                  <p className="mb-2 text-gray-300">
                    IP addresses are written as <strong className="text-white">four numbers</strong>{' '}
                    separated by dots (periods).
                  </p>
                  <p className="text-gray-300">
                    Each number can be from <strong className="text-white">0 to 255</strong>.
                  </p>
                </InfoBox>

                <h2 className="mt-16 mb-6 text-3xl font-bold text-blue-400">
                  What's a Subnet Mask?
                </h2>
                <p className="mb-6 text-gray-300">
                  Along with an IP address, you'll also configure something called a{' '}
                  <strong className="text-white">subnet mask</strong>. For now, just know that it's
                  written in the same format as an IP address.
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-8">
                  <h4 className="mb-6 text-center font-semibold text-white">Subnet Mask Format</h4>
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="rounded bg-green-600 px-6 py-4 text-2xl font-bold text-white">
                      255
                    </div>
                    <div className="text-2xl text-white">.</div>
                    <div className="rounded bg-green-600 px-6 py-4 text-2xl font-bold text-white">
                      255
                    </div>
                    <div className="text-2xl text-white">.</div>
                    <div className="rounded bg-green-600 px-6 py-4 text-2xl font-bold text-white">
                      255
                    </div>
                    <div className="text-2xl text-white">.</div>
                    <div className="rounded bg-green-600 px-6 py-4 text-2xl font-bold text-white">
                      0
                    </div>
                  </div>
                  <p className="mb-4 text-center text-gray-400">
                    Also four numbers separated by dots
                  </p>
                  <p className="text-center font-mono text-xl text-gray-300">255.255.255.0</p>
                </div>

                <InfoBox variant="info">
                  <p className="mb-2 text-gray-300">
                    <strong className="text-white">255.255.255.0</strong> is the most common subnet
                    mask you'll see.
                  </p>
                  <p className="text-gray-300">
                    Don't worry about what it means yet — you'll use it when configuring devices in
                    the next lesson!
                  </p>
                </InfoBox>
              </LessonSection>

              {/* LESSON 8: NETWORK HARDWARE BASICS */}
              <LessonSection title="Network Hardware: Switches and Interfaces">
                <p className="my-6 text-xl text-gray-200">
                  Before we configure a switch, let's look at what one actually looks like and
                  understand its physical parts!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What Does a Switch Look Like?
                </h2>
                <p className="mb-6 text-gray-300">
                  A network switch is a box with lots of ports (also called{' '}
                  <strong className="text-white">interfaces</strong>) where you plug in network
                  cables. Switches come in different sizes — some have 8 ports, some have 24 or 48
                  ports!
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <h4 className="mb-4 text-center font-semibold text-white">
                    Typical Network Switch
                  </h4>
                  <div className="rounded-lg bg-gray-900 p-8">
                    {/* Static export mode - next/image optimization unavailable for external images */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/2550T-PWR-Front.jpg/1280px-2550T-PWR-Front.jpg"
                      alt="Cisco network switch showing multiple ethernet ports on the front panel"
                      className="w-full rounded border border-gray-600"
                    />
                  </div>
                  <p className="mt-4 text-center text-gray-400">
                    This switch has 48 regular ports plus special uplink ports on the right
                  </p>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What is an Interface?
                </h2>
                <p className="mb-6 text-gray-300">
                  An <strong className="text-white">interface</strong> (or port) is where you plug
                  in a network cable. Each interface has a number so you can identify it, like{' '}
                  <code>FastEthernet 0/1</code> or <code>GigabitEthernet 1/0/1</code>.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Interface Types</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li>
                        <strong className="text-blue-400">FastEthernet (Fa):</strong> 100 Mbps —
                        older, slower
                      </li>
                      <li>
                        <strong className="text-green-400">GigabitEthernet (Gi):</strong> 1000 Mbps
                        (1 Gbps) — common
                      </li>
                      <li>
                        <strong className="text-purple-400">TenGigabitEthernet:</strong> 10 Gbps —
                        very fast!
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Interface Names</h4>
                    <ul className="space-y-3 font-mono text-sm text-gray-300">
                      <li>
                        <code className="text-blue-400">FastEthernet 0/1</code> — Port 1
                      </li>
                      <li>
                        <code className="text-blue-400">FastEthernet 0/24</code> — Port 24
                      </li>
                      <li>
                        <code className="text-green-400">GigabitEthernet 1/0/1</code> — Port 1
                      </li>
                    </ul>
                    <p className="mt-4 text-xs text-gray-400">
                      The numbers identify which slot and port
                    </p>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Console Port: Your First Connection
                </h2>
                <p className="mb-6 text-gray-300">
                  The <strong className="text-white">console port</strong> is a special port used
                  for initial setup and configuration. It's usually labeled "Console" and looks
                  different from the regular network ports.
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <h4 className="mb-4 text-center font-semibold text-white">
                    Console Port Location
                  </h4>
                  <div className="rounded-lg bg-gray-900 p-8">
                    {/* Static export mode - next/image optimization unavailable for external images */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://www.cisco.com/c/dam/en/us/td/i/100001-200000/190001-200000/197001-198000/197840.jpg"
                      alt="Back of Cisco switch showing console port"
                      className="w-full rounded border border-gray-600"
                    />
                  </div>
                  <p className="mt-4 text-center text-gray-400">
                    Console port (often blue) is usually on the front or back of the switch
                  </p>
                </div>

                <InfoBox variant="info">
                  <h4 className="mb-3 font-semibold text-blue-300">
                    Why Do We Need a Console Port?
                  </h4>
                  <p className="mb-3 text-gray-300">
                    When a switch is brand new (or has no configuration), it doesn't have an IP
                    address yet. You can't connect to it over the network because... well, it's not
                    on the network!
                  </p>
                  <p className="text-gray-300">
                    The console port lets you plug directly into the switch with a special cable to
                    do the initial setup.
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Network Racks</h2>
                <p className="mb-6 text-gray-300">
                  In professional environments, switches are mounted in{' '}
                  <strong className="text-white">racks</strong> — metal cabinets that hold multiple
                  network devices stacked on top of each other.
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <h4 className="mb-4 text-center font-semibold text-white">Equipment Rack</h4>
                  <div className="rounded-lg bg-gray-900 p-8">
                    {/* Static export mode - next/image optimization unavailable for external images */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Rack001.jpg/800px-Rack001.jpg"
                      alt="Network equipment rack with multiple switches and servers"
                      className="w-full rounded border border-gray-600"
                    />
                  </div>
                  <p className="mt-4 text-center text-gray-400">
                    A typical rack can hold many switches, routers, and servers
                  </p>
                </div>

                <InfoBox variant="real-world">
                  <h4 className="mb-2 font-semibold text-blue-300">🌍 Real World Example</h4>
                  <p className="text-gray-300">
                    In your school, there's probably a locked network closet with a rack containing
                    switches. One switch might be on the 1st floor rack, another on the 2nd floor.
                    Each switch has dozens of network cables running to classrooms and offices. The
                    IT person can manage all of them remotely once they're configured!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Summary: The Two Ways to Access a Switch
                </h2>
                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">1. Console Access</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✅ Plug a cable into the console port</li>
                      <li>✅ Direct physical connection</li>
                      <li>✅ Works even with no configuration</li>
                      <li>❌ Must be physically present</li>
                    </ul>
                    <p className="mt-4 text-gray-400">
                      <strong>Use for:</strong> Initial setup
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">2. Remote Access</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✅ Connect over the network using IP address</li>
                      <li>✅ Manage from anywhere</li>
                      <li>✅ No physical access needed</li>
                      <li>❌ Requires configuration first</li>
                    </ul>
                    <p className="mt-4 text-gray-400">
                      <strong>Use for:</strong> Day-to-day management
                    </p>
                  </div>
                </div>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Try It Now
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Let's look at what interfaces exist on your switch! The{' '}
                  <code>show ip interface brief</code> command is perfect for this — even though you
                  haven't configured any IPs yet, you can see all the interface names and their
                  status.
                </p>

                <Exercise exercise={lesson12 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-3 text-gray-300">
                      Notice the interface names in the output! Each interface has a name that
                      indicates what type it is. For example, <code>FastEthernet0/1</code> is a
                      physical port, <code>GigabitEthernet0/1</code> is a faster physical port, and{' '}
                      <code>Vlan1</code> is a virtual management interface.
                    </p>
                    <p className="text-gray-300">
                      The "Status" column shows if the interface is enabled (up) or disabled (down).
                      The "Protocol" column shows if it's actually working. Right now everything is
                      down because interfaces are disabled by default on Cisco devices!
                    </p>
                  </ProTip>
                </InfoBox>

                <div className="my-8 rounded-lg border border-blue-600 bg-blue-900 p-6">
                  <p className="mb-3 font-semibold text-blue-200">💡 Coming Up Next</p>
                  <p className="text-gray-300">
                    Now that you know what interfaces are and how to connect to a switch, you'll
                    learn how to configure management access so you can manage it remotely!
                  </p>
                </div>
              </LessonSection>

              {/* LESSON 9: MANAGEMENT ACCESS */}
              <LessonSection title="Configuring Management Access">
                <p className="my-6 text-xl text-gray-200">
                  Now that you understand IP addresses, let's put that knowledge to use by
                  configuring remote management access on a switch!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What is Management Access?
                </h2>
                <p className="mb-6 text-gray-300">
                  By default, you can only configure a switch by plugging a cable directly into it
                  (console access). But in the real world, network devices are in closets, racks, or
                  even different buildings!
                </p>

                <p className="mb-6 text-gray-300">
                  <strong className="text-white">Management access</strong> means giving your switch
                  an IP address so you can connect to it remotely over the network — without needing
                  physical access.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-red-600 bg-red-900 p-6">
                    <h4 className="mb-3 font-semibold text-red-300">❌ Without Management IP</h4>
                    <Diagram>
                      {`🏢 Building A          🏢 Building B
     │                      │
     │                      │
   [Switch]          [Switch] ← Need to fix
                            
IT Person must walk there! 👟`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">✅ With Management IP</h4>
                    <Diagram>
                      {`[Building A]          [Building B]
     │                      │
     │   Network Cable      │
   [IT PC] ═══════════ [Switch]
                       IP: 192.168.1.100
                            
Manage from anywhere remotely!`}
                    </Diagram>
                  </div>
                </div>

                <InfoBox variant="real-world">
                  <h4 className="mb-2 font-semibold text-blue-300">🌍 Real World Example</h4>
                  <p className="text-gray-300">
                    Your school's IT person needs to manage 50 switches across different buildings.
                    With management IPs configured, they can connect to any switch from their office
                    using SSH! No walking required.
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Management Interface
                </h2>
                <p className="mb-6 text-gray-300">
                  To manage a switch remotely, the switch itself needs an IP address. Unlike the
                  physical ports you plug cables into, there's a special{' '}
                  <strong className="text-white">management interface</strong> where you assign this
                  IP.
                </p>

                <InfoBox variant="info">
                  <p className="mb-2 text-gray-300">
                    <strong className="text-white">Important:</strong> You don't assign the IP to a
                    physical port like <code>FastEthernet 0/1</code>.
                  </p>
                  <p className="text-gray-300">
                    Instead, you use a special interface called <code>interface vlan 1</code> for
                    management access.
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The "no shutdown" Command
                </h2>
                <p className="mb-6 text-gray-300">
                  By default, many interfaces on Cisco devices are in "shutdown" state (turned off).
                  The <code>no shutdown</code> command turns the interface on.
                </p>

                <Diagram title="Interface States">
                  {`Shutdown (default):  Interface is OFF [X]
                        No traffic flows
                        
no shutdown:         Interface is ON [✓]
                        Traffic can flow`}
                </Diagram>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure management access on your switch:
                </p>

                <Exercise exercise={lesson13 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="mb-2 text-gray-300">
                    Type: <code>show ip interface brief</code>
                  </p>
                  <p className="text-gray-300">You should see:</p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-300">
                    <li>
                      An interface named <code>Vlan1</code> with IP address 192.168.1.100
                    </li>
                    <li>
                      Status: <code>up</code> (meaning interface is enabled)
                    </li>
                    <li>
                      Protocol: <code>up</code> (meaning interface is working)
                    </li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-400 italic">
                    💡 Tip: <code>show ip interface brief</code> is much faster than{' '}
                    <code>show running-config</code> when you just want to verify IP addresses and
                    interface status!
                  </p>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>The default gateway must be on the same network as your IP address</li>
                      <li>
                        In this example: 192.168.1.100 (switch) and 192.168.1.1 (gateway) are both
                        on the 192.168.1.0 network
                      </li>
                      <li>Later, you'll use this IP address to SSH into the switch remotely!</li>
                      <li>You'll learn more about what "vlan 1" means in the next lesson!</li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 10: VLANs */}
              <LessonSection title="VLANs: Organizing Your Network">
                <p className="my-6 text-xl text-gray-200">
                  VLANs let you split one physical switch into multiple virtual networks. It's like
                  having multiple switches in one!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Why Use VLANs?</h2>
                <p className="mb-6 text-gray-300">Imagine your school network without VLANs:</p>

                <Diagram
                  title="Without VLANs - Everyone sees everything! (INVALID)"
                  variant="error"
                >
                  {`┌────────────────────────┐
│   ONE BIG NETWORK      │
│                        │
│  Students              │
│  Teachers              │
│  Admin                 │
│  Cameras               │
│                        │
│  All mixed together!   │
└────────────────────────┘
[!] Privacy & Security Risk!`}
                </Diagram>

                <p className="my-6 text-gray-300">With VLANs, you can separate them:</p>

                <Diagram title="With VLANs - Organized & Secure! (VALID)" variant="success">
                  {`┌───────────────────────────────────┐
│         SWITCH                    │
│  ┌──────────┐    ┌──────────┐     │
│  │ VLAN 100 │    │ VLAN 200 │     │
│  │ Students │    │ Teachers │     │
│  │          │    │          │     │
│  └──────────┘    └──────────┘     │
│      ↕               ↕            │
│   Fa0/2-5        Fa0/6-10         │
└───────────────────────────────────┘
[✓] Students can't see teacher files!`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Creating VLANs</h2>
                <p className="mb-6 text-gray-300">
                  Creating a VLAN is easy — just give it a number (1-4094) and optionally a name.
                  Then you assign switch ports to that VLAN.
                </p>

                <InfoBox variant="real-world">
                  <h4 className="mb-3 font-semibold text-blue-300">🌍 Real School Network</h4>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">VLAN 10:</strong> Student computers (limited
                      internet)
                    </li>
                    <li>
                      <strong className="text-white">VLAN 20:</strong> Teacher computers (full
                      access)
                    </li>
                    <li>
                      <strong className="text-white">VLAN 30:</strong> Guest WiFi (internet only)
                    </li>
                    <li>
                      <strong className="text-white">VLAN 40:</strong> Security cameras (isolated)
                    </li>
                    <li>
                      <strong className="text-white">VLAN 50:</strong> Servers (restricted access)
                    </li>
                  </ul>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">Create VLANs and assign ports:</p>

                <Exercise exercise={lesson14 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="text-gray-300">
                    Type: <code>show vlan brief</code>
                  </p>
                  <p className="mt-2 text-gray-300">You should see:</p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-300">
                    <li>VLAN 100 (Students) with port Fa0/2</li>
                    <li>VLAN 200 (Teachers) with port Fa0/3</li>
                  </ul>
                </div>
              </LessonSection>

              {/* LESSON: SVI - VLAN INTERFACES */}
              <LessonSection title="SVI: Giving VLANs Their Own IP Address">
                <p className="my-6 text-xl text-gray-200">
                  Remember how we gave our switch an IP address using <code>interface vlan 1</code>?
                  You can do the same thing for ANY VLAN — and that's how VLANs can talk to each
                  other!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What's an SVI?</h2>
                <p className="mb-6 text-gray-300">
                  <strong className="text-white">SVI</strong> stands for{' '}
                  <strong className="text-white">Switched Virtual Interface</strong>. Think of it
                  like giving each VLAN its own "phone number" so it can communicate with the
                  outside world.
                </p>

                <Diagram
                  title="VLANs Without SVIs - Can't Talk to Each Other! (INVALID)"
                  variant="error"
                >
                  {`┌──────────────────────────────────────────────┐
│           Layer 3 Switch                     │
│                                              │
│   VLAN 100 (Students)   VLAN 200 (Teachers)  │
│                                              │
│    No IP Address         No IP Address       │
│                                              │
│   [X] No communication between VLANs!        │
│   [X] Students can't reach Teachers!         │
└──────────────────────────────────────────────┘`}
                </Diagram>

                <Diagram
                  title="VLANs With SVIs - Now They Can Communicate! (VALID)"
                  variant="success"
                >
                  {`┌──────────────────────────────────────────────┐
│           Layer 3 Switch                     │
│                                              │
│   VLAN 100 (Students)   VLAN 200 (Teachers)  │
│   SVI: 35.72.10.1/24    SVI: 33.2.169.1/24   │
│   [IP Configured]        [IP Configured]     │
│                                              │
│   [✓] Switch routes between VLANs!           │
│   [✓] Students can reach Teachers!           │
└──────────────────────────────────────────────┘`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Why Do VLANs Need IP Addresses?
                </h2>
                <p className="mb-4 text-gray-300">
                  Imagine your school has two buildings — one for students and one for teachers.
                  Each building has its own phone system, but they can't call each other!
                </p>
                <ul className="ml-8 list-disc space-y-3 text-gray-300">
                  <li>
                    <strong className="text-white">Without SVI:</strong> Each VLAN is like a
                    building with no phone line to the outside
                  </li>
                  <li>
                    <strong className="text-white">With SVI:</strong> Each VLAN gets a phone number
                    (IP address) and can call other VLANs
                  </li>
                </ul>

                <InfoBox variant="info">
                  <h4 className="mb-3 font-semibold text-blue-300">🏠 Real-Life Analogy</h4>
                  <p className="mb-3 text-gray-300">
                    Think of VLANs like different apartment buildings:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">VLAN 100 (35.72.10.0/24):</strong> "123 Student
                      Street" — all student computers live here
                    </li>
                    <li>
                      <strong className="text-white">VLAN 200 (33.2.169.0/24):</strong> "456 Teacher
                      Avenue" — all teacher computers live here
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    The SVI is like the building's front door with a street address — mail (data)
                    can now be delivered!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  SVI vs Management Interface
                </h2>
                <p className="mb-6 text-gray-300">
                  Earlier, you configured <code>interface vlan 1</code> for management access. That
                  was an SVI too! The difference is how you use it:
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">VLAN 1 (Management)</h4>
                    <p className="mb-3 text-gray-300">Used by the switch itself</p>
                    <Diagram>
                      {`interface vlan 1
 ip address 172.16.16.1 255.255.255.0
 no shutdown

Purpose: So YOU can SSH into the switch`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">VLAN 100/200 (Routing)</h4>
                    <p className="mb-3 text-gray-300">Used to route between VLANs</p>
                    <Diagram>
                      {`interface vlan 100
 ip address 35.72.10.1 255.255.255.0
 no shutdown

Purpose: Gateway for computers in VLAN 100`}
                    </Diagram>
                  </div>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">
                    🎯 Key Concept: Default Gateway
                  </p>
                  <p className="text-gray-300">
                    When you create an SVI with IP <code>35.72.10.1</code>, all computers in VLAN
                    100 will use
                    <code>35.72.10.1</code> as their{' '}
                    <strong className="text-white">default gateway</strong>. This is how they send
                    traffic to other VLANs or the internet!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Enable Routing on Layer 3 Switches
                </h2>
                <p className="mb-6 text-gray-300">
                  For SVIs to route traffic between VLANs, you need to enable IP routing on the
                  switch:
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <code className="font-mono text-lg text-blue-400">ip routing</code>
                  <p className="mt-2 text-gray-400">
                    This command tells the switch: "Start routing packets between VLANs!"
                  </p>
                </div>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure SVIs for inter-VLAN routing on a Layer 3 switch:
                </p>

                <Exercise exercise={lesson15a as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="mb-2 text-gray-300">
                    Type: <code>show ip interface brief</code>
                  </p>
                  <p className="text-gray-300">You should see:</p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-300">
                    <li>Vlan100 with IP 35.72.10.1 — Status: up, Protocol: up</li>
                    <li>Vlan200 with IP 33.2.169.1 — Status: up, Protocol: up</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-400 italic">
                    This command gives you a quick overview of all interfaces and their IP addresses
                    at a glance!
                  </p>
                </div>

                <InfoBox variant="real-world">
                  <h4 className="mb-3 font-semibold text-blue-300">🌍 Real Network Example</h4>
                  <p className="mb-3 text-gray-300">
                    In your school's network, a Layer 3 switch might have:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">VLAN 1 (172.16.16.1):</strong> Management — for
                      IT to access switches
                    </li>
                    <li>
                      <strong className="text-white">VLAN 100 (35.72.10.1):</strong> Students —
                      classroom computers
                    </li>
                    <li>
                      <strong className="text-white">VLAN 200 (33.2.169.1):</strong> Teachers —
                      teacher laptops
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    Each SVI acts as the default gateway for computers in that VLAN!
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Practice: Full Layer 3 Switch Setup
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Now configure a complete Layer 3 switch like in a real scenario (similar to
                  CyberPatriot!):
                </p>

                <Exercise exercise={lesson15 as ExerciseType} grammar={grammar} />

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 space-y-2 text-gray-300">
                      <li>You can create SVIs for any VLAN number (1-4094)</li>
                      <li>The SVI IP becomes the default gateway for devices in that VLAN</li>
                      <li>
                        Don't forget <code>ip routing</code> or the switch won't route between
                        VLANs!
                      </li>
                      <li>
                        Always use <code>no shutdown</code> to activate the SVI
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 11: TRUNK PORTS */}
              <LessonSection title="Trunk Ports: Connecting Switches">
                <p className="my-6 text-xl text-gray-200">
                  What if you have switches in different rooms or buildings? Trunk ports carry
                  multiple VLANs between switches!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Access Port vs Trunk Port
                </h2>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Access Port</h4>
                    <p className="mb-3 text-gray-300">
                      Carries <strong>ONE</strong> VLAN
                    </p>
                    <Diagram>
                      {`[Computer] ──── Access Port
 VLAN 100       (Only VLAN 100)`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Trunk Port</h4>
                    <p className="mb-3 text-gray-300">
                      Carries <strong>MULTIPLE</strong> VLANs
                    </p>
                    <Diagram>
                      {`[Switch A] ──── Trunk ──── [Switch B]
   VLAN 100 ═══════════════ VLAN 100
   VLAN 200 ═══════════════ VLAN 200`}
                    </Diagram>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Two Types of Trunk Configuration
                </h2>
                <p className="mb-6 text-gray-300">
                  Sometimes you need a trunk to allow ALL VLANs, other times you want to restrict
                  it. Here's the difference:
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">
                      ✅ Allow ALL VLANs (Default)
                    </h4>
                    <Diagram>
                      {`interface fa0/1
 switchport mode trunk
 
That's it! No "allowed vlan" command
means ALL VLANs can pass through.`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      <strong>Use when:</strong> You want the trunk to carry everything
                    </p>
                  </div>
                  <div className="rounded-lg border border-yellow-600 bg-yellow-900 p-6">
                    <h4 className="mb-3 font-semibold text-yellow-300">
                      ⚠️ Restrict to Specific VLANs
                    </h4>
                    <Diagram>
                      {`interface fa0/1
 switchport mode trunk
 switchport trunk allowed vlan 1,100,200
 
Only VLANs 1, 100, and 200 allowed.
All others are BLOCKED!`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      <strong>Use when:</strong> Security requires limiting VLANs
                    </p>
                  </div>
                </div>

                <InfoBox variant="info">
                  <h4 className="mb-3 font-semibold text-blue-300">🏠 Pizza Delivery Analogy</h4>
                  <p className="mb-3 text-gray-300">
                    Think of a trunk like a delivery entrance to an apartment building:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">Allow ALL:</strong> Any pizza delivery can
                      enter (fast, convenient)
                    </li>
                    <li>
                      <strong className="text-white">Restrict:</strong> Only deliveries for
                      apartments 1, 100, 200 allowed (more secure, controlled)
                    </li>
                  </ul>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Why Limit Allowed VLANs?
                </h2>
                <p className="mb-6 text-gray-300">
                  By default, trunks allow ALL VLANs (1-4094). But best practice is to allow only
                  the VLANs you need:
                </p>
                <ul className="ml-8 list-disc space-y-2 text-gray-300">
                  <li>
                    <strong className="text-white">Security:</strong> Don't send unnecessary traffic
                  </li>
                  <li>
                    <strong className="text-white">Performance:</strong> Less broadcast traffic
                  </li>
                  <li>
                    <strong className="text-white">Best Practice:</strong> Be explicit about what
                    you allow
                  </li>
                </ul>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="text-gray-300">
                      In CyberPatriot competitions, you often need to restrict trunk VLANs for
                      security points!
                    </p>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Task 1: Trunk Allowing ALL VLANs
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  First, configure a trunk that allows ALL VLANs (the simple way):
                </p>

                <Exercise exercise={lesson16 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ You succeeded when:</p>
                  <p className="mb-2 text-gray-300">
                    Type <code>show running-config</code> — you should see:
                  </p>
                  <div className="mt-2 rounded-lg bg-gray-800 p-3 font-mono text-sm">
                    interface FastEthernet0/1
                    <br />
                    &nbsp;<span className="text-yellow-300">switchport mode trunk</span>
                    <br />!
                  </div>
                  <p className="mt-3 text-sm text-gray-400">
                    Notice there's NO "switchport trunk allowed vlan" line — this means ALL VLANs
                    are allowed!
                  </p>
                </div>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Task 2: Trunk with Restricted VLANs
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Now configure trunk ports that carry only specific VLANs:
                </p>

                <Exercise exercise={lesson17 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-blue-500/50 bg-blue-900/30 p-6">
                  <p className="mb-3 flex items-center gap-2 font-semibold text-blue-300">
                    <span className="text-xl">💡</span> Important: VLANs Don't Need to Exist Yet!
                  </p>
                  <div className="space-y-3 text-gray-300">
                    <p>
                      Notice we're restricting VLANs 100 and 200, but we haven't created them yet.
                      This is{' '}
                      <strong className="text-blue-300">perfectly normal in Cisco IOS</strong>!
                    </p>
                    <ul className="ml-6 list-disc space-y-2">
                      <li>
                        <strong>IOS accepts the command</strong> — No errors even if the VLANs don't
                        exist
                      </li>
                      <li>
                        <strong>Configuration is saved</strong> — The allowed VLAN list is stored in
                        running-config
                      </li>
                      <li>
                        <strong>No traffic flows yet</strong> — Until VLANs 100 and 200 are created,
                        only VLAN 1 works
                      </li>
                      <li>
                        <strong>Automatic activation</strong> — Once you create{' '}
                        <code>vlan 100</code>, it immediately starts working on the trunk
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-blue-200">
                      This allows a common workflow: configure trunk ports first, then create VLANs
                      later. Very handy when planning your network infrastructure!
                    </p>
                  </div>
                </div>

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ You succeeded when:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>You configured both g0/1 and fa0/1 as trunk ports</li>
                    <li>You restricted allowed VLANs to only 1,100,200</li>
                    <li>
                      You saved your configuration with <code>write memory</code>
                    </li>
                    <li>
                      <strong className="text-cyan-300">Verify:</strong> Type{' '}
                      <code>show running-config</code> and confirm you see:
                      <div className="mt-2 ml-4 rounded-lg bg-gray-800 p-3 font-mono text-sm">
                        interface GigabitEthernet0/1
                        <br />
                        &nbsp;switchport mode trunk
                        <br />
                        &nbsp;
                        <span className="text-yellow-300">
                          switchport trunk allowed vlan 1,100,200
                        </span>
                        <br />
                        !<br />
                        interface FastEthernet0/1
                        <br />
                        &nbsp;switchport mode trunk
                        <br />
                        &nbsp;
                        <span className="text-yellow-300">
                          switchport trunk allowed vlan 1,100,200
                        </span>
                        <br />!
                      </div>
                    </li>
                  </ul>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 list-disc space-y-2 text-gray-300">
                      <li>VLAN 1 is included because it's the management VLAN</li>
                      <li>
                        Use commas to separate VLANs: <code>1,100,200</code> (no spaces!)
                      </li>
                      <li>
                        You can also use <code>show vlan brief</code> to see VLAN assignments, but
                        trunk configuration is best viewed in <code>show running-config</code>
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 12: SSH */}
              <LessonSection title="SSH: Secure Remote Access">
                <p className="my-6 text-xl text-gray-200">
                  SSH lets network engineers manage devices from anywhere — securely and encrypted!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Why SSH Matters</h2>
                <p className="mb-6 text-gray-300">
                  Imagine it's 2 AM and a network problem takes your school offline. The IT person
                  doesn't want to drive to school — they want to fix it from home!
                </p>

                <p className="mb-8 text-gray-300">
                  SSH (Secure Shell) makes this possible — with encryption so hackers can't steal
                  passwords.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-red-600 bg-red-900 p-6">
                    <h4 className="mb-3 font-semibold text-red-300">Telnet (Old Way - INSECURE)</h4>
                    <Diagram variant="error">
                      {`You → "password: admin123" → Router

[!] UNENCRYPTED!
Hacker sees: "password: admin123"
[X] They're in!`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">
                      SSH (Secure Way - ENCRYPTED)
                    </h4>
                    <Diagram variant="success">
                      {`You → [ENCRYPTED] %#^&*@!$^&* → Router

[✓] ENCRYPTED!
Hacker sees: gibberish
[✓] Can't break in!`}
                    </Diagram>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  SSH Setup Components
                </h2>
                <div className="my-8 space-y-4">
                  <div className="flex gap-4 rounded-lg border border-gray-700 bg-gray-800 p-5">
                    <div className="text-3xl font-bold text-blue-400">1</div>
                    <div>
                      <h4 className="mb-1 font-semibold text-white">Domain Name</h4>
                      <p className="text-gray-400">Required to generate encryption keys</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg border border-gray-700 bg-gray-800 p-5">
                    <div className="text-3xl font-bold text-blue-400">2</div>
                    <div>
                      <h4 className="mb-1 font-semibold text-white">RSA Keys</h4>
                      <p className="text-gray-400">Encryption keys (1024 or 2048 bits)</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg border border-gray-700 bg-gray-800 p-5">
                    <div className="text-3xl font-bold text-blue-400">3</div>
                    <div>
                      <h4 className="mb-1 font-semibold text-white">SSH Version 2</h4>
                      <p className="text-gray-400">More secure than version 1</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg border border-gray-700 bg-gray-800 p-5">
                    <div className="text-3xl font-bold text-blue-400">4</div>
                    <div>
                      <h4 className="mb-1 font-semibold text-white">Local User</h4>
                      <p className="text-gray-400">Username and password</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-lg border border-gray-700 bg-gray-800 p-5">
                    <div className="text-3xl font-bold text-blue-400">5</div>
                    <div>
                      <h4 className="mb-1 font-semibold text-white">VTY Lines</h4>
                      <p className="text-gray-400">Virtual terminals for remote access</p>
                    </div>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">VTY Lines Explained</h2>
                <p className="mb-6 text-gray-300">
                  VTY (Virtual TeletYpe) lines are like "phone lines" for remote connections.
                  <code>line vty 0 4</code> means lines 0, 1, 2, 3, 4 — that's 5 simultaneous
                  connections!
                </p>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure complete SSH access (this is a big one!):
                </p>

                <Exercise exercise={lesson18 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ You succeeded when:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      You configured all 5 SSH components (domain name, RSA keys, SSH v2, user
                      account, VTY lines)
                    </li>
                    <li>You saw the "Generating RSA keys" success message</li>
                    <li>
                      You saved your configuration with <code>write memory</code>
                    </li>
                    <li>
                      <strong className="text-cyan-300">Verify:</strong> Type{' '}
                      <code>show running-config</code> and confirm you see all SSH settings:
                      <div className="mt-2 ml-4 rounded-lg bg-gray-800 p-3 font-mono text-sm">
                        <span className="text-yellow-300">hostname SecureRouter</span>
                        <br />
                        <span className="text-yellow-300">ip domain-name cisco.com</span>
                        <br />
                        <span className="text-yellow-300">ip ssh version 2</span>
                        <br />
                        !<br />
                        <span className="text-yellow-300">username admin secret Cyb3rPatriot</span>
                        <br />
                        !<br />
                        line vty 0 4<br />
                        &nbsp;<span className="text-yellow-300">login local</span>
                        <br />
                        &nbsp;<span className="text-yellow-300">transport input ssh</span>
                        <br />!
                      </div>
                    </li>
                  </ul>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      <strong>Security Check:</strong> When configuring SSH in the real world,
                      always verify:
                    </p>
                    <ul className="ml-6 list-disc space-y-1 text-gray-300">
                      <li>
                        <code>show running-config</code> confirms all SSH settings
                      </li>
                      <li>
                        <code>show ip ssh</code> would show SSH status (not implemented in this
                        practice environment)
                      </li>
                      <li>VTY lines only allow SSH (transport input ssh) — no Telnet!</li>
                    </ul>
                  </ProTip>
                </InfoBox>
              </LessonSection>

              {/* LESSON 13: LAYER 3 SWITCHING */}
              <LessonSection title="Layer 3 Switching: Routed Ports">
                <p className="my-6 text-xl text-gray-200">
                  Layer 3 switches can both switch AND route! They combine the best of switches and
                  routers.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Understanding Switch vs Router Ports
                </h2>
                <p className="mb-6 text-gray-300">
                  By default, all switch ports operate at Layer 2 — they handle MAC addresses and
                  VLANs. But Layer 3 switches have a special power: you can convert ports to work
                  like router interfaces!
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Layer 2 Port (Default)</h4>
                    <Diagram>
                      {`[Computer] ──── [Switch Port]
                 Layer 2
                 MAC: aa:bb:cc...
                 VLAN: 100
                 Works with VLANs`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      <strong>Used for:</strong> Connecting end devices
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Layer 3 Port (Routed)</h4>
                    <Diagram>
                      {`[Router] ──── [Routed Port]
               Layer 3
               IP: 35.72.12.1
               No VLAN!
               Routes packets`}
                    </Diagram>
                    <p className="mt-3 text-gray-400">
                      <strong>Used for:</strong> Connecting to routers
                    </p>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  The Magic: "no switchport"
                </h2>
                <p className="mb-4 text-gray-300">
                  The command <code>no switchport</code> transforms a switch port into a routed
                  port. After this command:
                </p>
                <ul className="ml-8 list-disc space-y-2 text-gray-300">
                  <li>✅ Port works at Layer 3 (can route packets)</li>
                  <li>✅ Can assign an IP address directly</li>
                  <li>✅ Can run routing protocols (OSPF, etc.)</li>
                  <li>❌ No longer works with VLANs</li>
                  <li>❌ Can't connect end-user devices</li>
                </ul>

                <Diagram title="Real-World Scenario">
                  {`┌──────────────────────┐        ┌──────────────────────┐
│   Layer 3 Switch     │        │      Router          │
│                      │        │                      │
│   g1/0/1 (L2) ──┐    │        │                      │
│   VLAN 100      │    │        │                      │
│                 │    │        │                      │
│   g1/0/2 (L3) ══╪════╪════════╪══► To ISP            │
│   IP: 35.72.12.1│    │        │   IP: 35.72.12.2     │
└──────────────────────┘        └──────────────────────┘

g1/0/1 = Switchport (connects to computers)
g1/0/2 = Routed port (connects to router/internet)`}
                </Diagram>

                <InfoBox variant="info">
                  <p className="mb-2 font-semibold text-green-200">Remember:</p>
                  <p className="text-gray-300">
                    Layer 3 switches save money! Instead of buying a switch AND a router, you buy
                    one device that does both jobs.
                  </p>
                </InfoBox>

                <h2 className="mt-16 mb-6 text-3xl font-bold text-blue-400">
                  Point-to-Point Subnets: The /30 Network
                </h2>
                <p className="mb-6 text-gray-300">
                  When connecting two routers (or a router and Layer 3 switch), you use a special
                  tiny network called a <strong className="text-white">/30 subnet</strong>. Why?
                  Because you only need 2 IP addresses!
                </p>

                <Diagram title="Point-to-Point Link">
                  {`┌──────────────┐                    ┌──────────────┐
│   Switch 1   │ ════════════════ │   Switch 2   │
│              │  Point-to-Point  │              │
│   g1/0/1     │      Link        │   g1/0/1     │
│ 35.72.15.1   │                  │ 35.72.15.2   │
│    /30       │                  │    /30       │
└──────────────┘                  └──────────────┘

Only 2 devices, so only need 2 IPs!`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Understanding /30 Subnets
                </h2>
                <p className="mb-4 text-gray-300">
                  The subnet mask <code>255.255.255.252</code> (also written as <code>/30</code>)
                  gives you a tiny network:
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <h4 className="mb-4 font-semibold text-white">Example: 35.72.15.0/30</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded bg-gray-900 p-4">
                      <p className="mb-2 text-gray-400">Network Address:</p>
                      <code className="text-red-400">35.72.15.0</code>
                      <p className="mt-1 text-xs text-gray-500">
                        Can't use — identifies the network
                      </p>
                    </div>
                    <div className="rounded bg-gray-900 p-4">
                      <p className="mb-2 text-gray-400">First Usable:</p>
                      <code className="text-green-400">35.72.15.1</code>
                      <p className="mt-1 text-xs text-gray-500">Device 1 uses this</p>
                    </div>
                    <div className="rounded bg-gray-900 p-4">
                      <p className="mb-2 text-gray-400">Second Usable:</p>
                      <code className="text-green-400">35.72.15.2</code>
                      <p className="mt-1 text-xs text-gray-500">Device 2 uses this</p>
                    </div>
                    <div className="rounded bg-gray-900 p-4">
                      <p className="mb-2 text-gray-400">Broadcast Address:</p>
                      <code className="text-red-400">35.72.15.3</code>
                      <p className="mt-1 text-xs text-gray-500">Can't use — broadcasts to all</p>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-gray-300">
                    <strong className="text-white">
                      4 addresses total, but only 2 are usable!
                    </strong>
                  </p>
                </div>

                <InfoBox variant="info">
                  <h4 className="mb-3 font-semibold text-blue-300">🏠 Phone Line Analogy</h4>
                  <p className="mb-3 text-gray-300">
                    Think of a /30 subnet like a direct phone line between two offices:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">/30 subnet:</strong> Private line between two
                      offices (just 2 extensions)
                    </li>
                    <li>
                      <strong className="text-white">/24 subnet:</strong> Company phone system (254
                      extensions)
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    You don't need 254 extensions for a cable connecting two devices!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">Common /30 Patterns</h2>
                <p className="mb-4 text-gray-300">
                  When you see these IP pairs in a scenario, they're point-to-point links:
                </p>

                <div className="my-8 space-y-4 rounded-lg bg-gray-800 p-6">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-400">Link 1:</div>
                    <code className="text-blue-400">35.72.15.1</code>
                    <code className="text-blue-400">35.72.15.2</code>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-400">Link 2:</div>
                    <code className="text-blue-400">35.72.15.5</code>
                    <code className="text-blue-400">35.72.15.6</code>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-400">Link 3:</div>
                    <code className="text-blue-400">35.72.15.9</code>
                    <code className="text-blue-400">35.72.15.10</code>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-400">Link 4:</div>
                    <code className="text-blue-400">35.72.15.13</code>
                    <code className="text-blue-400">35.72.15.14</code>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Notice the pattern: .1-.2, .5-.6, .9-.10, .13-.14, .17-.18...
                  </p>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">🏆 CyberPatriot Tip</p>
                  <p className="text-gray-300">
                    When you see addresses like <code>35.72.15.2/30</code> and{' '}
                    <code>35.72.15.6/30</code> on the same device, these are likely connections to
                    different routers! Each /30 is a separate point-to-point link.
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure a routed port on a Layer 3 switch:
                </p>

                <Exercise exercise={lesson19 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="mb-2 text-gray-300">
                    Type: <code>show ip interface brief</code>
                  </p>
                  <p className="text-gray-300">You should see:</p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-300">
                    <li>GigabitEthernet0/2 with IP address 35.72.12.1</li>
                    <li>Status: up, Protocol: up</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-400 italic">
                    Notice how routed ports appear in <code>show ip interface brief</code> just like
                    SVIs — with IP addresses and up/down status!
                  </p>
                </div>

                <InfoBox variant="info">
                  <ProTip>
                    <ul className="ml-6 list-disc space-y-2 text-gray-300">
                      <li>
                        The subnet mask is /30 (255.255.255.252) — this gives only 2 usable IPs
                      </li>
                      <li>Perfect for point-to-point links between routers!</li>
                      <li>After "no switchport", you'll see: "Interface will be in routed mode"</li>
                    </ul>
                  </ProTip>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Task 2: Multiple Routed Ports
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  In a real scenario (like CyberPatriot!), you'll configure multiple routed ports.
                  Practice here:
                </p>

                <Exercise exercise={lesson20 as ExerciseType} grammar={grammar} />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="mb-2 text-gray-300">
                    Type: <code>show ip interface brief</code>
                  </p>
                  <p className="text-gray-300">
                    You should see all three interfaces with their IPs and status "up":
                  </p>
                  <div className="mt-2 rounded-lg bg-gray-800 p-3 font-mono text-sm">
                    GigabitEthernet1/0/1 &nbsp;&nbsp; 35.72.15.2 &nbsp;&nbsp;&nbsp; up &nbsp;&nbsp;
                    up
                    <br />
                    GigabitEthernet1/0/2 &nbsp;&nbsp; 35.72.15.6 &nbsp;&nbsp;&nbsp; up &nbsp;&nbsp;
                    up
                    <br />
                    GigabitEthernet1/0/3 &nbsp;&nbsp; 35.72.15.17 &nbsp;&nbsp; up &nbsp;&nbsp; up
                  </div>
                </div>

                <InfoBox variant="real-world">
                  <h4 className="mb-3 font-semibold text-blue-300">🌍 What Did We Just Build?</h4>
                  <p className="mb-3 text-gray-300">
                    You just configured a distribution switch with 3 uplinks to other
                    routers/switches:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">g1/0/1 (35.72.15.2/30):</strong> Connects to
                      another switch at 35.72.15.1
                    </li>
                    <li>
                      <strong className="text-white">g1/0/2 (35.72.15.6/30):</strong> Connects to
                      another switch at 35.72.15.5
                    </li>
                    <li>
                      <strong className="text-white">g1/0/3 (35.72.15.17/30):</strong> Connects to
                      another switch at 35.72.15.18
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    This is exactly how real enterprise networks are built!
                  </p>
                </InfoBox>
              </LessonSection>

              {/* TRANSITION: FROM SWITCHES TO ROUTERS */}
              <div className="my-24 rounded-xl border-4 border-blue-500 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-12">
                <h2 className="mb-8 text-center text-5xl font-bold text-blue-300">
                  🚀 Hardware Change: Now Using Routers
                </h2>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">⚠️ Device Transition Alert</p>
                  <p className="text-gray-300">
                    Starting with this lesson, you're working with a{' '}
                    <strong className="text-white">Cisco 1941 ISR router</strong>, not the Catalyst
                    2960 switch from earlier lessons. The interface names and default behaviors are
                    different!
                  </p>
                </InfoBox>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border-2 border-gray-600 bg-gray-800 p-6">
                    <h4 className="mb-4 text-xl font-bold text-blue-300">
                      Catalyst 2960 Switch
                      <br />
                      <span className="text-sm text-gray-400">(Lessons 1-13)</span>
                    </h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-400">•</span>
                        <span>
                          <strong className="text-white">Interfaces:</strong> FastEthernet (fa0/1),
                          GigabitEthernet (g0/1)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-400">•</span>
                        <span>
                          <strong className="text-white">Default mode:</strong> Layer 2 switchport
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-400">•</span>
                        <span>
                          <strong className="text-white">Primary use:</strong> Connect devices in a
                          LAN
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-400">•</span>
                        <span>
                          <strong className="text-white">Commands:</strong>{' '}
                          <code>switchport mode</code>, VLANs, trunks
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border-2 border-green-500 bg-gray-800 p-6">
                    <h4 className="mb-4 text-xl font-bold text-green-300">
                      Cisco 1941 Router
                      <br />
                      <span className="text-sm text-gray-400">(Lessons 14+)</span>
                    </h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-400">•</span>
                        <span>
                          <strong className="text-white">Interfaces:</strong> GigabitEthernet0/0,
                          GigabitEthernet0/1
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-400">•</span>
                        <span>
                          <strong className="text-white">Default mode:</strong> Layer 3 routed port
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-400">•</span>
                        <span>
                          <strong className="text-white">Primary use:</strong> Route between
                          networks/WANs
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-green-400">•</span>
                        <span>
                          <strong className="text-white">Commands:</strong> <code>ip route</code>,
                          routing protocols, no switchport commands
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Diagram title="Interface Naming Comparison">
                  {`Catalyst 2960 Switch             Cisco 1941 Router
┌──────────────────────┐     ┌──────────────────────┐
│ FastEthernet0/1      │     │ GigabitEthernet0/0   │
│ FastEthernet0/2      │     │ GigabitEthernet0/1   │
│ ...                  │     │ Vlan1 (management)   │
│ FastEthernet0/24     │     └──────────────────────┘
│ GigabitEthernet0/1   │
│ GigabitEthernet0/2   │     Router interfaces:
│ Vlan1 (management)   │     - NO FastEthernet
└──────────────────────┘     - Routed by default
                             - Can set IP directly
Switch ports:
- Layer 2 by default
- Need "no switchport" for L3`}
                </Diagram>

                <div className="mt-8 rounded-lg border border-blue-600 bg-blue-900/40 p-6">
                  <h4 className="mb-3 text-lg font-semibold text-blue-300">
                    💡 What This Means For You
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <span>
                        Interface names change: Use <code>GigabitEthernet0/0</code> or{' '}
                        <code>g0/0</code> instead of <code>fa0/1</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <span>
                        No <code>switchport</code> commands on routers—interfaces are routed by
                        default
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <span>
                        Focus shifts from VLANs/trunking to IP routing and connecting networks
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* LESSON 14: STATIC ROUTING */}
              <LessonSection title="Static Routing: Directing Traffic">
                <p className="my-6 text-xl text-gray-200">
                  Routers need to know where to send packets. Static routes are manual instructions
                  you configure.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What is Routing?</h2>
                <p className="mb-4 text-gray-300">
                  Imagine you're at a massive mall with thousands of stores. You want to find the
                  food court. Without directions, you're lost! Routing is like having a map that
                  tells you:
                </p>
                <ul className="ml-8 list-disc space-y-2 text-gray-300">
                  <li>"To reach the food court, go through Exit 3"</li>
                  <li>"To reach parking lot B, go through Exit 1"</li>
                  <li>"For everything else, go to the information desk"</li>
                </ul>
                <p className="mt-4 text-gray-300">
                  Routers need the same kind of directions for network traffic!
                </p>

                <Diagram title="Default Route - The Internet Exit">
                  {`Your Network          Your Router         The Internet
┌──────────┐         ┌───────────┐        ┌────────────┐
│ Computer │ ─────►  │  Router   │ ─────► │   ISP      │
│          │         │           │        │            │
│ Wants to │         │ "Send     │        │ Forward    │
│ reach    │         │ everything│        │ to final   │
│ Google   │         │ to ISP!"  │        │ destination│
└──────────┘         └───────────┘        └────────────┘
                         │
                 ip route 0.0.0.0 0.0.0.0 [ISP IP]
                 └── This means "all traffic"`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  What is 0.0.0.0 0.0.0.0?
                </h2>
                <p className="mb-6 text-gray-300">
                  <code>0.0.0.0 0.0.0.0</code> is the "catch-all" route, also called a{' '}
                  <strong className="text-white">default route</strong>. Think of it as: "If you
                  don't know where to send a packet, send it here!"
                </p>

                <InfoBox variant="info">
                  <p className="mb-2 font-semibold text-green-200">Translation:</p>
                  <p className="text-gray-300">
                    <code>ip route 0.0.0.0 0.0.0.0 35.72.13.1</code>
                  </p>
                  <p className="mt-2 text-gray-300">
                    Means: "For ANY destination we don't have a specific route for, send it to
                    35.72.13.1"
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Floating Static Routes: The Backup Plan
                </h2>
                <p className="mb-6 text-gray-300">
                  What happens if your primary internet connection fails? You need a backup! This is
                  where <strong className="text-white">floating static routes</strong> come in.
                </p>

                <Diagram title="Dual ISP Redundancy">
                  {`                ┌──────────────┐
                │  ISP 1       │  ← Primary (Fast fiber)
                │  35.72.13.1  │     AD = 1 (default)
                └──────────────┘
                       ▲
                       │ Normal traffic [ACTIVE]
                       │
                ┌──────────────┐
                │ Your Router  │
                └──────────────┘
                       │
                       │ Backup (only if ISP 1 fails)
                       ▼
                ┌──────────────┐
                │  ISP 2       │  ← Backup (Slower DSL)
                │  35.72.13.2  │     AD = 254 (backup)
                └──────────────┘`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Administrative Distance (AD)
                </h2>
                <p className="mb-6 text-gray-300">
                  AD is the "trust level" of a route. Lower number = more trusted = preferred.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Primary Route (AD = 1)</h4>
                    <Diagram>
                      {`ip route 0.0.0.0 0.0.0.0 35.72.13.1

AD 1 is default
Router uses this route first
Fast, reliable connection`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h4 className="mb-3 font-semibold text-white">Backup Route (AD = 254)</h4>
                    <Diagram>
                      {`ip route 0.0.0.0 0.0.0.0 35.72.13.2 254

AD 254 = "only if needed"
Router ignores unless primary fails
Slower backup connection`}
                    </Diagram>
                  </div>
                </div>

                <InfoBox variant="real-world">
                  <h4 className="mb-3 font-semibold text-blue-300">
                    🌍 Business Continuity Example
                  </h4>
                  <p className="mb-3 text-gray-300">
                    A hospital MUST stay online — patients' lives depend on it! They have:
                  </p>
                  <ul className="ml-6 space-y-1 text-gray-300">
                    <li>
                      <strong className="text-white">Primary:</strong> Fast fiber connection (AD 1)
                    </li>
                    <li>
                      <strong className="text-white">Backup:</strong> Slower cable connection (AD
                      254)
                    </li>
                    <li>
                      <strong className="text-white">Last Resort:</strong> Cellular modem (AD 253)
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    If fiber fails, cable automatically takes over. If both fail, cellular kicks in!
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure a primary default route with a floating backup:
                </p>

                <Exercise
                  exercise={lesson21 as ExerciseType}
                  grammar={routerGrammar}
                  deviceModel="1941-router"
                />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="text-gray-300">
                    Type: <code>show ip route</code>
                  </p>
                  <p className="mt-2 text-gray-300">
                    You should see two default routes (0.0.0.0/0):
                  </p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-300">
                    <li>One via 35.72.13.1 with AD 1</li>
                    <li>One via 35.72.13.2 with AD 254</li>
                  </ul>
                </div>
              </LessonSection>

              {/* LESSON 15: OSPF BASICS */}
              <LessonSection title="OSPF: Dynamic Routing Protocol">
                <p className="my-6 text-xl text-gray-200">
                  Static routes are manual. OSPF is automatic! Routers talk to each other and figure
                  out the best paths.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Static vs Dynamic Routing
                </h2>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-red-600 bg-red-900 p-6">
                    <h4 className="mb-3 font-semibold text-red-300">❌ Static Routing (Manual)</h4>
                    <ul className="ml-6 list-disc space-y-2 text-gray-300">
                      <li>You configure every route by hand</li>
                      <li>If a link fails, routes don't update</li>
                      <li>Hard to manage in large networks</li>
                      <li>Simple but not scalable</li>
                    </ul>
                    <p className="mt-4 text-gray-400">
                      <strong>Best for:</strong> Small networks, backup routes
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">
                      ✅ Dynamic Routing (Automatic)
                    </h4>
                    <ul className="ml-6 list-disc space-y-2 text-gray-300">
                      <li>Routers automatically share information</li>
                      <li>Routes update when topology changes</li>
                      <li>Calculates best paths automatically</li>
                      <li>Scales to huge networks</li>
                    </ul>
                    <p className="mt-4 text-gray-400">
                      <strong>Best for:</strong> Medium to large networks
                    </p>
                  </div>
                </div>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What is OSPF?</h2>
                <p className="mb-4 text-lg text-gray-300">
                  <strong className="text-white">OSPF</strong> = Open Shortest Path First
                </p>
                <ul className="ml-8 list-disc space-y-3 text-gray-300">
                  <li>
                    <strong className="text-white">Open:</strong> Industry standard (not
                    proprietary)
                  </li>
                  <li>
                    <strong className="text-white">Shortest Path:</strong> Calculates fastest route
                  </li>
                  <li>
                    <strong className="text-white">First:</strong> Uses best path first
                  </li>
                </ul>

                <Diagram title="OSPF in Action">
                  {`NORMAL OPERATION:
                Cost 10 (Fast!)
[Router A] ═══════════════════════ [Router B]
    │                                   │
    │                                   │
    └────── [Router C] ─────────────────┘
              Cost 30 (Backup)

OSPF chooses top path (Cost 10)
Traffic flows: A → B directly

IF TOP LINK FAILS:
[Router A] ══════ [X] LINK DOWN ═══ [Router B]
    │                                   │
    │         OSPF recalculates!        │
    └────── [Router C] ─────────────────┘
              Cost 30 (Now used!)

OSPF automatically switches to backup path
Traffic flows: A → C → B`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Wildcard Masks Explained
                </h2>
                <p className="mb-6 text-gray-300">
                  Wildcard masks are the OPPOSITE of subnet masks:
                </p>

                <InfoBox variant="info">
                  <p className="mb-3 font-semibold text-green-200">Quick Guide:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <code>0.0.0.0</code> = Match this EXACT IP address (one host)
                    </li>
                    <li>
                      <code>0.0.0.255</code> = Match this network (all hosts in /24)
                    </li>
                    <li>
                      <code>0.0.255.255</code> = Match this major network (all hosts in /16)
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    In wildcard: <strong className="text-white">0 = must match</strong>,{' '}
                    <strong className="text-white">255 = don't care</strong>
                  </p>
                </InfoBox>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-red-200">⚠️ Area 0 is Special</p>
                  <p className="text-gray-300">
                    Area 0 is called the "backbone area". All other areas must connect to Area 0.
                    For most basic configurations, everything is in Area 0.
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Task 1: Basic OSPF
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure OSPF to advertise a single network:
                </p>

                <Exercise
                  exercise={lesson22 as ExerciseType}
                  grammar={routerGrammar}
                  deviceModel="1941-router"
                />

                <InfoBox variant="info">
                  <ProTip>
                    <p className="mb-2 text-gray-300">
                      <code>network 35.72.12.2 0.0.0.0 area 0</code> breaks down to:
                    </p>
                    <ul className="ml-6 list-disc space-y-2 text-gray-300">
                      <li>
                        <strong className="text-white">35.72.12.2</strong> = The IP address to match
                      </li>
                      <li>
                        <strong className="text-white">0.0.0.0</strong> = Wildcard mask (match
                        exactly)
                      </li>
                      <li>
                        <strong className="text-white">area 0</strong> = Put this network in area 0
                      </li>
                    </ul>
                  </ProTip>
                </InfoBox>

                <h2 className="mt-16 mb-6 text-3xl font-bold text-blue-400">
                  OSPF on ALL Layer 3 Interfaces
                </h2>
                <p className="mb-6 text-gray-300">
                  In real networks (and CyberPatriot!), you often need OSPF on{' '}
                  <strong className="text-white">ALL</strong> your Layer 3 interfaces — not just
                  one. This means adding a <code>network</code> command for each interface's IP!
                </p>

                <Diagram title="Layer 3 Switch with Multiple OSPF Networks">
                  {`┌─────────────────────────────────────────────────────┐
│         CorporateDistributionSwitch1                │
│                                                     │
│  g1/0/1: 35.72.15.2/30  ←── network statement needed│
│  g1/0/2: 35.72.15.6/30  ←── network statement needed│
│  g1/0/3: 35.72.15.17/30 ←── network statement needed│
│                                                     │
│  VLAN 1:   172.16.16.1/24  ←── network statement needed│
│  VLAN 100: 35.72.10.1/24   ←── network statement needed│
│  VLAN 200: 33.2.169.1/24   ←── network statement needed│
│                                                     │
│  Each IP needs to be advertised in OSPF!           │
└─────────────────────────────────────────────────────┘

router ospf 1
 network 35.72.15.2 0.0.0.0 area 0
 network 35.72.15.6 0.0.0.0 area 0
 network 35.72.15.17 0.0.0.0 area 0
 network 172.16.16.1 0.0.0.0 area 0
 network 35.72.10.1 0.0.0.0 area 0
 network 33.2.169.1 0.0.0.0 area 0`}
                </Diagram>

                <InfoBox variant="info">
                  <h4 className="mb-3 font-semibold text-blue-300">🏠 Mailbox Analogy</h4>
                  <p className="mb-3 text-gray-300">
                    Think of OSPF like registering your addresses with the post office:
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      Each <code>network</code> command is like saying: "Hey, I'm responsible for
                      this address!"
                    </li>
                    <li>
                      Other routers learn: "To reach 35.72.10.0, send traffic to this switch!"
                    </li>
                    <li>
                      If you forget to add a network, other routers won't know how to reach it!
                    </li>
                  </ul>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Task 2: OSPF on ALL Interfaces
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure OSPF for a Layer 3 switch with multiple interfaces (like in a real
                  scenario!):
                </p>

                <Exercise
                  exercise={lesson23 as ExerciseType}
                  grammar={routerGrammar}
                  deviceModel="1941-router"
                />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verify your work:</p>
                  <p className="mb-2 text-gray-300">
                    Type: <code>show running-config</code>
                  </p>
                  <p className="text-gray-300">
                    You should see under <code>router ospf 1</code>:
                  </p>
                  <div className="mt-2 rounded-lg bg-gray-800 p-3 font-mono text-sm">
                    router ospf 1<br />
                    &nbsp;<span className="text-yellow-300">network 35.72.15.2 0.0.0.0 area 0</span>
                    <br />
                    &nbsp;<span className="text-yellow-300">network 35.72.15.6 0.0.0.0 area 0</span>
                    <br />
                    &nbsp;
                    <span className="text-yellow-300">network 35.72.15.17 0.0.0.0 area 0</span>
                    <br />
                    &nbsp;
                    <span className="text-yellow-300">network 172.16.16.1 0.0.0.0 area 0</span>
                    <br />
                    &nbsp;<span className="text-yellow-300">network 35.72.10.1 0.0.0.0 area 0</span>
                    <br />
                    &nbsp;<span className="text-yellow-300">network 33.2.169.1 0.0.0.0 area 0</span>
                    <br />!
                  </div>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">🏆 CyberPatriot Tip</p>
                  <p className="text-gray-300">
                    When you see "Configure OSPF for <strong>all</strong> Layer 3 interfaces" — you
                    need to add a<code>network</code> command for{' '}
                    <strong>every single IP address</strong> on the device. Check{' '}
                    <code>show ip interface brief</code> to see all your IPs!
                  </p>
                </InfoBox>
              </LessonSection>

              {/* LESSON 16: OSPF INTERFACE COST */}
              <LessonSection title="OSPF Interface Cost: Path Preference">
                <p className="my-6 text-xl text-gray-200">
                  OSPF chooses paths based on "cost" — lower cost is better. You can manually set
                  costs to control traffic flow!
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">What is OSPF Cost?</h2>
                <p className="mb-4 text-gray-300">
                  OSPF assigns a "cost" to each link based on its bandwidth. Think of cost as:
                </p>
                <ul className="ml-8 list-disc space-y-2 text-gray-300">
                  <li>
                    <strong className="text-white">Low cost</strong> = Fast, preferred path (like a
                    highway)
                  </li>
                  <li>
                    <strong className="text-white">High cost</strong> = Slow, avoid if possible
                    (like a dirt road)
                  </li>
                </ul>

                <Diagram title="Path Selection Example">
                  {`                 Cost 10 (Fiber - Fast!)
    [Router A] ════════════════════ [Router B]
        │                               │
        │                               │
        │ Cost 30                       │
        │ (Copper - Medium)             │
        │                               │
    [Router C] ─────────────────────────┘
                Cost 50 (DSL - Slow)

OSPF adds costs along path:
- Path 1: A → B = Cost 10 [BEST!]
- Path 2: A → C → B = Cost 80 (30 + 50)

OSPF always chooses Path 1 (lowest total cost)`}
                </Diagram>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Default OSPF Cost Calculation
                </h2>
                <p className="mb-6 text-gray-300">
                  By default, OSPF calculates cost based on bandwidth:
                </p>

                <InfoBox variant="info">
                  <p className="mb-3 font-semibold text-green-200">
                    Formula: Cost = 100,000,000 / bandwidth in bps
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">10 Gbps link:</strong> Cost = 1
                    </li>
                    <li>
                      <strong className="text-white">1 Gbps link:</strong> Cost = 1
                    </li>
                    <li>
                      <strong className="text-white">100 Mbps link:</strong> Cost = 1
                    </li>
                    <li>
                      <strong className="text-white">10 Mbps link:</strong> Cost = 10
                    </li>
                  </ul>
                  <p className="mt-3 text-gray-300">
                    Higher bandwidth = Lower cost = Preferred path!
                  </p>
                </InfoBox>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">
                  Why Manually Set Cost?
                </h2>
                <p className="mb-4 text-gray-300">
                  Sometimes you want to override the automatic calculation:
                </p>

                <InfoBox variant="real-world">
                  <h4 className="mb-3 font-semibold text-blue-300">🌍 Real-World Scenarios</h4>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">Traffic Engineering:</strong> Force traffic
                      through specific paths
                    </li>
                    <li>
                      <strong className="text-white">Load Balancing:</strong> Distribute traffic
                      across multiple links
                    </li>
                    <li>
                      <strong className="text-white">Backup Links:</strong> Make backup paths less
                      preferred
                    </li>
                    <li>
                      <strong className="text-white">Cost Considerations:</strong> Expensive
                      satellite link = high cost even if fast
                    </li>
                  </ul>
                </InfoBox>

                <div className="my-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-green-600 bg-green-900 p-6">
                    <h4 className="mb-3 font-semibold text-green-300">
                      Low Cost Interface (Primary)
                    </h4>
                    <Diagram variant="success">
                      {`interface g0/0
ip ospf cost 10

[✓] Primary path
[✓] Fast link
[✓] Use this first`}
                    </Diagram>
                  </div>
                  <div className="rounded-lg border border-yellow-600 bg-yellow-900 p-6">
                    <h4 className="mb-3 font-semibold text-yellow-300">
                      High Cost Interface (Backup)
                    </h4>
                    <Diagram>
                      {`interface g0/2
ip ospf cost 30

[!] Backup path
[!] Slower link
[!] Use if primary fails`}
                    </Diagram>
                  </div>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-red-200">🏆 CyberPatriot Tip</p>
                  <p className="text-gray-300">
                    Scenarios often require setting specific OSPF costs to control traffic flow. Pay
                    attention to requirements like "prefer path through Router A" — you'll need to
                    adjust costs!
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Your Task
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Configure OSPF costs on two interfaces to control path preference:
                </p>

                <Exercise
                  exercise={lesson24 as ExerciseType}
                  grammar={routerGrammar}
                  deviceModel="1941-router"
                />
              </LessonSection>

              {/* CAPSTONE: FULL SCENARIO */}
              <LessonSection title="Capstone: Full Network Configuration">
                <p className="my-6 text-xl text-gray-200">
                  Time to put it ALL together! This exercise simulates a real CyberPatriot scenario.
                  You'll configure a complete Layer 3 distribution switch from scratch.
                </p>

                <h2 className="mt-12 mb-6 text-3xl font-bold text-blue-400">The Scenario</h2>
                <p className="mb-6 text-gray-300">
                  You've been hired to configure{' '}
                  <strong className="text-white">CorporateDistributionSwitch1</strong> for a company
                  network. Here are your requirements:
                </p>

                <div className="my-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <h4 className="mb-4 font-semibold text-white">📋 Configuration Requirements</h4>

                  <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                      <h5 className="mb-2 font-semibold text-blue-300">Device Setup:</h5>
                      <ul className="ml-6 list-disc space-y-1 text-gray-300">
                        <li>
                          Hostname: <code>CorporateDistributionSwitch1</code>
                        </li>
                      </ul>
                    </div>

                    <div className="border-b border-gray-700 pb-4">
                      <h5 className="mb-2 font-semibold text-blue-300">
                        Layer 3 Interfaces (Routed Ports):
                      </h5>
                      <ul className="ml-6 list-disc space-y-1 text-gray-300">
                        <li>
                          Gigabit 1/0/1: <code>35.72.15.2/30</code>
                        </li>
                        <li>
                          Gigabit 1/0/2: <code>35.72.15.6/30</code>
                        </li>
                        <li>
                          Gigabit 1/0/3: <code>35.72.15.17/30</code>
                        </li>
                      </ul>
                    </div>

                    <div className="border-b border-gray-700 pb-4">
                      <h5 className="mb-2 font-semibold text-blue-300">VLANs & SVIs:</h5>
                      <ul className="ml-6 list-disc space-y-1 text-gray-300">
                        <li>Create VLANs 100 and 200</li>
                        <li>
                          VLAN 1 SVI: <code>172.16.16.1/24</code>
                        </li>
                        <li>
                          VLAN 100 SVI: <code>35.72.10.1/24</code>
                        </li>
                        <li>
                          VLAN 200 SVI: <code>33.2.169.1/24</code>
                        </li>
                      </ul>
                    </div>

                    <div className="border-b border-gray-700 pb-4">
                      <h5 className="mb-2 font-semibold text-blue-300">Trunk Port:</h5>
                      <ul className="ml-6 list-disc space-y-1 text-gray-300">
                        <li>Gigabit 1/0/4 should be a trunk allowing only VLANs 1, 100, and 200</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="mb-2 font-semibold text-blue-300">OSPF Routing:</h5>
                      <ul className="ml-6 list-disc space-y-1 text-gray-300">
                        <li>Configure OSPF for ALL Layer 3 interfaces</li>
                        <li>Use cost 10 on g1/0/1 (primary path)</li>
                        <li>Use cost 30 on g1/0/2 (backup path)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <InfoBox variant="important">
                  <p className="mb-2 font-semibold text-yellow-200">🏆 Competition Tip</p>
                  <p className="text-gray-300">
                    This is EXACTLY the type of scenario you'll see in CyberPatriot! Take your time,
                    follow the requirements carefully, and verify each step with <code>show</code>{' '}
                    commands.
                  </p>
                </InfoBox>

                <h3 className="mt-16 mb-6 flex items-center gap-3 text-3xl font-bold text-blue-400">
                  <span className="text-4xl">👉</span> Complete Configuration
                </h3>
                <p className="mb-8 text-lg text-gray-300">
                  Follow these steps to complete the full configuration. This is a long one — take
                  it step by step!
                </p>

                <Exercise
                  exercise={lesson25 as ExerciseType}
                  grammar={routerGrammar}
                  deviceModel="1941-router"
                />

                <div className="my-8 rounded-lg border border-green-600 bg-green-900 p-6">
                  <p className="mb-3 font-semibold text-green-300">✓ Verification Checklist:</p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>
                      ☐ <code>show vlan brief</code> — See VLANs 100 and 200
                    </li>
                    <li>
                      ☐ <code>show ip interface brief</code> — All interfaces up with correct IPs
                    </li>
                    <li>
                      ☐ <code>show running-config</code> — OSPF has 6 network statements
                    </li>
                    <li>
                      ☐ <code>show running-config</code> — g1/0/1 has <code>ip ospf cost 10</code>
                    </li>
                    <li>
                      ☐ <code>show running-config</code> — g1/0/2 has <code>ip ospf cost 30</code>
                    </li>
                    <li>
                      ☐ <code>show running-config</code> — g1/0/4 shows trunk with allowed VLANs
                      1,100,200
                    </li>
                  </ul>
                </div>

                <InfoBox variant="real-world">
                  <h4 className="mb-3 font-semibold text-blue-300">
                    🎓 What You Just Accomplished
                  </h4>
                  <p className="mb-3 text-gray-300">
                    Congratulations! You just configured a complete corporate distribution switch
                    with:
                  </p>
                  <ul className="ml-6 list-disc space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">3 routed uplinks</strong> using /30 subnets for
                      router connections
                    </li>
                    <li>
                      <strong className="text-white">3 SVIs</strong> acting as default gateways for
                      each VLAN
                    </li>
                    <li>
                      <strong className="text-white">OSPF on all interfaces</strong> for dynamic
                      routing
                    </li>
                    <li>
                      <strong className="text-white">OSPF costs</strong> to control primary vs
                      backup paths
                    </li>
                    <li>
                      <strong className="text-white">Restricted trunk</strong> for security
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-300">
                    This is EXACTLY what network engineers do in the real world — and in
                    CyberPatriot competitions!
                  </p>
                </InfoBox>
              </LessonSection>
            </LessonCounterProvider>

            {/* COMPLETION SECTION */}
            <div className="my-20 rounded-lg border-2 border-green-600 bg-green-900 p-12">
              <div className="mb-10 text-center">
                <div className="mb-6 text-7xl">🎉</div>
                <h2 className="mb-4 text-4xl font-bold text-white">Congratulations!</h2>
                <p className="text-xl text-gray-300">
                  You've completed the entire course and learned real networking skills!
                </p>
              </div>

              <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ CLI navigation and modes
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">✅ TAB completion</div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">✅ Setting hostnames</div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">✅ Password security</div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Password entry experience
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Sub-configuration modes
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Understanding IP addresses
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Network hardware basics
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Management access configuration
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Creating and organizing VLANs
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ SVI (VLAN interfaces) for routing
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Trunk ports (ALL vs restricted VLANs)
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">✅ SSH secure access</div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Layer 3 switching & routed ports
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Point-to-point /30 subnets
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ Static routing with floating backups
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ OSPF on ALL Layer 3 interfaces
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-gray-300">
                  ✅ OSPF cost manipulation
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}

export default function LearnPage() {
  const [switchGrammar, setSwitchGrammar] = useState<CommandGrammar | null>(null);
  const [layer3Grammar, setLayer3Grammar] = useState<CommandGrammar | null>(null);
  const [routerGrammar, setRouterGrammar] = useState<CommandGrammar | null>(null);

  useEffect(() => {
    // Load all three device grammars
    import('@/lib/data-loader').then(({ loadGrammar }) => {
      Promise.all([
        loadGrammar('2960-switch'),
        loadGrammar('3650-24ps'),
        loadGrammar('1941-router'),
      ]).then(([switchGr, layer3Gr, routerGr]) => {
        setSwitchGrammar(switchGr);
        setLayer3Grammar(layer3Gr);
        setRouterGrammar(routerGr);
      });
    });
  }, []);

  if (!switchGrammar || !layer3Grammar || !routerGrammar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading terminal...</div>
      </div>
    );
  }

  return (
    <TerminalRegistryProvider>
      <PageContent
        switchGrammar={switchGrammar}
        _layer3Grammar={layer3Grammar}
        routerGrammar={routerGrammar}
      />
    </TerminalRegistryProvider>
  );
}
