'use client'

import { useEffect, useState } from 'react'
import { mutate } from 'swr'

interface Props {
  submissions: { id: string; menu: string; nickname: string }[]
  roomId: string
  hostNickname: string // <- pass this from parent
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export default function VoteForm({ submissions, roomId, hostNickname }: Props) {
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

  const isHost = nickname === hostNickname

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

  const handleDeleteSubmission = async (submissionId: string) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this submission?'
    )
    if (!confirmDelete) return

    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      alert('Failed to delete submission.')
      return
    }

    // Refresh the list
    mutate(`/api/rooms/${roomId}`)
  }

  if (submitted) {
    return <p className='mt-4 text-green-600'>Thanks for voting!</p>
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
      {submissions.map((s) => (
        <div key={s.id} className='flex justify-between items-center'>
          <label className='flex items-center space-x-2'>
            <input
              type='radio'
              name='vote'
              value={s.id}
              onChange={() => setSelectedId(s.id)}
            />
            <span>{s.menu}</span>
            <span className='text-gray-500 text-sm'>({s.nickname})</span>
          </label>

          {isHost && (
            <button
              type='button'
              onClick={() => handleDeleteSubmission(s.id)}
              className='text-red-600 text-sm underline hover:text-red-800'
            >
              Delete
            </button>
          )}
        </div>
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
