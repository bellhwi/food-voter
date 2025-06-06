import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title } = body

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      )
    }

    const id = new ObjectId().toString()
    const createdAt = new Date()
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours from now

    const client = await clientPromise
    const db = client.db('sandbox')
    const collection = db.collection('rooms')

    await collection.insertOne({ id, title, createdAt, deadline })

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    console.error('POST /api/rooms error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
