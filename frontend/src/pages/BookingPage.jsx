import React, { useState, useEffect } from "react";
import axios from "axios";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/admin/bookings");
        setBookings(res.data);
      } catch (err) {
        setError("Failed to fetch booking data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-12">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Admin Bookings Dashboard
        </h2>
        <p className="text-gray-600 text-center mb-8">
          View all confirmed university tour bookings made by users.
        </p>

        {loading ? (
          <div className="text-center text-gray-500 text-lg animate-pulse">
            Loading booking data...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg font-medium">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    University ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Booking Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((item, index) => (
                    <tr key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.user_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.university_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.booking_date)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No bookings made yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
