import React, { useState } from 'react';
import axios from 'axios';

const SearchComponent = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim() === '') {
        onSearch([]);
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/universities/search?q=${searchQuery}`);
      onSearch(res.data);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto my-8">
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">Find Universities by Name</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a university..."
          className="flex-1 p-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        />
        <button
          onClick={handleSearch}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}
    </div>
  );
};

export default SearchComponent;
