import React from "react"
import { Loader } from "lucide-react"
import { cn } from "@/utils/cn"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  ...props
}) => (
  <div
    className={cn("flex items-center justify-center", className)}
    {...props}
  >
    <Loader className={cn("animate-spin text-primary-500", sizeClasses[size])} />
  </div>
)

export const LoadingSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "h-12 w-full rounded-lg bg-slate-700 animate-pulse",
      className
    )}
  />
)

export default Spinner
