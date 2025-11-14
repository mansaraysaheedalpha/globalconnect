//src/app/(platform)/dashboard/events/[eventId]/_components/full-screen-viewer.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface FullScreenViewerProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FullScreenViewer = ({
  src,
  isOpen,
  onClose,
}: FullScreenViewerProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-0 bg-background/80 backdrop-blur-sm flex flex-col">
        <TransformWrapper>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => zoomIn()}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => zoomOut()}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => resetTransform()}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-grow w-full h-full cursor-grab">
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: "100%", height: "100%" }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={src}
                      alt="Fullscreen Slide"
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="100vw"
                    />
                  </div>
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>
      </DialogContent>
    </Dialog>
  );
};