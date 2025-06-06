import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId')
  if (!roomId)
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })

  const client = await clientPromise
  const db = client.db('foodvoter')
  const votes = await db.collection('votes').find({ roomId }).toArray()

  const counts: Record<string, number> = {}
  for (const vote of votes) {
    const id = vote.submissionId.toString()
    counts[id] = (counts[id] || 0) + 1
  }

  return NextResponse.json(counts)
}
export async function POST(req: NextRequest) {
  try {
    const { roomId, submissionId, nickname } = await req.json()

    if (!roomId || !submissionId || !nickname) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('foodvoter')

    // Save the vote
    await db.collection('votes').insertOne({
      roomId,
      submissionId,
      nickname,
      createdAt: new Date(),
    })

    // Count unique voters
    const uniqueVoters = await db
      .collection('votes')
      .distinct('nickname', { roomId })

    // Count expected voters based on submissions
    const expectedVoters = await db
      .collection('submissions')
      .distinct('nickname', { roomId })

    // Transition to results phase if everyone voted
    if (uniqueVoters.length >= expectedVoters.length) {
      await db
        .collection('rooms')
        .updateOne({ roomId }, { $set: { phase: 'results' } })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
