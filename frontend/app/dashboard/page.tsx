'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api'
import { Child } from '@/lib/types'
import Navbar from '@/components/Navbar'
import ChildCard from '@/components/ChildCard'

export default function DashboardPage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [childForm, setChildForm] = useState({
    name: '', age: 10, grade: 5, native_language: 'zh', proficiency_level: 1,
  })
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Parent')
      try {
        const data = await api.children.list()
        setChildren(data)
      } catch {}
      setLoading(false)
    }
    init()
  }, [router])

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    try {
      const child = await api.children.create(childForm)
      setChildren(prev => [...prev, child])
      setShowAddChild(false)
      setChildForm({ name: '', age: 10, grade: 5, native_language: 'zh', proficiency_level: 1 })
    } catch (err: any) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your children's English practice</p>
          </div>
          <button
            onClick={() => setShowAddChild(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            + Add Child
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">👧🏻</span>
            <h2 className="text-xl font-bold text-gray-800 mt-4">Add your first child</h2>
            <p className="text-gray-400 mt-2 mb-6">Create a profile for your child to get started.</p>
            <button
              onClick={() => setShowAddChild(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Add Child Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {children.map(child => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </main>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Child Profile</h2>
            <form onSubmit={handleAddChild} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child's name</label>
                <input
                  required
                  value={childForm.name}
                  onChange={e => setChildForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Xiaoming"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number" min={6} max={16} required
                    value={childForm.age}
                    onChange={e => setChildForm(f => ({ ...f, age: +e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="number" min={1} max={12} required
                    value={childForm.grade}
                    onChange={e => setChildForm(f => ({ ...f, grade: +e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English level (1-5)</label>
                <select
                  value={childForm.proficiency_level}
                  onChange={e => setChildForm(f => ({ ...f, proficiency_level: +e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={1}>1 — Beginner</option>
                  <option value={2}>2 — Elementary</option>
                  <option value={3}>3 — Intermediate</option>
                  <option value={4}>4 — Upper-Intermediate</option>
                  <option value={5}>5 — Advanced</option>
                </select>
              </div>
              {addError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>
              )}
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setShowAddChild(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
                  {adding ? 'Adding...' : 'Add Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
