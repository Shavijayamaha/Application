import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState({ username: "", full_name: "", email: "", age: "", city: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/profile?username=${storedUser.username}`);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [storedUser, navigate]);

  const handleChange = (e) => setUserData({ ...userData, [e.target.id]: e.target.value });

  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost:5000/api/user/update", userData);
      setMessage("Profile updated successfully");
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      setError("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`http://localhost:5000/api/user/delete?username=${storedUser.username}`);
        localStorage.removeItem("user");
        navigate("/signup");
      } catch {
        setError("Failed to delete profile.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Your Profile</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <div className="space-y-4">
          {["username", "full_name", "email", "age", "city"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-medium capitalize">{field}:</label>
              <input
                type={field === "age" ? "number" : "text"}
                id={field}
                value={userData[field] || ""}
                onChange={handleChange}
                disabled={field === "username"}
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md ${field === "username" ? "bg-gray-200 cursor-not-allowed" : ""}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={handleUpdate} className="bg-blue-600 text-white py-2 px-4 rounded-md">Update</button>
          <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded-md">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
