import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  const { roomId, nickname } = await req.json()

  if (!roomId || !nickname) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('foodvoter')

    await db
      .collection('rooms')
      .updateOne({ roomId }, { $addToSet: { participants: nickname } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Ready error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
