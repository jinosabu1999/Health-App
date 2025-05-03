interface RecommendationsCardProps {
  result: {
    bmi: string
    bodyFatPercentage: string
    waistToHeightRatio: string | null
  }
}

export default function RecommendationsCard({ result }: RecommendationsCardProps) {
  const bmi = Number.parseFloat(result.bmi)
  const bodyFatPercentage = Number.parseFloat(result.bodyFatPercentage)
  const waistToHeightRatio = result.waistToHeightRatio ? Number.parseFloat(result.waistToHeightRatio) : null

  const recommendations = [
    ...(bmi < 18.5
      ? [
          "Consider increasing your calorie intake with nutrient-dense foods.",
          "Incorporate strength training exercises to build muscle mass.",
        ]
      : []),
    ...(bmi >= 25
      ? [
          "Focus on creating a slight calorie deficit through diet and exercise.",
          "Aim for at least 150 minutes of moderate-intensity aerobic activity per week.",
        ]
      : []),
    ...(bodyFatPercentage > 25
      ? [
          "Consider incorporating high-intensity interval training (HIIT) into your exercise routine.",
          "Increase your protein intake to support muscle growth and fat loss.",
        ]
      : []),
    ...(waistToHeightRatio && waistToHeightRatio > 0.5
      ? [
          "Focus on reducing abdominal fat through targeted exercises and a balanced diet.",
          "Consider limiting processed foods and increasing fiber intake.",
        ]
      : []),
    "Stay hydrated by drinking at least 8 glasses of water per day.",
    "Ensure you get 7-9 hours of quality sleep each night.",
    "Manage stress through relaxation techniques like meditation or yoga.",
  ]

  return (
    <div className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Personalized Recommendations</h2>
      <ul className="list-disc pl-5 space-y-2">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="text-gray-600 dark:text-gray-300">
            {recommendation}
          </li>
        ))}
      </ul>
    </div>
  )
}
