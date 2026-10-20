import React from "react";
import Icon, { IconName } from "./Icons";

interface StatCardProps {
  title: string;
  value: string | number;
  note: string;
  trend?: "up" | "down" | "neutral" | "alert";
  icon: IconName;
  tone?: "green" | "lime" | "yellow" | "red" | "blue";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  note,
  trend = "neutral",
  icon,
  tone = "green",
  onClick,
}) => {
  const iconTones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    lime: "bg-lime-50 text-lime-700 border-lime-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    blue: "bg-sky-50 text-sky-700 border-sky-100",
  };

  const trendColors = {
    up: "text-emerald-700 font-semibold",
    down: "text-rose-600 font-semibold",
    alert: "text-amber-700 font-semibold",
    neutral: "text-gray-500",
  };

  return (
    <article
      onClick={onClick}
      className={`relative p-5 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-emerald-300 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${iconTones[tone]}`}>
          <Icon name={icon} size={18} />
        </div>
      </div>

      <div className="mt-4">
        <strong className="text-2xl font-bold tracking-tight text-gray-900 font-display block">
          {value}
        </strong>
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${trendColors[trend]}`}>
          {trend === "up" && "↗ "}
          {trend === "down" && "↘ "}
          {trend === "alert" && "● "}
          {note}
        </p>
      </div>
    </article>
  );
};

export default StatCard;
