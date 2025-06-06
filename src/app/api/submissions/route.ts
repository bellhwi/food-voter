import clientPromise from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { roomId, nickname, menu } = await req.json()
  if (!roomId || !nickname || !menu) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('foodvoter')
  const result = await db.collection('submissions').insertOne({
    roomId,
    nickname,
    menu,
    createdAt: new Date(),
  })

  return NextResponse.json({ ok: true })
}
