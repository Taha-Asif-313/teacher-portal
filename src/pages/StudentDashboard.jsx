import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { FaSearch } from "react-icons/fa";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("today");
  const [schedules, setSchedules] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { degree_program, semester, token } = user?.userData || {};

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    if (!degree_program || !semester || !token) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/course-by-degree-program/${degree_program}/${semester}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setCourseList(res.data.course_codes || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // Fetch all/today schedules
  const fetchSchedules = async () => {
    setLoading(true);
    if (!degree_program || !semester || !token) {
      setError("Missing student information or token.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/student-schedules/${degree_program}/${semester}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (activeTab === "today") {
        setSchedules(res.data.today_schedule || []);
      } else {
        setSchedules(res.data.all_schedules || []);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules by course
  const fetchSchedulesByCourse = async () => {
    if (!selectedCourse || !token) {
      setError("Please select a course.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/course-of-student/${selectedCourse}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      console.log(res);
      

      if (Array.isArray(res.data)) {
        setSchedules(res.data);
        setError(null);
      } else {
        setSchedules([]);
        setError("Unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching course schedule:", err);
      setError("Failed to fetch schedule for the selected course.");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    if (activeTab === "all") {
      fetchCourses();
    }
  }, [activeTab]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">
        Welcome, {user?.userData?.name} 🎓
      </h1>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">
          Student ID: {user?.userData?.student_id}
        </p>
        <p className="text-sm text-gray-600">
          Degree Program: {degree_program}
        </p>
        <p className="text-sm text-gray-600">Semester: {semester}</p>
        <p className="text-sm text-gray-600">
          Section: {user?.userData?.section}
        </p>

        {/* Tabs */}
        <div className="flex space-x-4 my-4 text-sm">
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

        {/* Dropdown for filtering All Schedules */}
        {activeTab === "all" && (
          <div className="flex items-center gap-2 my-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border px-3 py-1.5 text-sm rounded w-full"
            >
              <option value="">Select a course</option>
              {Array.isArray(courseList) &&
                courseList.map((course, idx) => (
                  <option key={idx} value={course}>
                    {course}
                  </option>
                ))}
            </select>
            <button
              onClick={fetchSchedulesByCourse}
              className="bg-primary text-sm text-white flex items-center gap-2 px-4 py-1.5 rounded hover:bg-blue-700"
            >
              Search
              <FaSearch />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}

        {/* Schedule Table */}
        {schedules.length > 0 ? (
          <table className="w-full mt-4 border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Course</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Room</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2">{item.course_name}</td>
                  <td className="border px-4 py-2">{item.lecture_date}</td>
                  <td className="border px-4 py-2">
                    {item.start_time} - {item.end_time}
                  </td>
                  <td className="border px-4 py-2">{item.room || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-red-600 text-sm text-center mt-4">
            No schedule found!
          </div>
        )}
      </div>
    </div>
  );
}
