import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import QRCodeDisplay from './QRCodeDisplay'
import CountdownTimer from './CountdownTimer'
import ClientWrapper from './ClientWrapper'

interface RoomPageProps {
  params: {
    id: string
  }
}

type Phase = 'submitting' | 'voting' | 'results'

interface Room {
  roomId: string
  title: string
  deadline: string
  phase: Phase
  hostNickname: string // ✅ Add this
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

async function getVotes(roomId: string) {
  const client = await clientPromise
  const db = client.db('foodvoter')
  const votes = await db.collection('votes').find({ roomId }).toArray()

  const counts: Record<string, number> = {}
  for (const vote of votes) {
    const id = vote.submissionId.toString()
    counts[id] = (counts[id] || 0) + 1
  }

  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export default async function RoomPage({ params }: RoomPageProps) {
  const client = await clientPromise
  const db = client.db('foodvoter')

  const room = await db.collection<Room>('rooms').findOne({ roomId: params.id })
  if (!room) return notFound()

  return (
    <main className='max-w-md mx-auto p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>{room.title}</h1>
      <CountdownTimer deadline={room.deadline} />
      <QRCodeDisplay roomId={room.roomId} />
      <ClientWrapper roomId={room.roomId} />
    </main>
  )
}
