"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Hotel, User, Globe, Phone, Mail,
  MapPin, FileText, Save, Loader2,
  Shield, Clock, CreditCard, Bell,
  ChevronRight, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { updateHotelAction } from "@/actions/hotel.actions";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const hotelSchema = z.object({
  name:        z.string().min(2, "Hotel name must be at least 2 characters"),
  location:    z.string().min(2, "Location is required"),
  description: z.string().optional(),
  phone:       z.string().optional(),
  email:       z.string().email("Invalid email").optional().or(z.literal("")),
  website:     z.string().optional(),
});

type HotelForm = z.infer<typeof hotelSchema>;

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  createdAt: Date;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
}

type SettingsTab = "hotel" | "profile" | "notifications" | "billing";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "hotel",         label: "Hotel Profile",  icon: Hotel   },
  { id: "profile",       label: "My Profile",     icon: User    },
  { id: "notifications", label: "Notifications",  icon: Bell    },
  { id: "billing",       label: "Billing",        icon: CreditCard },
];

export function SettingsClient({
  hotel,
  user,
}: {
  hotel: Hotel;
  user: User;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("hotel");
  const [isSaving, setIsSaving]   = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<HotelForm>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name:        hotel.name,
      location:    hotel.location,
      description: hotel.description ?? "",
      phone:       hotel.phone ?? "",
      email:       hotel.email ?? "",
      website:     hotel.website ?? "",
    },
  });

  const onSaveHotel = async (data: HotelForm) => {
    setIsSaving(true);
    try {
      const result = await updateHotelAction(data);
      if (result.success) toast.success("Hotel settings saved!");
      else toast.error(result.error || "Failed to save");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your hotel profile and account preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar tabs ── */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-2 space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
                {activeTab === tab.id && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />
                )}
              </button>
            ))}
          </div>

          {/* Account info card */}
          <div className="mt-4 bg-slate-900/50 border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-sm font-bold border border-indigo-500/30">
                  {getInitials(user.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-medium capitalize">
                {user.role.toLowerCase()} Account
              </span>
            </div>
          </div>
        </nav>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── Hotel Profile tab ── */}
            {activeTab === "hotel" && (
              <form onSubmit={handleSubmit(onSaveHotel)} className="space-y-6">
                <SectionCard
                  icon={Hotel}
                  title="Hotel Information"
                  description="Basic details about your property"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-300 text-sm">Hotel Name *</Label>
                      <Input
                        placeholder="The Grand Azure"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("name")}
                      />
                      {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Location *
                      </Label>
                      <Input
                        placeholder="Miami Beach, Florida"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("location")}
                      />
                      {errors.location && <p className="text-red-400 text-xs">{errors.location.message}</p>}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Description
                        <span className="text-slate-600">(optional)</span>
                      </Label>
                      <Textarea
                        placeholder="Describe your hotel..."
                        rows={3}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 resize-none"
                        {...register("description")}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={Globe}
                  title="Contact Details"
                  description="How guests and partners can reach you"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone
                      </Label>
                      <Input
                        placeholder="+1 (305) 555-0100"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("phone")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </Label>
                      <Input
                        type="email"
                        placeholder="info@myhotel.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("email")}
                      />
                      {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-300 text-sm flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> Website
                      </Label>
                      <Input
                        placeholder="https://myhotel.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 h-10"
                        {...register("website")}
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Hotel meta */}
                <SectionCard
                  icon={Clock}
                  title="System Info"
                  description="Read-only hotel metadata"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Hotel ID",    value: hotel.id.slice(0, 16) + "..." },
                      { label: "Currency",    value: hotel.currency },
                      { label: "Timezone",    value: hotel.timezone },
                      { label: "Created",     value: new Date(hotel.createdAt).toLocaleDateString() },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="text-sm text-slate-300 font-mono bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 rounded-lg">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 gap-2 px-6"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" />Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* ── Profile tab ── */}
            {activeTab === "profile" && (
              <ProfileTab user={user} />
            )}

            {/* ── Notifications tab ── */}
            {activeTab === "notifications" && (
              <NotificationsTab />
            )}

            {/* ── Billing tab ── */}
            {activeTab === "billing" && (
              <BillingTab />
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// Profile tab
// ─────────────────────────────────────────
function ProfileTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <SectionCard icon={User} title="Personal Information" description="Your account details">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xl font-bold border border-indigo-500/30">
              {getInitials(user.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-white">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {user.role.toLowerCase()} · Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Full Name</Label>
            <Input
              defaultValue={user.name ?? ""}
              className="bg-white/5 border-white/10 text-white h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Email</Label>
            <Input
              defaultValue={user.email ?? ""}
              type="email"
              className="bg-white/5 border-white/10 text-white h-10"
              disabled
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
            onClick={() => toast.info("Profile update coming soon")}
          >
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </SectionCard>

      <SectionCard icon={Shield} title="Security" description="Password and account security">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Password</p>
              <p className="text-xs text-slate-500 mt-0.5">Last changed: Never</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info("Password change coming soon")}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs"
            >
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info("2FA coming soon")}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs"
            >
              Enable
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────
// Notifications tab
// ─────────────────────────────────────────
const NOTIFICATION_SETTINGS = [
  {
    group: "Bookings",
    items: [
      { label: "New booking created",      desc: "When a new booking is made",           default: true  },
      { label: "Booking confirmed",         desc: "When a booking is confirmed",          default: true  },
      { label: "Booking cancelled",         desc: "When a guest cancels",                default: true  },
      { label: "Check-in reminder",         desc: "24 hours before guest check-in",      default: true  },
      { label: "Check-out reminder",        desc: "24 hours before guest check-out",     default: false },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Room maintenance alerts",  desc: "When a room is flagged for maintenance", default: true  },
      { label: "Revenue milestones",        desc: "Monthly revenue targets reached",        default: false },
      { label: "Occupancy reports",         desc: "Weekly occupancy summary email",         default: false },
    ],
  },
];

function NotificationsTab() {
  const [settings, setSettings] = useState(() => {
    return NOTIFICATION_SETTINGS.map((group) => ({
      ...group,
      items: group.items.map((item) => ({ ...item, enabled: item.default })),
    }));
  });

  const toggle = (groupIdx: number, itemIdx: number) => {
    setSettings((prev) =>
      prev.map((group, gi) =>
        gi !== groupIdx
          ? group
          : {
              ...group,
              items: group.items.map((item, ii) =>
                ii !== itemIdx ? item : { ...item, enabled: !item.enabled }
              ),
            }
      )
    );
  };

  return (
    <div className="space-y-6">
      {settings.map((group, gi) => (
        <SectionCard
          key={group.group}
          icon={Bell}
          title={`${group.group} Notifications`}
          description={`Control ${group.group.toLowerCase()} alert preferences`}
        >
          <div className="space-y-2">
            {group.items.map((item, ii) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => {
                    toggle(gi, ii);
                    toast.success(
                      `${item.label} ${!item.enabled ? "enabled" : "disabled"}`
                    );
                  }}
                  className={cn(
                    "w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
                    item.enabled ? "bg-indigo-600" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200",
                      item.enabled ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}

      <div className="flex justify-end">
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          onClick={() => toast.success("Notification preferences saved!")}
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Billing tab
// ─────────────────────────────────────────
const PLANS = [
  {
    name:     "Starter",
    price:    0,
    current:  true,
    features: ["1 property", "Up to 20 rooms", "Basic analytics", "Email support"],
  },
  {
    name:     "Pro",
    price:    49,
    current:  false,
    features: ["Up to 5 properties", "Unlimited rooms", "Advanced analytics", "Priority support", "API access", "Custom domain"],
  },
  {
    name:     "Enterprise",
    price:    149,
    current:  false,
    features: ["Unlimited properties", "Unlimited rooms", "Full analytics suite", "Dedicated support", "SLA guarantee", "White-label"],
  },
];

function BillingTab() {
  return (
    <div className="space-y-6">
      <SectionCard icon={CreditCard} title="Current Plan" description="Manage your subscription">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "p-5 rounded-xl border transition-all",
                plan.current
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-white">{plan.name}</h4>
                {plan.current && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-4">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 && <span className="text-sm font-normal text-slate-500">/mo</span>}
              </p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <Check className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                disabled={plan.current}
                onClick={() => toast.info(`Upgrading to ${plan.name} — coming soon!`)}
                className={cn(
                  "w-full text-xs",
                  plan.current
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                )}
              >
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={CreditCard} title="Payment Method" description="Manage your payment details">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-slate-800 border border-white/[0.06] rounded-2xl flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-white mb-1">No payment method</p>
          <p className="text-xs text-slate-500 mb-4">Add a card to upgrade your plan</p>
          <Button
            size="sm"
            onClick={() => toast.info("Payment setup coming soon!")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
          >
            Add Payment Method
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}