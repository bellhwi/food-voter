import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.pathname.split('/').pop() // extract ID from the URL path

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('foodvoter')

    const result = await db
      .collection('submissions')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
