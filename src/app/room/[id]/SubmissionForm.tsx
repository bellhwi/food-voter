'use client'

import { useState } from 'react'

export default function SubmissionForm({ roomId }: { roomId: string }) {
  const [nickname, setNickname] = useState('')
  const [menu, setMenu] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname || !menu) return

    setLoading(true)
    setError('') // Clear any previous error

    const res = await fetch('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ roomId, nickname, menu }),
    })

    if (res.ok) {
      document.cookie = `nickname=${nickname}; path=/`
      setSubmitted(true)
    } else if (res.status === 403) {
      const data = await res.json()
      setError(data.error || 'Submissions are closed.')
    } else {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return <p className='mt-4 text-green-600'>Thanks for your suggestion!</p>
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
      {error && (
        <p className='text-red-600 text-sm bg-red-100 p-2 rounded'>{error}</p>
      )}

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
