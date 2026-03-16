import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
};

const baseClassName =
  "inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90";

export function Button({ children, className, href, type = "button" }: ButtonProps) {
  if (href) {
    return (
      <Link className={cn(baseClassName, className)} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cn(baseClassName, className)} type={type}>
      {children}
    </button>
  );
}
