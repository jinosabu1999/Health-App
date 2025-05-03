interface ResultCardProps {
  result: {
    bmi: string
    category: string
    bodyFatPercentage: string
    waistToHeightRatio: string | null
    bmr: number
  }
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400">BMI:</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.bmi}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Category:</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.category}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Body Fat Percentage:</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.bodyFatPercentage}%</p>
        </div>
        {result.waistToHeightRatio && (
          <div>
            <p className="text-gray-600 dark:text-gray-400">Waist-to-Height Ratio:</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.waistToHeightRatio}</p>
          </div>
        )}
        <div>
          <p className="text-gray-600 dark:text-gray-400">Basal Metabolic Rate (BMR):</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.bmr} calories/day</p>
        </div>
      </div>
    </div>
  )
}
