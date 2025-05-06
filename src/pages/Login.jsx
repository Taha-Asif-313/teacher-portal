import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");
  const [credentials, setCredentials] = useState({
    student_id: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    setLoading(true);
    const endpoint =
      role === "student" ? "/api/studen-login/" : "/api/teacher-login/";

    const payload =
      role === "student"
        ? {
            student_id: credentials.student_id,
            password: credentials.password,
          }
        : {
            email: credentials.email,
            password: credentials.password,
          };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}${endpoint}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(data.message || "Login successful");

      const userData =
        role === "student"
          ? {
              name: data.name,
              student_id: data.student_id,
              role,
              token: data.token,
              semester:data.semester,
              degree_program:data.degree_program,
              section:data.section
            }
          : {
              name: data.teacher_name,
              teacher_id: data.teacher_id,
              role,
              token: data.token,
            };

      // after successful login
      if (role === "student") {
        login({ userData, role: "student" });
        navigate("/student-dashboard");
      } else {
        login({ userData, role: "teacher" });
        navigate("/teacher-dashboard");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-[600px] space-y-4">
        <div className=" mx-auto bg-gray-200 rounded-full p-1 flex items-center justify-between text-sm font-medium">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 z-10 py-1.5 rounded-full transition-colors duration-200 ${
              role === "student" ? "text-white bg-primary" : "text-gray-700"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole("teacher")}
            className={`flex-1 z-10 py-1.5 rounded-full transition-colors duration-200 ${
              role === "teacher" ? "text-white bg-primary" : "text-gray-700"
            }`}
          >
            Teacher
          </button>
        </div>

        {role === "student" ? (
          <>
            <div className="flex flex-col text-sm">
              <label className="text-xs text-gray-700">Student ID</label>
              <input
                type="text"
                name="student_id"
                value={credentials.student_id}
                onChange={handleChange}
                className="border rounded px-2 py-1 mt-1 text-sm"
                placeholder="Enter Student ID"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col text-sm">
              <label className="text-xs text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="border rounded px-2 py-1 mt-1 text-sm"
                placeholder="Enter Email"
              />
            </div>
          </>
        )}

        <div className="flex flex-col text-sm">
          <label className="text-xs text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="border rounded px-2 py-1 mt-1 text-sm"
            placeholder="Enter Password"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-white text-sm py-2 rounded mt-2"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
