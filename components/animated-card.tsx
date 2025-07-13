"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import type React from "react"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ children, className = "", delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={hover ? { scale: 0.98 } : undefined}
    >
      <Card className={`${className} transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10`}>
        {children}
      </Card>
    </motion.div>
  )
}
