import { FoodLogger } from "@/components/nutrition/food-logger"

export default function LogFoodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Food</h1>
        <p className="text-muted-foreground">Search for foods and track your nutrition</p>
      </div>

      <FoodLogger />
    </div>
  )
}
