'use client'

import { useState } from 'react'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'

interface Room {
  id: string
  title: string
  deadline: string
}

function getTimeLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now()
  if (ms <= 0) return 'Voting ended'
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}:${sec.toString().padStart(2, '0')} left`
}

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
    if (res.ok) setSent(true)
  }

  if (sent) return <p className='text-green-600'>Submitted! ✅</p>

  return (
    <form onSubmit={handleSubmit} className='space-y-2 mt-6'>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
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

async function getVotes(roomId: string) {
  const client = await clientPromise
  const db = client.db('foodvoter')
  const votes = await db.collection('votes').find({ roomId }).toArray()

  const counts: Record<string, number> = {}
  for (const vote of votes) {
    const id = vote.submissionId.toString()
    counts[id] = (counts[id] || 0) + 1
  }

  return counts
}

export default async function RoomPage({ params }: { params: { id: string } }) {
  const client = await clientPromise
  const db = client.db('foodvoter') // Replace if your DB name is different
  const room = await db.collection<Room>('rooms').findOne({ id: params.id })
  const submissions = await getSubmissions(params.id)
  const voteCounts = await getVotes(params.id)

  if (!room) return notFound()

  return (
    <main className='max-w-md mx-auto p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>{room.title}</h1>
      <p className='text-gray-600'>⏳ {getTimeLeft(room.deadline)}</p>

      {/* 🔜 Recipe input + vote section will go here */}
      <div className='mt-6 text-gray-400 italic'>
        Voting interface coming soon…
      </div>
      <SubmissionForm roomId={room.id} />
      <div className='mt-8 space-y-2'>
        <h2 className='font-semibold text-lg'>Suggested Menus</h2>
        {submissions.length === 0 && (
          <p className='text-gray-500 italic'>No submissions yet.</p>
        )}
        {submissions.map((sub) => (
          <div key={sub.id} className='border p-3 rounded shadow-sm bg-white'>
            <p className='font-medium'>{sub.menu}</p>
            <p className='text-sm text-gray-500'>by {sub.nickname}</p>

            {/* ✅ Vote Button */}
            <button
              className='mt-2 bg-green-600 text-white px-3 py-1 rounded'
              onClick={async () => {
                const res = await fetch('/api/votes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    roomId: room.id,
                    submissionId: sub.id,
                    nickname: 'YOUR_NICKNAME', // 🔁 replace later
                  }),
                })

                const data = await res.json()
                if (res.ok) {
                  alert('Vote submitted!')
                  window.location.reload()
                } else {
                  alert(data.error)
                }
              }}
            >
              Vote
            </button>
            <p className='text-sm text-gray-700 mt-1'>
              {voteCounts[sub.id] || 0} vote
              {voteCounts[sub.id] === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

async function getSubmissions(roomId: string) {
  const client = await clientPromise
  const db = client.db('foodvoter')
  const submissions = await db
    .collection('submissions')
    .find({ roomId })
    .sort({ createdAt: -1 })
    .toArray()

  return submissions.map((s) => ({
    id: s._id.toString(),
    nickname: s.nickname,
    menu: s.menu,
  }))
}
