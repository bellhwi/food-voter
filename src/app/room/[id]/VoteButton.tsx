'use client'

import { useNicknameStore } from '@/stores/nicknameStore'

interface Props {
  roomId: string
  submissionId: string
}

export default function VoteButton({ roomId, submissionId }: Props) {
  const nickname = useNicknameStore((state) => state.nickname)

  const handleClick = async () => {
    if (!nickname) {
      alert('Nickname is missing.')
      return
    }

    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        submissionId,
        nickname,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      alert('Vote submitted!')
      window.location.reload()
    } else {
      alert(data.error || 'Failed to vote.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className='mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700'
    >
      Vote
    </button>
  )
}
