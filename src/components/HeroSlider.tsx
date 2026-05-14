'use client'

import { useState, useEffect } from 'react'

const IMAGES = [
  '/slider/LEGIT-flowerface.webp',
  '/slider/LEGIT-Horse.webp',
  '/slider/yprint-shirt-sun-logo.webp',
  '/slider/LEGIT-Mountain.webp',
  '/slider/LEGIT-peperoni.webp',
  '/slider/LEGIT-sun.webp',
  '/slider/LEGIT-Tree.webp',
  '/slider/default-shirt-mockup.webp',
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % IMAGES.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        aspectRatio: '3/4',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
      }}
    >
      {IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`yprint Shirt Design ${i + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
          }}
        />
      ))}
    </div>
  )
}
