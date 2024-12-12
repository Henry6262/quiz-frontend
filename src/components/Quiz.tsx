'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { QuizABI } from '@/abi'
import { GuessResult } from './GuessResult'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Trophy, CoinsIcon as CoinIcon, AlertCircle, X } from 'lucide-react'

interface QuizProps {
  address: `0x${string}`
}

export function Quiz({ address }: QuizProps) {
  const { address: userAddress } = useAccount()
  const [answer, setAnswer] = useState('')
  const [betAmount, setBetAmount] = useState('0')
  const [guessResult, setGuessResult] = useState<'correct' | 'incorrect' | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { data: question } = useReadContract({
    address,
    abi: QuizABI,
    functionName: 'question',
  }) as { data: string | undefined }

  const { data: balance } = useReadContract({
    address,
    abi: QuizABI,
    functionName: 'getContractBalance',
  }) as { data: bigint | undefined }

  const { data: hasAnswered } = useReadContract({
    address,
    abi: QuizABI,
    functionName: 'correctAnswers',
    args: [userAddress],
  }) as { data: boolean | undefined }

  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess,
    data: receipt 
  } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (receipt) {
      const wasSuccessful = receipt.status === 'success'
      const hadTransfer = receipt.logs.length > 0
      
      if (wasSuccessful && hadTransfer) {
        setGuessResult('correct')
      } else {
        setGuessResult('incorrect')
      }
    }
  }, [receipt])

  useEffect(() => {
    if (balance) {
      const maxBet = formatEther(balance / BigInt(2))
      setBetAmount(maxBet)
    }
  }, [balance])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGuessResult(null)

    if (!balance) {
      setErrorMessage('Unable to fetch contract balance. Please try again.')
      setShowErrorModal(true)
      return
    }

    const maxBet = balance / BigInt(2)
    const betAmountWei = parseEther(betAmount)

    if (betAmountWei > maxBet) {
      setErrorMessage(`Your bet cannot exceed half of the contract balance (${formatEther(maxBet)} ETH).`)
      setShowErrorModal(true)
      return
    }

    writeContract({
      address,
      abi: QuizABI,
      functionName: 'guess',
      args: [answer],
      value: betAmountWei,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md ${hasAnswered ? 'opacity-75' : ''}`}
    >
      <h3 className="text-xl font-semibold mb-3 text-gray-800">
        {question || 'Loading...'}
      </h3>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <CoinIcon className="mr-2 text-orange-500" size={16} />
        <span className="font-medium">Prize Pool:</span>
        <span className="ml-1 text-orange-500 font-bold">
          {balance ? `${formatEther(balance)} ETH` : 'Loading...'}
        </span>
      </div>

      {hasAnswered ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-orange-50 rounded-lg text-center"
        >
          <Trophy className="mx-auto mb-2 text-orange-500" size={32} />
          <p className="text-gray-700 font-medium">
            You've already solved this quiz!
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`answer-${address}`} className="block text-sm font-medium mb-1 text-gray-700">
              Your Answer
            </label>
            <motion.input
              id={`answer-${address}`}
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
              placeholder="Enter your answer"
            />
          </div>

          <div>
            <label htmlFor={`betAmount-${address}`} className="block text-sm font-medium mb-1 text-gray-700">
              Bet Amount (ETH)
            </label>
            <motion.input
              id={`betAmount-${address}`}
              whileFocus={{ scale: 1.02 }}
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              step="0.0001"
              max={balance ? formatEther(balance / BigInt(2)) : undefined}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
            />
            {balance && (
              <p className="text-xs text-gray-500 mt-1">
                Max bet: {formatEther(balance / BigInt(2))} ETH
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isPending || isConfirming}
            className={`w-full py-2 px-4 text-white rounded-md transition-all duration-300 ease-in-out ${
              isPending || isConfirming ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {isPending ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : isConfirming ? (
              'Submitting answer...'
            ) : (
              'Submit Answer'
            )}
          </motion.button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center text-red-500 text-sm"
            >
              <AlertCircle className="mr-2" size={16} />
              {error.message}
            </motion.div>
          )}
          
          {isSuccess && (
            <GuessResult 
              result={guessResult} 
              betAmount={betAmount}
            />
          )}
        </form>
      )}

      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <AlertCircle className="text-orange-500" size={24} />
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
              <p className="text-gray-600">{errorMessage}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowErrorModal(false)}
                className="mt-4 w-full py-2 px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

