"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, BookOpen, CalendarDays, User, BedDouble, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createBookingAction, checkRoomAvailabilityAction } from "@/actions/booking.actions";
import { formatCurrency } from "@/lib/utils";

const bookingSchema = z.object({
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email required"),
  guestPhone: z.string().optional(),
  guestCountry: z.string().optional(),
  roomId: z.string().min(1, "Please select a room"),
  checkIn: z.string().min(1, "Check-in date required"),
  checkOut: z.string().min(1, "Check-out date required"),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  source: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  status: string;
}

interface BookingFormModalProps {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  defaultRoomId?: string;
}

const COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "Germany", "France",
  "Japan", "UAE", "India", "Singapore", "Other",
];

const SOURCES = [
  { value: "direct", label: "Direct" },
  { value: "booking.com", label: "Booking.com" },
  { value: "expedia", label: "Expedia" },
  { value: "airbnb", label: "Airbnb" },
  { value: "phone", label: "Phone" },
  { value: "walkin", label: "Walk-in" },
];

export function BookingFormModal({
  open,
  onClose,
  rooms,
  defaultRoomId,
}: BookingFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [pricePreview, setPricePreview] = useState<{
    nights: number;
    total: number;
    pricePerNight: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: defaultRoomId ?? "",
      adults: 1,
      children: 0,
      source: "direct",
    },
  });

  const watchedRoomId = watch("roomId");
  const watchedCheckIn = watch("checkIn");
  const watchedCheckOut = watch("checkOut");

  // Reset on open/close
  useEffect(() => {
    if (open) {
      reset({
        roomId: defaultRoomId ?? "",
        adults: 1,
        children: 0,
        source: "direct",
      });
      setAvailabilityError(null);
      setPricePreview(null);
    }
  }, [open, reset, defaultRoomId]);

  // Calculate price preview & check availability
  useEffect(() => {
    if (!watchedRoomId || !watchedCheckIn || !watchedCheckOut) {
      setPricePreview(null);
      return;
    }

    const checkIn = new Date(watchedCheckIn);
    const checkOut = new Date(watchedCheckOut);
    if (checkOut <= checkIn) {
      setPricePreview(null);
      return;
    }

    const room = rooms.find((r) => r.id === watchedRoomId);
    if (!room) return;

    const nights = differenceInDays(checkOut, checkIn);
    const total = room.price * nights;
    setPricePreview({ nights, total, pricePerNight: room.price });

    // Debounced availability check
    const timer = setTimeout(async () => {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);
      try {
        const result = await checkRoomAvailabilityAction(
          watchedRoomId,
          checkIn,
          checkOut
        );
        if (!result.available) {
          setAvailabilityError(`Room unavailable — conflicts with booking on ${result.conflictDates}`);
        }
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [watchedRoomId, watchedCheckIn, watchedCheckOut, rooms]);

  const onSubmit = async (data: BookingForm) => {
    if (availabilityError) {
      toast.error("Please resolve the availability conflict first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createBookingAction({
        ...data,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
      });

      if (result.success) {
        toast.success("Booking created successfully!");
        onClose();
        reset();
      } else {
        toast.error(result.error || "Failed to create booking");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const availableRooms = rooms.filter((r) => r.status !== "MAINTENANCE");
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          {/* Centering wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">New Booking</h2>
                      <p className="text-xs text-slate-500">Fill in guest and stay details</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                  {/* ── Guest Info ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-white">Guest Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <Label className="text-slate-300 text-sm">Full Name *</Label>
                        <Input
                          placeholder="James Wilson"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                          {...register("guestName")}
                        />
                        {errors.guestName && (
                          <p className="text-red-400 text-xs">{errors.guestName.message}</p>
                        )}
                      </div>
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <Label className="text-slate-300 text-sm">Email *</Label>
                        <Input
                          type="email"
                          placeholder="james@email.com"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                          {...register("guestEmail")}
                        />
                        {errors.guestEmail && (
                          <p className="text-red-400 text-xs">{errors.guestEmail.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-300 text-sm">Phone</Label>
                        <Input
                          placeholder="+1 555-0100"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                          {...register("guestPhone")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-300 text-sm">Country</Label>
                        <Select onValueChange={(val) => setValue("guestCountry", val)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c} className="text-slate-300 focus:bg-white/10 focus:text-white">
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* ── Stay Details ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BedDouble className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-white">Stay Details</h3>
                    </div>
                    <div className="space-y-4">
                      {/* Room selector */}
                      <div className="space-y-1.5">
                        <Label className="text-slate-300 text-sm">Room *</Label>
                        <Select
                          defaultValue={defaultRoomId}
                          onValueChange={(val) => setValue("roomId", val)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                            <SelectValue placeholder="Select a room" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {availableRooms.map((room) => (
                              <SelectItem
                                key={room.id}
                                value={room.id}
                                className="text-slate-300 focus:bg-white/10 focus:text-white"
                              >
                                <div className="flex items-center justify-between w-full gap-4">
                                  <span>Room {room.name} — {room.type}</span>
                                  <span className="text-slate-500 text-xs">{formatCurrency(room.price)}/night</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.roomId && (
                          <p className="text-red-400 text-xs">{errors.roomId.message}</p>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Check-in *
                          </Label>
                          <Input
                            type="date"
                            min={today}
                            className="bg-white/5 border-white/10 text-white focus:border-indigo-500 h-10 [color-scheme:dark]"
                            {...register("checkIn")}
                          />
                          {errors.checkIn && (
                            <p className="text-red-400 text-xs">{errors.checkIn.message}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Check-out *
                          </Label>
                          <Input
                            type="date"
                            min={watchedCheckIn || today}
                            className="bg-white/5 border-white/10 text-white focus:border-indigo-500 h-10 [color-scheme:dark]"
                            {...register("checkOut")}
                          />
                          {errors.checkOut && (
                            <p className="text-red-400 text-xs">{errors.checkOut.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Availability feedback */}
                      {isCheckingAvailability && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Checking availability...
                        </div>
                      )}
                      {availabilityError && (
                        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-400">{availabilityError}</p>
                        </div>
                      )}

                      {/* Price preview */}
                      {pricePreview && !availabilityError && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                              Price Summary
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-slate-300">
                              <span>{formatCurrency(pricePreview.pricePerNight)} × {pricePreview.nights} night{pricePreview.nights !== 1 ? "s" : ""}</span>
                              <span className="font-semibold text-white">{formatCurrency(pricePreview.total)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Guests */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 text-sm">Adults</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            className="bg-white/5 border-white/10 text-white focus:border-indigo-500 h-10"
                            {...register("adults")}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 text-sm">Children</Label>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            className="bg-white/5 border-white/10 text-white focus:border-indigo-500 h-10"
                            {...register("children")}
                          />
                        </div>
                      </div>

                      {/* Source + Notes */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 text-sm">Booking Source</Label>
                          <Select
                            defaultValue="direct"
                            onValueChange={(val) => setValue("source", val)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              {SOURCES.map((s) => (
                                <SelectItem key={s.value} value={s.value} className="text-slate-300 focus:bg-white/10 focus:text-white">
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 text-sm">Notes</Label>
                          <Input
                            placeholder="Special requests..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10"
                            {...register("notes")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="flex-1 text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !!availabilityError || isCheckingAvailability}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                      ) : (
                        <>Create Booking {pricePreview ? `· ${formatCurrency(pricePreview.total)}` : ""}</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}