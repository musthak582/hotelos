"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, className, id, ...props }: InputFieldProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-black/70">
        {label}
      </Label>
      <Input
        id={inputId}
        className={cn(
          "border-black/10 focus:border-black/30",
          error && "border-red-500/50 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500/70 mt-1">{error}</p>
      )}
    </div>
  );
}