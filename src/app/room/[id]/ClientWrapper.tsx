'use client'

import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'
import SubmissionForm from './SubmissionForm'
import VoteForm from './VoteForm'
import QRCodeDisplay from './QRCodeDisplay'
import CountdownTimer from './CountdownTimer'

const safeFetcher = async (url: string) => {
  const res = await fetch(url)
  const text = await res.text()

  try {
    const json = JSON.parse(text)
    if (!res.ok) {
      console.error(`[SWR Fetch Error] ${url}`, json)
      throw new Error(json.error || 'Server error')
    }
    return json
  } catch (err) {
    console.error(`[SWR Parse Error] ${url}`, err, 'Raw response:', text)
    throw new Error('Failed to parse server response')
  }
}

type Submission = {
  id: string
  nickname: string
  menu: string
}

type VoteCounts = Record<string, number>

type Phase = 'submitting' | 'voting' | 'results'

type Room = {
  roomId: string
  title: string
  deadline: string
  phase: Phase
  hostNickname: string
}

export default function ClientWrapper({ roomId }: { roomId: string }) {
  const { data: room, error: roomError } = useSWR<Room>(
    roomId ? `/api/rooms?roomId=${roomId}` : null,
    safeFetcher,
    { refreshInterval: 3000 }
  )

  const { data: submissions, error: subError } = useSWR<Submission[]>(
    room ? `/api/submissions?roomId=${roomId}` : null,
    safeFetcher,
    { refreshInterval: room?.phase !== 'results' ? 3000 : 0 }
  )

  const { data: voteCounts, error: voteError } = useSWR<VoteCounts>(
    room ? `/api/votes?roomId=${roomId}` : null,
    safeFetcher,
    { refreshInterval: room?.phase !== 'results' ? 3000 : 0 }
  )

  const [nickname, setNickname] = useState('')
  useEffect(() => {
    const match = document.cookie.match(/(^| )nickname=([^;]+)/)
    if (match) setNickname(decodeURIComponent(match[2]))
  }, [])

  const isHost = nickname === room?.hostNickname
  const [editMode, setEditMode] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleTitleUpdate = async () => {
    if (!newTitle.trim() || !nickname) {
      alert(
        'Nickname is missing. Please refresh the page or check your cookie.'
      )
      return
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, newTitle, nickname }),
      })

      const text = await res.text()
      if (!res.ok) {
        console.error('PUT /api/rooms failed:', text)
        alert('Server error: ' + text)
        return
      }

      const data = JSON.parse(text)
      if (!data.success) {
        alert('Update failed. Try again later.')
        return
      }

      setEditMode(false)
      mutate(`/api/rooms?roomId=${roomId}`)
    } catch (err) {
      console.error('handleTitleUpdate error:', err)
      alert('Something went wrong.')
    }
  }

  if (roomError || subError || voteError)
    return <p className='text-red-500'>Failed to load data.</p>
  if (!room || !submissions || !voteCounts) return <p>Loading...</p>

  const sortedResults = submissions
    .map((s) => ({ ...s, votes: voteCounts[s.id] || 0 }))
    .sort((a, b) => b.votes - a.votes)

  const winner = sortedResults[0]

  return (
    <>
      {room.phase === 'voting' && <CountdownTimer deadline={room.deadline} />}
      {room.phase === 'submitting' && <QRCodeDisplay roomId={room.roomId} />}

      {/* Title & Edit Section */}
      <div className='flex justify-between items-center mt-6 mb-4'>
        {isHost && editMode && room.phase === 'submitting' ? (
          <>
            <input
              type='text'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className='border px-2 py-1 rounded w-full max-w-md'
            />
            <button
              onClick={handleTitleUpdate}
              className='ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className='ml-2 px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
            >
              Cancel
            </button>
          </>
        ) : (
          <h1 className='text-xl font-bold'>
            {room.title}{' '}
            {isHost && room.phase === 'submitting' && (
              <button
                className='ml-2 text-sm text-blue-600 hover:underline'
                onClick={() => {
                  setNewTitle(room.title)
                  setEditMode(true)
                }}
              >
                ✏️ Edit
              </button>
            )}
          </h1>
        )}
      </div>

      {room.phase === 'submitting' && (
        <SubmissionForm
          roomId={roomId}
          presetNickname={isHost ? nickname : undefined}
        />
      )}

      {room.phase === 'submitting' && isHost && (
        <p className='text-gray-600 italic mb-6'>
          Waiting for others to submit their menus...
        </p>
      )}

      {room.phase === 'voting' && (
        <VoteForm
          roomId={roomId}
          submissions={submissions}
          hostNickname={room.hostNickname}
          roomPhase={room.phase}
        />
      )}

      {room.phase === 'results' && (
        <div className='mt-6 space-y-6'>
          <p className='text-green-600 font-semibold'>Voting ended! 🎉</p>
          {sortedResults.length === 0 ? (
            <p className='text-gray-500 mt-2'>No votes submitted.</p>
          ) : (
            <>
              <div className='p-4 border rounded bg-yellow-50'>
                <p className='text-lg font-bold'>🏆 Winner:</p>
                <p className='mt-1'>
                  {winner.menu}{' '}
                  <span className='text-sm text-gray-500'>
                    by {winner.nickname}
                  </span>
                </p>
                <p className='text-sm text-gray-700'>
                  {winner.votes} vote{winner.votes === 1 ? '' : 's'}
                </p>
              </div>

              <div className='space-y-3'>
                <h2 className='font-semibold text-lg'>All Results</h2>
                {sortedResults.map((s) => (
                  <div
                    key={s.id}
                    className='border p-3 rounded bg-white shadow-sm'
                  >
                    <p className='font-medium'>{s.menu}</p>
                    <p className='text-sm text-gray-500'>by {s.nickname}</p>
                    <p className='text-sm text-gray-700 mt-1'>
                      {s.votes} vote{s.votes === 1 ? '' : 's'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className='text-center'>
            <button
              onClick={() => (window.location.href = '/create')}
              className='mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              Create New Room
            </button>
          </div>
        </div>
      )}
    </>
  )
}
