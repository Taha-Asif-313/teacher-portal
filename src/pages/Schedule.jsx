import { useAuth } from "../AuthContext";
import { useState } from "react";
import ScheduleCard from "../components/ScheduleCard";

const schedules = [
  { id: 1, title: "Math Class", time: "10:00 AM" },
  { id: 2, title: "Science Class", time: "12:00 PM" },
];

export default function Schedule() {
  const { user } = useAuth();
  if (!user) return <div>Please login</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Welcome, {user.name}</h1>
      <div className="space-y-4">
        {schedules.map((item) => (
          <ScheduleCard key={item.id} schedule={item} />
        ))}
      </div>
    </div>
  );
}
