"use client";

import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BloomLevel = "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";

interface BloomBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const bloomConfig: Record<BloomLevel, {
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  REMEMBER: {
    label: "Remember",
    shortLabel: "R",
    description: "Recall facts and basic concepts",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    icon: "💭",
  },
  UNDERSTAND: {
    label: "Understand",
    shortLabel: "U",
    description: "Explain ideas and concepts",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "💡",
  },
  APPLY: {
    label: "Apply",
    shortLabel: "A",
    description: "Use information in new situations",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: "⚙️",
  },
  ANALYZE: {
    label: "Analyze",
    shortLabel: "AN",
    description: "Draw connections among ideas",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    icon: "🔍",
  },
  EVALUATE: {
    label: "Evaluate",
    shortLabel: "E",
    description: "Justify decisions and judgments",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: "⚖️",
  },
  CREATE: {
    label: "Create",
    shortLabel: "C",
    description: "Produce new or original work",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: "🎨",
  },
};

export function BloomBadge({ level, size = "sm", showLabel = false }: BloomBadgeProps) {
  const config = bloomConfig[level as BloomLevel] || bloomConfig.UNDERSTAND;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.bgColor} ${config.borderColor} ${config.color} ${sizeClasses[size]} cursor-help`}
          >
            <span>{config.icon}</span>
            {showLabel ? config.label : config.shortLabel}
          </motion.span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-slate-900 border-slate-800 text-white"
        >
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${config.color} font-semibold`}>
                {config.label}
              </span>
              <span className="text-slate-500 text-xs">
                Bloom&apos;s Taxonomy
              </span>
            </div>
            <p className="text-xs text-slate-400">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Visual level indicator for learning path
export function BloomLevelIndicator({ level }: { level: string }) {
  const levels: BloomLevel[] = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"];
  const currentIndex = levels.indexOf(level as BloomLevel);

  return (
    <div className="flex items-center gap-1">
      {levels.map((lvl, index) => {
        const config = bloomConfig[lvl];
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <motion.div
            key={lvl}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-2 h-2 rounded-full ${isCurrent
              ? `${config.bgColor.replace("/10", "/50")} ring-2 ring-offset-1 ring-offset-slate-950 ring-current`
              : isActive
                ? config.bgColor
                : "bg-slate-800"
              } ${isCurrent ? config.color : ""}`}
          />
        );
      })}
    </div>
  );
}





