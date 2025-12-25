'use client';

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TerminalManager } from '@/lib/terminal-manager';
import { useScrollAnimations } from '@/lib/useScrollAnimations';
import { useProgressBar } from '@/lib/useProgressBar';
import type { CommandGrammar } from '@src/types';


import { LessonSection } from '@/components/LessonSection';
import { InfoBox } from '@/components/InfoBox';
import { ProTip } from '@/components/ProTip';
import { SkillCard } from '@/components/SkillCard';
import { Diagram } from '@/components/Diagram';
import { LessonCounterProvider } from '@/lib/LessonCounterContext';

// Dynamically import Terminal to avoid SSR issues with XTerm
const Terminal = dynamic(() => import('@/components/Terminal'), {
  ssr: false,
  loading: () => <div className="bg-gray-800 p-8 rounded text-gray-400 text-center">Loading terminal...</div>
});

export default function LearnPage() {
  const [grammar, setGrammar] = useState<CommandGrammar | null>(null);

  // Enable interactivity features
  useScrollAnimations();
  useProgressBar();

  useEffect(() => {
    const manager = new TerminalManager();
    manager.initialize().then(g => setGrammar(g));
  }, []);

  if (!grammar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-300 text-xl">Loading CLI Grammar...</div>
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-gray-900">
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div id="lessons">
          <LessonCounterProvider>
          {/* INTRODUCTION */}
          <LessonSection title="Welcome, Future Network Engineer! 👋" isIntro>
            <p className="text-2xl text-white my-6">
              You're about to learn how to configure real network devices — the computers that make the internet work!
            </p>

            <p className="text-gray-300 text-lg mb-6">
              Think of this like learning to drive, but instead of a car, you're controlling routers and switches
              that connect the entire world. Pretty cool, right?
            </p>

            <InfoBox variant="info">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">📚 How This Works</h3>
              <ul className="ml-6 space-y-3 text-gray-300">
                <li><strong className="text-white">Read</strong> each concept explanation</li>
                <li><strong className="text-white">Practice</strong> in the interactive terminal</li>
                <li><strong className="text-white">Scroll down</strong> to learn the next concept</li>
                <li>That's it! No tabs, no clicking around — just scroll and learn</li>
              </ul>
            </InfoBox>

            <h2 className="text-4xl font-bold text-white mt-16 mb-8">
              What You'll Master
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-10">
              <SkillCard icon="🎯" title="CLI Navigation" description="Modes, commands, tab completion" />
              <SkillCard icon="🔐" title="Security" description="Passwords, SSH, encryption" />
              <SkillCard icon="🌐" title="IP Addressing" description="IPv4, subnets, gateways" />
              <SkillCard icon="🏢" title="VLANs & Switching" description="Access ports, trunks, Layer 2" />
              <SkillCard icon="⚡" title="Layer 3 Switching" description="Routed ports, no switchport" />
              <SkillCard icon="🗺️" title="Static Routing" description="Default routes, floating backup" />
              <SkillCard icon="🔄" title="Dynamic Routing" description="OSPF protocol, areas" />
              <SkillCard icon="⚙️" title="Path Control" description="OSPF costs, traffic engineering" />
            </div>
          </LessonSection>

          {/* LESSON 1: NAVIGATING MODES */}
          <LessonSection title="Navigating Between Modes">
            <p className="text-xl text-gray-200 my-6">
              Let's start with the basics. Every network device has different <strong className="text-white">"modes"</strong> — like different levels of access.
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Understanding the Prompt</h2>
            <p className="text-gray-300 mb-8 text-lg">The prompt (the text before where you type) tells you where you are:</p>

            <div className="space-y-3 my-8">
              <div className="flex items-center gap-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400 px-4 py-2 rounded bg-gray-900 min-w-[200px]">Switch&gt;</code>
                <span className="text-gray-400">User mode — Limited access</span>
              </div>
              <div className="flex items-center gap-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400 px-4 py-2 rounded bg-gray-900 min-w-[200px]">Switch#</code>
                <span className="text-gray-400">Privileged mode — More access</span>
              </div>
              <div className="flex items-center gap-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400 px-4 py-2 rounded bg-gray-900 min-w-[200px]">Switch(config)#</code>
                <span className="text-gray-400">Configuration mode — Where you make changes</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-16 mb-6">Moving Between Modes</h2>
            <p className="text-gray-300 mb-6 text-lg">
              You'll use these commands constantly to navigate between modes:
            </p>

            <div className="space-y-4 my-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400">enable</code>
                <p className="text-gray-400 mt-2">Moves from user mode (<code>&gt;</code>) to privileged mode (<code>#</code>)</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400">configure terminal</code>
                <p className="text-gray-400 mt-2">Moves from privileged mode (<code>#</code>) to configuration mode (<code>(config)#</code>)</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400">exit</code>
                <p className="text-gray-400 mt-2">Goes back one level at a time</p>
              </div>
            </div>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Try It Now
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Practice moving between modes in the terminal below:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li>Type <code>enable</code> and press Enter — watch the prompt change from <code>&gt;</code> to <code>#</code></li>
              <li>Type <code>configure terminal</code> and press Enter — watch the prompt change to <code>(config)#</code></li>
              <li>Type <code>exit</code> — notice you go back one level to <code>#</code></li>
              <li>Type <code>configure terminal</code> again to enter config mode</li>
              <li>Type <code>exit</code> again to return to privileged mode</li>
            </ol>

            <Terminal grammar={grammar} />

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
            <p className="text-xl text-gray-200 my-6">
              One of the most powerful tools in your CLI toolkit is the <kbd>TAB</kbd> key. It saves time and prevents mistakes!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What Does TAB Do?</h2>
            <p className="text-gray-300 mb-6 text-lg">
              Pressing <kbd>TAB</kbd> does two amazing things:
            </p>

            <div className="space-y-4 my-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-3 text-lg">1. Auto-Completes Commands</h4>
                <p className="text-gray-300 mb-3">Type part of a command and press <kbd>TAB</kbd> to complete it automatically.</p>
                <div className="bg-gray-900 p-4 rounded mt-3">
                  <p className="text-gray-400 mb-2">Example:</p>
                  <p className="text-green-400 font-mono">Switch# conf{'<TAB>'}</p>
                  <p className="text-gray-400 mt-2">→ Completes to: <code className="text-blue-400">configure</code></p>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-3 text-lg">2. Shows Available Options</h4>
                <p className="text-gray-300 mb-3">If multiple commands match, pressing <kbd>TAB</kbd> twice shows all options.</p>
                <div className="bg-gray-900 p-4 rounded mt-3">
                  <p className="text-gray-400 mb-2">Example:</p>
                  <p className="text-green-400 font-mono">Switch# sh{'<TAB><TAB>'}</p>
                  <p className="text-gray-400 mt-2">→ Shows: <code className="text-blue-400">show</code>, <code className="text-blue-400">shutdown</code>, etc.</p>
                </div>
              </div>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2">Press <kbd>TAB</kbd> at any time to auto-complete commands or see options!</p>
                <p className="text-gray-300">This is the #1 trick professionals use. It prevents typos and speeds you up.</p>
              </ProTip>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Try It Now
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Practice using TAB completion in the terminal below:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li>Type <code>enable</code> to enter privileged mode</li>
              <li>Type <code>conf</code> then press <kbd>TAB</kbd> — watch it auto-complete to <code>configure</code></li>
              <li>Type <code> t</code> (space + t) then press <kbd>TAB</kbd> — it should complete to <code>terminal</code></li>
              <li>Press Enter to enter configuration mode</li>
            </ol>

            <Terminal grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300">
                  <li>Use <kbd>TAB</kbd> liberally — it's not cheating, it's smart!</li>
                  <li>TAB completion works at any mode level — user, privileged, or configuration</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON: ABORTING NAME LOOKUP */}
          <LessonSection title="What to Do When Things Freeze 🚨">
            <p className="text-xl text-gray-200 my-6">
              You'll sometimes type a command incorrectly or in the wrong mode, and something unexpected happens — 
              the CLI seems to <strong className="text-red-300">freeze</strong> for what feels like forever!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The Mystery Freeze</h2>
            <p className="text-gray-300 mb-6 text-lg">
              Here's what commonly happens to beginners:
            </p>

            <div className="bg-gray-800 border border-yellow-600 rounded-lg p-6 my-8">
              <p className="text-gray-400 mb-3">You type a command in the wrong place:</p>
              <Diagram>
                {`Switch> end`}
              </Diagram>
              <p className="text-gray-400 mt-4">Then you see this confusing message:</p>
              <Diagram>
                {`Translating "end"...domain server (255.255.255.255)
% Name lookup aborted`}
              </Diagram>
              <p className="text-yellow-300 mt-4 font-semibold">
                And your terminal is stuck for 5 seconds! 😰
              </p>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What's Happening?</h2>
            <p className="text-gray-300 mb-6">
              When IOS doesn't recognize what you typed as a valid command, it thinks you might be trying to connect to 
              another device by hostname. So it tries to look up that name using <strong className="text-white">DNS</strong> (Domain Name System) — 
              just like your web browser looks up website names.
            </p>

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 my-8">
              <h4 className="text-blue-300 font-semibold mb-3 text-lg">Why Does This Happen?</h4>
              <p className="text-gray-300 mb-4">
                Cisco devices have a helpful feature: if you type a word that isn't a command, it assumes you want to 
                <strong className="text-cyan-300"> telnet</strong> to another device with that name. But since there's probably no DNS server configured, 
                it has to <strong className="text-yellow-300">wait until the lookup times out</strong>.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mt-4">
                <p className="text-gray-400 text-sm mb-2">Common mistakes that trigger this:</p>
                <ul className="ml-6 space-y-1 text-gray-300 text-sm">
                  <li>• Typing <code>end</code> in User mode (it only works in Config mode)</li>
                  <li>• Misspelling commands: <code>cofigure</code> instead of <code>configure</code></li>
                  <li>• Typing Linux/Windows commands by mistake: <code>ls</code>, <code>dir</code>, <code>clear</code></li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-red-400 mt-12 mb-6">The Timeout Problem</h2>
            <p className="text-gray-300 mb-6">
              A <strong className="text-white">timeout</strong> is when your device waits for a response that never comes. 
              In this case, IOS is waiting for a DNS server to respond, but:
            </p>
            <ul className="ml-8 space-y-3 text-gray-300 mb-6 list-disc">
              <li>There probably isn't a DNS server configured</li>
              <li>Even if there is one, it won't know what "end" or your typo means</li>
              <li>So IOS waits... and waits... until it gives up (typically 5 seconds in this simulator)</li>
            </ul>

            <InfoBox variant="important">
              <p className="text-red-200 font-semibold mb-2 text-lg">⏱️ Don't Just Wait!</p>
              <p className="text-gray-300">
                While 5 seconds doesn't sound like much, it feels like an eternity when you're working. 
                And if you keep making typos, those delays add up fast!
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-green-400 mt-16 mb-6">The Escape Sequence: CTRL+SHIFT+6</h2>
            <p className="text-gray-300 mb-6 text-lg">
              Here's the <strong className="text-green-300">secret trick</strong> every Cisco engineer knows:
            </p>

            <div className="bg-green-900 border-2 border-green-500 rounded-lg p-8 my-8">
              <div className="text-center mb-6">
                <p className="text-green-200 text-2xl font-bold mb-4">Press these keys together:</p>
                <div className="flex items-center justify-center gap-4">
                  <kbd className="bg-gray-800 text-white px-6 py-4 rounded-lg text-3xl font-mono border-2 border-gray-600 shadow-lg">
                    CTRL
                  </kbd>
                  <span className="text-white text-3xl">+</span>
                  <kbd className="bg-gray-800 text-white px-6 py-4 rounded-lg text-3xl font-mono border-2 border-gray-600 shadow-lg">
                    SHIFT
                  </kbd>
                  <span className="text-white text-3xl">+</span>
                  <kbd className="bg-gray-800 text-white px-6 py-4 rounded-lg text-3xl font-mono border-2 border-gray-600 shadow-lg">
                    6
                  </kbd>
                </div>
              </div>
              <p className="text-gray-300 text-center text-lg mt-6">
                This is called the <strong className="text-yellow-300">"escape sequence"</strong> — 
                it immediately stops whatever the device is doing and gives you back control!
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 my-8">
              <h4 className="text-white font-semibold mb-4 text-lg">How It Works:</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">1️⃣</span>
                  <div>
                    <p className="text-gray-300">You type a bad command and see "Translating..."</p>
                    <code className="text-red-400 text-sm">Translating "end"...domain server (255.255.255.255)</code>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">2️⃣</span>
                  <div>
                    <p className="text-gray-300">Instead of waiting, press <kbd>CTRL+SHIFT+6</kbd></p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">3️⃣</span>
                  <div>
                    <p className="text-gray-300">You immediately see:</p>
                    <code className="text-yellow-400 text-sm">% Name lookup aborted</code>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">4️⃣</span>
                  <div>
                    <p className="text-gray-300">The prompt returns and you can keep working! 🎉</p>
                  </div>
                </div>
              </div>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-3">
                  <strong>Why these specific keys?</strong> <kbd>CTRL+SHIFT+6</kbd> is Cisco's universal 
                  "interrupt" signal. It works for aborting not just DNS lookups, but also ping commands, 
                  traceroutes, and other operations you want to stop early.
                </p>
                <p className="text-gray-300">
                  <strong>Important:</strong> You must press all three keys together — <kbd>CTRL</kbd>, 
                  <kbd>SHIFT</kbd>, and <kbd>6</kbd>. Just <kbd>CTRL+6</kbd> won't work! This makes it harder 
                  to trigger accidentally while you're typing commands.
                </p>
              </ProTip>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Try It Now
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Let's deliberately trigger this error so you can practice escaping from it:
            </p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li>
                At the <code>Switch&gt;</code> prompt, type: <code className="text-red-400">end</code> and press Enter
                <p className="text-sm text-gray-400 mt-2">
                  (Remember: <code>end</code> only works in configuration mode, so this will trigger the DNS lookup)
                </p>
              </li>
              <li>
                Watch for the message: <code className="text-yellow-400">Translating "end"...</code>
              </li>
              <li>
                <strong className="text-green-300">Immediately press:</strong> <kbd>CTRL+SHIFT+6</kbd>
                <p className="text-sm text-gray-400 mt-2">
                  You should see <code className="text-yellow-400">% Name lookup aborted</code> and get your prompt back
                </p>
              </li>
              <li>
                Try it again with other "fake" commands: <code className="text-red-400">test</code>, <code className="text-red-400">hello</code>, 
                or any nonsense word — then use <kbd>CTRL+SHIFT+6</kbd> to abort
              </li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 my-8">
              <p className="text-blue-300 font-semibold mb-3 text-lg">💡 Key Takeaway</p>
              <p className="text-gray-300 mb-3">
                When you see "Translating..." appear after typing a command:
              </p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>✓ You probably typed the command in the wrong mode or misspelled it</li>
                <li>✓ IOS is trying to interpret it as a hostname to connect to</li>
                <li>✓ Press <kbd>CTRL+SHIFT+6</kbd> immediately to abort the lookup</li>
                <li>✓ Check your spelling and make sure you're in the right mode!</li>
              </ul>
            </div>

            <InfoBox variant="important">
              <p className="text-yellow-200 font-semibold mb-2">🎯 Real-World Wisdom</p>
              <p className="text-gray-300">
                Every network engineer has hit this problem hundreds of times. The mark of a professional 
                isn't avoiding mistakes — it's knowing <kbd>CTRL+SHIFT+6</kbd> by heart so you can 
                recover instantly! This keystroke will become muscle memory very quickly.
              </p>
            </InfoBox>
          </LessonSection>

          {/* LESSON 3: SETTING HOSTNAME */}
          <LessonSection title="Giving Your Device a Name">
            <p className="text-xl text-gray-200 my-6">
              Just like you name your phone "Brian's iPhone", network devices need names too!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What's a Hostname?</h2>
            <p className="text-gray-300 mb-6 text-lg">
              The hostname is your device's name. It appears in the prompt and helps identify which device you're working on.
              In a real network, you might have dozens of switches — good names help you stay organized!
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
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

            <h2 className="text-3xl font-bold text-blue-400 mt-16 mb-6">Saving Your Work</h2>

            <InfoBox variant="important">
              <p className="text-red-200 font-semibold text-lg mb-2">⚠️ CRITICAL:</p>
              <p className="text-gray-200 mb-3">Changes in Cisco IOS are NOT saved automatically!</p>
              <p className="text-gray-300">You must use <code>write memory</code> to save, or your changes disappear when the device restarts.</p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure your first device with these steps:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>configure terminal</code> — Enter configuration mode</li>
              <li><code>hostname MyFirstSwitch</code> — Set the name (watch the prompt change!)</li>
              <li><code>end</code> — Exit configuration mode</li>
              <li><code>write memory</code> — <strong className="text-yellow-300">SAVE YOUR WORK!</strong></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3 text-lg">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>The prompt shows your new hostname instead of "Switch"</li>
                <li>You see <code className="text-emerald-400">[OK]</code> after running <code>write memory</code></li>
                <li>
                  <strong className="text-cyan-300">Verify:</strong> Type <code>show running-config</code> and confirm you see your hostname near the top:
                  <div className="bg-gray-800 rounded-lg p-3 mt-2 ml-4 font-mono text-sm">
                    Building configuration...<br />
                    !<br />
                    <span className="text-yellow-300">hostname MyFirstSwitch</span><br />
                    !
                  </div>
                </li>
              </ul>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300">
                  The <code>show running-config</code> command displays ALL configuration on your device. 
                  It's one of the most important commands you'll use — network engineers check it constantly to verify their work!
                </p>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 4: ENABLE SECRET */}
          <LessonSection title="Security: Adding a Password">
            <p className="text-xl text-gray-200 my-6">
              Without a password, anyone can access and change your device. Let's lock it down!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Passwords Matter</h2>
            <p className="text-gray-300 mb-4">Imagine if anyone could reconfigure your school's network. They could:</p>
            <ul className="ml-8 space-y-2 text-gray-300 list-disc">
              <li>Block internet access for everyone</li>
              <li>See private traffic</li>
              <li>Create security holes</li>
              <li>Cause chaos!</li>
            </ul>

            <p className="text-gray-300 mt-6">
              The <code>enable secret</code> command sets a password to enter privileged mode.
              It's encrypted (scrambled) so even if someone sees the configuration file, they can't read your password.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-red-900 border border-red-600 rounded-lg p-6">
                <h4 className="text-red-300 font-semibold mb-3">❌ Without Password</h4>
                <Diagram>
                  {`Anyone → Switch → Full access!
      (No protection)`}
                </Diagram>
              </div>
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">✅ With Password</h4>
                <Diagram>
                  {`You → Password → Switch → Secure!
    (Protected)`}
                </Diagram>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Password Best Practices</h2>

            <InfoBox variant="info">
              <p className="text-green-200 font-semibold mb-3">Good passwords have:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>Mix of uppercase and lowercase letters</li>
                <li>Numbers</li>
                <li>Special characters (!@#$%)</li>
                <li>At least 8 characters</li>
              </ul>
              <p className="mt-4 text-gray-300">Example: <code>C1sc0R0ck$</code> (notice the 1 is number one, 0 is zero)</p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Add security to your device:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>configure terminal</code> — Enter configuration mode</li>
              <li><code>hostname CorporateSwitch</code> — Give it a professional name</li>
              <li><code>enable secret C1sc0R0ck$</code> — Set the password (be careful with special characters!)</li>
              <li><code>end</code> — Exit configuration mode</li>
              <li><code>write memory</code> — Save your work</li>
            </ol>

            <Terminal grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300">
                  You can view your configuration with <code>show running-config</code>.
                  Try it! Notice how the password is encrypted (shows as a long hash).
                </p>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 5: PASSWORD ENTRY EXPERIENCE */}
          <LessonSection title="Understanding Password Entry in IOS">
            <p className="text-xl text-gray-200 my-6">
              Now that you've set a password, let's experience what it's like to use it. This is where many students get confused!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The Big Surprise: You Won't See Anything!</h2>
            <p className="text-gray-300 mb-6">
              When you type a password on a website, you usually see asterisks (<code>********</code>) or dots (<code>••••••••</code>). 
              This gives you feedback that you're typing.
            </p>

            <p className="text-gray-300 mb-6">
              <strong className="text-white">But IOS is different!</strong> When you type a password in the Cisco CLI, 
              you see absolutely NOTHING. No asterisks, no dots, no indication that you're typing at all.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Web Password (What you're used to)</h4>
                <Diagram>
                  {`Username: admin
Password: ••••••••
                    ↑
              You see dots!`}
                </Diagram>
                <p className="text-gray-400 mt-3">Visual feedback as you type</p>
              </div>
              <div className="bg-blue-900 border border-blue-600 rounded-lg p-6">
                <h4 className="text-blue-300 font-semibold mb-3">IOS CLI Password (The real thing)</h4>
                <Diagram>
                  {`Switch> enable
Password: 
          ↑
    You see NOTHING!`}
                </Diagram>
                <p className="text-gray-400 mt-3">No visual feedback at all</p>
              </div>
            </div>

            <InfoBox variant="important">
              <p className="text-red-200 font-semibold text-lg mb-2">⚠️ This is NORMAL!</p>
              <p className="text-gray-300 mb-3">
                The screen not showing anything when you type a password is <strong className="text-white">not a bug</strong> — 
                it's a security feature!
              </p>
              <p className="text-gray-300">
                Someone looking over your shoulder can't even tell how long your password is.
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Does IOS Do This?</h2>
            <p className="text-gray-300 mb-4">There are two main security reasons:</p>
            <ul className="ml-8 space-y-3 text-gray-300 list-disc">
              <li>
                <strong className="text-white">Password Length Privacy:</strong> If someone sees asterisks, 
                they can count them and know your password length. With no feedback, they learn nothing!
              </li>
              <li>
                <strong className="text-white">Console History:</strong> If the password appeared on screen (even as dots), 
                it might get saved in logs or screen recordings.
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

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What Happens If You Get It Wrong?</h2>
            <p className="text-gray-300 mb-6">
              If you type the wrong password, IOS will simply say:
            </p>

            <div className="bg-gray-800 border border-red-600 rounded-lg p-6 my-8">
              <code className="text-red-400 font-mono">% Bad secrets</code>
              <p className="text-gray-400 mt-3">This means: "Wrong password, try again!"</p>
            </div>

            <p className="text-gray-300 mb-6">
              Don't panic — just type <code>enable</code> again and try entering your password more carefully.
            </p>

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300">
                  <li>Type slowly and deliberately when entering passwords</li>
                  <li>Remember: uppercase letters, lowercase letters, numbers, and special characters ALL matter</li>
                  <li>If you make a mistake while typing, press Backspace — even though you can't see it, it works!</li>
                  <li>Passwords are case-sensitive: <code>Cisco123</code> ≠ <code>cisco123</code></li>
                </ul>
              </ProTip>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              First, you'll set up a password, then practice using it with no visual feedback:
            </p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode (no password yet)</li>
              <li><code>configure terminal</code> — Enter configuration mode</li>
              <li><code>enable secret C1sc0R0ck$</code> — Set the password</li>
              <li><code>end</code> — Exit configuration mode</li>
              <li><code>disable</code> — Go back to user mode (the password is now active!)</li>
              <li><strong className="text-yellow-300">Now the real test:</strong> Type <code>enable</code> and press Enter</li>
              <li>You'll be prompted for a password</li>
              <li>Type <code>C1sc0R0ck$</code> carefully — <strong className="text-yellow-300">you won't see anything appear on screen!</strong></li>
              <li>Press Enter and watch the prompt change to <code>#</code> (success!)</li>
              <li>Type <code>disable</code> to go back to user mode</li>
              <li>Try <code>enable</code> again, but this time type the wrong password on purpose</li>
              <li>See the "% Bad secrets" message</li>
              <li>Try one more time with the correct password: <code>C1sc0R0ck$</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>You can successfully enter privileged mode by typing the password without seeing it</li>
                <li>You understand this is normal CLI behavior, not a bug</li>
                <li>You've seen what happens when you enter the wrong password</li>
                <li>
                  <strong className="text-cyan-300">Verify:</strong> Type <code>show running-config</code> and confirm you see your password configured:
                  <div className="bg-gray-800 rounded-lg p-3 mt-2 ml-4 font-mono text-sm">
                    enable secret C1sc0R0ck$
                  </div>
                  <p className="text-gray-400 text-sm mt-2 ml-4">
                    (In a real Cisco device, this would show as an encrypted hash for security)
                  </p>
                </li>
              </ul>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2">
                  <strong>Get in the habit:</strong> After configuring any security feature, use <code>show running-config</code> to verify it was applied correctly.
                </p>
                <p className="text-gray-300">
                  Professional network engineers verify everything before moving on to the next task!
                </p>
              </ProTip>
            </InfoBox>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-2">🌍 Real World Note</h4>
              <p className="text-gray-300">
                This "no visual feedback" behavior isn't just Cisco — it's common in many Unix/Linux systems, 
                enterprise networking equipment from Juniper, Arista, and others. 
                Once you get used to it, you'll feel like a pro!
              </p>
            </InfoBox>

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 my-8">
              <p className="text-blue-200 font-semibold mb-3">💡 Coming Up Next</p>
              <p className="text-gray-300">
                Now that you know how to set configuration, you'll learn how to <strong>remove</strong> it using the powerful <code>no</code> command!
              </p>
            </div>
          </LessonSection>

          {/* LESSON: THE NO COMMAND */}
          <LessonSection title="The 'no' Command: Undoing Configuration">
            <p className="text-xl text-gray-200 my-6">
              You've learned how to <strong>add</strong> configuration — but what if you make a mistake or need to change something? 
              Enter the <code className="text-yellow-300">no</code> command: IOS's "undo button"!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The Power of 'no'</h2>
            <p className="text-gray-300 mb-6">
              In IOS, almost every configuration command can be reversed by putting <code>no</code> in front of it. 
              Think of it like a time machine for your device's configuration!
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">Adding Configuration</h4>
                <Diagram>
                  {`Switch(config)# hostname Router1
Switch(config)# enable secret MyPass123`}
                </Diagram>
                <p className="text-gray-400 mt-3">You add settings</p>
              </div>
              <div className="bg-red-900 border border-red-600 rounded-lg p-6">
                <h4 className="text-red-300 font-semibold mb-3">Removing Configuration</h4>
                <Diagram>
                  {`Router1(config)# no hostname
Router1(config)# no enable secret`}
                </Diagram>
                <p className="text-gray-400 mt-3">You remove them with 'no'</p>
              </div>
            </div>

            <InfoBox variant="important">
              <p className="text-yellow-200 font-semibold mb-2">🎯 Key Concept</p>
              <p className="text-gray-300">
                The <code>no</code> command doesn't just delete things randomly — it <strong>reverses specific commands</strong>. 
                If you set something, <code>no</code> unsets it. If you enabled something, <code>no</code> disables it.
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">How 'no' Works</h2>
            <p className="text-gray-300 mb-4">
              The pattern is simple: take the command you used to set something, and put <code>no</code> at the front:
            </p>

            <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-6">
              <div>
                <p className="text-blue-300 font-semibold mb-2">Setting a hostname:</p>
                <code className="text-gray-300">hostname Lab-Router</code>
                <p className="text-green-300 font-semibold mb-2 mt-4">Removing it:</p>
                <code className="text-gray-300">no hostname</code>
                <p className="text-gray-400 mt-2 text-sm">→ Resets to default "Switch"</p>
              </div>

              <hr className="border-gray-700" />

              <div>
                <p className="text-blue-300 font-semibold mb-2">Setting a password:</p>
                <code className="text-gray-300">enable secret MySecurePass</code>
                <p className="text-green-300 font-semibold mb-2 mt-4">Removing it:</p>
                <code className="text-gray-300">no enable secret</code>
                <p className="text-gray-400 mt-2 text-sm">→ Removes the password requirement</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What Happens When You Use 'no'?</h2>
            <p className="text-gray-300 mb-6">
              Using <code>no</code> typically does one of two things:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-800 border-l-4 border-blue-500 p-6">
                <h4 className="text-blue-300 font-semibold mb-2">1. Resets to Default</h4>
                <p className="text-gray-300 mb-3">
                  Some commands have a default value. Using <code>no</code> brings it back:
                </p>
                <code className="text-sm text-gray-400">no hostname</code>
                <p className="text-gray-400 mt-2 text-sm">→ Resets hostname back to "Switch"</p>
              </div>

              <div className="bg-gray-800 border-l-4 border-purple-500 p-6">
                <h4 className="text-purple-300 font-semibold mb-2">2. Completely Removes</h4>
                <p className="text-gray-300 mb-3">
                  Other commands don't have defaults — using <code>no</code> removes them entirely:
                </p>
                <code className="text-sm text-gray-400">no enable secret</code>
                <p className="text-gray-400 mt-2 text-sm">→ No password required for enable (back to how it was initially)</p>
              </div>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300">
                  <strong>Pro Tip:</strong> When you use <code>no</code>, you typically <strong>don't</strong> include the value you set. 
                  For example, use <code>no hostname</code> instead of <code>no hostname Router1</code>. 
                  IOS knows what you configured and will remove it!
                </p>
              </ProTip>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Is This Useful?</h2>
            <p className="text-gray-300 mb-4">
              The <code>no</code> command is essential for several scenarios:
            </p>

            <ul className="ml-8 space-y-4 text-gray-300 list-disc">
              <li>
                <strong className="text-white">Fixing Mistakes:</strong> Typed the wrong hostname? 
                <code>no hostname</code> and start over
              </li>
              <li>
                <strong className="text-white">Changing Configuration:</strong> Need to change a password? 
                Remove the old one with <code>no</code>, then set a new one
              </li>
              <li>
                <strong className="text-white">Troubleshooting:</strong> Something not working? 
                Remove configuration to test if that was causing the problem
              </li>
              <li>
                <strong className="text-white">Decommissioning:</strong> No longer need security on a lab device? 
                <code>no enable secret</code> removes the password
              </li>
            </ul>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Practice the complete configuration lifecycle — set something, verify it, then remove it:
            </p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>configure terminal</code> — Enter configuration mode</li>
              <li><code>hostname TestLab</code> — Set a hostname (watch the prompt change!)</li>
              <li><code>enable secret Practice123</code> — Set a password</li>
              <li><code>end</code> — Exit to privileged mode to see your changes</li>
              <li><strong className="text-cyan-300">Checkpoint: </strong><code>show running-config</code> — See both hostname and password in config</li>
              <li>Notice your prompt shows <code>TestLab#</code></li>
              <li><code>disable</code> — Go to user mode (you'll see <code>TestLab&gt;</code>)</li>
              <li><code>enable</code> — Try to enter privileged mode (password prompt appears)</li>
              <li>Type <code>Practice123</code> carefully (no visual feedback) and press Enter</li>
              <li><code>configure terminal</code> — Back to config mode</li>
              <li><strong className="text-yellow-300">Now remove everything:</strong></li>
              <li><code>no enable secret</code> — Remove the password</li>
              <li><code>no hostname</code> — Reset hostname to default</li>
              <li>Notice the prompt changed back to <code>Switch(config)#</code></li>
              <li><code>end</code> — Exit to privileged mode</li>
              <li><strong className="text-cyan-300">Verify removal: </strong><code>show running-config</code> — Confirm both are gone!</li>
              <li><code>disable</code> — Exit to user mode</li>
              <li><code>enable</code> — Try again (no password needed now!)</li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>You can set a hostname and password, then remove both</li>
                <li>You used <code>show running-config</code> to verify configuration before and after using <code>no</code> commands</li>
                <li>You understand that <code>no hostname</code> resets to "Switch" (default)</li>
                <li>You understand that <code>no enable secret</code> removes password protection</li>
                <li>You verified the password was removed by using <code>enable</code> without being prompted</li>
              </ul>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2">
                  <strong>Professional Workflow:</strong> Network engineers always verify their changes with <code>show</code> commands before moving on.
                </p>
                <p className="text-gray-300">
                  Make it a habit: Configure → Show → Verify → Save!
                </p>
              </ProTip>
            </InfoBox>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-2">🌍 Real World Application</h4>
              <p className="text-gray-300 mb-3">
                Network engineers use the <code>no</code> command constantly:
              </p>
              <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                <li>Removing old VLANs that are no longer used</li>
                <li>Disabling interfaces for security (and re-enabling them later with <code>no shutdown</code>)</li>
                <li>Cleaning up routing configuration</li>
                <li>Removing access control lists (ACLs) for testing</li>
              </ul>
              <p className="text-gray-300 mt-3">
                Master the <code>no</code> command now, and you'll save yourself hours of frustration later!
              </p>
            </InfoBox>

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 my-8">
              <p className="text-blue-200 font-semibold mb-3">💡 Coming Up Next</p>
              <p className="text-gray-300">
                Now that you can both add and remove configuration, you're ready to learn about sub-configuration modes — 
                configurations within configurations!
              </p>
            </div>
          </LessonSection>

          {/* LESSON 6: SUB-CONFIGURATION MODES */}
          <LessonSection title="Working with Sub-Configuration Modes">
            <p className="text-xl text-gray-200 my-6">
              So far you've worked with two modes: privileged (<code>#</code>) and global config (<code>(config)#</code>).
              Now you'll learn about <strong className="text-white">sub-configuration modes</strong> — configurations within configurations!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Understanding Configuration Layers</h2>
            <p className="text-gray-300 mb-6">
              When you configure specific parts of a device (like interfaces, routing protocols, or VTY lines),
              you enter a <strong className="text-white">sub-configuration mode</strong>.
              This creates multiple layers you need to navigate through.
            </p>

            <Diagram title="Configuration Layers">
              {`Switch#                    ← Privileged mode
   ↓ (configure terminal)
Switch(config)#            ← Global config mode
   ↓ (interface vlan 1)
Switch(config-if)#         ← Interface config mode (deeper!)
   ↓ (exit)
Switch(config)#            ← Back one level
   ↓ (exit)
Switch#                    ← Back to privileged mode`}
            </Diagram>

            <InfoBox variant="info">
              <p className="text-gray-300 mb-2">
                Notice the prompt changes to <code>(config-if)#</code> when you're in interface configuration mode.
              </p>
              <p className="text-gray-300">
                The prompt ALWAYS tells you exactly where you are!
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Exit vs End: The Important Difference</h2>
            <p className="text-gray-300 mb-4">
              When you're deep in configuration modes, you have two ways to get back to privileged mode:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">exit — One Level at a Time</h4>
                <Diagram>
                  {`Switch(config-if)# exit
Switch(config)# exit
Switch#

Takes 2 exits to get back`}
                </Diagram>
                <p className="text-gray-400 mt-3"><strong>Use when:</strong> You want to go back one level</p>
              </div>
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">end — Jump Directly</h4>
                <Diagram>
                  {`Switch(config-if)# end
Switch#

Takes 1 command! ✅`}
                </Diagram>
                <p className="text-gray-400 mt-3"><strong>Use when:</strong> You want to jump straight to privileged mode</p>
              </div>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2">Use <code>end</code> when you're deep in configuration and want to get back to privileged mode quickly!</p>
                <p className="text-gray-300">Use <code>exit</code> when you want to go back just one level (e.g., from interface config back to global config).</p>
              </ProTip>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Practice navigating sub-configuration modes:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>configure terminal</code> — Enter global config mode</li>
              <li><code>interface vlan 1</code> — Enter interface configuration mode (notice the prompt changes!)</li>
              <li><code>exit</code> — Go back one level to <code>(config)#</code></li>
              <li><code>interface vlan 1</code> — Enter interface config mode again</li>
              <li><code>end</code> — Jump directly back to <code>#</code> (compare how fast this is!)</li>
            </ol>

            <Terminal grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300">
                  <li>Watch how the prompt changes: <code>(config)#</code> → <code>(config-if)#</code></li>
                  <li>You'll use sub-configuration modes for interfaces, routing protocols, VTY lines, and more</li>
                  <li>The deeper you go, the more useful <code>end</code> becomes!</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 7: IP ADDRESSING BASICS */}
          <LessonSection title="Understanding IP Addresses">
            <p className="text-xl text-gray-200 my-6">
              Every device on a network needs an address so others can find it. This is called an IP address.
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What's an IP Address?</h2>
            <p className="text-gray-300 mb-6">Think of an IP address like a phone number or street address:</p>
            <ul className="ml-8 space-y-3 text-gray-300 list-disc mb-8">
              <li><strong className="text-white">Phone number:</strong> Lets people call you</li>
              <li><strong className="text-white">Street address:</strong> Lets mail reach you</li>
              <li><strong className="text-white">IP address:</strong> Lets data reach your device</li>
            </ul>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 my-8">
              <h4 className="text-white font-semibold mb-6 text-center">IP Address Format</h4>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-blue-600 text-white font-bold text-2xl px-6 py-4 rounded">192</div>
                <div className="text-white text-2xl">.</div>
                <div className="bg-blue-600 text-white font-bold text-2xl px-6 py-4 rounded">168</div>
                <div className="text-white text-2xl">.</div>
                <div className="bg-blue-600 text-white font-bold text-2xl px-6 py-4 rounded">1</div>
                <div className="text-white text-2xl">.</div>
                <div className="bg-blue-600 text-white font-bold text-2xl px-6 py-4 rounded">100</div>
              </div>
              <p className="text-center text-gray-400 mb-4">Four numbers separated by dots (periods)</p>
              <p className="text-center text-gray-300 font-mono text-xl">192.168.1.100</p>
            </div>

            <InfoBox variant="info">
              <p className="text-gray-300 mb-2">
                IP addresses are written as <strong className="text-white">four numbers</strong> separated by dots (periods).
              </p>
              <p className="text-gray-300">
                Each number can be from <strong className="text-white">0 to 255</strong>.
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-16 mb-6">What's a Subnet Mask?</h2>
            <p className="text-gray-300 mb-6">
              Along with an IP address, you'll also configure something called a <strong className="text-white">subnet mask</strong>.
              For now, just know that it's written in the same format as an IP address.
            </p>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 my-8">
              <h4 className="text-white font-semibold mb-6 text-center">Subnet Mask Format</h4>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-green-600 text-white font-bold text-2xl px-6 py-4 rounded">255</div>
                <div className="text-white text-2xl">.</div>
                <div className="bg-green-600 text-white font-bold text-2xl px-6 py-4 rounded">255</div>
                <div className="text-white text-2xl">.</div>
                <div className="bg-green-600 text-white font-bold text-2xl px-6 py-4 rounded">255</div>
                <div className="text-white text-2xl">.</div>
                <div className="bg-green-600 text-white font-bold text-2xl px-6 py-4 rounded">0</div>
              </div>
              <p className="text-center text-gray-400 mb-4">Also four numbers separated by dots</p>
              <p className="text-center text-gray-300 font-mono text-xl">255.255.255.0</p>
            </div>

            <InfoBox variant="info">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">255.255.255.0</strong> is the most common subnet mask you'll see.
              </p>
              <p className="text-gray-300">
                Don't worry about what it means yet — you'll use it when configuring devices in the next lesson!
              </p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Try It Now
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Let's see what IP addresses look like on a real device! Don't worry if you don't understand everything yet.
            </p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>show ip interface brief</code> — View IP addresses on interfaces (there won't be any configured yet!)</li>
              <li>Look at the output — you'll see interface names and their status</li>
            </ol>

            <Terminal grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300">
                  The output might look confusing now, but you're seeing the same format you'll use later: 
                  four numbers separated by dots! Notice how interfaces can have IP addresses assigned to them.
                </p>
              </ProTip>
            </InfoBox>

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 my-8">
              <p className="text-blue-200 font-semibold mb-3">💡 Coming Up Next</p>
              <p className="text-gray-300">
                Before we configure IP addresses, let's learn about the physical parts of a network switch and how to connect to it.
              </p>
            </div>
          </LessonSection>

          {/* LESSON 8: NETWORK HARDWARE BASICS */}
          <LessonSection title="Network Hardware: Switches and Interfaces">
            <p className="text-xl text-gray-200 my-6">
              Before we configure a switch, let's look at what one actually looks like and understand its physical parts!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What Does a Switch Look Like?</h2>
            <p className="text-gray-300 mb-6">
              A network switch is a box with lots of ports (also called <strong className="text-white">interfaces</strong>) 
              where you plug in network cables. Switches come in different sizes — some have 8 ports, some have 24 or 48 ports!
            </p>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 my-8">
              <h4 className="text-white font-semibold mb-4 text-center">Typical Network Switch</h4>
              <div className="bg-gray-900 p-8 rounded-lg">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/2550T-PWR-Front.jpg/1280px-2550T-PWR-Front.jpg" 
                  alt="Cisco network switch showing multiple ethernet ports on the front panel"
                  className="w-full rounded border border-gray-600"
                />
              </div>
              <p className="text-gray-400 text-center mt-4">
                This switch has 48 regular ports plus special uplink ports on the right
              </p>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What is an Interface?</h2>
            <p className="text-gray-300 mb-6">
              An <strong className="text-white">interface</strong> (or port) is where you plug in a network cable. 
              Each interface has a number so you can identify it, like <code>FastEthernet 0/1</code> or <code>GigabitEthernet 1/0/1</code>.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Interface Types</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><strong className="text-blue-400">FastEthernet (Fa):</strong> 100 Mbps — older, slower</li>
                  <li><strong className="text-green-400">GigabitEthernet (Gi):</strong> 1000 Mbps (1 Gbps) — common</li>
                  <li><strong className="text-purple-400">TenGigabitEthernet:</strong> 10 Gbps — very fast!</li>
                </ul>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Interface Names</h4>
                <ul className="space-y-3 text-gray-300 font-mono text-sm">
                  <li><code className="text-blue-400">FastEthernet 0/1</code> — Port 1</li>
                  <li><code className="text-blue-400">FastEthernet 0/24</code> — Port 24</li>
                  <li><code className="text-green-400">GigabitEthernet 1/0/1</code> — Port 1</li>
                </ul>
                <p className="text-gray-400 mt-4 text-xs">The numbers identify which slot and port</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The Console Port: Your First Connection</h2>
            <p className="text-gray-300 mb-6">
              The <strong className="text-white">console port</strong> is a special port used for initial setup and configuration. 
              It's usually labeled "Console" and looks different from the regular network ports.
            </p>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 my-8">
              <h4 className="text-white font-semibold mb-4 text-center">Console Port Location</h4>
              <div className="bg-gray-900 p-8 rounded-lg">
                <img 
                  src="https://www.cisco.com/c/dam/en/us/td/i/100001-200000/190001-200000/197001-198000/197840.jpg" 
                  alt="Back of Cisco switch showing console port"
                  className="w-full rounded border border-gray-600"
                />
              </div>
              <p className="text-gray-400 text-center mt-4">
                Console port (often blue) is usually on the front or back of the switch
              </p>
            </div>

            <InfoBox variant="info">
              <h4 className="text-blue-300 font-semibold mb-3">Why Do We Need a Console Port?</h4>
              <p className="text-gray-300 mb-3">
                When a switch is brand new (or has no configuration), it doesn't have an IP address yet. 
                You can't connect to it over the network because... well, it's not on the network!
              </p>
              <p className="text-gray-300">
                The console port lets you plug directly into the switch with a special cable to do the initial setup.
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Network Racks</h2>
            <p className="text-gray-300 mb-6">
              In professional environments, switches are mounted in <strong className="text-white">racks</strong> — 
              metal cabinets that hold multiple network devices stacked on top of each other.
            </p>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 my-8">
              <h4 className="text-white font-semibold mb-4 text-center">Equipment Rack</h4>
              <div className="bg-gray-900 p-8 rounded-lg">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Rack001.jpg/800px-Rack001.jpg" 
                  alt="Network equipment rack with multiple switches and servers"
                  className="w-full rounded border border-gray-600"
                />
              </div>
              <p className="text-gray-400 text-center mt-4">
                A typical rack can hold many switches, routers, and servers
              </p>
            </div>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-2">🌍 Real World Example</h4>
              <p className="text-gray-300">
                In your school, there's probably a locked network closet with a rack containing switches. 
                One switch might be on the 1st floor rack, another on the 2nd floor. 
                Each switch has dozens of network cables running to classrooms and offices. 
                The IT person can manage all of them remotely once they're configured!
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Summary: The Two Ways to Access a Switch</h2>
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">1. Console Access</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>✅ Plug a cable into the console port</li>
                  <li>✅ Direct physical connection</li>
                  <li>✅ Works even with no configuration</li>
                  <li>❌ Must be physically present</li>
                </ul>
                <p className="text-gray-400 mt-4"><strong>Use for:</strong> Initial setup</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">2. Remote Access</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>✅ Connect over the network using IP address</li>
                  <li>✅ Manage from anywhere</li>
                  <li>✅ No physical access needed</li>
                  <li>❌ Requires configuration first</li>
                </ul>
                <p className="text-gray-400 mt-4"><strong>Use for:</strong> Day-to-day management</p>
              </div>
            </div>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Explore Your Switch
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Let's look at the interfaces on a switch! These commands show you information about the network interfaces.
            </p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>show ip interface brief</code> — View IP addresses on interfaces (there won't be any configured yet!)</li>
              <li>Look at the output — you'll see interface names and their status</li>
            </ol>

            <Terminal grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2">
                  Notice the interface names in the output! Each interface has a name that indicates what it is.
                  For example, <code>Vlan1</code> is a virtual management interface, while physical ports would be named like <code>FastEthernet0/1</code> or <code>GigabitEthernet1/0/1</code>.
                </p>
                <p className="text-gray-300">
                  The "Status" column shows if the interface is up or down, and "Protocol" shows if it's working properly.
                </p>
              </ProTip>
            </InfoBox>

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 my-8">
              <p className="text-blue-200 font-semibold mb-3">💡 Coming Up Next</p>
              <p className="text-gray-300">
                Now that you know what interfaces are and how to connect to a switch, 
                you'll learn how to configure management access so you can manage it remotely!
              </p>
            </div>
          </LessonSection>

          {/* LESSON 9: MANAGEMENT ACCESS */}
          <LessonSection title="Configuring Management Access">
            <p className="text-xl text-gray-200 my-6">
              Now that you understand IP addresses, let's put that knowledge to use by configuring remote management access on a switch!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What is Management Access?</h2>
            <p className="text-gray-300 mb-6">
              By default, you can only configure a switch by plugging a cable directly into it (console access).
              But in the real world, network devices are in closets, racks, or even different buildings!
            </p>

            <p className="text-gray-300 mb-6">
              <strong className="text-white">Management access</strong> means giving your switch an IP address so you can
              connect to it remotely over the network — without needing physical access.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-red-900 border border-red-600 rounded-lg p-6">
                <h4 className="text-red-300 font-semibold mb-3">❌ Without Management IP</h4>
                <Diagram>
                  {`🏢 Building A          🏢 Building B
     │                      │
     │                      │
   [Switch]          [Switch] ← Need to fix
                            
IT Person must walk there! 👟`}
                </Diagram>
              </div>
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">✅ With Management IP</h4>
                <Diagram>
                  {`🏢 Building A          🏢 Building B
     │                      │
     │   Network Cable      │
   [IT PC] ═══════════ [Switch]
                       IP: 192.168.1.100
                            
Manage from anywhere! 💻`}
                </Diagram>
              </div>
            </div>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-2">🌍 Real World Example</h4>
              <p className="text-gray-300">
                Your school's IT person needs to manage 50 switches across different buildings.
                With management IPs configured, they can connect to any switch from their office using SSH!
                No walking required.
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The Management Interface</h2>
            <p className="text-gray-300 mb-6">
              To manage a switch remotely, the switch itself needs an IP address. 
              Unlike the physical ports you plug cables into, there's a special <strong className="text-white">management interface</strong> where you assign this IP.
            </p>

            <InfoBox variant="info">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Important:</strong> You don't assign the IP to a physical port like <code>FastEthernet 0/1</code>.
              </p>
              <p className="text-gray-300">
                Instead, you use a special interface called <code>interface vlan 1</code> for management access.
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The "no shutdown" Command</h2>
            <p className="text-gray-300 mb-6">
              By default, many interfaces on Cisco devices are in "shutdown" state (turned off).
              The <code>no shutdown</code> command turns the interface on.
            </p>

            <Diagram title="Interface States">
              {`Shutdown (default):  Interface is OFF ❌
                        No traffic flows
                        
no shutdown:         Interface is ON ✅
                        Traffic can flow`}
            </Diagram>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure management access on your switch:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>interface vlan 1</code> — Enter interface configuration for the management interface</li>
              <li><code>ip address 192.168.1.100 255.255.255.0</code> — Assign IP address and subnet mask</li>
              <li><code>no shutdown</code> — Turn the interface on (you'll see a log message!)</li>
              <li><code>exit</code> — Back to global config mode</li>
              <li><code>ip default-gateway 192.168.1.1</code> — Set the default gateway</li>
              <li><code>end</code> — Jump back to privileged mode</li>
              <li><code>write memory</code> — Save your configuration</li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ Verify your work:</p>
              <p className="text-gray-300 mb-2">Type: <code>show ip interface brief</code></p>
              <p className="text-gray-300">You should see:</p>
              <ul className="ml-6 mt-2 space-y-1 text-gray-300 list-disc">
                <li>An interface named <code>Vlan1</code> with IP address 192.168.1.100</li>
                <li>Status: <code>up</code></li>
                <li>Protocol: <code>up</code></li>
              </ul>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300">
                  <li>The default gateway must be on the same network as your IP address</li>
                  <li>In this example: 192.168.1.100 (switch) and 192.168.1.1 (gateway) are both on the 192.168.1.0 network</li>
                  <li>Later, you'll use this IP address to SSH into the switch remotely!</li>
                  <li>You'll learn more about what "vlan 1" means in the next lesson!</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 10: VLANs */}
          <LessonSection title="VLANs: Organizing Your Network">
            <p className="text-xl text-gray-200 my-6">
              VLANs let you split one physical switch into multiple virtual networks. It's like having multiple switches in one!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Use VLANs?</h2>
            <p className="text-gray-300 mb-6">Imagine your school network without VLANs:</p>

            <Diagram title="❌ Without VLANs - Everyone sees everything!">
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
⚠️ Privacy & Security Risk!`}
            </Diagram>

            <p className="text-gray-300 my-6">With VLANs, you can separate them:</p>

            <Diagram title="✅ With VLANs - Organized & Secure!">
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
✅ Students can't see teacher files!`}
            </Diagram>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Creating VLANs</h2>
            <p className="text-gray-300 mb-6">
              Creating a VLAN is easy — just give it a number (1-4094) and optionally a name.
              Then you assign switch ports to that VLAN.
            </p>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-3">🌍 Real School Network</h4>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li><strong className="text-white">VLAN 10:</strong> Student computers (limited internet)</li>
                <li><strong className="text-white">VLAN 20:</strong> Teacher computers (full access)</li>
                <li><strong className="text-white">VLAN 30:</strong> Guest WiFi (internet only)</li>
                <li><strong className="text-white">VLAN 40:</strong> Security cameras (isolated)</li>
                <li><strong className="text-white">VLAN 50:</strong> Servers (restricted access)</li>
              </ul>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Create VLANs and assign ports:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>vlan 100</code> — Create VLAN 100</li>
              <li><code>name Students</code> — Give it a name (optional but helpful!)</li>
              <li><code>exit</code></li>
              <li><code>vlan 200</code> — Create VLAN 200</li>
              <li><code>name Teachers</code></li>
              <li><code>exit</code></li>
              <li><code>interface fa0/2</code> — Configure port FastEthernet 0/2</li>
              <li><code>switchport mode access</code> — Make it an access port</li>
              <li><code>switchport access vlan 100</code> — Assign to VLAN 100</li>
              <li><code>interface fa0/3</code> — Configure another port</li>
              <li><code>switchport mode access</code></li>
              <li><code>switchport access vlan 200</code> — Assign to VLAN 200</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ Verify your work:</p>
              <p className="text-gray-300">Type: <code>show vlan brief</code></p>
              <p className="text-gray-300 mt-2">You should see:</p>
              <ul className="ml-6 mt-2 space-y-1 text-gray-300 list-disc">
                <li>VLAN 100 (Students) with port Fa0/2</li>
                <li>VLAN 200 (Teachers) with port Fa0/3</li>
              </ul>
            </div>
          </LessonSection>

          {/* LESSON 11: TRUNK PORTS */}
          <LessonSection title="Trunk Ports: Connecting Switches">
            <p className="text-xl text-gray-200 my-6">
              What if you have switches in different rooms or buildings? Trunk ports carry multiple VLANs between switches!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Access Port vs Trunk Port</h2>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Access Port</h4>
                <p className="text-gray-300 mb-3">Carries <strong>ONE</strong> VLAN</p>
                <Diagram>
                  {`[Computer] ──── Access Port
 VLAN 100       (Only VLAN 100)`}
                </Diagram>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Trunk Port</h4>
                <p className="text-gray-300 mb-3">Carries <strong>MULTIPLE</strong> VLANs</p>
                <Diagram>
                  {`[Switch A] ──── Trunk ──── [Switch B]
   VLAN 100 ═══════════════ VLAN 100
   VLAN 200 ═══════════════ VLAN 200`}
                </Diagram>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Limit Allowed VLANs?</h2>
            <p className="text-gray-300 mb-6">
              By default, trunks allow ALL VLANs (1-4094). But best practice is to allow only the VLANs you need:
            </p>
            <ul className="ml-8 space-y-2 text-gray-300 list-disc">
              <li><strong className="text-white">Security:</strong> Don't send unnecessary traffic</li>
              <li><strong className="text-white">Performance:</strong> Less broadcast traffic</li>
              <li><strong className="text-white">Best Practice:</strong> Be explicit about what you allow</li>
            </ul>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300">
                  In CyberPatriot competitions, you often need to restrict trunk VLANs for security points!
                </p>
              </ProTip>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure trunk ports that carry only specific VLANs:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>interface g0/1</code> — GigabitEthernet 0/1 (uplink port)</li>
              <li><code>switchport mode trunk</code> — Make it a trunk</li>
              <li><code>switchport trunk allowed vlan 1,100,200</code> — Allow only these VLANs</li>
              <li><code>exit</code></li>
              <li><code>interface fa0/1</code> — Another trunk port</li>
              <li><code>switchport mode trunk</code></li>
              <li><code>switchport trunk allowed vlan 1,100,200</code></li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>You configured both g0/1 and fa0/1 as trunk ports</li>
                <li>You restricted allowed VLANs to only 1,100,200</li>
                <li>You saved your configuration with <code>write memory</code></li>
                <li>
                  <strong className="text-cyan-300">Verify:</strong> Type <code>show running-config</code> and confirm you see:
                  <div className="bg-gray-800 rounded-lg p-3 mt-2 ml-4 font-mono text-sm">
                    interface GigabitEthernet0/1<br />
                    &nbsp;switchport mode trunk<br />
                    &nbsp;<span className="text-yellow-300">switchport trunk allowed vlan 1,100,200</span><br />
                    !<br />
                    interface FastEthernet0/1<br />
                    &nbsp;switchport mode trunk<br />
                    &nbsp;<span className="text-yellow-300">switchport trunk allowed vlan 1,100,200</span><br />
                    !
                  </div>
                </li>
              </ul>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                  <li>VLAN 1 is included because it's the management VLAN</li>
                  <li>Use commas to separate VLANs: <code>1,100,200</code> (no spaces!)</li>
                  <li>You can also use <code>show vlan brief</code> to see VLAN assignments, but trunk configuration is best viewed in <code>show running-config</code></li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 12: SSH */}
          <LessonSection title="SSH: Secure Remote Access">
            <p className="text-xl text-gray-200 my-6">
              SSH lets network engineers manage devices from anywhere — securely and encrypted!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why SSH Matters</h2>
            <p className="text-gray-300 mb-6">
              Imagine it's 2 AM and a network problem takes your school offline.
              The IT person doesn't want to drive to school — they want to fix it from home!
            </p>

            <p className="text-gray-300 mb-8">SSH (Secure Shell) makes this possible — with encryption so hackers can't steal passwords.</p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-red-900 border border-red-600 rounded-lg p-6">
                <h4 className="text-red-300 font-semibold mb-3">🚫 Telnet (Old Way)</h4>
                <Diagram>
                  {`You → "password: admin123" → Router

⚠️ UNENCRYPTED!
Hacker sees: "password: admin123"
❌ They're in!`}
                </Diagram>
              </div>
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">✅ SSH (Secure Way)</h4>
                <Diagram>
                  {`You → 🔒 %#^&*@!$^&* → Router

✅ ENCRYPTED!
Hacker sees: gibberish
✅ Can't break in!`}
                </Diagram>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">SSH Setup Components</h2>
            <div className="space-y-4 my-8">
              <div className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">1</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Domain Name</h4>
                  <p className="text-gray-400">Required to generate encryption keys</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">2</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">RSA Keys</h4>
                  <p className="text-gray-400">Encryption keys (1024 or 2048 bits)</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">3</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">SSH Version 2</h4>
                  <p className="text-gray-400">More secure than version 1</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">4</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Local User</h4>
                  <p className="text-gray-400">Username and password</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">5</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">VTY Lines</h4>
                  <p className="text-gray-400">Virtual terminals for remote access</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">VTY Lines Explained</h2>
            <p className="text-gray-300 mb-6">
              VTY (Virtual TeletYpe) lines are like "phone lines" for remote connections.
              <code>line vty 0 4</code> means lines 0, 1, 2, 3, 4 — that's 5 simultaneous connections!
            </p>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure complete SSH access (this is a big one!):</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>hostname SecureRouter</code> — Give it a name</li>
              <li><code>ip domain-name cisco.com</code> — Required for key generation</li>
              <li><code>crypto key generate rsa modulus 1024</code> — Generate encryption keys</li>
              <li><code>ip ssh version 2</code> — Use secure version</li>
              <li><code>username admin secret Cyb3rPatriot</code> — Create user account</li>
              <li><code>line vty 0 4</code> — Enter VTY configuration</li>
              <li><code>login local</code> — Use local user database</li>
              <li><code>transport input ssh</code> — Only allow SSH (no Telnet!)</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>You configured all 5 SSH components (domain name, RSA keys, SSH v2, user account, VTY lines)</li>
                <li>You saw the "Generating RSA keys" success message</li>
                <li>You saved your configuration with <code>write memory</code></li>
                <li>
                  <strong className="text-cyan-300">Verify:</strong> Type <code>show running-config</code> and confirm you see all SSH settings:
                  <div className="bg-gray-800 rounded-lg p-3 mt-2 ml-4 font-mono text-sm">
                    <span className="text-yellow-300">hostname SecureRouter</span><br />
                    <span className="text-yellow-300">ip domain-name cisco.com</span><br />
                    <span className="text-yellow-300">ip ssh version 2</span><br />
                    !<br />
                    <span className="text-yellow-300">username admin secret Cyb3rPatriot</span><br />
                    !<br />
                    line vty 0 4<br />
                    &nbsp;<span className="text-yellow-300">login local</span><br />
                    &nbsp;<span className="text-yellow-300">transport input ssh</span><br />
                    !
                  </div>
                </li>
              </ul>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2">
                  <strong>Security Check:</strong> When configuring SSH in the real world, always verify:
                </p>
                <ul className="ml-6 space-y-1 text-gray-300 list-disc">
                  <li><code>show running-config</code> confirms all SSH settings</li>
                  <li><code>show ip ssh</code> would show SSH status (not implemented in this practice environment)</li>
                  <li>VTY lines only allow SSH (transport input ssh) — no Telnet!</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 13: LAYER 3 SWITCHING */}
          <LessonSection title="Layer 3 Switching: Routed Ports">
            <p className="text-xl text-gray-200 my-6">
              Layer 3 switches can both switch AND route! They combine the best of switches and routers.
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Understanding Switch vs Router Ports</h2>
            <p className="text-gray-300 mb-6">
              By default, all switch ports operate at Layer 2 — they handle MAC addresses and VLANs.
              But Layer 3 switches have a special power: you can convert ports to work like router interfaces!
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Layer 2 Port (Default)</h4>
                <Diagram>
                  {`[Computer] ──── [Switch Port]
                 Layer 2
                 MAC: aa:bb:cc...
                 VLAN: 100
                 Works with VLANs`}
                </Diagram>
                <p className="text-gray-400 mt-3"><strong>Used for:</strong> Connecting end devices</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Layer 3 Port (Routed)</h4>
                <Diagram>
                  {`[Router] ──── [Routed Port]
               Layer 3
               IP: 35.72.12.1
               No VLAN!
               Routes packets`}
                </Diagram>
                <p className="text-gray-400 mt-3"><strong>Used for:</strong> Connecting to routers</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">The Magic: "no switchport"</h2>
            <p className="text-gray-300 mb-4">
              The command <code>no switchport</code> transforms a switch port into a routed port. After this command:
            </p>
            <ul className="ml-8 space-y-2 text-gray-300 list-disc">
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
              <p className="text-green-200 font-semibold mb-2">Remember:</p>
              <p className="text-gray-300">
                Layer 3 switches save money! Instead of buying a switch AND a router,
                you buy one device that does both jobs.
              </p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure a routed port on a Layer 3 switch:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>interface g1/0/2</code> — Enter the interface</li>
              <li><code>no switchport</code> — Convert to routed port (this is the key!)</li>
              <li><code>ip address 35.72.12.1 255.255.255.252</code> — Assign IP address</li>
              <li><code>no shutdown</code> — Turn the interface on</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ Verify your work:</p>
              <p className="text-gray-300">Type: <code>show ip interface brief</code></p>
              <p className="text-gray-300 mt-2">You should see g1/0/2 with IP 35.72.12.1 and status "up"</p>
            </div>

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                  <li>The subnet mask is /30 (255.255.255.252) — this gives only 2 usable IPs</li>
                  <li>Perfect for point-to-point links between routers!</li>
                  <li>After "no switchport", you'll see: "Interface will be in routed mode"</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 14: STATIC ROUTING */}
          <LessonSection title="Static Routing: Directing Traffic">
            <p className="text-xl text-gray-200 my-6">
              Routers need to know where to send packets. Static routes are manual instructions you configure.
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What is Routing?</h2>
            <p className="text-gray-300 mb-4">
              Imagine you're at a massive mall with thousands of stores. You want to find the food court.
              Without directions, you're lost! Routing is like having a map that tells you:
            </p>
            <ul className="ml-8 space-y-2 text-gray-300 list-disc">
              <li>"To reach the food court, go through Exit 3"</li>
              <li>"To reach parking lot B, go through Exit 1"</li>
              <li>"For everything else, go to the information desk"</li>
            </ul>
            <p className="text-gray-300 mt-4">Routers need the same kind of directions for network traffic!</p>

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

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What is 0.0.0.0 0.0.0.0?</h2>
            <p className="text-gray-300 mb-6">
              <code>0.0.0.0 0.0.0.0</code> is the "catch-all" route, also called a <strong className="text-white">default route</strong>.
              Think of it as: "If you don't know where to send a packet, send it here!"
            </p>

            <InfoBox variant="info">
              <p className="text-green-200 font-semibold mb-2">Translation:</p>
              <p className="text-gray-300"><code>ip route 0.0.0.0 0.0.0.0 35.72.13.1</code></p>
              <p className="text-gray-300 mt-2">Means: "For ANY destination we don't have a specific route for, send it to 35.72.13.1"</p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Floating Static Routes: The Backup Plan</h2>
            <p className="text-gray-300 mb-6">
              What happens if your primary internet connection fails? You need a backup!
              This is where <strong className="text-white">floating static routes</strong> come in.
            </p>

            <Diagram title="Dual ISP Redundancy">
              {`                ┌──────────────┐
                │  ISP 1       │  ← Primary (Fast fiber)
                │  35.72.13.1  │     AD = 1 (default)
                └──────────────┘
                       ▲
                       │ Normal traffic ✅
                       │
                ┌──────────────┐
                │ Your Router  │
                └──────────────┘
                       │
                       │ Backup (only if ISP 1 fails) 🔄
                       ▼
                ┌──────────────┐
                │  ISP 2       │  ← Backup (Slower DSL)
                │  35.72.13.2  │     AD = 254 (backup)
                └──────────────┘`}
            </Diagram>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Administrative Distance (AD)</h2>
            <p className="text-gray-300 mb-6">
              AD is the "trust level" of a route. Lower number = more trusted = preferred.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Primary Route (AD = 1)</h4>
                <Diagram>
                  {`ip route 0.0.0.0 0.0.0.0 35.72.13.1

AD 1 is default
Router uses this route first
Fast, reliable connection`}
                </Diagram>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Backup Route (AD = 254)</h4>
                <Diagram>
                  {`ip route 0.0.0.0 0.0.0.0 35.72.13.2 254

AD 254 = "only if needed"
Router ignores unless primary fails
Slower backup connection`}
                </Diagram>
              </div>
            </div>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-3">🌍 Business Continuity Example</h4>
              <p className="text-gray-300 mb-3">
                A hospital MUST stay online — patients' lives depend on it! They have:
              </p>
              <ul className="ml-6 space-y-1 text-gray-300">
                <li><strong className="text-white">Primary:</strong> Fast fiber connection (AD 1)</li>
                <li><strong className="text-white">Backup:</strong> Slower cable connection (AD 254)</li>
                <li><strong className="text-white">Last Resort:</strong> Cellular modem (AD 253)</li>
              </ul>
              <p className="text-gray-300 mt-3">If fiber fails, cable automatically takes over. If both fail, cellular kicks in!</p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure a primary default route with a floating backup:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>ip route 0.0.0.0 0.0.0.0 35.72.13.1</code> — Primary route (AD defaults to 1)</li>
              <li><code>ip route 0.0.0.0 0.0.0.0 35.72.13.2 254</code> — Backup route (AD 254)</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ Verify your work:</p>
              <p className="text-gray-300">Type: <code>show ip route</code></p>
              <p className="text-gray-300 mt-2">You should see two default routes (0.0.0.0/0):</p>
              <ul className="ml-6 mt-2 space-y-1 text-gray-300 list-disc">
                <li>One via 35.72.13.1 with AD 1</li>
                <li>One via 35.72.13.2 with AD 254</li>
              </ul>
            </div>
          </LessonSection>

          {/* LESSON 15: OSPF BASICS */}
          <LessonSection title="OSPF: Dynamic Routing Protocol">
            <p className="text-xl text-gray-200 my-6">
              Static routes are manual. OSPF is automatic! Routers talk to each other and figure out the best paths.
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Static vs Dynamic Routing</h2>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-red-900 border border-red-600 rounded-lg p-6">
                <h4 className="text-red-300 font-semibold mb-3">❌ Static Routing (Manual)</h4>
                <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                  <li>You configure every route by hand</li>
                  <li>If a link fails, routes don't update</li>
                  <li>Hard to manage in large networks</li>
                  <li>Simple but not scalable</li>
                </ul>
                <p className="text-gray-400 mt-4"><strong>Best for:</strong> Small networks, backup routes</p>
              </div>
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">✅ Dynamic Routing (Automatic)</h4>
                <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                  <li>Routers automatically share information</li>
                  <li>Routes update when topology changes</li>
                  <li>Calculates best paths automatically</li>
                  <li>Scales to huge networks</li>
                </ul>
                <p className="text-gray-400 mt-4"><strong>Best for:</strong> Medium to large networks</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What is OSPF?</h2>
            <p className="text-gray-300 mb-4 text-lg"><strong className="text-white">OSPF</strong> = Open Shortest Path First</p>
            <ul className="ml-8 space-y-3 text-gray-300 list-disc">
              <li><strong className="text-white">Open:</strong> Industry standard (not proprietary)</li>
              <li><strong className="text-white">Shortest Path:</strong> Calculates fastest route</li>
              <li><strong className="text-white">First:</strong> Uses best path first</li>
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
[Router A] ══════ ❌ LINK DOWN ═══ [Router B]
    │                                   │
    │         OSPF recalculates!        │
    └────── [Router C] ─────────────────┘
              Cost 30 (Now used!)

OSPF automatically switches to backup path
Traffic flows: A → C → B`}
            </Diagram>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Wildcard Masks Explained</h2>
            <p className="text-gray-300 mb-6">
              Wildcard masks are the OPPOSITE of subnet masks:
            </p>

            <InfoBox variant="info">
              <p className="text-green-200 font-semibold mb-3">Quick Guide:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li><code>0.0.0.0</code> = Match this EXACT IP address (one host)</li>
                <li><code>0.0.0.255</code> = Match this network (all hosts in /24)</li>
                <li><code>0.0.255.255</code> = Match this major network (all hosts in /16)</li>
              </ul>
              <p className="text-gray-300 mt-3">In wildcard: <strong className="text-white">0 = must match</strong>, <strong className="text-white">255 = don't care</strong></p>
            </InfoBox>

            <InfoBox variant="important">
              <p className="text-red-200 font-semibold mb-2">⚠️ Area 0 is Special</p>
              <p className="text-gray-300">
                Area 0 is called the "backbone area". All other areas must connect to Area 0.
                For most basic configurations, everything is in Area 0.
              </p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure OSPF to advertise a network:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>router ospf 1</code> — Enable OSPF with process ID 1</li>
              <li><code>network 35.72.12.2 0.0.0.0 area 0</code> — Advertise this IP in area 0</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300 mb-2"><code>network 35.72.12.2 0.0.0.0 area 0</code> breaks down to:</p>
                <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                  <li><strong className="text-white">35.72.12.2</strong> = The IP address to match</li>
                  <li><strong className="text-white">0.0.0.0</strong> = Wildcard mask (match exactly)</li>
                  <li><strong className="text-white">area 0</strong> = Put this network in area 0</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 16: OSPF INTERFACE COST */}
          <LessonSection title="OSPF Interface Cost: Path Preference">
            <p className="text-xl text-gray-200 my-6">
              OSPF chooses paths based on "cost" — lower cost is better. You can manually set costs to control traffic flow!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What is OSPF Cost?</h2>
            <p className="text-gray-300 mb-4">OSPF assigns a "cost" to each link based on its bandwidth. Think of cost as:</p>
            <ul className="ml-8 space-y-2 text-gray-300 list-disc">
              <li><strong className="text-white">Low cost</strong> = Fast, preferred path (like a highway)</li>
              <li><strong className="text-white">High cost</strong> = Slow, avoid if possible (like a dirt road)</li>
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
- Path 1: A → B = Cost 10 ✅ BEST!
- Path 2: A → C → B = Cost 80 (30 + 50)

OSPF always chooses Path 1 (lowest total cost)`}
            </Diagram>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Default OSPF Cost Calculation</h2>
            <p className="text-gray-300 mb-6">By default, OSPF calculates cost based on bandwidth:</p>

            <InfoBox variant="info">
              <p className="text-green-200 font-semibold mb-3">Formula: Cost = 100,000,000 / bandwidth in bps</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li><strong className="text-white">10 Gbps link:</strong> Cost = 1</li>
                <li><strong className="text-white">1 Gbps link:</strong> Cost = 1</li>
                <li><strong className="text-white">100 Mbps link:</strong> Cost = 1</li>
                <li><strong className="text-white">10 Mbps link:</strong> Cost = 10</li>
              </ul>
              <p className="text-gray-300 mt-3">Higher bandwidth = Lower cost = Preferred path!</p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Manually Set Cost?</h2>
            <p className="text-gray-300 mb-4">Sometimes you want to override the automatic calculation:</p>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-3">🌍 Real-World Scenarios</h4>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li><strong className="text-white">Traffic Engineering:</strong> Force traffic through specific paths</li>
                <li><strong className="text-white">Load Balancing:</strong> Distribute traffic across multiple links</li>
                <li><strong className="text-white">Backup Links:</strong> Make backup paths less preferred</li>
                <li><strong className="text-white">Cost Considerations:</strong> Expensive satellite link = high cost even if fast</li>
              </ul>
            </InfoBox>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                <h4 className="text-green-300 font-semibold mb-3">Low Cost Interface</h4>
                <Diagram>
                  {`interface g0/0
ip ospf cost 10

✅ Primary path
✅ Fast link
✅ Use this first`}
                </Diagram>
              </div>
              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-6">
                <h4 className="text-yellow-300 font-semibold mb-3">High Cost Interface</h4>
                <Diagram>
                  {`interface g0/2
ip ospf cost 30

⚠️ Backup path
⚠️ Slower link
⚠️ Use if primary fails`}
                </Diagram>
              </div>
            </div>

            <InfoBox variant="important">
              <p className="text-red-200 font-semibold mb-2">🏆 CyberPatriot Tip</p>
              <p className="text-gray-300">
                Scenarios often require setting specific OSPF costs to control traffic flow.
                Pay attention to requirements like "prefer path through Router A" — you'll need to adjust costs!
              </p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Configure OSPF costs on two interfaces to control path preference:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>interface g0/0</code> — Primary interface</li>
              <li><code>ip ospf cost 10</code> — Set low cost (preferred path)</li>
              <li><code>exit</code></li>
              <li><code>interface g0/2</code> — Backup interface</li>
              <li><code>ip ospf cost 30</code> — Set higher cost (backup path)</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal grammar={grammar} />
          </LessonSection>
          </LessonCounterProvider>

          {/* COMPLETION SECTION */}
          <div className="bg-green-900 border-2 border-green-600 rounded-lg p-12 my-20">
            <div className="text-center mb-10">
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Congratulations!
              </h2>
              <p className="text-xl text-gray-300">
                You've completed the entire course and learned real networking skills!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-10">
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ CLI navigation and modes</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ TAB completion</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Setting hostnames</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Password security</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Password entry experience</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Sub-configuration modes</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Understanding IP addresses</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Network hardware basics</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Management access configuration</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Creating and organizing VLANs</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Trunk ports</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ SSH secure access</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Layer 3 switching</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Static routing</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ OSPF dynamic routing</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ OSPF cost manipulation</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
