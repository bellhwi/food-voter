'use client'

import QRCode from 'react-qr-code'

export default function QRCodeDisplay({ roomId }: { roomId: string }) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/room/${roomId}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our Food Vote!',
          text: 'Help us decide what to eat 🍕🍔🍣',
          url: url,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      alert(
        'Sharing not supported on this browser. Please copy the link manually.'
      )
    }
  }

  return (
    <div className='mt-4 flex flex-col items-center'>
      <h2 className='text-lg font-semibold mb-2'>Scan or Share</h2>
      <QRCode value={url} size={200} />
      <p className='mt-2 text-sm text-gray-500 break-all text-center'>{url}</p>
      <button
        onClick={handleShare}
        className='mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
      >
        Share This Link
      </button>
    </div>
  )
}
