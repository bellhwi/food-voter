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

// PUT /api/rooms
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { roomId, newTitle, nickname } = body

    if (!roomId || !newTitle || !nickname) {
      return NextResponse.json(
        { error: 'Missing roomId, newTitle, or nickname.' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('foodvoter')

    const room = await db.collection<Room>('rooms').findOne({ roomId })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.hostNickname !== nickname) {
      return NextResponse.json(
        { error: 'Only the host can edit the room title.' },
        { status: 403 }
      )
    }

    if (room.phase !== 'submitting') {
      return NextResponse.json(
        { error: 'Title can only be edited during the submitting phase.' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('rooms')
      .updateOne({ roomId }, { $set: { title: newTitle } })

    return NextResponse.json({ success: result.modifiedCount === 1 })
  } catch (error) {
    console.error('PUT /api/rooms error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
