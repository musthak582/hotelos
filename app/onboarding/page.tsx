"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ← add this
import { motion } from "framer-motion";
import { Hotel, MapPin, FileText, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createHotelAction } from "@/actions/hotel.actions";

const hotelSchema = z.object({
  name: z.string().min(2, "Hotel name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  description: z.string().optional(),
});

type HotelForm = z.infer<typeof hotelSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession(); // ← add this
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<HotelForm>({
    resolver: zodResolver(hotelSchema),
  });

  const onSubmit = async (data: HotelForm) => {
    setIsLoading(true);
    try {
      const result = await createHotelAction(data);
      if (result.success) {
        toast.success("Hotel created! Welcome to HotelOS 🎉");

        // ✅ Force Auth.js to re-fetch session with the new hotelId
        await update();

        // ✅ Now navigate — middleware will see hotelId in the token
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to create hotel");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative"
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">✓</span>
            </div>
            <span className="text-xs text-slate-500">Account</span>
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">2</span>
            </div>
            <span className="text-xs text-white font-medium">Hotel Setup</span>
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-xs text-slate-500 font-bold">3</span>
            </div>
            <span className="text-xs text-slate-500">Dashboard</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
              <Hotel className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Set up your hotel</h1>
              <p className="text-slate-400 text-sm">This takes less than a minute</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm flex items-center gap-2">
                <Hotel className="w-3.5 h-3.5" /> Hotel Name
              </Label>
              <Input
                placeholder="The Grand Azure"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-11"
                {...register("name")}
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Location
              </Label>
              <Input
                placeholder="Miami Beach, Florida"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-11"
                {...register("location")}
              />
              {errors.location && <p className="text-red-400 text-xs">{errors.location.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Description
                <span className="text-slate-600">(optional)</span>
              </Label>
              <Textarea
                placeholder="A luxury beachfront hotel with breathtaking views..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 resize-none"
                {...register("description")}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-2" />Go to Dashboard</>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}