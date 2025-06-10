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

    // Save the submission
    await db.collection('submissions').insertOne({
      roomId,
      nickname,
      menu,
      createdAt: new Date(),
    })

    // Add participant to the room (once per nickname)
    await db.collection('rooms').updateOne(
      { roomId },
      { $addToSet: { participants: nickname } } // ensures no duplicates
    )

    // Count unique participants
    const uniqueParticipants = await db
      .collection('submissions')
      .distinct('nickname', { roomId })

    // Transition to voting if enough users have submitted
    if (uniqueParticipants.length >= 2) {
      await db.collection('rooms').updateOne(
        { roomId },
        {
          $set: {
            phase: 'voting',
            deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins
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
