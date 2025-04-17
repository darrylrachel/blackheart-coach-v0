type Gender = "male" | "female"
type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance"

// Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
export function calculateBMR(gender: Gender, weight: number, height: number, age = 30): number {
  // Weight in kg, height in cm, age in years
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// Calculate Total Daily Energy Expenditure (TDEE)
export function calculateTDEE(
  gender: Gender,
  weight: number,
  height: number,
  activityLevel: ActivityLevel,
  age = 30,
): number {
  const bmr = calculateBMR(gender, weight, height, age)

  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    lightly_active: 1.375, // Light exercise 1-3 days/week
    moderately_active: 1.55, // Moderate exercise 3-5 days/week
    very_active: 1.725, // Hard exercise 6-7 days/week
    extremely_active: 1.9, // Very hard exercise & physical job
  }

  return Math.round(bmr * activityMultipliers[activityLevel])
}

// Calculate macronutrient targets based on TDEE and fitness goal
export function calculateMacros(tdee: number, fitnessGoal: FitnessGoal) {
  let proteinPerKg: number
  let fatPercentage: number
  let calorieAdjustment: number

  switch (fitnessGoal) {
    case "fat_loss":
      proteinPerKg = 2.2 // Higher protein for fat loss
      fatPercentage = 0.25 // 25% of calories from fat
      calorieAdjustment = -500 // Deficit for fat loss
      break
    case "muscle_gain":
      proteinPerKg = 2.0 // High protein for muscle gain
      fatPercentage = 0.25 // 25% of calories from fat
      calorieAdjustment = 500 // Surplus for muscle gain
      break
    case "maintenance":
    default:
      proteinPerKg = 1.8 // Moderate protein for maintenance
      fatPercentage = 0.3 // 30% of calories from fat
      calorieAdjustment = 0 // No adjustment for maintenance
      break
  }

  const adjustedCalories = tdee + calorieAdjustment

  // Assuming 70kg as default weight if not provided
  const proteinGrams = Math.round(70 * proteinPerKg) // Protein in grams
  const proteinCalories = proteinGrams * 4 // 4 calories per gram of protein

  const fatCalories = adjustedCalories * fatPercentage
  const fatGrams = Math.round(fatCalories / 9) // 9 calories per gram of fat

  const remainingCalories = adjustedCalories - proteinCalories - fatCalories
  const carbGrams = Math.round(remainingCalories / 4) // 4 calories per gram of carbs

  return {
    calories: adjustedCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  }
}
