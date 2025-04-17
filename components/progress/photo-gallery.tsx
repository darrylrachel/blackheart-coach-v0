"use client"

import { useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/supabase/database.types"

type ProgressPhoto = Database["public"]["Tables"]["progress_photos"]["Row"]

interface PhotoGalleryProps {
  photos: ProgressPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null)

  // Group photos by category
  const frontPhotos = photos.filter((photo) => photo.category === "front")
  const backPhotos = photos.filter((photo) => photo.category === "back")
  const sidePhotos = photos.filter((photo) => photo.category === "side")
  const otherPhotos = photos.filter((photo) => photo.category === "other")

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="back">Back</TabsTrigger>
          <TabsTrigger value="side">Side</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <PhotoGrid photos={photos} onSelectPhoto={setSelectedPhoto} />
        </TabsContent>
        <TabsContent value="front" className="mt-4">
          <PhotoGrid photos={frontPhotos} onSelectPhoto={setSelectedPhoto} />
        </TabsContent>
        <TabsContent value="back" className="mt-4">
          <PhotoGrid photos={backPhotos} onSelectPhoto={setSelectedPhoto} />
        </TabsContent>
        <TabsContent value="side" className="mt-4">
          <PhotoGrid photos={sidePhotos} onSelectPhoto={setSelectedPhoto} />
        </TabsContent>
        <TabsContent value="other" className="mt-4">
          <PhotoGrid photos={otherPhotos} onSelectPhoto={setSelectedPhoto} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-[60vh]">
                <Image
                  src={selectedPhoto.photo_url || "/placeholder.svg"}
                  alt={`Progress photo from ${selectedPhoto.date}`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="font-medium">{format(parseISO(selectedPhoto.date), "MMMM d, yyyy")}</p>
                <p className="text-sm text-muted-foreground capitalize">{selectedPhoto.category} view</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PhotoGridProps {
  photos: ProgressPhoto[]
  onSelectPhoto: (photo: ProgressPhoto) => void
}

function PhotoGrid({ photos, onSelectPhoto }: PhotoGridProps) {
  if (photos.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No photos in this category</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Dialog key={photo.id}>
          <DialogTrigger asChild>
            <div
              className="relative aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onSelectPhoto(photo)}
            >
              <Image
                src={photo.photo_url || "/placeholder.svg"}
                alt={`Progress photo from ${photo.date}`}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1">
                {format(parseISO(photo.date), "MMM d, yyyy")}
              </div>
            </div>
          </DialogTrigger>
        </Dialog>
      ))}
    </div>
  )
}
