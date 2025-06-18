'use client'

import { useState } from 'react'
import { useNicknameStore } from '@/stores/nicknameStore'

export default function SubmissionForm({ roomId }: { roomId: string }) {
  const nickname = useNicknameStore((state) => state.nickname)
  const [menu, setMenu] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedMenu, setSubmittedMenu] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !menu.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, nickname, menu }),
    })

    if (res.ok) {
      setSubmitted(true)
      setSubmittedMenu(menu)
    } else if (res.status === 403) {
      const data = await res.json()
      setError(data.error || 'Submissions are closed.')
    } else {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <p className='mt-4'>
        <strong className='text-green-600'>{submittedMenu}</strong> sounds
        great! Waiting for others...
      </p>
    )
  }

  return (
    <div className='space-y-4 mt-4'>
      {error && (
        <p className='text-red-600 text-sm bg-red-100 p-2 rounded'>{error}</p>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          placeholder='What are you craving?'
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          required
          className='w-full px-3 py-2 border rounded'
        />
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-green-800 text-white py-2 rounded hover:bg-green-900'
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
