'use client'

import { useEffect, useState } from 'react'

export default function SubmissionForm({
  roomId,
  presetNickname,
}: {
  roomId: string
  presetNickname?: string
}) {
  const [nickname, setNickname] = useState(presetNickname || '')
  const [menu, setMenu] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedMenu, setSubmittedMenu] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!presetNickname) {
      const match = document.cookie.match(/(^| )nickname=([^;]+)/)
      if (match) setNickname(decodeURIComponent(match[2]))
    }
  }, [presetNickname])

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
      if (!presetNickname) {
        document.cookie = `nickname=${encodeURIComponent(nickname)}; path=/`
      }
      setSubmitted(true)
      setSubmittedMenu(menu) // Save the submitted menu
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
    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
      {error && (
        <p className='text-red-600 text-sm bg-red-100 p-2 rounded'>{error}</p>
      )}

      {!presetNickname && (
        <input
          type='text'
          placeholder='Your nickname'
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className='w-full px-3 py-2 border rounded'
        />
      )}

      <input
        type='text'
        placeholder='What’s your pick?'
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
  )
}
