import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { FaSearch } from "react-icons/fa";
import AttendanceModal from "./AttendanceModal";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("today");

  const [todaySchedules, setTodaySchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { degree_program, semester, token } = user?.userData || {};

  const fetchCourses = async () => {
    if (!degree_program || !semester || !token) return;
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/course-of-students/${degree_program}/${semester}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setCourseList(res.data.course_codes || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchTodaySchedules = async () => {
    if (!degree_program || !semester || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/student-schedules/${degree_program}/${semester}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      const { schedules, class_started } = res.data;
      setTodaySchedules(
        Array.isArray(schedules)
          ? schedules.map((item) => ({ ...item, class_started }))
          : []
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch today's schedule.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedulesByCourse = async () => {
    if (!selectedCourse || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/schedules-by-course/${selectedCourse}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setAllSchedules(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch schedule for selected course.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  useEffect(() => {
    if (activeTab === "today") fetchTodaySchedules();
    if (activeTab === "all") fetchCourses();
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "today") fetchTodaySchedules();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const scheduleData = activeTab === "today" ? todaySchedules : allSchedules;

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

        {activeTab === "all" && (
          <div className="flex items-center gap-2 my-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border px-3 py-1.5 text-sm rounded w-full"
            >
              <option value="">Select a course</option>
              {courseList.map((course, idx) => (
                <option key={idx} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <button
              onClick={fetchSchedulesByCourse}
              className="bg-primary text-sm text-white flex items-center gap-2 px-4 py-1.5 rounded hover:bg-blue-700"
            >
              Search <FaSearch />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}

        {scheduleData.length > 0 ? (
          <table className="w-full mt-4 border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Teacher Name</th>
                <th className="border px-4 py-2">Course</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2">{item.teacher_name}</td>
                  <td className="border px-4 py-2">{item.course_name}</td>
                  <td className="border px-4 py-2">{item.lecture_date}</td>
                  <td className="border px-4 py-2">
                    {item.start_time} - {item.end_time}
                  </td>
                  <td className="border px-4 py-2">
                    {item.class_started ? (
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-white bg-primary rounded py-1 px-2 font-semibold"
                      >
                        Mark Attendance
                      </button>
                    ) : (
                      <button className="text-gray-500">Not Started</button>
                    )}
                  </td>
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
      {/* Modal for attendance */}
      <AttendanceModal
        isOpen={isModalOpen}
        closeModal={handleCloseModal}
        schedule={selectedSchedule}
        user={user}
      />
    </div>
  );
}
