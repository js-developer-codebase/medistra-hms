"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || React.useId();
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "h-4.5 w-4.5 flex items-center justify-center rounded border border-slate-300 bg-white transition-all cursor-pointer",
              "peer-checked:bg-emerald-600 peer-checked:border-emerald-600 peer-checked:text-white",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-1",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              "dark:border-slate-700 dark:bg-slate-900 dark:peer-checked:bg-emerald-600",
              className
            )}
            onClick={() => {
              const input = document.getElementById(checkboxId) as HTMLInputElement;
              if (input && !input.disabled) {
                input.click();
              }
            }}
          >
            <Check className="h-3 w-3 hidden peer-checked:block" />
          </div>
          {/* Visible check icon layer */}
          <Check
            className={cn(
              "absolute h-3 w-3 text-white pointer-events-none opacity-0 transition-opacity",
              "peer-checked:opacity-100"
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
