import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400",
        secondary:
          "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        destructive:
          "bg-red-500/10 text-red-700 border border-red-500/20 dark:text-red-400",
        warning:
          "bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:text-amber-400",
        info:
          "bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 dark:text-cyan-400",
        outline:
          "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
