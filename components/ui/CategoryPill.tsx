"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { CategoryInfo } from "@/lib/types";

interface CategoryPillProps {
  category: CategoryInfo;
  isActive?: boolean;
  onClick: () => void;
}

export function CategoryPill({ category, isActive, onClick }: CategoryPillProps) {
  const IconComponent = (Icons as any)[category.icon.charAt(0).toUpperCase() + category.icon.slice(1)] || Icons.HelpCircle;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "rounded-full px-6 py-6 border-black/10 hover:border-black/30 transition-all",
        isActive 
          ? "bg-black text-white hover:bg-black/90 border-black" 
          : "bg-white text-black hover:bg-black/5"
      )}
    >
      <IconComponent className={cn("h-4 w-4 mr-2", isActive ? "text-white" : "text-black/60")} />
      {category.name}
    </Button>
  );
}