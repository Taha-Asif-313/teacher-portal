import { useState } from "react";
import toast from "react-hot-toast";
import { FaChalkboardTeacher } from "react-icons/fa";
import Loader from "./Loader";

export default function ScheduleCard({ schedule }) {
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    setStarting(true);
    toast.success(`Starting ${schedule.title}...`);
    setTimeout(() => {
      toast.success(`${schedule.title} started`);
      setStarting(false);
    }, 1500);
  };

  return (
    <div className="p-4 bg-white shadow rounded flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaChalkboardTeacher className="text-primary" />
          {schedule.title}
        </h2>
        <p className="text-sm text-gray-600">{schedule.time}</p>
      </div>
      <button
        onClick={handleStart}
        disabled={starting}
        className="bg-primary text-white px-4 py-1 rounded"
      >
        {starting ? <Loader /> : "Start"}
      </button>
    </div>
  );
}
