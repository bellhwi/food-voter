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
      <h1 className='text-2xl font-bold'>Pickle</h1>
      <p className='mt-2 mb-4'>Skip chaos. Vote fair. Eat happy.</p>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Room title (e.g., "Lunch Drama")'
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
          className='w-full bg-green-800 text-white py-2 rounded hover:bg-green-900'
        >
          Create your Pickle
        </button>
      </form>
    </main>
  )
}
