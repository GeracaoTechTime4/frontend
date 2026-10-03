import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const iconSizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const tileSizes = {
    sm: "w-2.5 h-2.5 rounded-[2px]",
    md: "w-3 h-3 rounded-[3px]",
    lg: "w-3.5 h-3.5 rounded-[4px]",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon with 4 tiles */}
      <div
        className={`${iconSizes[size]} bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20`}
      >
        <div className="grid grid-cols-2 gap-1 p-1">
          <div className={`${tileSizes[size]} bg-white`} />
          <div className={`${tileSizes[size]} bg-white`} />
          <div className={`${tileSizes[size]} bg-white`} />
          <div className={`${tileSizes[size]} bg-white`} />
        </div>
      </div>

      {/* Brand Text */}
      <span className={`${textSizes[size]} font-bold tracking-tight text-slate-900`}>
        Scale<span className="text-blue-600">Ops</span>
      </span>
    </div>
  );
};
