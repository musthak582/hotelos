"use client";

import { ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ResultDisplayProps {
  label?: string;
  value: ReactNode;
  onCopy?: string;
  className?: string;
}

export function ResultDisplay({ label, value, onCopy, className }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!onCopy) return;
    await navigator.clipboard.writeText(onCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-black/60">{label}</p>
          {onCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 text-black/40 hover:text-black"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">
                {copied ? "Copied!" : "Copy"}
              </span>
            </Button>
          )}
        </div>
      )}
      <div className="p-4 bg-black/5 rounded-lg font-mono text-sm break-all">
        {value}
      </div>
    </div>
  );
}