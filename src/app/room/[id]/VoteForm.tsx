'use client'

import { useEffect, useState } from 'react'

interface Props {
  submissions: { id: string; menu: string; nickname: string }[]
  roomId: string
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export default function VoteForm({ submissions, roomId }: Props) {
  const [selectedId, setSelectedId] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const saved = getCookie('nickname')
    if (saved) {
      setNickname(saved)
    } else {
      alert('Please submit a menu before voting.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || !nickname) return

    setLoading(true)
    const res = await fetch('/api/votes', {
      method: 'POST',
      body: JSON.stringify({ roomId, submissionId: selectedId, nickname }),
    })
    if (res.ok) {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return <p className='mt-4 text-green-600'>Thanks for voting!</p>
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
      {submissions.map((s) => (
        <label key={s.id} className='block'>
          <input
            type='radio'
            name='vote'
            value={s.id}
            onChange={() => setSelectedId(s.id)}
            className='mr-2'
          />
          {s.menu} <span className='text-gray-500 text-sm'>({s.nickname})</span>
        </label>
      ))}

      <button
        type='submit'
        disabled={loading || !selectedId || !nickname}
        className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
      >
        {loading ? 'Submitting...' : 'Vote'}
      </button>
    </form>
  )
}
