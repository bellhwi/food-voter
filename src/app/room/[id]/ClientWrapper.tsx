'use client'

import SubmissionForm from './SubmissionForm'
import VoteButton from './VoteButton'

export default function ClientWrapper({
  roomId,
  submissions,
  voteCounts,
}: {
  roomId: string
  submissions: { id: string; menu: string; nickname: string }[]
  voteCounts: Record<string, number>
}) {
  return (
    <>
      <SubmissionForm roomId={roomId} />

      <div className='mt-8 space-y-2'>
        <h2 className='font-semibold text-lg'>Suggested Menus</h2>

        {submissions.length === 0 ? (
          <p className='text-gray-500 italic'>No submissions yet.</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className='border p-3 rounded shadow-sm bg-white'>
              <p className='font-medium'>{sub.menu}</p>
              <p className='text-sm text-gray-500'>by {sub.nickname}</p>

              <VoteButton roomId={roomId} submissionId={sub.id} />

              <p className='text-sm text-gray-700 mt-1'>
                {voteCounts[sub.id] || 0} vote
                {voteCounts[sub.id] === 1 ? '' : 's'}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  )
}
