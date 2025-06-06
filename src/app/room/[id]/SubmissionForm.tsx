'use client'

import { useState } from 'react'

export default function SubmissionForm({ roomId }: { roomId: string }) {
  const [nickname, setNickname] = useState('')
  const [menu, setMenu] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname || !menu) return

    setLoading(true)
    const res = await fetch('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ roomId, nickname, menu }),
    })

    if (res.ok) {
      // ✅ Save nickname in cookie instead of localStorage
      document.cookie = `nickname=${nickname}; path=/`
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return <p className='mt-4 text-green-600'>Thanks for your suggestion!</p>
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
      <input
        type='text'
        placeholder='Your nickname'
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
        className='w-full px-3 py-2 border rounded'
      />
      <input
        type='text'
        placeholder='Suggested menu'
        value={menu}
        onChange={(e) => setMenu(e.target.value)}
        required
        className='w-full px-3 py-2 border rounded'
      />
      <button
        type='submit'
        disabled={loading}
        className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
