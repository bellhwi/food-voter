import clientPromise from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { roomId, submissionId, nickname } = await req.json()
  if (!roomId || !submissionId || !nickname) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('foodvoter')

  const existing = await db.collection('votes').findOne({ roomId, nickname })
  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 400 })
  }

  await db.collection('votes').insertOne({
    roomId,
    submissionId,
    nickname,
    createdAt: new Date(),
  })

  return NextResponse.json({ ok: true })
}
