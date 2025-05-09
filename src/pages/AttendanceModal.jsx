import { useState } from "react";
import axios from "axios";

const AttendanceModal = ({ isOpen, closeModal, schedule, user }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  const startCamera = () => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          setVideoStream(stream);
          setCameraActive(true);
        })
        .catch(err => console.log("Camera error: ", err));
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    const videoElement = document.getElementById("camera-video");
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext("2d").drawImage(videoElement, 0, 0);
    setImage(canvas.toDataURL("image/jpeg"));
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please capture the image first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("student_id", user?.userData?.student_id);
      formData.append("image", image);
      formData.append("latitude", schedule?.latitude || 0); // Replace with actual value
      formData.append("longitude", schedule?.longitude || 0); // Replace with actual value
      formData.append("classroom_id", schedule?.classroom_id || "");

      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/mark-attendance/`, formData, {
        headers: { Authorization: `Token ${user?.userData?.token}` },
      });

      closeModal();
    } catch (err) {
      setError("Failed to mark attendance. Please try again.");
      console.error("Error marking attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

          <div className="flex flex-col items-center">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="bg-primary text-white py-2 px-4 rounded"
              >
                Start Camera
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <video
                  id="camera-video"
                  autoPlay
                  width="100%"
                  height="auto"
                  className="mb-4"
                ></video>
                <button
                  onClick={captureImage}
                  className="bg-primary text-white py-2 px-4 rounded mb-4"
                >
                  Capture Image
                </button>
                {image && <img src={image} alt="Captured" className="w-40 mb-4" />}
              </div>
            )}

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`${
                  loading ? "bg-gray-500" : "bg-primary"
                } text-white py-2 px-4 rounded`}
              >
                {loading ? "Submitting..." : "Submit Attendance"}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default AttendanceModal;
