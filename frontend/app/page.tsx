'use client'
import Link from 'next/link'
import { useState } from 'react'

const TOPICS = [
  { emoji: '⚽', label: 'Sports & Games' },
  { emoji: '🚀', label: 'Science & Space' },
  { emoji: '🐾', label: 'Animals & Nature' },
  { emoji: '🎬', label: 'Movies & Music' },
  { emoji: '🌍', label: 'Travel & Culture' },
  { emoji: '🍕', label: 'Food & Cooking' },
  { emoji: '📖', label: 'Stories & Books' },
  { emoji: '💻', label: 'Technology' },
]

const FEATURES = [
  { emoji: '🎙️', title: 'Real Voice Conversations', desc: 'Tap and speak — Lily listens, responds, and adapts in real time.' },
  { emoji: '🧠', title: 'Personalised to Your Child', desc: 'Lily remembers topics, level, and past sessions. Every conversation feels tailored.' },
  { emoji: '✏️', title: 'Natural Grammar Correction', desc: 'Errors are corrected through natural recasting — never embarrassing, always effective.' },
  { emoji: '📚', title: 'Vocabulary Journal', desc: 'Every new word is saved with a definition and example the child can revisit.' },
  { emoji: '🔥', title: 'Daily Streak System', desc: 'Streaks and gentle reminders keep kids consistent without pressure.' },
  { emoji: '📊', title: 'Detailed Parent Reports', desc: 'After every session: new words, grammar notes, progress, and recommendations.' },
]

const STATS = [
  { value: '8–14', label: 'Age Range' },
  { value: '15 min', label: 'Per Session' },
  { value: '3 min', label: 'Setup Time' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Sticky Navbar ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🎙️</span>
            </div>
            <span className="font-extrabold text-xl text-gray-900">SpeakLily</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#topics" className="hover:text-blue-600 transition-colors">Topics</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2">Log in</Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
              Try Free →
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium border-t border-gray-100 pt-4">
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#topics" onClick={() => setMenuOpen(false)}>Topics</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <Link href="/login" className="text-gray-600">Log in</Link>
            <Link href="/signup" className="bg-blue-600 text-white text-center py-2.5 rounded-xl font-bold">Try Free →</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              🏆 AI-Powered English for Ages 8–14
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Your child speaks
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                fluent English
              </span>
              <br />
              in 30 days.
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-md">
              Meet <strong className="text-white">Lily</strong> — an AI tutor that has real voice conversations with your child every day. No classroom. No schedule. Just natural English practice that actually works.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/signup"
                className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-extrabold text-lg px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-orange-500/30 hover:scale-105 text-center">
                Start Free Trial 🚀
              </Link>
              <a href="#how"
                className="border-2 border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-colors text-center">
                See How It Works
              </a>
            </div>
            <p className="text-blue-300 text-sm">✓ No credit card &nbsp;·&nbsp; ✓ 7-day free trial &nbsp;·&nbsp; ✓ Cancel anytime</p>
          </div>

          {/* Right: app mockup */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-3xl scale-110" />
              {/* Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-5 w-80">
                {/* App header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg">L</div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Lily</p>
                    <p className="text-xs text-green-500 font-medium">● Speaking now…</p>
                  </div>
                  <div className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-lg">🔥 7 day streak</div>
                </div>
                {/* Chat bubbles */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">L</div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[75%]">
                      <p className="text-xs text-gray-700 leading-relaxed">Hi Aryan! Ready to talk today? Tell me about your favourite sport! ⚽</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-500 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[75%]">
                      <p className="text-xs text-white leading-relaxed">I love cricket! I play every weekend with friends.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">L</div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[75%]">
                      <p className="text-xs text-gray-700 leading-relaxed">That's wonderful! Do you bat or bowl? 🏏</p>
                    </div>
                  </div>
                  {/* Typing */}
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">L</div>
                    <div className="bg-gray-100 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Vocab badge */}
                <div className="bg-blue-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-blue-600 font-semibold mb-1">✨ New word learned</p>
                  <p className="text-sm font-bold text-gray-800">Enthusiastic</p>
                  <p className="text-xs text-gray-500">having strong excitement or interest</p>
                </div>
                {/* Mic */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm-1 16.93A7.001 7.001 0 015 11H3a9 9 0 0017 0h-2a7.001 7.001 0 01-6 6.93V20H9v2h6v-2h-4v-2.07z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-gray-100">
                <span className="text-xl">📈</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Level Up!</p>
                  <p className="text-xs text-green-500">B1 → B2</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-gray-100">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Today's goal</p>
                  <p className="text-xs text-blue-500">3/3 complete ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-3 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-blue-300 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section id="how" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Simple as 1-2-3</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">From signup to speaking in minutes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[33%] right-[33%] h-0.5 bg-gradient-to-r from-blue-200 to-blue-200" />
          {[
            {
              step: '01',
              emoji: '👶',
              title: 'Add your child',
              desc: 'Enter their name, age, grade, and current English level. Takes 60 seconds.',
              color: 'bg-blue-50 border-blue-200',
              num: 'text-blue-500',
            },
            {
              step: '02',
              emoji: '🎙️',
              title: 'Start a session',
              desc: 'Your child picks a topic they love and starts talking. Lily guides the conversation.',
              color: 'bg-purple-50 border-purple-200',
              num: 'text-purple-500',
            },
            {
              step: '03',
              emoji: '📊',
              title: 'Track progress',
              desc: 'You get a full report: vocabulary, grammar observations, and next steps.',
              color: 'bg-green-50 border-green-200',
              num: 'text-green-500',
            },
          ].map(s => (
            <div key={s.step} className={`${s.color} border-2 rounded-3xl p-7 text-center relative`}>
              <p className={`text-5xl font-black ${s.num} mb-4 opacity-20 absolute top-4 right-5`}>{s.step}</p>
              <div className="text-5xl mb-4">{s.emoji}</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Topics ────────────────────────────────────── */}
      <section id="topics" className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Engaging Content</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Topics kids actually want to talk about</h2>
            <p className="text-blue-200 mt-3 text-base max-w-xl mx-auto">No boring textbook drills. Lily talks about things your child loves — so they forget they're even learning.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TOPICS.map(t => (
              <div key={t.label} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-5 text-center transition-all cursor-default hover:scale-105">
                <div className="text-4xl mb-2">{t.emoji}</div>
                <p className="text-white font-semibold text-sm">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Built for Real Learning</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Everything in one place</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all bg-white">
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="font-extrabold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Results banner ────────────────────────────── */}
      <section className="bg-orange-50 border-y-2 border-orange-100 py-12">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-black text-orange-500 mb-1">87%</p>
            <p className="text-gray-600 font-semibold">of children improve their speaking confidence in 4 weeks</p>
          </div>
          <div>
            <p className="text-5xl font-black text-blue-500 mb-1">15 min</p>
            <p className="text-gray-600 font-semibold">per day is all it takes — fits around any school schedule</p>
          </div>
          <div>
            <p className="text-5xl font-black text-purple-500 mb-1">3×</p>
            <p className="text-gray-600 font-semibold">faster vocabulary growth compared to classroom English alone</p>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Transparent Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Less than one private lesson</h2>
            <p className="text-gray-400 mt-2">A private English tutor costs $30–80/hour. Lily is available 24/7.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-7">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Free Forever</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">$0</p>
              <p className="text-gray-400 text-sm mb-6">Start learning today</p>
              <ul className="space-y-3 mb-8">
                {['3 sessions per week', 'Up to 2 child profiles', 'Vocabulary journal', 'Basic session summaries'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-green-500 flex-shrink-0 text-xs">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center border-2 border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors">
                Get Started Free
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-7 text-white relative shadow-2xl shadow-blue-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                🏆 MOST POPULAR
              </div>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Pro Plan</p>
              <p className="text-4xl font-extrabold mb-1">$9<span className="text-lg font-normal text-blue-200">/mo</span></p>
              <p className="text-blue-200 text-sm mb-6">Everything unlimited</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited daily sessions',
                  'Up to 5 child profiles',
                  'Full progress reports',
                  'Weekly parent summaries',
                  'Vocabulary journal + review',
                  'Goal tracking & streaks',
                  'Adaptive curriculum',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-blue-100">
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xs">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-white text-blue-700 font-extrabold py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                Start 7-Day Free Trial →
              </Link>
              <p className="text-center text-blue-200 text-xs mt-3">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 py-20 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-5xl mb-6">🌟</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Give your child the gift of confident English
          </h2>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed">
            Every day without practice is a day behind. Start free today — no credit card, no commitment, no risk.
          </p>
          <Link href="/signup"
            className="inline-block bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-extrabold text-xl px-10 py-5 rounded-2xl transition-all shadow-2xl hover:shadow-orange-500/30 hover:scale-105">
            Start Free Trial Now 🚀
          </Link>
          <p className="text-blue-400 text-sm mt-4">No credit card required · Set up in under 3 minutes</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-slate-950 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎙️</span>
            </div>
            <span className="font-bold text-white">SpeakLily</span>
          </div>
          <p className="text-sm text-center">AI English Speaking Coach for children aged 8–14</p>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">© 2025 SpeakLily. All rights reserved.</p>
      </footer>

    </div>
  )
}
