import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">University Finder</Link>
        <div className="space-x-4 flex items-center">
          {!user ? (
            <>
              <Link to="/login" className="hover:text-gray-200">Login</Link>
              <Link to="/signup" className="hover:text-gray-200">Sign Up</Link>
            </>
          ) : (
            <>
              <span className="font-semibold">{user.full_name || user.username}</span>
              <Link to="/profile" className="hover:text-gray-200">Profile</Link>
              {user.user_type === "admin" && (
                <>
                  <Link to="/admin" className="hover:text-gray-200">Admin Panel</Link>
                  <Link to="/admin/feedback" className="hover:text-gray-200">Feedback</Link>
                  <Link to="/admin/bookings" className="hover:text-gray-200">Bookings</Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
