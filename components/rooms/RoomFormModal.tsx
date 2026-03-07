"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRoomAction, updateRoomAction } from "@/actions/room.actions";

const AMENITIES_OPTIONS = [
  "WiFi", "TV", "AC", "Mini Bar", "Balcony",
  "Jacuzzi", "Ocean View", "City View", "Lounge",
  "Butler Service", "Kitchen", "Safe",
];

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  type: z.enum(["STANDARD", "DELUXE", "SUITE", "PENTHOUSE"]),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  capacity: z.coerce.number().min(1).max(20),
  floor: z.coerce.number().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

type RoomForm = z.infer<typeof roomSchema>;

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  floor: number | null;
  description: string | null;
  amenities: string[];
  status: string;
}

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  room?: Room | null;
}

export function RoomFormModal({ open, onClose, room }: RoomFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const isEditing = !!room;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      type: "STANDARD",
      capacity: 2,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (room) {
      reset({
        name: room.name,
        type: room.type as any,
        price: room.price,
        capacity: room.capacity,
        floor: room.floor ?? undefined,
        description: room.description ?? "",
        amenities: room.amenities,
      });
      setSelectedAmenities(room.amenities);
    } else {
      reset({ type: "STANDARD", capacity: 2 });
      setSelectedAmenities([]);
    }
  }, [room, reset]);

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    setValue("amenities", updated);
  };

  const onSubmit = async (data: RoomForm) => {
    setIsLoading(true);
    try {
      const payload = { ...data, amenities: selectedAmenities };
      const result = isEditing
        ? await updateRoomAction(room.id, payload)
        : await createRoomAction(payload);

      if (result.success) {
        toast.success(isEditing ? "Room updated!" : "Room created!");
        onClose();
        reset();
        setSelectedAmenities([]);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* ✅ Position wrapper — flex centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 m-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                      <BedDouble className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        {isEditing ? "Edit Room" : "Add New Room"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isEditing
                          ? `Editing room ${room.name}`
                          : "Fill in the room details below"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  {/* Row 1: Name + Floor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">
                        Room Name / Number
                      </Label>
                      <Input
                        placeholder="101"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Floor</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("floor")}
                      />
                    </div>
                  </div>

                  {/* Row 2: Type + Capacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">
                        Room Type
                      </Label>
                      <Select
                        defaultValue={room?.type ?? "STANDARD"}
                        onValueChange={(val) => setValue("type", val as any)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="bg-slate-900 border-white/10">
                          {["STANDARD", "DELUXE", "SUITE", "PENTHOUSE"].map(
                            (t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="text-slate-300 focus:bg-white/10 focus:text-white"
                              >
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      {errors.type && (
                        <p className="text-red-400 text-xs">
                          {errors.type.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">
                        Max Guests
                      </Label>
                      <Input
                        type="number"
                        placeholder="2"
                        min={1}
                        max={20}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("capacity")}
                      />
                      {errors.capacity && (
                        <p className="text-red-400 text-xs">
                          {errors.capacity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">
                      Price per Night (USD)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        $
                      </span>

                      <Input
                        type="number"
                        placeholder="199"
                        min={1}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10 pl-7"
                        {...register("price")}
                      />
                    </div>

                    {errors.price && (
                      <p className="text-red-400 text-xs">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">
                      Description{" "}
                      <span className="text-slate-600">(optional)</span>
                    </Label>

                    <Textarea
                      placeholder="Spacious room with ocean view..."
                      rows={2}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 resize-none"
                      {...register("description")}
                    />
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">
                      Amenities
                    </Label>

                    <div className="flex flex-wrap gap-2">
                      {AMENITIES_OPTIONS.map((amenity) => {
                        const selected =
                          selectedAmenities.includes(amenity);

                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected
                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                : "bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20"
                              }`}
                          >
                            {amenity}
                          </button>
                        );
                      })}
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
                      disabled={isLoading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : isEditing ? (
                        "Save Changes"
                      ) : (
                        "Create Room"
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