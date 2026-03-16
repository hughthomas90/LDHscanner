import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-3xl border border-white/70 bg-white/90 p-6 shadow-panel", className)}>
      {children}
    </div>
  );
}
