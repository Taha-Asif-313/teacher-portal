import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { FaHourglassStart } from "react-icons/fa";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("today"); // "today" | "all"
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    const teacherId = user?.userData?.teacher_id;
    const token = user?.userData?.token;

    if (!teacherId || !token) {
      setError("Invalid user or token.");
      return;
    }

    const url =
      activeTab === "today"
        ? `${import.meta.env.VITE_SERVER_URL}/api/teacher-schedule/${teacherId}/`
        : `${import.meta.env.VITE_SERVER_URL}/api/teacher-schedules-all/${teacherId}/`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
console.log(res);

      setSchedules(res.data?.all_schedules || []); // Make sure backend returns { schedules: [...] }
      setError(null);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load schedule. Please try again later.");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [activeTab]);

  const handleStart = (item) => {
    console.log("Degree Program:", item.degree_program);
    console.log("Semester:", item.semester);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Current Location:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">
        Welcome, {user?.userData?.teacher_name} 🧑‍🏫
      </h1>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600 mb-2">
          Teacher ID: {user?.userData?.teacher_id}
        </p>

        {/* Tabs */}
        <div className="flex space-x-4 justify-center mb-4 text-sm">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 rounded ${
              activeTab === "today"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Today’s Schedule
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded ${
              activeTab === "all"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            All Schedules
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}

        {/* Table */}
        {schedules.length > 0 ? (
          <table className="w-full mt-4 ">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Degree</th>
                <th className="px-4 py-2">Semester</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className=" px-4 py-4">{item.course_name}</td>
                  <td className=" px-4 py-4">{item.degree_program}</td>
                  <td className=" px-4 py-4">{item.semester}</td>
                  <td className=" px-4 py-4">{item.lecture_date}</td>
                  <td className=" px-4 py-4">
                    {item.start_time} - {item.end_time}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleStart(item)}
                      className="bg-primary text-sm text-white px-3 py-1 mx-auto flex items-center justify-center gap-2 rounded hover:bg-blue-600"
                    >
                      <FaHourglassStart/>
                      Start
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-red-600 text-sm text-center">
            No schedule found!
          </div>
        )}
      </div>
    </div>
  );
}
