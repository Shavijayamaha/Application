import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UniversityCardsSection from './components/UniversityCardsSection';
import SearchComponent from './components/SearchComponent';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Profile from './pages/Profile'; 
import AdminPanel from './pages/AdminPanel';
import FeedbackPage from './pages/FeedbackPage';
import BookingPage from './pages/BookingPage';


function App() {
  const [recommendedUniversityId, setRecommendedUniversityId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleRecommendation = (universityId) => {
    setRecommendedUniversityId(universityId);
    setSearchResults([]); // Clear search results when a recommendation is made
  };

  const handleSearch = (results) => {
    setRecommendedUniversityId(null); // Clear recommendation when a search is performed
    setSearchResults(results);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSection onRecommendation={handleRecommendation} />
                  <SearchComponent onSearch={handleSearch} />
                  <UniversityCardsSection recommendedUniversityId={recommendedUniversityId} searchResults={searchResults} />
                </>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} /> 
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/feedback" element={<FeedbackPage />} />
            <Route path="/admin/bookings" element={<BookingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
