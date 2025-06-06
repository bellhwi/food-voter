import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import ClientWrapper from './ClientWrapper'

interface RoomPageProps {
  params: {
    id: string
  }
}
interface Room {
  roomId: string
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

export default async function RoomPage({ params }: RoomPageProps) {
  const client = await clientPromise
  const db = client.db('foodvoter') // Replace if your DB name is different

  const room = await db.collection<Room>('rooms').findOne({ roomId: params.id })

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
      <ClientWrapper
        roomId={room.roomId}
        submissions={submissions}
        voteCounts={voteCounts}
      />
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
