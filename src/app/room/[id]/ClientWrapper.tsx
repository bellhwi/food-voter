'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import SubmissionForm from './SubmissionForm'
import VoteForm from './VoteForm'
import QRCodeDisplay from './QRCodeDisplay'
import CountdownTimer from './CountdownTimer'
import { useNicknameStore } from '@/stores/nicknameStore'

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

type Phase = 'waiting' | 'submitting' | 'voting' | 'results'

type Room = {
  roomId: string
  title: string
  deadline: string
  phase: Phase
  hostNickname: string
  participants: string[]
  expectedParticipantCount?: number
}

export default function ClientWrapper({ roomId }: { roomId: string }) {
  const { data: room, error: roomError } = useSWR<Room>(
    roomId ? `/api/rooms?roomId=${roomId}` : null,
    safeFetcher,
    {
      refreshInterval: (latestRoom: Room | undefined) =>
        ['waiting', 'submitting', 'voting'].includes(latestRoom?.phase || '')
          ? 1000
          : 0,
      dedupingInterval: 500,
    }
  )

  const { data: submissions, error: subError } = useSWR<Submission[]>(
    room ? `/api/submissions?roomId=${roomId}` : null,
    safeFetcher,
    {
      refreshInterval: () =>
        ['waiting', 'submitting', 'voting'].includes(room?.phase || '')
          ? 1000
          : 0,
      dedupingInterval: 500,
    }
  )

  const { data: voteCounts, error: voteError } = useSWR<VoteCounts>(
    room ? `/api/votes?roomId=${roomId}` : null,
    safeFetcher,
    {
      refreshInterval: () =>
        ['waiting', 'submitting', 'voting'].includes(room?.phase || '')
          ? 1000
          : 0,
      dedupingInterval: 500,
    }
  )

  const { data: voteRecords } = useSWR<
    { nickname: string; submissionId: string }[]
  >(room ? `/api/voteRecords?roomId=${roomId}` : null, safeFetcher, {
    refreshInterval: () =>
      ['waiting', 'submitting', 'voting'].includes(room?.phase || '')
        ? 1000
        : 0,
    dedupingInterval: 500,
  })

  const { nickname, setNickname } = useNicknameStore()
  const [hasClickedReady, setHasClickedReady] = useState(false)
  const [localNickname, setLocalNickname] = useState(nickname)

  useEffect(() => {
    if (room?.participants.includes(nickname)) {
      setHasClickedReady(true)
    }
  }, [room, nickname])

  if (roomError || subError || voteError)
    return <p className='text-red-500'>Failed to load data.</p>
  if (!room || !submissions || !voteCounts) return <p>Loading...</p>

  const isHost = nickname === room.hostNickname

  const sortedResults = submissions
    .map((s) => ({ ...s, votes: voteCounts[s.id] || 0 }))
    .sort((a, b) => b.votes - a.votes)

  const winner = sortedResults[0]

  return (
    <>
      {room.phase === 'voting' && <CountdownTimer deadline={room.deadline} />}
      {room.phase === 'waiting' && <QRCodeDisplay roomId={room.roomId} />}

      {/* Show participants & Start Voting */}
      {room.phase === 'waiting' && (
        <div className='mt-4'>
          <h2 className='font-semibold'>Participants Ready:</h2>
          <ul className='list-disc list-inside text-gray-400'>
            {room.participants?.map((p) => (
              <li key={p}>
                {p === room.hostNickname ? `Host${isHost ? ' (You)' : ''}` : p}
              </li>
            ))}
          </ul>

          {/* Nickname input + ready button */}
          {!room.participants.includes(nickname) && !isHost && (
            <>
              <input
                type='text'
                placeholder='Your nickname'
                value={localNickname}
                onChange={(e) => setLocalNickname(e.target.value)}
                required
                className='mt-4 w-full px-3 py-2 border rounded'
              />
              <button
                className='mt-6 bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900'
                onClick={async () => {
                  if (!localNickname.trim()) return

                  setNickname(localNickname)

                  const res = await fetch('/api/ready', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, nickname: localNickname }),
                  })

                  if (res.ok) {
                    setHasClickedReady(true)
                    mutate(`/api/rooms?roomId=${roomId}`)
                  } else {
                    alert('Failed to mark as ready.')
                  }
                }}
              >
                I’m ready
              </button>
            </>
          )}

          {/* ✅ Show this regardless of participant status */}
          {hasClickedReady && !isHost && (
            <p className='mt-2 text-sm text-gray-600'>
              Waiting for others to get ready...
            </p>
          )}

          {/* Host Start Voting Button */}
          {isHost && (
            <>
              <button
                className={`mt-4 px-4 py-2 rounded text-white transition ${
                  room.participants.length < 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-800 hover:bg-green-900'
                }`}
                onClick={async () => {
                  const res = await fetch('/api/rooms/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, nickname }),
                  })
                  if (res.ok) {
                    mutate(`/api/rooms?roomId=${roomId}`)
                  } else {
                    const err = await res.json()
                    alert(err.error || 'Failed to start voting.')
                  }
                }}
                disabled={room.participants.length < 1}
              >
                Let&apos;s start
              </button>
              <p className='mt-2 text-sm text-gray-600'>
                Wait until everyone's ready, then press start.
              </p>
            </>
          )}
        </div>
      )}

      {room.phase === 'submitting' && (
        <>
          {room.expectedParticipantCount && (
            <div className='mb-4 text-center'>
              <p className='text-sm text-gray-500 mb-1'>
                {submissions.length} of {room.expectedParticipantCount} menus
                submitted
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto'>
                <div
                  className='bg-green-600 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${
                      (submissions.length / room.expectedParticipantCount) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
          <SubmissionForm roomId={roomId} />
        </>
      )}

      {room.phase === 'voting' && (
        <>
          {room.phase === 'voting' &&
            room.expectedParticipantCount &&
            voteRecords && (
              <div className='mb-4 text-center'>
                <p className='text-sm text-gray-500 mb-1'>
                  {voteRecords.length} of {room.expectedParticipantCount} votes
                  submitted
                </p>
                <div className='w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto'>
                  <div
                    className='bg-green-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${
                        (voteRecords.length / room.expectedParticipantCount) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          <VoteForm
            roomId={roomId}
            submissions={submissions}
            hostNickname={room.hostNickname}
            roomPhase={room.phase}
          />
        </>
      )}

      {room.phase === 'results' && (
        <div className='mt-6 space-y-6'>
          <p className='font-semibold'>
            {sortedResults.length > 1 &&
            sortedResults[0].votes === sortedResults[1].votes ? (
              <>⚠️ It’s a tie!</>
            ) : (
              <>
                🏆 <span className='text-green-600'>{winner?.menu}</span> it is!
              </>
            )}
          </p>

          {sortedResults.length === 0 ? (
            <p className='text-gray-500 mt-2'>No votes submitted.</p>
          ) : (
            <div className='space-y-3'>
              <h2 className='font-semibold text-lg'>All Results</h2>
              {sortedResults.map((s, index) => (
                <div key={s.id}>
                  <p>{s.menu}</p>
                  <p className='text-gray-400'>by {s.nickname}</p>
                  <p className='text-gray-400'>
                    {s.votes} vote{s.votes === 1 ? '' : 's'}
                  </p>
                  {index < sortedResults.length - 1 && (
                    <hr className='my-2 text-gray-800' />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className='text-center'>
            <button
              onClick={() => (window.location.href = '/create')}
              className='mt-6 bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900'
            >
              One more round?
            </button>
          </div>
        </div>
      )}
    </>
  )
}
