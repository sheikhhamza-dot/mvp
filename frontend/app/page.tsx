import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎙️</span>
          <span className="font-bold text-xl text-gray-800">English Coach</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800">Log in</Link>
          <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          AI-Powered English Speaking Practice
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Your child's personal<br />
          <span className="text-blue-500">English speaking tutor</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 leading-relaxed max-w-2xl mx-auto">
          Lily is an AI tutor that has real conversations with your child in English —
          correcting grammar naturally, teaching vocabulary in context, and building
          confidence one session at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg hover:shadow-xl">
            Start 7-Day Free Trial
          </Link>
          <Link href="/login" className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-lg font-semibold px-8 py-4 rounded-2xl transition-colors">
            Log in
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required • Full access for 7 days</p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { emoji: '👋', title: 'Tap & Talk', desc: 'Your child taps a button and starts speaking English. Lily listens and responds naturally.' },
            { emoji: '🧠', title: 'Lily Adapts', desc: 'The AI learns your child\'s level, interests, and weak areas. Every session is personalised.' },
            { emoji: '📊', title: 'You See Progress', desc: 'After each session, get a detailed report: new words, grammar observations, and what to practise.' },
          ].map(item => (
            <div key={item.title} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">{item.emoji}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Everything your child needs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { emoji: '💬', title: 'Real Conversations', desc: '10-15 min voice sessions on topics kids love' },
              { emoji: '🎯', title: 'Gentle Corrections', desc: 'Grammar fixed naturally through conversation' },
              { emoji: '📚', title: 'Vocabulary Journal', desc: 'Every new word saved with examples' },
              { emoji: '🔥', title: 'Streak Tracking', desc: 'Daily streaks keep kids coming back' },
              { emoji: '📈', title: 'Level Progression', desc: 'Automatically gets harder as skills improve' },
              { emoji: '📋', title: 'Parent Reports', desc: 'Detailed summaries after every session' },
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl border border-gray-100">
                <div className="text-2xl mb-2">{f.emoji}</div>
                <h4 className="font-semibold text-gray-800 text-sm">{f.title}</h4>
                <p className="text-gray-400 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Simple pricing</h2>
        <p className="text-center text-gray-500 mb-10">Less than a single hour with a private tutor</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <p className="font-semibold text-gray-500 text-sm">Free</p>
            <p className="text-4xl font-extrabold text-gray-800 mt-2">¥0</p>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              {['3 sessions per week', 'Basic session summaries', 'Conversation memory'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className="block mt-6 border-2 border-gray-300 text-gray-700 text-center font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Get started free
            </Link>
          </div>
          <div className="border-2 border-blue-500 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <p className="font-semibold text-blue-500 text-sm">Paid</p>
            <p className="text-4xl font-extrabold text-gray-800 mt-2">¥69<span className="text-lg font-normal text-gray-400">/mo</span></p>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              {[
                'Unlimited sessions', 'Full progress reports', 'Weekly summaries',
                'Vocabulary journal', 'Adaptive curriculum', 'Parent goal-setting',
              ].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-blue-500">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-3 rounded-xl transition-colors">
              Start 7-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2025 English Coach. Built for Grade 4-8 students.</p>
      </footer>
    </div>
  )
}
