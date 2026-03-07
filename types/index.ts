import type { User, Hotel, Room, Booking, Guest } from "@prisma/client";

// Re-export Prisma types
export type { User, Hotel, Room, Booking, Guest };

// Extended types with relations
export type BookingWithRelations = Booking & {
  room: Room;
  guest: Guest;
};

export type RoomWithBookings = Room & {
  bookings: Booking[];
};

export type HotelWithRooms = Hotel & {
  rooms: Room[];
};

// Dashboard stats type
export type DashboardStats = {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  availableRooms: number;
  totalRooms: number;
  revenueChange: number;
  bookingsChange: number;
};

// Monthly revenue for charts
export type MonthlyRevenue = {
  month: string;
  revenue: number;
  bookings: number;
};

// Room types enum
export type RoomType = "STANDARD" | "DELUXE" | "SUITE" | "PENTHOUSE";

// Booking status enum
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

// Room status enum
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

// User roles
export type UserRole = "OWNER" | "STAFF";

// Form types
export type CreateRoomInput = {
  name: string;
  type: RoomType;
  price: number;
  capacity: number;
  description?: string;
};

export type CreateBookingInput = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
};

export type CreateHotelInput = {
  name: string;
  location: string;
  description?: string;
};
