'use client'

import useSWR from 'swr'
import SubmissionForm from './SubmissionForm'
import VoteForm from './VoteForm'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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
}

export default function ClientWrapper({ roomId }: { roomId: string }) {
  const { data: room, error: roomError } = useSWR<Room>(
    `/api/rooms?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 3000 }
  )

  const shouldPoll = room?.phase !== 'results'

  const { data: submissions, error: subError } = useSWR<Submission[]>(
    `/api/submissions?roomId=${roomId}`,
    fetcher,
    { refreshInterval: shouldPoll ? 3000 : 0 }
  )

  const { data: voteCounts, error: voteError } = useSWR<VoteCounts>(
    `/api/votes?roomId=${roomId}`,
    fetcher,
    { refreshInterval: shouldPoll ? 3000 : 0 }
  )

  if (roomError || subError || voteError)
    return <p className='text-red-500'>Failed to load data.</p>

  if (!room || !submissions || !voteCounts) return <p>Loading...</p>

  const sortedResults = submissions
    .map((s) => ({
      ...s,
      votes: voteCounts[s.id] || 0,
    }))
    .sort((a, b) => b.votes - a.votes)

  const winner = sortedResults[0]

  return (
    <>
      {room.phase === 'submitting' && <SubmissionForm roomId={roomId} />}

      {room.phase === 'voting' && (
        <VoteForm roomId={roomId} submissions={submissions} />
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
        </div>
      )}
    </>
  )
}
