'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const [title, setTitle] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })

    const data = await res.json()
    if (data.id) {
      router.push(`/room/${data.id}`)
    }
  }

  return (
    <main className='max-w-md mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Create a New Room</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's the vote about?"
          className='w-full p-2 border rounded'
        />
        <button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
        >
          Create Room
        </button>
      </form>
    </main>
  )
}
