"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Grid, Maximize2 } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        No photos available
      </div>
    );
  }

  const displayedPhotos = showAllPhotos ? photos : photos.slice(0, 5);
  const remainingCount = photos.length - 5;

  return (
    <>
      {/* Gallery Grid */}
      <div className="overflow-hidden rounded-lg bg-gray-100">
        <div className="grid gap-2">
          {/* Main photo */}
          <button
            onClick={() => openLightbox(0)}
            className="relative aspect-[16/9] w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[0]}
              alt={title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <span className="rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
                1 / {photos.length}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
                <Maximize2 className="h-4 w-4" />
                View
              </span>
            </div>
          </button>

          {/* Thumbnail grid */}
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {displayedPhotos.slice(1, 5).map((photo, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index + 1)}
                  className="relative aspect-square overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`${title} ${index + 2}`}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                  {/* Show "+X more" overlay on the last thumbnail if there are more photos */}
                  {index === 3 && remainingCount > 0 && !showAllPhotos && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                      <span className="text-lg font-semibold">+{remainingCount} more</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Show all photos button */}
          {photos.length > 5 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAllPhotos(!showAllPhotos)}
            >
              <Grid className="mr-2 h-4 w-4" />
              {showAllPhotos ? "Show fewer photos" : `Show all ${photos.length} photos`}
            </Button>
          )}

          {/* Additional photos grid when showing all */}
          {showAllPhotos && photos.length > 5 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(5).map((photo, index) => (
                <button
                  key={index + 5}
                  onClick={() => openLightbox(index + 5)}
                  className="relative aspect-square overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`${title} ${index + 6}`}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none" hideCloseButton>
          <div className="relative flex h-[95vh] items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 z-50 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 z-50 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[currentIndex]}
              alt={`${title} ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-white">
              {currentIndex + 1} / {photos.length}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded transition-all ${
                      index === currentIndex
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
