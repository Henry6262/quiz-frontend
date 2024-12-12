'use client'
import { useAccount } from 'wagmi'
import { CustomConnectButton } from '@/components/ConnectButton'
import { CreateQuiz } from '@/components/CreateQuiz'
import { QuizList } from '@/components/QuizList'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Quiz dApp</h1>
          <CustomConnectButton />
        </nav>

        {isConnected ? (
          <div className="space-y-8">
            <CreateQuiz />
            <QuizList />
          </div>
        ) : (
          <div className="text-center py-8">
            Please connect your wallet to continue
          </div>
        )}
      </div>
    </main>
  )
}
