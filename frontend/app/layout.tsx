import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'English Coach — AI Speaking Practice for Kids',
  description: 'AI-powered English speaking practice for Grade 4-8 students. Practice speaking English every day with Lily, your personal AI tutor.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
