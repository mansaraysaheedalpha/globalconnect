// src/hooks/use-toast.ts
import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, variant, duration = 3000 }: ToastProps) => {
    const message = description || title || "";

    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description,
        duration,
      });
    } else {
      sonnerToast.success(title || "Success", {
        description,
        duration,
      });
    }
  };

  return { toast };
}
