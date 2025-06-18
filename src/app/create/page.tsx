'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNicknameStore } from '@/stores/nicknameStore'

export default function CreatePage() {
  const [title, setTitle] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const setNicknameInStore = useNicknameStore((state) => state.setNickname)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !nickname.trim()) return

    setLoading(true)

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, hostNickname: nickname }),
      })

      const data = await res.json()
      if (data.roomId) {
        setNicknameInStore(nickname)
        router.push(`/room/${data.roomId}`)
      }
    } catch (error) {
      alert('Failed to create room. Please try again.')
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <main className='max-w-md mx-auto p-6'>
      <h1 className='text-2xl font-bold'>Food Voter</h1>
      <p className='mt-2 mb-4'>
        End &quot;What are we eating?&quot; in a few minutes.
      </p>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Room title (e.g. Lunch Drama)'
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
          className='w-full bg-green-800 text-white py-2 rounded hover:bg-green-900 disabled:opacity-50'
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create new room'}
        </button>
      </form>
      <div className='text-gray-400'>
        <p className='mt-4 font-bold'>How it works?</p>
        <ol className='list-decimal ml-4'>
          <li>Create a new room</li>
          <li>Invite your hungry friends/family</li>
          <li>Submit a food you&apos;re craving</li>
          <li>Vote the food</li>
          <li>Eat happy</li>
        </ol>
      </div>
    </main>
  )
}
