"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Save, ArrowLeft } from "lucide-react"

// Mock food data (in a real app, this would come from Nutritionix API)
const mockFoods = [
  {
    id: "f1",
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: 100,
    servingUnit: "g",
  },
  {
    id: "f2",
    name: "Brown Rice",
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    servingSize: 100,
    servingUnit: "g",
  },
  { id: "f3", name: "Broccoli", calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, servingSize: 100, servingUnit: "g" },
  { id: "f4", name: "Salmon", calories: 206, protein: 22, carbs: 0, fat: 13, servingSize: 100, servingUnit: "g" },
  {
    id: "f5",
    name: "Sweet Potato",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    servingSize: 100,
    servingUnit: "g",
  },
]

interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
  servingUnit: string
}

interface FoodEntry {
  food: Food
  quantity: number
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
}

export function FoodLogger() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast")
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(false)

  const filteredFoods = mockFoods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food)
    setSearchTerm("")
  }

  const handleAddFood = () => {
    if (selectedFood) {
      setFoodEntries([
        ...foodEntries,
        {
          food: selectedFood,
          quantity,
          mealType,
        },
      ])
      setSelectedFood(null)
      setQuantity(1)
    }
  }

  const handleRemoveFood = (index: number) => {
    setFoodEntries(foodEntries.filter((_, i) => i !== index))
  }

  const calculateNutrition = (food: Food, quantity: number) => {
    const multiplier = quantity / (food.servingSize / 100)
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
    }
  }

  const handleSaveEntries = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const today = new Date().toISOString().split("T")[0]

      // Create nutrition logs
      const logsToInsert = foodEntries.map((entry) => {
        const nutrition = calculateNutrition(entry.food, entry.quantity)
        return {
          user_id: user.id,
          date: today,
          meal_type: entry.mealType,
          food_name: entry.food.name,
          serving_size: entry.quantity,
          serving_unit: entry.food.servingUnit,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        }
      })

      const { error } = await supabase.from("nutrition_logs").insert(logsToInsert)

      if (error) {
        throw error
      }

      // Redirect to nutrition page
      router.push("/nutrition")
    } catch (error) {
      console.error("Error saving nutrition logs:", error)
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Foods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for foods..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <div className="border rounded-md divide-y">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer"
                    onClick={() => handleSelectFood(food)}
                  >
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </p>
                    </div>
                    <Plus className="h-5 w-5" />
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted-foreground">No foods found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFood && (
        <Card>
          <CardHeader>
            <CardTitle>Add Food</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{selectedFood.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedFood.calories} kcal per {selectedFood.servingSize}
                {selectedFood.servingUnit}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity ({selectedFood.servingUnit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={mealType} onValueChange={(value) => setMealType(value as any)}>
                  <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Nutrition</h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="font-medium">{calculateNutrition(selectedFood, quantity).calories}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="font-medium">{calculateNutrition(selectedFood, quantity).protein}g</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="font-medium">{calculateNutrition(selectedFood, quantity).carbs}g</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="font-medium">{calculateNutrition(selectedFood, quantity).fat}g</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddFood} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add to Meal
            </Button>
          </CardFooter>
        </Card>
      )}

      {foodEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Food Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {foodEntries.map((entry, index) => {
                const nutrition = calculateNutrition(entry.food, entry.quantity)
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{entry.food.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.quantity} {entry.food.servingUnit} • {entry.mealType}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{nutrition.calories} kcal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {nutrition.protein}g | C: {nutrition.carbs}g | F: {nutrition.fat}g
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFood(index)} className="h-8 w-8">
                        <span className="sr-only">Remove</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/nutrition")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSaveEntries} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Entries"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
