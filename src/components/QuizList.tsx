'use client'

import { useAccount, useReadContract } from 'wagmi'
import { QUIZ_FACTORY_ADDRESS } from '@/constants/contracts'
import { QuizFactoryABI } from '@/abi'
import { Quiz } from '@/components/Quiz'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function QuizList() {
  const { address: userAddress } = useAccount()
  
  const { data: quizzes, isPending } = useReadContract({
    address: QUIZ_FACTORY_ADDRESS,
    abi: QuizFactoryABI,
    functionName: 'getQuizzes',
  }) as { data: `0x${string}`[] | undefined, isPending: boolean }

  if (!userAddress) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-6 bg-orange-50 rounded-lg shadow-md"
    >
      <AlertTriangle className="mx-auto mb-4 text-orange-500" size={32} />
      <p className="text-lg font-semibold text-gray-800">
        Please connect your wallet to participate in quizzes
      </p>
    </motion.div>
  )

  if (isPending) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >


      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-orange-500">Available Quizzes</h2>
          <div className="text-sm text-gray-600">
            Total Quizzes: {quizzes?.length || 0}
          </div>
        </div>
        
        {quizzes && quizzes.length > 0 ? (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {quizzes.map((quizAddress) => (
              <motion.div
                key={quizAddress}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Quiz address={quizAddress} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 bg-gray-50 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-800">No Quizzes Available</h2>
            <p className="text-gray-600">Create a new quiz to get started!</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

