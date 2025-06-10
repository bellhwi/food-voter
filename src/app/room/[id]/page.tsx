import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
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
  hostNickname: string
}

export default async function RoomPage({ params }: RoomPageProps) {
  const client = await clientPromise
  const db = client.db('foodvoter')

  const room = await db.collection<Room>('rooms').findOne({ roomId: params.id })
  if (!room) return notFound()

  console.log('room.phase', room.phase)

  return (
    <main className='max-w-md mx-auto p-6 space-y-4'>
      <ClientWrapper roomId={room.roomId} />
    </main>
  )
}
