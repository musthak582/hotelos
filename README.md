# StayPilot – Multi-Property Hotel Management SaaS

**StayPilot** is a modern, full-stack **SaaS platform** designed for hotel owners and staff to efficiently manage multiple properties, rooms, and bookings from a centralized, professional dashboard. Built with a modern full-stack architecture, StayPilot demonstrates real-world SaaS patterns, multi-tenant database design, role-based access, and a polished UI inspired by leading platforms like Stripe, Linear, and Notion.  

---

## System Overview

StayPilot is a **multi-tenant SaaS** system where each hotel owner has complete control over their properties. The platform provides:

- **Centralized management** of multiple hotels, rooms, and bookings  
- **Role-based access control** for Owners and Staff  
- **Real-time analytics** and insights on bookings, revenue, and occupancy rates  
- **Responsive and modern UI** with smooth animations, soft shadows, and rounded cards  
- **Production-ready architecture** with Next.js, Prisma, PostgreSQL, and Vercel deployment  

---

## Key Features

### 1. Authentication & User Management
- Secure **email/password login**  
- **Google OAuth** login support  
- **Role-based access control** (OWNER, STAFF)  
- Session management and protected routes  

### 2. Hotel Management
- Owners can **create and manage multiple hotels**  
- Hotel profile includes: Name, Location, Description  
- Multi-tenant isolation ensures owners only see their data  

### 3. Room Management
- Add, edit, and delete rooms  
- Room details: Name, Type, Price per Night, Capacity, Status  
- Maintain availability for bookings  

### 4. Booking System
- Create bookings for guests (Name, Email, Phone, Room, Check-in/Check-out)  
- **Automatic total price calculation**  
- **Double-booking prevention**  
- Role-based access ensures only staff/owners manage bookings  

### 5. Calendar & Availability
- Visual **booking calendar** for all rooms  
- Highlights occupied and available days  
- Quickly check room availability  

### 6. Analytics Dashboard
- **Total bookings**, **total revenue**, and **monthly revenue charts**  
- **Occupancy rate tracking**  
- Quick view of recent bookings  
- Recharts-based visual analytics  

### 7. Modern UI & Components
- Professional **dashboard layout** with sidebar navigation  
- Clean, minimal design with **large whitespace**  
- Rounded cards, soft shadows, glass effects, and smooth animations  
- Reusable UI components: Sidebar, Navbar, Stats Cards, Tables, Forms, Modals, Charts, Date Pickers  

### 8. Multi-Tenant Architecture
- Each user sees **only their hotels, rooms, and bookings**  
- Database designed with Prisma for Users, Hotels, Rooms, Guests, and Bookings  
- Secure separation of data per tenant  

### 9. Deployment & Scalability
- Fully deployed on **Vercel**  
- Uses **Neon PostgreSQL** for production-ready database  
- Built with **Next.js full-stack** architecture, including server actions and API routes  

---

## Tech Stack
- **Frontend & Backend:** Next.js (App Router), TypeScript, Tailwind CSS, ShadCN UI, Framer Motion  
- **Database:** Prisma ORM, PostgreSQL (NeonDB)  
- **Authentication:** Auth.js (Email/Password + Google OAuth)  
- **Charts & Analytics:** Recharts  
- **Deployment:** Vercel  

---

**StayPilot** is a portfolio-level SaaS project demonstrating **full-stack development skills, multi-tenant architecture, modern UI/UX design, and production-ready deployment**—perfect for showcasing expertise in building real-world SaaS applications.