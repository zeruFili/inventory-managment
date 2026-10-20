import React from "react";

export type BadgeTone = "green" | "lime" | "yellow" | "amber" | "red" | "gray" | "blue" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = "green",
  dot = true,
  size = "md",
  className = "",
}) => {
  const toneClasses: Record<BadgeTone, string> = {
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    lime: "bg-lime-50 text-lime-800 border-lime-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    red: "bg-rose-50 text-rose-800 border-rose-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
  };

  const dotColors: Record<BadgeTone, string> = {
    green: "bg-emerald-500",
    lime: "bg-lime-500",
    yellow: "bg-yellow-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    gray: "bg-gray-400",
    blue: "bg-sky-500",
    purple: "bg-purple-500",
  };

  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${toneClasses[tone]} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[tone]}`} />}
      {children}
    </span>
  );
};

export default Badge;
