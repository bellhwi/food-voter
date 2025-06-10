import { NextResponse, NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

interface Room {
  roomId: string
  title: string
  createdAt: Date
  deadline: string
  phase: 'submitting' | 'voting' | 'results'
  hostNickname: string
  participants?: string[]
}

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId')
  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('foodvoter')
  const room = await db.collection<Room>('rooms').findOne({ roomId })

  if (!room) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(room)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, hostNickname } = body

    if (!title || !hostNickname) {
      return NextResponse.json(
        { error: 'Title and hostNickname are required' },
        { status: 400 }
      )
    }

    const roomId = new ObjectId().toString()
    const createdAt = new Date()
    const deadline = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 mins from now

    const client = await clientPromise
    const db = client.db('foodvoter')

    const newRoom: Room = {
      roomId,
      title,
      createdAt,
      deadline,
      phase: 'submitting',
      hostNickname,
      participants: [],
    }

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
