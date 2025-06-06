'use client'

import { useState, useEffect } from 'react'
function SubmissionForm({ roomId }: { roomId: string }) {
  const [nickname, setNickname] = useState('')
  const [menu, setMenu] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, nickname, menu }),
    })
    if (res.ok) {
      setSent(true)
      setTimeout(() => window.location.reload(), 300) // 0.3초 후 새로고침
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('nickname')
    if (saved) setNickname(saved)
  }, [])

  if (sent) return <p className='text-green-600'>Submitted! ✅</p>

  return (
    <form onSubmit={handleSubmit} className='space-y-2 mt-6'>
      <input
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value)
          localStorage.setItem('nickname', e.target.value)
        }}
        placeholder='Your nickname'
        className='w-full border rounded p-2'
        required
      />
      <input
        value={menu}
        onChange={(e) => setMenu(e.target.value)}
        placeholder='Menu idea (e.g. Sushi)'
        className='w-full border rounded p-2'
        required
      />
      <button
        type='submit'
        className='bg-blue-600 text-white px-4 py-2 rounded w-full'
      >
        Submit
      </button>
    </form>
  )
}
export default SubmissionForm
