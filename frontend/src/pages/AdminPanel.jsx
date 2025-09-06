import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    university_id: "",
    name: "",
    location: "",
    ranking: 0,
    website: "",
    image_url: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch universities
  const fetchUniversities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/universities");
      setUniversities(res.data);
    } catch (err) {
      setError("Failed to fetch universities.");
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/admin/universities", formData);
      setMessage("University added successfully!");
      setFormData({
        university_id: "",
        name: "",
        location: "",
        ranking: 0,
        website: "",
        image_url: "",
      });
      fetchUniversities();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add university.");
    }
  };

  const handleDeleteUniversity = async (id) => {
    if (window.confirm("Are you sure you want to delete this university?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/universities/${id}`);
        setMessage("University deleted successfully!");
        fetchUniversities();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete university.");
      }
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin Panel - Manage Universities</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}

      <form onSubmit={handleAddUniversity} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {["university_id", "name", "location", "ranking", "website", "image_url"].map((field) => (
          <div key={field}>
            <label className="block text-gray-700 font-medium capitalize">{field}:</label>
            <input
              type={field === "ranking" ? "number" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md col-span-full">
          Add University
        </button>
      </form>

      <h3 className="text-2xl font-semibold mb-4">Existing Universities</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Ranking</th>
              <th className="border px-4 py-2">Website</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => (
              <tr key={uni.university_id}>
                <td className="border px-4 py-2">{uni.university_id}</td>
                <td className="border px-4 py-2">{uni.name}</td>
                <td className="border px-4 py-2">{uni.location}</td>
                <td className="border px-4 py-2">{uni.ranking}</td>
                <td className="border px-4 py-2">
                  <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {uni.website}
                  </a>
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDeleteUniversity(uni.university_id)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
