"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { SeoHead } from "@/components/shared/SeoHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  seoKeywords?: string[];
  className?: string;
}

export function ToolLayout({
  title,
  description,
  children,
  seoKeywords = [],
  className,
}: ToolLayoutProps) {
  return (
    <>
      <SeoHead
        title={title}
        description={description}
        keywords={["web3 tool", ...seoKeywords]}
      />

      <PageLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              {title}
            </h1>
            <p className="text-lg text-black/60">
              {description}
            </p>
          </div>

          <Card className="border-black/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-black">
                {title}
              </CardTitle>
              <CardDescription className="text-black/60">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className={cn(className)}>
              {children}
            </CardContent>
          </Card>
        </motion.div>
      </PageLayout>
    </>
  );
}