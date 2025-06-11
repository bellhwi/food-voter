import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  const { roomId, nickname } = await req.json()

  if (!roomId || !nickname) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('foodvoter')

  const room = await db.collection('rooms').findOne({ roomId })
  if (!room || room.hostNickname !== nickname) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const participantCount = room.participants?.length || 0

  await db.collection('rooms').updateOne(
    { roomId },
    {
      $set: {
        phase: 'submitting',
        allowSubmissions: true,
        expectedParticipantCount: participantCount,
      },
    }
  )

  return NextResponse.json({ ok: true })
}
