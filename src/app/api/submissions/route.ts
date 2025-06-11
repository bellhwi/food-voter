import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId')
  if (!roomId)
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })

  const client = await clientPromise
  const db = client.db('foodvoter')
  const submissions = await db
    .collection('submissions')
    .find({ roomId })
    .sort({ createdAt: -1 })
    .toArray()

  const result = submissions.map((s) => ({
    id: s._id.toString(),
    nickname: s.nickname,
    menu: s.menu,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  try {
    const { roomId, nickname, menu } = await req.json()

    if (!roomId || !nickname || !menu) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('foodvoter')

    const room = await db.collection('rooms').findOne({ roomId })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.allowSubmissions === false) {
      return NextResponse.json(
        { error: 'Voting has already started. Submissions are closed.' },
        { status: 403 }
      )
    }

    // Save the submission
    await db.collection('submissions').insertOne({
      roomId,
      nickname,
      menu,
      createdAt: new Date(),
    })

    // Add participant (deduplicated)
    await db
      .collection('rooms')
      .updateOne({ roomId }, { $addToSet: { participants: nickname } })

    // ✅ Use expectedParticipantCount to decide when to transition
    const submissions = await db
      .collection('submissions')
      .find({ roomId })
      .toArray()

    const uniqueSubmitted = [
      ...new Set(submissions.map((s) => s.nickname.trim().toLowerCase())),
    ]

    if (
      room.phase === 'submitting' &&
      room.expectedParticipantCount &&
      uniqueSubmitted.length >= room.expectedParticipantCount
    ) {
      await db.collection('rooms').updateOne(
        { roomId },
        {
          $set: {
            phase: 'voting',
            deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            allowSubmissions: false,
          },
        }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
