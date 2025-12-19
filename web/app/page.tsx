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
  loading: () => <div className="bg-dark-bg p-8 rounded-lg text-text-secondary text-center">Loading terminal...</div>
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
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-text-primary text-xl">Loading CLI Grammar...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto p-8">
        {/* INTRODUCTION */}
        <LessonSection title="Welcome, Future Network Engineer! 👋" isIntro>
          <p className="text-xl leading-relaxed text-text-bright my-6">
            You're about to learn how to configure real network devices - the computers that make the internet work!
          </p>
          
          <p className="mb-4">
            Think of this like learning to drive, but instead of a car, you're controlling routers and switches 
            that connect the entire world. Pretty cool, right?
          </p>
          
          <InfoBox variant="info">
            <h3 className="text-lg font-semibold mb-3">📚 How This Works</h3>
            <ul className="ml-6 space-y-2">
              <li><strong>Read</strong> each concept explanation</li>
              <li><strong>Practice</strong> in the terminal right below it</li>
              <li><strong>Scroll down</strong> to learn the next concept</li>
              <li>That's it! No tabs, no clicking around - just scroll and learn</li>
            </ul>
          </InfoBox>
          
          <h2 className="text-3xl text-secondary mt-10 mb-4">What You'll Master (11 Complete Lessons)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
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
          <p className="text-xl leading-relaxed text-text-bright my-6">
            Let's start with the basics. Every network device has different "modes" - like different levels of access.
          </p>
          
          <h2 className="text-3xl text-secondary mt-10 mb-4">Understanding the Prompt</h2>
          <p className="mb-4">The prompt (the text before where you type) tells you where you are:</p>
          
          <div className="space-y-2 my-6">
            <div className="flex items-center gap-6 p-4 bg-dark-bg rounded-lg border border-border">
              <code className="font-mono text-xl text-secondary bg-dark-bg px-4 py-2 rounded min-w-[200px]">Switch&gt;</code>
              <span className="text-text-secondary">User mode - Limited access</span>
            </div>
            <div className="flex items-center gap-6 p-4 bg-dark-bg rounded-lg border border-border">
              <code className="font-mono text-xl text-secondary bg-dark-bg px-4 py-2 rounded min-w-[200px]">Switch#</code>
              <span className="text-text-secondary">Privileged mode - More access</span>
            </div>
            <div className="flex items-center gap-6 p-4 bg-dark-bg rounded-lg border border-border">
              <code className="font-mono text-xl text-secondary bg-dark-bg px-4 py-2 rounded min-w-[200px]">Switch(config)#</code>
              <span className="text-text-secondary">Configuration mode - Where you make changes</span>
            </div>
          </div>
          
          <h2 className="text-3xl text-secondary mt-10 mb-4">The Magic TAB Key ✨</h2>
          
          <InfoBox variant="tip">
            <p><strong>Pro Tip:</strong> Press <kbd className="bg-light-bg border border-border rounded px-2 py-1 font-mono text-sm shadow-sm">TAB</kbd> at any time to auto-complete commands or see options!</p>
            <p className="mt-2">This is the #1 trick professionals use. It prevents typos and speeds you up.</p>
          </InfoBox>
          
          <div className="bg-dark-bg p-10 border-t-4 border-primary mt-8">
            <h3 className="text-primary text-xl mb-4">👉 Try It Now</h3>
            <p className="mb-4">Type these commands in the terminal below:</p>
            <ol className="bg-medium-bg p-6 rounded-lg my-6 border border-border list-decimal list-inside space-y-4">
              <li>Type <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">enable</code> and press Enter - watch the prompt change from <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">&gt;</code> to <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">#</code></li>
              <li>Type <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">en</code> then press <kbd className="bg-light-bg border border-border rounded px-2 py-1 font-mono text-sm">TAB</kbd> - see it auto-complete!</li>
              <li>Type <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">conf</code> then press <kbd className="bg-light-bg border border-border rounded px-2 py-1 font-mono text-sm">TAB</kbd> - now you're in configuration mode</li>
              <li>Type <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">exit</code> to go back one level</li>
              <li>Type <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">end</code> to jump back to privileged mode</li>
            </ol>
            
            <Terminal terminalId="terminal-1" grammar={grammar} />
            
            <InfoBox variant="help">
              <p><strong>💡 Helpful Hints:</strong></p>
              <ul className="ml-6 mt-2 space-y-1">
                <li>Notice how the prompt changes as you move between modes</li>
                <li>Use <kbd className="bg-light-bg border border-border rounded px-2 py-1 font-mono text-sm">TAB</kbd> liberally - it's not cheating, it's smart!</li>
                <li>If you get lost, type <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">end</code> to jump back to <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">#</code></li>
              </ul>
            </InfoBox>
          </div>
        </LessonSection>

        {/* LESSON 2: SETTING HOSTNAME */}
        <LessonSection lessonNumber={2} title="Giving Your Device a Name">
          <p className="text-xl leading-relaxed text-text-bright my-6">
            Just like you name your phone "Brian's iPhone", network devices need names too!
          </p>
          
          <h2 className="text-3xl text-secondary mt-10 mb-4">What's a Hostname?</h2>
          <p className="mb-4">
            The hostname is your device's name. It appears in the prompt and helps identify which device you're working on.
            In a real network, you might have dozens of switches - good names help you stay organized!
          </p>
          
          <Diagram title="Before:">
            {`┌─────────────┐
│   Switch    │  ← Generic name
└─────────────┘`}
          </Diagram>
          
          <Diagram title="After:">
            {`┌──────────────────────┐
│  MyFirstSwitch       │  ← Your unique name!
└──────────────────────┘`}
          </Diagram>
          
          <h2 className="text-3xl text-secondary mt-10 mb-4">Saving Your Work</h2>
          
          <InfoBox variant="important">
            <p><strong>⚠️ CRITICAL:</strong> Changes in Cisco IOS are NOT saved automatically!</p>
            <p className="mt-2">You must use <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">write memory</code> to save, or your changes disappear when the device restarts.</p>
            <p className="mt-2">Think of it like Microsoft Word - you have to click Save!</p>
          </InfoBox>
          
          <div className="bg-dark-bg p-10 border-t-4 border-primary mt-8">
            <h3 className="text-primary text-xl mb-4">👉 Your Task</h3>
            <p className="mb-4">Configure your first device with these steps:</p>
            <ol className="bg-medium-bg p-6 rounded-lg my-6 border border-border list-decimal list-inside space-y-4">
              <li><code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">enable</code> - Enter privileged mode</li>
              <li><code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">configure terminal</code> - Enter configuration mode</li>
              <li><code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">hostname MyFirstSwitch</code> - Set the name (watch the prompt change!)</li>
              <li><code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">end</code> - Exit configuration mode</li>
              <li><code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">write memory</code> - <strong>SAVE YOUR WORK!</strong></li>
            </ol>
            
            <Terminal terminalId="terminal-2" grammar={grammar} />
            
            <div className="bg-secondary/10 border border-success border-l-4 rounded-lg p-6 my-6">
              <p><strong>✓ You succeeded when:</strong></p>
              <ul className="ml-6 mt-2 space-y-1">
                <li>The prompt shows your new hostname instead of "Switch"</li>
                <li>You see "[OK]" after running <code className="bg-dark-bg px-2 py-1 rounded font-mono text-secondary">write memory</code></li>
              </ul>
            </div>
          </div>
        </LessonSection>

        {/* TODO: Add remaining 9 lessons - following same pattern */}
        <div className="bg-medium-bg border-2 border-warning rounded-xl p-10 my-16 text-center">
          <h2 className="text-2xl text-warning mb-4">🚧 Additional Lessons Coming Soon</h2>
          <p className="text-text-secondary">
            Lessons 3-11 will be added following the same pattern. 
            The core infrastructure (Terminal, Components, Tailwind) is complete and working!
          </p>
          <p className="text-text-secondary mt-4">
            For now, practice with Lessons 1-2 to verify the terminal functionality.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
