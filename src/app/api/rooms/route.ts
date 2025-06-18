import { NextResponse, NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

interface Room {
  roomId: string
  title: string
  createdAt: Date
  deadline: string
  phase: 'waiting' | 'submitting' | 'voting' | 'results'
  hostNickname: string
  participants?: string[]
  allowSubmissions: boolean
}

// GET /api/rooms?roomId=123
export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId')
  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('foodvoter')
  const room = await db.collection<Room>('rooms').findOne({ roomId })

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  return NextResponse.json(room)
}

// POST /api/rooms
export async function POST(req: Request) {
  try {
    const { title, hostNickname }: Partial<Room> = await req.json()

    if (!title || !hostNickname) {
      return NextResponse.json(
        { error: 'Both title and hostNickname are required.' },
        { status: 400 }
      )
    }

    const roomId = new ObjectId().toString()
    const createdAt = new Date()
    const deadline = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const newRoom: Room = {
      roomId,
      title,
      createdAt,
      deadline,
      phase: 'waiting',
      hostNickname,
      participants: [hostNickname],
      allowSubmissions: false,
    }

    const client = await clientPromise
    const db = client.db('foodvoter')

    await db.collection<Room>('rooms').insertOne(newRoom)

    return NextResponse.json({ roomId }, { status: 200 })
  } catch (error) {
    console.error('POST /api/rooms error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
