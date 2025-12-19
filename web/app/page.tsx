'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TerminalManager } from '@/lib/terminal-manager';
import { useScrollAnimations } from '@/lib/useScrollAnimations';
import { useProgressBar } from '@/lib/useProgressBar';
import { useClickToCopy } from '@/lib/useClickToCopy';
import type { CommandGrammar } from '@src/types';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LessonSection } from '@/components/LessonSection';
import { InfoBox } from '@/components/InfoBox';
import { SkillCard } from '@/components/SkillCard';
import { Diagram } from '@/components/Diagram';

// Dynamically import Terminal to avoid SSR issues with XTerm
const Terminal = dynamic(() => import('@/components/Terminal'), {
  ssr: false,
  loading: () => <div className="bg-slate-800/30 p-8 rounded-xl text-slate-400 text-center animate-pulse">Loading terminal...</div>
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-300 text-xl animate-pulse">Loading CLI Grammar...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* INTRODUCTION */}
        <LessonSection title="Welcome, Future Network Engineer! 👋" isIntro>
          <p className="text-2xl leading-relaxed text-white/90 my-6 font-light">
            You're about to learn how to configure real network devices — the computers that make the internet work!
          </p>
          
          <p className="text-slate-300 text-lg mb-6 leading-relaxed">
            Think of this like learning to drive, but instead of a car, you're controlling routers and switches 
            that connect the entire world. Pretty cool, right?
          </p>
          
          <InfoBox variant="info">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">📚 How This Works</h3>
            <ul className="ml-6 space-y-3 text-slate-300">
              <li><strong className="text-white">Read</strong> each concept explanation</li>
              <li><strong className="text-white">Practice</strong> in the interactive terminal</li>
              <li><strong className="text-white">Scroll down</strong> to learn the next concept</li>
              <li>That's it! No tabs, no clicking around — just scroll and learn</li>
            </ul>
          </InfoBox>
          
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mt-16 mb-8">
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

        {/* LESSON 1: FIRST COMMANDS */}
        <LessonSection lessonNumber={1} title="Your First Commands">
          <p className="text-xl leading-relaxed text-slate-200 my-6">
            Let's start with the basics. Every network device has different <strong className="text-white">"modes"</strong> — like different levels of access.
          </p>
          
          <h2 className="text-3xl font-bold text-cyan-400 mt-12 mb-6">Understanding the Prompt</h2>
          <p className="text-slate-300 mb-8 text-lg">The prompt (the text before where you type) tells you where you are:</p>
          
          <div className="space-y-3 my-8">
            <div className="flex items-center gap-6 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
              <code className="font-mono text-lg text-cyan-400 px-4 py-2 rounded-lg bg-slate-900/70 min-w-[200px] shadow-inner">Switch&gt;</code>
              <span className="text-slate-400">User mode — Limited access</span>
            </div>
            <div className="flex items-center gap-6 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
              <code className="font-mono text-lg text-cyan-400 px-4 py-2 rounded-lg bg-slate-900/70 min-w-[200px] shadow-inner">Switch#</code>
              <span className="text-slate-400">Privileged mode — More access</span>
            </div>
            <div className="flex items-center gap-6 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
              <code className="font-mono text-lg text-cyan-400 px-4 py-2 rounded-lg bg-slate-900/70 min-w-[200px] shadow-inner">Switch(config)#</code>
              <span className="text-slate-400">Configuration mode — Where you make changes</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-cyan-400 mt-16 mb-6">The Magic TAB Key ✨</h2>
          
          <InfoBox variant="tip">
            <p className="text-slate-200 text-lg"><strong className="text-emerald-300">Pro Tip:</strong> Press <kbd>TAB</kbd> at any time to auto-complete commands or see options!</p>
            <p className="mt-3 text-slate-300">This is the #1 trick professionals use. It prevents typos and speeds you up.</p>
          </InfoBox>
          
          <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 mt-12 shadow-xl">
            <h3 className="text-cyan-400 text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Try It Now
            </h3>
            <p className="text-slate-300 mb-8 text-lg">Type these commands in the terminal below:</p>
            <ol className="bg-slate-900/50 p-8 rounded-xl my-8 border border-slate-700/30 list-decimal ml-6 space-y-5 text-slate-300 leading-relaxed">
              <li>Type <code>enable</code> and press Enter — watch the prompt change from <code>&gt;</code> to <code>#</code></li>
              <li>Type <code>en</code> then press <kbd>TAB</kbd> — see it auto-complete!</li>
              <li>Type <code>conf</code> then press <kbd>TAB</kbd> — now you're in configuration mode</li>
              <li>Type <code>exit</code> to go back one level</li>
              <li>Type <code>end</code> to jump back to privileged mode</li>
            </ol>
            
            <Terminal terminalId="terminal-1" grammar={grammar} />
            
            <InfoBox variant="help">
              <p className="text-amber-200 font-semibold mb-3 text-lg">💡 Helpful Hints</p>
              <ul className="ml-6 space-y-2 text-slate-300">
                <li>Notice how the prompt changes as you move between modes</li>
                <li>Use <kbd>TAB</kbd> liberally — it's not cheating, it's smart!</li>
                <li>If you get lost, type <code>end</code> to jump back to <code>#</code></li>
              </ul>
            </InfoBox>
          </div>
        </LessonSection>

        {/* LESSON 2: SETTING HOSTNAME */}
        <LessonSection lessonNumber={2} title="Giving Your Device a Name">
          <p className="text-xl leading-relaxed text-slate-200 my-6">
            Just like you name your phone "Brian's iPhone", network devices need names too!
          </p>
          
          <h2 className="text-3xl font-bold text-cyan-400 mt-12 mb-6">What's a Hostname?</h2>
          <p className="text-slate-300 mb-6 text-lg leading-relaxed">
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
          
          <h2 className="text-3xl font-bold text-cyan-400 mt-16 mb-6">Saving Your Work</h2>
          
          <InfoBox variant="important">
            <p className="text-rose-200 font-semibold text-lg mb-2">⚠️ CRITICAL:</p>
            <p className="text-slate-200 mb-3">Changes in Cisco IOS are NOT saved automatically!</p>
            <p className="text-slate-300">You must use <code>write memory</code> to save, or your changes disappear when the device restarts.</p>
            <p className="text-slate-400 mt-3 italic">Think of it like Microsoft Word — you have to click Save!</p>
          </InfoBox>
          
          <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 mt-12 shadow-xl">
            <h3 className="text-cyan-400 text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">👉</span> Your Task
            </h3>
            <p className="text-slate-300 mb-8 text-lg">Configure your first device with these steps:</p>
            <ol className="bg-slate-900/50 p-8 rounded-xl my-8 border border-slate-700/30 list-decimal ml-6 space-y-5 text-slate-300 leading-relaxed">
              <li><code>enable</code> — Enter privileged mode</li>
              <li><code>configure terminal</code> — Enter configuration mode</li>
              <li><code>hostname MyFirstSwitch</code> — Set the name (watch the prompt change!)</li>
              <li><code>end</code> — Exit configuration mode</li>
              <li><code>write memory</code> — <strong className="text-amber-300">SAVE YOUR WORK!</strong></li>
            </ol>
            
            <Terminal terminalId="terminal-2" grammar={grammar} />
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 my-8">
              <p className="text-emerald-300 font-semibold mb-3 text-lg">✓ You succeeded when:</p>
              <ul className="ml-6 space-y-2 text-slate-300">
                <li>The prompt shows your new hostname instead of "Switch"</li>
                <li>You see <code className="text-emerald-400">[OK]</code> after running <code>write memory</code></li>
              </ul>
            </div>
          </div>
        </LessonSection>

        {/* COMING SOON */}
        <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/50 border-2 border-amber-500/30 rounded-2xl p-12 my-20 text-center backdrop-blur-sm">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-amber-400 mb-4">Additional Lessons Coming Soon</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Lessons 3-11 will be added following the same pattern. 
            The core infrastructure (Terminal, Components, Tailwind) is complete and working!
          </p>
          <p className="text-slate-500 mt-4">
            For now, practice with Lessons 1-2 to verify the terminal functionality.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
