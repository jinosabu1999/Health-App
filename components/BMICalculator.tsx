"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import InputField from "./InputField"
import ResultCard from "./ResultCard"
import CategoryCard from "./CategoryCard"
import RecommendationsCard from "./RecommendationsCard"

export default function BMICalculator() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [waist, setWaist] = useState("")
  const [gender, setGender] = useState("male")
  const [result, setResult] = useState(null)

  const calculateHealthMetrics = () => {
    const heightM = Number.parseFloat(height) / 100
    const weightKg = Number.parseFloat(weight)
    const ageYears = Number.parseInt(age)
    const waistCm = waist ? Number.parseFloat(waist) : null

    if (isNaN(heightM) || isNaN(weightKg) || heightM <= 0 || weightKg <= 0 || isNaN(ageYears) || ageYears <= 0) {
      alert("Please enter valid values for height, weight, and age.")
      return
    }

    const bmi = weightKg / (heightM * heightM)
    let category = ""
    if (bmi < 18.5) category = "Underweight"
    else if (bmi >= 18.5 && bmi < 25) category = "Normal weight"
    else if (bmi >= 25 && bmi < 30) category = "Overweight"
    else category = "Obese"

    const bodyFatPercentage =
      gender === "male" ? 1.2 * bmi + 0.23 * ageYears - 10.8 * 1 - 5.4 : 1.2 * bmi + 0.23 * ageYears - 10.8 * 0 - 5.4

    const waistToHeightRatio = waistCm ? (waistCm / (heightM * 100)).toFixed(2) : null

    const bmr =
      gender === "male"
        ? 88.362 + 13.397 * weightKg + 4.799 * (heightM * 100) - 5.677 * ageYears
        : 447.593 + 9.247 * weightKg + 3.098 * (heightM * 100) - 4.33 * ageYears

    setResult({
      bmi: bmi.toFixed(2),
      category,
      bodyFatPercentage: bodyFatPercentage.toFixed(2),
      waistToHeightRatio,
      bmr: Math.round(bmr),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Height (cm)" value={height} onChange={setHeight} />
        <InputField label="Weight (kg)" value={weight} onChange={setWeight} />
        <InputField label="Age" value={age} onChange={setAge} />
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <InputField
          label="Waist Circumference (cm) (optional)"
          value={waist}
          onChange={setWaist}
          placeholder="Enter if available"
        />
      </div>

      <Button onClick={calculateHealthMetrics} className="w-full">
        Calculate Health Metrics
      </Button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <ResultCard result={result} />
          <CategoryCard />
          <RecommendationsCard result={result} />
        </motion.div>
      )}
    </div>
  )
}
