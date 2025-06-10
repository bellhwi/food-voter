import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import ClientWrapper from './ClientWrapper'

type Phase = 'submitting' | 'voting' | 'results'

interface Room {
  roomId: string
  title: string
  deadline: string
  phase: Phase
  hostNickname: string
}

type RoomPageParams = Promise<{ id: string }>

// ✅ DO NOT manually type params as a Promise
// ✅ Let Next.js handle prop types
export default async function RoomPage({ params }: { params: RoomPageParams }) {
  const { id } = await params

  const client = await clientPromise
  const db = client.db('foodvoter')

  const room = await db.collection<Room>('rooms').findOne({ roomId: id })

  if (!room) return notFound()

  return (
    <main className='max-w-md mx-auto p-6 space-y-4'>
      <ClientWrapper roomId={room.roomId} />
    </main>
  )
}
