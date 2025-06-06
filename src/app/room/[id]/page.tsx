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

export default async function RoomPage({ params }: { params: { id: string } }) {
  const client = await clientPromise
  const db = client.db('foodvoter') // Replace if your DB name is different
  const room = await db.collection<Room>('rooms').findOne({ id: params.id })

  if (!room) return notFound()

  return (
    <main className='max-w-md mx-auto p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>{room.title}</h1>
      <p className='text-gray-600'>⏳ {getTimeLeft(room.deadline)}</p>

      {/* 🔜 Recipe input + vote section will go here */}
      <div className='mt-6 text-gray-400 italic'>
        Voting interface coming soon…
      </div>
    </main>
  )
}
