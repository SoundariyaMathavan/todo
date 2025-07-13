"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsCardAnimatedProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
  delay?: number
  gradient?: string
}

export function StatsCardAnimated({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
  gradient = "from-blue-500 to-purple-500",
}: StatsCardAnimatedProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const increment = value / 30
      const counter = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(counter)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, 50)

      return () => clearInterval(counter)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-6 relative">
          {/* Animated background gradient */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.8 }}
          />

          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-2">
              <motion.p
                className="text-sm text-muted-foreground font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
              >
                {title}
              </motion.p>

              <motion.p
                className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: delay + 0.4,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                {displayValue}
              </motion.p>
            </div>

            <motion.div
              className={`p-3 rounded-full bg-gradient-to-br ${gradient} shadow-lg`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: delay + 0.5,
                type: "spring",
                stiffness: 150,
              }}
              whileHover={{
                rotate: 360,
                transition: { duration: 0.6 },
              }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>

          {/* Pulse effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 rounded-lg`}
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: delay + 1,
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
