"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteRoomAction } from "@/actions/room.actions";

interface DeleteRoomDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

export function DeleteRoomDialog({
  open,
  onClose,
  roomId,
  roomName,
}: DeleteRoomDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteRoomAction(roomId);
      if (result.success) {
        toast.success(`Room ${roomName} deleted`);
        onClose();
      } else {
        toast.error(result.error || "Failed to delete room");
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
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Delete Room {roomName}?
                </h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  This action cannot be undone. All booking history for this room
                  will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
                    ) : (
                      "Delete Room"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}