'use client'

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { QUIZ_FACTORY_ADDRESS } from '@/constants/contracts'
import { QuizFactoryABI } from '@/abi'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export function CreateQuiz() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [initialFund, setInitialFund] = useState('0.001')

  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (question.length < 10) {
      alert('Question should be at least 10 characters long')
      return
    }
    
    writeContract({
      address: QUIZ_FACTORY_ADDRESS,
      abi: QuizFactoryABI,
      functionName: 'createQuiz',
      args: [question, answer],
      value: parseEther(initialFund),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-orange-500">Create a Quiz</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="question" className="block mb-2 text-sm font-medium text-gray-700">Question</label>
          <motion.input
            id="question"
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
            placeholder="Enter your question (min 10 characters)"
          />
        </div>

        <div>
          <label htmlFor="answer" className="block mb-2 text-sm font-medium text-gray-700">Answer</label>
          <motion.input
            id="answer"
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
            placeholder="Enter the answer"
          />
        </div>

        <div>
          <label htmlFor="initialFund" className="block mb-2 text-sm font-medium text-gray-700">Initial Fund (ETH)</label>
          <motion.input
            id="initialFund"
            whileFocus={{ scale: 1.02 }}
            type="number"
            value={initialFund}
            onChange={(e) => setInitialFund(e.target.value)}
            step="0.001"
            min="0.001"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
          />
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          disabled={isPending || isConfirming}
          className={`w-full px-4 py-3 text-white rounded-md transition-all duration-300 ease-in-out ${
            isPending || isConfirming ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isPending ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : isConfirming ? (
            'Creating quiz...'
          ) : (
            'Create Quiz'
          )}
        </motion.button>

        {hash && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600 mt-4"
          >
            Transaction Hash: {hash}
          </motion.div>
        )}
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-green-500 mt-4"
          >
            <CheckCircle className="mr-2" size={20} />
            Quiz created successfully!
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-red-500 mt-4"
          >
            <AlertCircle className="mr-2" size={20} />
            Error: {error.message}
          </motion.div>
        )}
      </form>
    </motion.div>
  )
}

