"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface PhotoUploadProps {
  userId: string
  onComplete: () => void
}

export function PhotoUpload({ userId, onComplete }: PhotoUploadProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [photoCategory, setPhotoCategory] = useState<"front" | "back" | "side" | "other">("front")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed")
        return
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split("T")[0]
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${userId}/${uuidv4()}.${fileExt}`
      const filePath = `progress-photos/${fileName}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, selectedFile)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(filePath)

      // Save the photo record in the database
      const { error: dbError } = await supabase.from("progress_photos").insert({
        user_id: userId,
        date: today,
        photo_url: publicUrlData.publicUrl,
        category: photoCategory,
      })

      if (dbError) {
        throw dbError
      }

      // Success - refresh the page and close the upload form
      router.refresh()
      onComplete()
    } catch (err: any) {
      console.error("Error uploading photo:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Photo Category</Label>
            <RadioGroup value={photoCategory} onValueChange={(value) => setPhotoCategory(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="front" id="front" />
                <Label htmlFor="front">Front View</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="back" id="back" />
                <Label htmlFor="back">Back View</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side" id="side" />
                <Label htmlFor="side">Side View</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Select Photo</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              {selectedFile && (
                <Button variant="ghost" size="icon" onClick={handleClearFile} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onComplete}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || loading}>
              {loading ? "Uploading..." : "Upload Photo"}
              {!loading && <Upload className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {previewUrl ? (
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full aspect-square bg-muted p-6">
                  <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">Photo preview will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
