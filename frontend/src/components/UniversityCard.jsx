import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const UniversityCard = ({ university, onUpdateInfo, updatedInfo, user }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal
  const [isLoadingInfo, setIsLoadingInfo] = useState(false); // State for loading indicator

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/feedback/average-rating/${university.university_id}`
        );
        setAverageRating(response.data.average_rating);
        setRatingCount(response.data.count);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setAverageRating(0);
        setRatingCount(0);
      }
    };
    fetchRatings();
  }, [university.university_id]);

  // UseEffect to turn off loading when updatedInfo prop changes
  useEffect(() => {
    if (updatedInfo) {
      setIsLoadingInfo(false);
    }
  }, [updatedInfo]);

  const handleRatingSubmit = async (selectedRating) => {
    if (!user) {
      setMessage("Please log in to submit a rating.");
      setMessageType("error");
      return;
    }

    const payload = {
      user_email: user.email,
      university_id: university.university_id,
      rating: selectedRating,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/feedback/submit-rating",
        payload
      );
      if (response.status === 201 || response.status === 200) {
        setUserRating(selectedRating);
        setMessage("Rating submitted successfully!");
        setMessageType("success");

        const updatedResponse = await axios.get(
          `http://127.0.0.1:5000/api/feedback/average-rating/${university.university_id}`
        );
        setAverageRating(updatedResponse.data.average_rating);
        setRatingCount(updatedResponse.data.count);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setMessage("Failed to submit rating.");
      setMessageType("error");
    }
  };

  const handleApply = async () => {
    if (!user) {
      setMessage("Please log in to apply.");
      setMessageType("error");
      return;
    }

    const payload = {
      user_email: user.email,
      university_id: university.university_id,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/bookings",
        payload
      );
      if (response.status === 200) {
        setMessage("Application submitted successfully!");
        setMessageType("success");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setMessage("Failed to submit application.");
      setMessageType("error");
    }
  };

  // Handler to show modal with loading state immediately
  const handleGetLatestInfo = () => {
    setIsModalOpen(true);
    setIsLoadingInfo(true);
    onUpdateInfo(university.university_id); // Trigger the AI call in the parent component
  };
  
  // Handler to close modal and reset states
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsLoadingInfo(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300">
        <img
          src={university.image_url}
          alt={university.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {university.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Located in <span className="font-medium">{university.location}</span>, ranked{" "}
            <span className="font-medium">{university.ranking}</span>. Visit their
            website at{" "}
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {university.website}
            </a>
            .
          </p>

          {/* Star Rating Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Rating:</h4>
            <div className="flex items-center mb-2">
              <span className="text-xl font-bold text-yellow-500 mr-2">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex">
                {[...Array(5)].map((star, index) => {
                  const ratingValue = index + 1;
                  return (
                    <svg
                      key={`avg-star-${index}`}
                      className={`w-5 h-5 ${
                        ratingValue <= averageRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69l4.16.059c.974.014 1.371 1.25.688 1.838l-3.375 2.455a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.12l-3.375-2.455a1 1 0 00-1.176 0l-3.375 2.455c-.785.568-1.84-.199-1.54-1.12l1.287-3.957a1 1 0 00-.364-1.118L2.091 9.471c-.683-.588-.286-1.824.688-1.838l4.16-.059a1 1 0 00.95-.69l1.286-3.957z"></path>
                    </svg>
                  );
                })}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({ratingCount} ratings)
              </span>
            </div>

            <p className="text-gray-600 mb-2">Rate this university:</p>
            <div className="flex">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <svg
                    key={`user-star-${index}`}
                    className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
                      ratingValue <= (hoverRating || userRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onMouseEnter={() => setHoverRating(ratingValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRatingSubmit(ratingValue)}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69l4.16.059c.974.014 1.371 1.25.688 1.838l-3.375 2.455a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.12l-3.375-2.455a1 1 0 00-1.176 0l-3.375 2.455c-.785.568-1.84-.199-1.54-1.12l1.287-3.957a1 1 0 00-.364-1.118L2.091 9.471c-.683-.588-.286-1.824.688-1.838l4.16-.059a1 1 0 00.95-.69l1.286-3.957z"></path>
                  </svg>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleGetLatestInfo}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex-1"
            >
              Get Latest Info
            </button>
            <button
              onClick={handleApply}
              disabled={!user}
              className={`bg-green-600 text-white px-4 py-2 rounded-lg transition flex-1 ${
                !user ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
              }`}
            >
              Apply Now
            </button>
          </div>

          {/* Dynamic Message Display */}
          {message && (
            <div
              className={`mt-4 text-center px-4 py-2 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Modal for Latest Info */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
            {isLoadingInfo ? (
              <div className="flex flex-col items-center justify-center min-h-[150px]">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-700 font-semibold">
                  Fetching latest info, please wait...
                </p>
              </div>
            ) : (
              <>
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  Latest Info: {university.name}
                </h4>
                <div className="max-h-80 overflow-y-auto text-gray-700 mb-6">
                  <p>{updatedInfo}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition w-full"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UniversityCard;

