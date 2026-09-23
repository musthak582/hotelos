"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tool } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link href={`/tools/${tool.slug}`} className="block h-full">
        <Card className="h-full border-black/5 hover:border-black/20 transition-all shadow-sm hover:shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {tool.popular && (
                  <Badge variant="secondary" className="bg-black/5 text-black border-none">
                    <Star className="h-3 w-3 mr-1 fill-black" />
                    Popular
                  </Badge>
                )}
                {tool.new && (
                  <Badge variant="outline" className="border-black/20 text-black">
                    New
                  </Badge>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-black/20 group-hover:text-black/40 transition-colors" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-black">
              {tool.name}
            </h3>
            
            <p className="text-black/60 text-sm leading-relaxed">
              {tool.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}