// src/app/room/[id]/VoteButton.tsx
'use client'

interface Props {
  roomId: string
  submissionId: string
}

export default function VoteButton({ roomId, submissionId }: Props) {
  const handleClick = async () => {
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        submissionId,
        nickname: 'YOUR_NICKNAME', // ← 나중에 교체 가능
      }),
    })

    const data = await res.json()
    if (res.ok) {
      alert('Vote submitted!')
      window.location.reload()
    } else {
      alert(data.error)
    }
  }

  return (
    <button
      onClick={handleClick}
      className='mt-2 bg-green-600 text-white px-3 py-1 rounded'
    >
      Vote
    </button>
  )
}
