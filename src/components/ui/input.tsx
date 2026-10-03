import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center w-full", containerClassName)}>
        {startIcon && (
          <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-slate-400">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full h-12 rounded-xl bg-[#eef3fb] text-slate-900 text-sm font-normal px-4 transition-all duration-200",
            "placeholder:text-slate-400 placeholder:font-normal",
            "outline-none border border-transparent",
            "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            startIcon && "pl-11",
            endIcon && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
