interface GuessResultProps {
  result: 'correct' | 'incorrect' | null
  betAmount: string
}

export function GuessResult({ result, betAmount }: GuessResultProps) {
  if (!result) return null

  if (result === 'correct') {
    return (
      <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🎉</span>
          <div>
            <h4 className="font-bold text-green-800">Congratulations!</h4>
            <p className="text-green-700">
              Your answer was correct! You won {Number(betAmount) * 2} ETH!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
      <div className="flex items-center">
        <span className="text-2xl mr-2">❌</span>
        <div>
          <h4 className="font-bold text-red-800">Incorrect Answer</h4>
          <p className="text-red-700">
            Sorry, that wasn't right. You lost {betAmount} ETH. Try again!
          </p>
        </div>
      </div>
    </div>
  )
} 