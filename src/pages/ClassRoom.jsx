import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { format } from "date-fns";

const ClassRoom = () => {
  const { classroomData, user } = useAuth();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [students, setStudents] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!classroomData?.start_time) return;

    // Initialize students into local state
    setStudents(classroomData.students || []);

    const start = new Date(classroomData.start_time).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setSecondsElapsed(elapsed);
    }, 1000);

    // WebSocket connection
    const newSocket = new WebSocket(
      `ws://192.168.1.10:8000/ws/classroom/${classroomData.classroom_id}/`
    );
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      console.log("📥 Message received:", event.data);
      try {
        const data = JSON.parse(event.data);

        if (data?.student_id) {
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.id === data.student_id
                ? { ...student, status: "Present" }
                : student
            )
          );
        }
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    newSocket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      clearInterval(interval);
      newSocket.close();
    };
  }, [classroomData]);

  const formatTime = (seconds) => {
    const base = new Date();
    return format(new Date(base.getTime() + seconds * 1000), "HH:mm:ss");
  };

  if (!classroomData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
        No class started yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">
        Welcome, {user?.userData?.teacher_name} 🧑‍🏫
      </h1>

      <div className="bg-white p-4 rounded shadow w-full mx-auto">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Teacher ID: {user?.userData?.teacher_id}</p>
          <p className="text-sm text-gray-600">Class ID: {classroomData.classroom_id}</p>
          <p className="text-sm text-gray-600">Start Time: {classroomData.start_time}</p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            Class Duration: {formatTime(secondsElapsed)}
          </p>
        </div>

        <h2 className="text-lg font-semibold mb-3 text-primary">Students Present</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border border-gray-200">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Roll Number</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.roll_number}</td>
                  <td className="px-4 py-2">{student.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;
