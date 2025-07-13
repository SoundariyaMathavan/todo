"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Pickaxe, Zap, Hash, CheckCircle } from "lucide-react"

interface MiningAnimationProps {
  isVisible: boolean
  onComplete?: () => void
}

export function MiningAnimation({ isVisible, onComplete }: MiningAnimationProps) {
  const [stage, setStage] = useState<"mining" | "hashing" | "complete">("mining")

  useEffect(() => {
    if (isVisible) {
      setStage("mining")

      const timer1 = setTimeout(() => setStage("hashing"), 1500)
      const timer2 = setTimeout(() => setStage("complete"), 3000)
      const timer3 = setTimeout(() => {
        onComplete?.()
      }, 4000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-background rounded-2xl p-8 shadow-2xl border max-w-md w-full mx-4"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-16 h-16 mx-auto"
              >
                {stage === "mining" && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Pickaxe className="w-16 h-16 text-blue-500" />
                  </motion.div>
                )}
                {stage === "hashing" && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Hash className="w-16 h-16 text-purple-500" />
                  </motion.div>
                )}
                {stage === "complete" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </motion.div>
                )}
              </motion.div>

              <div className="space-y-2">
                <motion.h3
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold"
                >
                  {stage === "mining" && "Mining Block..."}
                  {stage === "hashing" && "Calculating Hash..."}
                  {stage === "complete" && "Block Mined!"}
                </motion.h3>

                <motion.p
                  key={`${stage}-desc`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground"
                >
                  {stage === "mining" && "Finding the perfect nonce"}
                  {stage === "hashing" && "Verifying proof of work"}
                  {stage === "complete" && "Task added to blockchain"}
                </motion.p>
              </div>

              {stage !== "complete" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{stage === "mining" ? "60%" : "90%"}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: stage === "mining" ? "60%" : "90%" }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}

              {stage === "complete" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex justify-center"
                >
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
