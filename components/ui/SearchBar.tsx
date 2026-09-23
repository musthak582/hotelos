"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = "Search tools...",
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className={cn("relative group", className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 group-focus-within:text-black/60 transition-colors" />
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-12 pr-12 h-14 text-lg bg-white border-black/10 focus:border-black/20 rounded-2xl shadow-sm hover:shadow-md transition-all"
      />
      {query && (
        <Button
          size="icon"
          variant="ghost"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}