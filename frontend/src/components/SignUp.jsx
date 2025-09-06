import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    age: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/signup", { ...formData, user_type: "user" });
      setSuccess("Sign-up successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during sign-up.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["username", "password", "full_name", "email", "age", "city"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-medium capitalize">{field}:</label>
              <input
                type={field === "password" ? "password" : "text"}
                id={field}
                value={formData[field]}
                onChange={handleChange}
                required={["username", "password", "full_name", "email"].includes(field)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md">
            Sign Up
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default SignUp;
