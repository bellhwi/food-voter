'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function CreatePage() {
  const [title, setTitle] = useState('')
  const [nickname, setNickname] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !nickname.trim()) return

    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, hostNickname: nickname }),
    })

    const data = await res.json()
    if (data.roomId) {
      // Save nickname in cookie for later use (e.g., voting)
      Cookies.set('nickname', nickname, { expires: 7 })
      router.push(`/room/${data.roomId}`)
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
        <input
          type='text'
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder='Your nickname (host)'
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
