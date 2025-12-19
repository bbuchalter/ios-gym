'use client';

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TerminalManager } from '@/lib/terminal-manager';
import { useScrollAnimations } from '@/lib/useScrollAnimations';
import { useProgressBar } from '@/lib/useProgressBar';
import { useClickToCopy } from '@/lib/useClickToCopy';
import type { CommandGrammar } from '@src/types';

import { Footer } from '@/components/Footer';
import { LessonSection } from '@/components/LessonSection';
import { InfoBox } from '@/components/InfoBox';
import { ProTip } from '@/components/ProTip';
import { SkillCard } from '@/components/SkillCard';
import { Diagram } from '@/components/Diagram';

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
  useClickToCopy();

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
          <LessonSection lessonNumber={1} title="Navigating Between Modes">
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
                <p className="text-gray-400 mt-2">Goes back one level (from <code>(config)#</code> to <code>#</code>, or from <code>#</code> to <code>&gt;</code>)</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <code className="font-mono text-lg text-blue-400">end</code>
                <p className="text-gray-400 mt-2">Jumps directly back to privileged mode (<code>#</code>) from anywhere in configuration mode</p>
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
              <li>Type <code>end</code> — notice you jump directly back to <code>#</code></li>
            </ol>

            <Terminal terminalId="terminal-1" grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300">
                  <li>Notice how the prompt changes as you move between modes</li>
                  <li><code>exit</code> goes back one level at a time</li>
                  <li><code>end</code> jumps directly back to privileged mode — very useful if you're deep in configuration!</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 2: TAB COMPLETION */}
          <LessonSection lessonNumber={2} title="The Magic TAB Key ✨">
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

            <Terminal terminalId="terminal-2" grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300">
                  <li>Use <kbd>TAB</kbd> liberally — it's not cheating, it's smart!</li>
                  <li>TAB completion works at any mode level — user, privileged, or configuration</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 3: SETTING HOSTNAME */}
          <LessonSection lessonNumber={3} title="Giving Your Device a Name">
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

            <Terminal terminalId="terminal-3" grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3 text-lg">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-gray-300">
                <li>The prompt shows your new hostname instead of "Switch"</li>
                <li>You see <code className="text-emerald-400">[OK]</code> after running <code>write memory</code></li>
              </ul>
            </div>
          </LessonSection>

          {/* LESSON 4: ENABLE SECRET */}
          <LessonSection lessonNumber={4} title="Security: Adding a Password">
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

            <Terminal terminalId="terminal-4" grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <p className="text-gray-300">
                  You can view your configuration with <code>show running-config</code>.
                  Try it! Notice how the password is encrypted (shows as a long hash).
                </p>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 5: IP ADDRESSING */}
          <LessonSection lessonNumber={5} title="IP Addresses: Your Device's Phone Number">
            <p className="text-xl text-gray-200 my-6">
              Every device on a network needs an address so others can find it. This is called an IP address.
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">What's an IP Address?</h2>
            <p className="text-gray-300 mb-4">Think of an IP address like a phone number or street address:</p>
            <ul className="ml-8 space-y-2 text-gray-300 list-disc">
              <li><strong className="text-white">Phone number:</strong> Let's people call you</li>
              <li><strong className="text-white">Street address:</strong> Let's mail reach you</li>
              <li><strong className="text-white">IP address:</strong> Let's data reach your device</li>
            </ul>

            <Diagram title="IP Address Format">
              {`192  .  168  .  1    .  100
 ↓       ↓      ↓        ↓
Network addresses   Host number

Together: 192.168.1.100`}
            </Diagram>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Management Access</h2>
            <p className="text-gray-300 mb-6">
              To manage a switch remotely, you need to give it an IP address on VLAN 1 (the management VLAN).
              Without this, you can only access the switch by plugging a cable directly into it!
            </p>

            <InfoBox variant="real-world">
              <h4 className="text-blue-300 font-semibold mb-2">🌍 Real World Example</h4>
              <p className="text-gray-300">
                Your school's IT person needs to manage switches in different buildings.
                With IP addresses on each switch, they can connect from their office without walking to each closet!
              </p>
            </InfoBox>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Subnet Mask & Default Gateway</h2>
            <ul className="ml-8 space-y-3 text-gray-300">
              <li><strong className="text-white">Subnet Mask:</strong> Defines how big your network is</li>
              <li><strong className="text-white">Default Gateway:</strong> The "door" to other networks (like the internet)</li>
            </ul>

            <InfoBox variant="info">
              <p className="text-gray-200">
                Common subnet mask: <code>255.255.255.0</code> gives you 254 devices on one network
              </p>
            </InfoBox>

            <h3 className="text-blue-400 text-3xl font-bold mt-16 mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-gray-300 mb-8 text-lg">Give your switch a management IP address:</p>
            <ol className="bg-gray-800 p-8 pl-12 rounded-lg my-8 border border-gray-700 list-decimal space-y-5 text-gray-300">
              <li><code>enable</code></li>
              <li><code>configure terminal</code></li>
              <li><code>interface vlan 1</code> — Enter the management interface</li>
              <li><code>ip address 192.168.1.100 255.255.255.0</code> — Assign IP address</li>
              <li><code>no shutdown</code> — Turn the interface on</li>
              <li><code>exit</code></li>
              <li><code>ip default-gateway 192.168.1.1</code> — Set gateway (router's IP)</li>
              <li><code>end</code></li>
              <li><code>write memory</code></li>
            </ol>

            <Terminal terminalId="terminal-5" grammar={grammar} />

            <div className="bg-green-900 border border-green-600 rounded-lg p-6 my-8">
              <p className="text-green-300 font-semibold mb-3">✓ Verify your work:</p>
              <p className="text-gray-300 mb-2">Type: <code>show ip interface brief</code></p>
              <p className="text-gray-300">You should see VLAN 1 with your IP address and status "up"</p>
            </div>
          </LessonSection>

          {/* LESSON 6: VLANs */}
          <LessonSection lessonNumber={6} title="VLANs: Organizing Your Network">
            <p className="text-xl text-gray-200 my-6">
              VLANs let you split one physical switch into multiple virtual networks. It's like having multiple switches in one!
            </p>

            <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-6">Why Use VLANs?</h2>
            <p className="text-gray-300 mb-6">Imagine your school network without VLANs:</p>

            <Diagram title="❌ Without VLANs - Everyone sees everything!">
              {`┌────────────────────────┐
│   ONE BIG NETWORK      │
│                        │
│  👨‍🎓 Students          │
│  👨‍🏫 Teachers          │
│  👔 Admin              │
│  📹 Cameras            │
│                        │
│  All mixed together!   │
└────────────────────────┘
⚠️ Privacy & Security Risk!`}
            </Diagram>

            <p className="text-gray-300 my-6">With VLANs, you can separate them:</p>

            <Diagram title="✅ With VLANs - Organized & Secure!">
              {`┌───────────────────────────────────┐
│         SWITCH                    │
│  ┌──────────┐    ┌──────────┐    │
│  │ VLAN 100 │    │ VLAN 200 │    │
│  │ Students │    │ Teachers │    │
│  │  👨‍🎓👨‍🎓   │    │  👨‍🏫👨‍🏫   │    │
│  └──────────┘    └──────────┘    │
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

            <Terminal terminalId="terminal-6" grammar={grammar} />

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

          {/* LESSON 7: TRUNK PORTS */}
          <LessonSection lessonNumber={7} title="Trunk Ports: Connecting Switches">
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

            <Terminal terminalId="terminal-7" grammar={grammar} />

            <InfoBox variant="info">
              <ProTip>
                <ul className="ml-6 space-y-2 text-gray-300 list-disc">
                  <li>VLAN 1 is included because it's the management VLAN</li>
                  <li>Use commas to separate VLANs: <code>1,100,200</code> (no spaces!)</li>
                </ul>
              </ProTip>
            </InfoBox>
          </LessonSection>

          {/* LESSON 8: SSH */}
          <LessonSection lessonNumber={8} title="SSH: Secure Remote Access">
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

            <Terminal terminalId="terminal-8" grammar={grammar} />
          </LessonSection>

          {/* LESSON 9: LAYER 3 SWITCHING */}
          <LessonSection lessonNumber={9} title="Layer 3 Switching: Routed Ports">
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
│   g1/0/1 (L2) ──┐   │        │                      │
│   VLAN 100       │   │        │                      │
│                  │   │        │                      │
│   g1/0/2 (L3) ══╪════╪════════╪══► To ISP           │
│   IP: 35.72.12.1│   │        │   IP: 35.72.12.2     │
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

            <Terminal terminalId="terminal-9" grammar={grammar} />

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

          {/* LESSON 10: STATIC ROUTING */}
          <LessonSection lessonNumber={10} title="Static Routing: Directing Traffic">
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
┌──────────┐         ┌──────────┐        ┌──────────┐
│ Computer │ ─────► │  Router  │ ─────► │   ISP    │
│          │         │          │        │          │
│ Wants to │         │ "Send    │        │ Forward  │
│ reach    │         │ everything│        │ to final │
│ Google   │         │ to ISP!" │        │ destination│
└──────────┘         └──────────┘        └──────────┘
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

            <Terminal terminalId="terminal-10" grammar={grammar} />

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

          {/* LESSON 11: OSPF BASICS */}
          <LessonSection lessonNumber={11} title="OSPF: Dynamic Routing Protocol">
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

            <Terminal terminalId="terminal-11" grammar={grammar} />

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

          {/* LESSON 12: OSPF INTERFACE COST */}
          <LessonSection lessonNumber={12} title="OSPF Interface Cost: Path Preference">
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

            <Terminal terminalId="terminal-12" grammar={grammar} />
          </LessonSection>

          {/* COMPLETION SECTION */}
          <div className="bg-green-900 border-2 border-green-600 rounded-lg p-12 my-20">
            <div className="text-center mb-10">
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Congratulations!
              </h2>
              <p className="text-xl text-gray-300">
                You've completed all 12 lessons and learned real networking skills!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-10">
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ CLI navigation and modes</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ TAB completion</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Setting hostnames</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ Password security</div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">✅ IP address configuration</div>
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

      <Footer />
    </div>
  );
}
