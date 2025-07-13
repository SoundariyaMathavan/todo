"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Hash, Blocks, Shield, Zap, Star, Sparkles } from "lucide-react"

const icons = [Hash, Blocks, Shield, Zap, Star, Sparkles]

interface FloatingElement {
  id: number
  Icon: any
  x: number
  y: number
  delay: number
  duration: number
  color: string
}

export function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const newElements: FloatingElement[] = []

    for (let i = 0; i < 8; i++) {
      newElements.push({
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
      })
    }

    setElements(newElements)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute opacity-20"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            color: element.color,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <element.Icon size={24} />
        </motion.div>
      ))}
    </div>
  )
}
