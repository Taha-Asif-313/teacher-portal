import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentId: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    if (!form.image) {
      toast.error("Please upload a face image");
      return;
    }
  
    const formData = new FormData();
    formData.append("student_id", form.studentId);
    formData.append("password", form.password);
    formData.append("confirm_password", form.confirmPassword);
    formData.append("face_image", form.image);
  
    try {
      setLoading(true);
  
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/register/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (res.status === 201) {
        toast.success(res.data.message || "Registered successfully");
        navigate("/login")
        setForm({ studentId: "", password: "", confirmPassword: "", image: null });
        setPreview(null);
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
     
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-black text-primary text-center">Student Register</h2>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 text-xs">Student ID</label>
          <input
            type="text"
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            className="border rounded px-2 py-1 mt-1"
            required
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 text-xs">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="border rounded px-2 py-1 mt-1"
            required
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 text-xs">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="border rounded px-2 py-1 mt-1"
            required
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 mb-1 text-xs">Upload Your Image</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="flex items-center justify-center gap-2 border-2 border-dashed border-primary text-primary px-3 py-2 rounded cursor-pointer hover:bg-primary/10"
          >
            <FiUpload />
            {preview ? "Change Image" : "Upload from Gallery or Camera"}
          </label>
          {preview && (
            <img src={preview} alt="Preview" className="mt-2 rounded w-24 h-24 object-cover" />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded text-sm flex justify-center items-center gap-2"
        >
          {loading ? <Loader /> : "Register"}
        </button>
      </form>
    </div>
  );
}
