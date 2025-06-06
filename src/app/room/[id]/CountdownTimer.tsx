'use client'

import { useEffect, useState } from 'react'

export default function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const ms = new Date(deadline).getTime() - Date.now()
      if (ms <= 0) {
        setTimeLeft('Voting ended')
        return
      }
      const min = Math.floor(ms / 60000)
      const sec = Math.floor((ms % 60000) / 1000)
      setTimeLeft(`${min}:${sec.toString().padStart(2, '0')} left`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return <p className='text-gray-600'>⏳ {timeLeft}</p>
}
