import { PrismaClient, RoomType, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create owner user ───
  const hashedPassword = await bcrypt.hash("password123", 12);

  const owner = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "alex@hotelpms.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  console.log("✅ Created owner:", owner.email);

  // ─── Create hotel ───
  const hotel = await prisma.hotel.create({
    data: {
      name: "The Grand Azure",
      location: "Miami Beach, Florida",
      description:
        "A luxury beachfront hotel offering world-class amenities and breathtaking ocean views.",
      phone: "+1 (305) 555-0100",
      email: "info@grandazure.com",
      currency: "USD",
      timezone: "America/New_York",
      ownerId: owner.id,
    },
  });

  console.log("✅ Created hotel:", hotel.name);

  // ─── Create rooms ───
  const roomData = [
    {
      name: "101",
      type: RoomType.STANDARD,
      price: 149,
      capacity: 2,
      floor: 1,
      description: "Cozy standard room with city view",
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
    },
    {
      name: "102",
      type: RoomType.STANDARD,
      price: 149,
      capacity: 2,
      floor: 1,
      description: "Cozy standard room with city view",
      amenities: ["WiFi", "TV", "AC"],
    },
    {
      name: "201",
      type: RoomType.DELUXE,
      price: 249,
      capacity: 3,
      floor: 2,
      description: "Spacious deluxe room with partial ocean view",
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
    },
    {
      name: "202",
      type: RoomType.DELUXE,
      price: 249,
      capacity: 3,
      floor: 2,
      description: "Spacious deluxe room with partial ocean view",
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
    },
    {
      name: "301",
      type: RoomType.SUITE,
      price: 449,
      capacity: 4,
      floor: 3,
      description: "Luxurious suite with panoramic ocean views",
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Lounge"],
    },
    {
      name: "302",
      type: RoomType.SUITE,
      price: 449,
      capacity: 4,
      floor: 3,
      description: "Luxurious suite with panoramic ocean views",
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi"],
    },
    {
      name: "PH1",
      type: RoomType.PENTHOUSE,
      price: 899,
      capacity: 6,
      floor: 10,
      description: "The ultimate penthouse experience with private rooftop terrace",
      amenities: ["WiFi", "TV", "AC", "Full Bar", "Private Terrace", "Jacuzzi", "Butler Service"],
    },
  ];

  const rooms = await Promise.all(
    roomData.map((room) =>
      prisma.room.create({
        data: { ...room, hotelId: hotel.id },
      })
    )
  );

  console.log(`✅ Created ${rooms.length} rooms`);

  // ─── Create guests ───
  const guestData = [
    { name: "James Wilson", email: "james.wilson@email.com", phone: "+1 555-0101", country: "USA" },
    { name: "Sofia Martinez", email: "sofia.m@email.com", phone: "+1 555-0102", country: "Mexico" },
    { name: "Liam Chen", email: "liam.chen@email.com", phone: "+44 555-0103", country: "UK" },
    { name: "Emma Davis", email: "emma.d@email.com", phone: "+1 555-0104", country: "USA" },
    { name: "Noah Patel", email: "noah.p@email.com", phone: "+91 555-0105", country: "India" },
    { name: "Olivia Thompson", email: "olivia.t@email.com", phone: "+1 555-0106", country: "Canada" },
  ];

  const guests = await Promise.all(
    guestData.map((guest) =>
      prisma.guest.create({
        data: { ...guest, hotelId: hotel.id },
      })
    )
  );

  console.log(`✅ Created ${guests.length} guests`);

  // ─── Create bookings (spread across last 3 months) ───
  const now = new Date();

  const bookingData = [
    {
      roomId: rooms[0].id,
      guestId: guests[0].id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 2, 9),
      status: BookingStatus.CHECKED_OUT,
      totalPrice: 149 * 4,
    },
    {
      roomId: rooms[1].id,
      guestId: guests[1].id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 2, 12),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 2, 15),
      status: BookingStatus.CHECKED_OUT,
      totalPrice: 149 * 3,
    },
    {
      roomId: rooms[2].id,
      guestId: guests[2].id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 1, 3),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 1, 7),
      status: BookingStatus.CHECKED_OUT,
      totalPrice: 249 * 4,
    },
    {
      roomId: rooms[3].id,
      guestId: guests[3].id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 1, 18),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 1, 22),
      status: BookingStatus.CHECKED_OUT,
      totalPrice: 249 * 4,
    },
    {
      roomId: rooms[4].id,
      guestId: guests[4].id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), 1),
      checkOut: new Date(now.getFullYear(), now.getMonth(), 5),
      status: BookingStatus.CONFIRMED,
      totalPrice: 449 * 4,
    },
    {
      roomId: rooms[5].id,
      guestId: guests[5].id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), 8),
      checkOut: new Date(now.getFullYear(), now.getMonth(), 11),
      status: BookingStatus.CONFIRMED,
      totalPrice: 449 * 3,
    },
    {
      roomId: rooms[6].id,
      guestId: guests[0].id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), 15),
      checkOut: new Date(now.getFullYear(), now.getMonth(), 20),
      status: BookingStatus.PENDING,
      totalPrice: 899 * 5,
    },
    {
      roomId: rooms[0].id,
      guestId: guests[1].id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 1, 2),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 1, 6),
      status: BookingStatus.PENDING,
      totalPrice: 149 * 4,
    },
  ];

  await Promise.all(
    bookingData.map((booking) =>
      prisma.booking.create({
        data: { ...booking, hotelId: hotel.id },
      })
    )
  );

  console.log(`✅ Created ${bookingData.length} bookings`);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────");
  console.log("Demo credentials:");
  console.log("  Email:    alex@hotelpms.com");
  console.log("  Password: password123");
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });