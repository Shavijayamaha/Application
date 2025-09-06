// UniversityCardsSection.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import UniversityCard from "./UniversityCard"; // adjust path as needed

const UniversityCardsSection = ({ recommendedUniversityId, searchResults }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [updatedInfo, setUpdatedInfo] = useState({}); 

  const universitiesToDisplay =
    searchResults.length > 0
      ? searchResults
      : recommendedUniversityId
      ? universities.filter(
          (u) => u.university_id === recommendedUniversityId
        )
      : universities;

  const displayMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/universities");
        setUniversities(res.data);
      } catch (err) {
        setError("Failed to fetch university data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleUpdateInfo = async (universityId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/university/update-info",
        { university_id: universityId }
      );
      const { university_id, updated_info } = res.data;
      setUpdatedInfo((prev) => ({
        ...prev,
        [university_id]: updated_info,
      }));
      displayMessage("Latest info fetched successfully!");
    } catch (err) {
      displayMessage("Failed to fetch latest info.", "error");
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div
          className={`p-4 mb-4 rounded-lg text-white font-semibold text-center ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
        {searchResults.length > 0
          ? "Search Results"
          : recommendedUniversityId
          ? "Your Recommended University"
          : "Explore All Universities"}
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 text-lg">
          Loading universities...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 text-lg">{error}</div>
      ) : universitiesToDisplay.length === 0 ? (
        <div className="text-center text-gray-500 p-8 text-lg">
          No universities found. Please try a different search or recommendation.
          😔
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {universitiesToDisplay.map((university) => (
            <div
              key={university.university_id}
              className={
                university.university_id === recommendedUniversityId
                  ? "border-4 border-blue-500 rounded-xl"
                  : ""
              }
            >
              <UniversityCard
                university={university}
                onUpdateInfo={handleUpdateInfo}
                updatedInfo={updatedInfo[university.university_id]}
                user={user}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityCardsSection;
