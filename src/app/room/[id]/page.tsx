import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import ClientWrapper from './ClientWrapper'
import QRCodeDisplay from './QRCodeDisplay'
import CountdownTimer from './CountdownTimer'

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
      <CountdownTimer deadline={room.deadline} />
      <QRCodeDisplay roomId={room.roomId} />

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
