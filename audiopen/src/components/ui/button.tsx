import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400/40 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary:
      "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50",
    ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

