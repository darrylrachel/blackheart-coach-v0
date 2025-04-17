export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          gender: string
          current_weight: number
          height: number
          fitness_goal: "fat_loss" | "muscle_gain" | "maintenance"
          fitness_level: "newbie" | "intermediate" | "advanced"
          activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
          preferred_weight_unit: "lbs" | "kg"
          preferred_volume_unit: "oz" | "ml"
          tdee: number
          protein_goal: number
          carbs_goal: number
          fat_goal: number
          calories_goal: number
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          gender: string
          current_weight: number
          height: number
          fitness_goal: "fat_loss" | "muscle_gain" | "maintenance"
          fitness_level: "newbie" | "intermediate" | "advanced"
          activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
          preferred_weight_unit: "lbs" | "kg"
          preferred_volume_unit: "oz" | "ml"
          tdee: number
          protein_goal: number
          carbs_goal: number
          fat_goal: number
          calories_goal: number
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          gender?: string
          current_weight?: number
          height?: number
          fitness_goal?: "fat_loss" | "muscle_gain" | "maintenance"
          fitness_level?: "newbie" | "intermediate" | "advanced"
          activity_level?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
          preferred_weight_unit?: "lbs" | "kg"
          preferred_volume_unit?: "oz" | "ml"
          tdee?: number
          protein_goal?: number
          carbs_goal?: number
          fat_goal?: number
          calories_goal?: number
          avatar_url?: string | null
        }
      }
      daily_metrics: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          weight: number | null
          water_intake: number | null
          mood: "terrible" | "bad" | "neutral" | "good" | "great" | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          weight?: number | null
          water_intake?: number | null
          mood?: "terrible" | "bad" | "neutral" | "good" | "great" | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          weight?: number | null
          water_intake?: number | null
          mood?: "terrible" | "bad" | "neutral" | "good" | "great" | null
        }
      }
      nutrition_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          food_name: string
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          food_name: string
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack"
          food_name?: string
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
        }
      }
      workouts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          name: string
          notes: string | null
          duration: number | null
          muscles_worked: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          name: string
          notes?: string | null
          duration?: number | null
          muscles_worked: string[]
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          name?: string
          notes?: string | null
          duration?: number | null
          muscles_worked?: string[]
        }
      }
      workout_exercises: {
        Row: {
          id: string
          created_at: string
          workout_id: string
          exercise_name: string
          exercise_id: string | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          workout_id: string
          exercise_name: string
          exercise_id?: string | null
          order: number
        }
        Update: {
          id?: string
          created_at?: string
          workout_id?: string
          exercise_name?: string
          exercise_id?: string | null
          order?: number
        }
      }
      workout_sets: {
        Row: {
          id: string
          created_at: string
          workout_exercise_id: string
          set_number: number
          weight: number | null
          reps: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          workout_exercise_id: string
          set_number: number
          weight?: number | null
          reps?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          workout_exercise_id?: string
          set_number?: number
          weight?: number | null
          reps?: number | null
          notes?: string | null
        }
      }
      workout_programs: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          level: "beginner" | "intermediate" | "advanced"
          duration_weeks: number
          days_per_week: number
          goal: "strength" | "hypertrophy" | "endurance" | "fat_loss" | "general"
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          level: "beginner" | "intermediate" | "advanced"
          duration_weeks: number
          days_per_week: number
          goal: "strength" | "hypertrophy" | "endurance" | "fat_loss" | "general"
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          level?: "beginner" | "intermediate" | "advanced"
          duration_weeks?: number
          days_per_week?: number
          goal?: "strength" | "hypertrophy" | "endurance" | "fat_loss" | "general"
        }
      }
      user_programs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          program_id: string
          current_week: number
          current_day: number
          start_date: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          program_id: string
          current_week: number
          current_day: number
          start_date: string
          is_active: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          program_id?: string
          current_week?: number
          current_day?: number
          start_date?: string
          is_active?: boolean
        }
      }
      progress_photos: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          photo_url: string
          category: "front" | "back" | "side" | "other"
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          photo_url: string
          category: "front" | "back" | "side" | "other"
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          photo_url?: string
          category?: "front" | "back" | "side" | "other"
        }
      }
      journal_entries: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          mood: "terrible" | "bad" | "neutral" | "good" | "great"
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          mood: "terrible" | "bad" | "neutral" | "good" | "great"
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          mood?: "terrible" | "bad" | "neutral" | "good" | "great"
          content?: string
        }
      }
      ai_usage: {
        Row: {
          id: string
          created_at: string
          user_id: string
          feature: string
          tokens_used: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          feature: string
          tokens_used: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          feature?: string
          tokens_used?: number
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          plan_id: string
          status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
          current_period_start: string
          current_period_end: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          plan_id: string
          status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
          current_period_start: string
          current_period_end: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          plan_id?: string
          status?: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
          current_period_start?: string
          current_period_end?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
