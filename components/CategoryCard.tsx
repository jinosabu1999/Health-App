"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const categories = [
  {
    name: "Underweight",
    range: "BMI < 18.5",
    description:
      "Being underweight can increase the risk of osteoporosis, weakened immune system, and fertility issues.",
  },
  {
    name: "Normal weight",
    range: "18.5 ≤ BMI < 25",
    description:
      "A normal BMI is associated with lower risk of various health issues and is generally considered healthy.",
  },
  {
    name: "Overweight",
    range: "25 ≤ BMI < 30",
    description: "Being overweight may increase the risk of heart disease, type 2 diabetes, and certain cancers.",
  },
  {
    name: "Obese",
    range: "BMI ≥ 30",
    description:
      "Obesity is associated with higher risks of cardiovascular diseases, diabetes, and other health complications.",
  },
]

export default function CategoryCard() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">BMI Categories</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <motion.div
            key={category.name}
            className="bg-white dark:bg-gray-600 rounded-lg p-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800 dark:text-white">{category.name}</span>
              <span className="text-blue-600 dark:text-blue-400">{category.range}</span>
            </div>
            <AnimatePresence>
              {activeCategory === category.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-gray-600 dark:text-gray-300"
                >
                  {category.description}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
