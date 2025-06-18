import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('foodvoter')

    // Get all votes for this room
    const voteDocs = await db
      .collection('votes')
      .find({ roomId })
      .project({ _id: 0, nickname: 1, submissionId: 1 }) // optional: filter fields
      .toArray()

    return NextResponse.json(voteDocs)
  } catch (err) {
    console.error('Failed to fetch vote records:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
