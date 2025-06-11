'use client'

import { useEffect, useState } from 'react'
import { mutate } from 'swr'
import { useNicknameStore } from '@/stores/nicknameStore'

interface Props {
  submissions: { id: string; menu: string; nickname: string }[]
  roomId: string
  hostNickname: string
  roomPhase: 'submitting' | 'voting' | 'results'
}

export default function VoteForm({
  submissions,
  roomId,
  hostNickname,
  roomPhase,
}: Props) {
  const nickname = useNicknameStore((state) => state.nickname)
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (roomPhase === 'voting') {
      const hasSubmitted = submissions.some((s) => s.nickname === nickname)

      if (!hasSubmitted) {
        // Wait a second before showing the alert to allow SWR to refresh
        const timeout = setTimeout(() => {
          alert("Voting has already started. You're not allowed to vote.")
          setBlocked(true)
        }, 1000)

        return () => clearTimeout(timeout)
      }
    }

    if (roomPhase === 'submitting') {
      // Optional: alert if someone tries to jump ahead
      setBlocked(true)
    }
  }, [roomPhase, submissions, nickname])

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
    const confirmDelete = confirm('Are you sure you want to delete this menu?')
    if (!confirmDelete) return

    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      alert('Failed to delete submission.')
      return
    }

    mutate(`/api/rooms/${roomId}`)
  }

  if (submitted) {
    return <p className='mt-4'>Voted! Waiting for others...</p>
  }

  if (blocked) {
    return (
      <p className='mt-4 text-red-500'>
        You&apos;re not eligible to vote in this room.
      </p>
    )
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
            <span className='text-gray-400 text-sm'>(by {s.nickname})</span>
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
        className='w-full bg-green-800 text-white py-2 rounded hover:bg-green-900'
      >
        {loading ? 'Submitting...' : 'Vote'}
      </button>
    </form>
  )
}
