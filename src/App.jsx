import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Schedule from "./pages/Schedule";
import { useAuth } from "./AuthContext";
import { Toaster } from "react-hot-toast";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassRoom from "./pages/ClassRoom";

function App() {
  const { user } = useAuth();

  return (
    <>
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={user ? <Schedule /> : <Navigate to="/login" />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard/>} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard/>} />
        <Route path="/class-room" element={<ClassRoom/>} />
      </Routes>

    </Router>
     <Toaster />
    </>
    
  );
}

export default App;
