import React, { useState } from 'react';
import axios from 'axios';

const HeroSection = ({ onRecommendation }) => {
  const [formData, setFormData] = useState({
    district: '',
    al_passed: false,
    ol_passed: false,
    stream: '',
    career_interest: '',
    budget: 0,
    preferred_city: '',
    degree_programs: '',
    program_description: '',
    hostel_required: false,
    sports_or_extracurricular: false,
    university_type: '',
    language_mediums: '',
    hostel_available: false,
    semester_fee_lkr: 0,
    entry_requirements: '',
    ranking_score: 0,
    international_affiliation: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSend = {
      ...formData,
      budget: parseInt(formData.budget, 10),
      semester_fee_lkr: parseInt(formData.semester_fee_lkr, 10),
      ranking_score: parseFloat(formData.ranking_score),
    };

    try {
      const response = await axios.post('http://localhost:5000/api/predict', dataToSend);
      onRecommendation(response.data.recommended_university_id);
    } catch (err) {
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-2xl shadow-2xl max-w-6xl mx-auto my-12">
      <h1 className="text-5xl font-extrabold text-center text-blue-800 mb-3">Find Your Perfect University 🎓</h1>
      <p className="text-center text-blue-600 text-lg mb-10">Complete the form to receive a personalized recommendation in Sri Lanka.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Row 1 */}
        <div className="grid md:grid-cols-3 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">District</span>
            <input type="text" name="district" value={formData.district} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="al_passed" checked={formData.al_passed} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">AL Passed</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="ol_passed" checked={formData.ol_passed} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">OL Passed</span>
          </label>
        </div>

        {/* Row 2 */}
        <div className="grid md:grid-cols-3 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Stream</span>
            <input type="text" name="stream" value={formData.stream} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Career Interest</span>
            <input type="text" name="career_interest" value={formData.career_interest} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Budget (LKR)</span>
            <input type="number" name="budget" value={formData.budget} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
        </div>

        {/* Row 3 */}
        <div className="grid md:grid-cols-3 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Preferred City</span>
            <input type="text" name="preferred_city" value={formData.preferred_city} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Degree Programs</span>
            <input type="text" name="degree_programs" value={formData.degree_programs} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Program Description</span>
            <input type="text" name="program_description" value={formData.program_description} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
        </div>

        {/* Row 4 */}
        <div className="grid md:grid-cols-3 gap-6">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="hostel_required" checked={formData.hostel_required} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">Hostel Required</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="sports_or_extracurricular" checked={formData.sports_or_extracurricular} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">Sports / Extracurricular</span>
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">University Type</span>
            <input type="text" name="university_type" value={formData.university_type} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
        </div>

        {/* Row 5 */}
        <div className="grid md:grid-cols-3 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Language Mediums</span>
            <input type="text" name="language_mediums" value={formData.language_mediums} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="hostel_available" checked={formData.hostel_available} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">Hostel Available</span>
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Semester Fee (LKR)</span>
            <input type="number" name="semester_fee_lkr" value={formData.semester_fee_lkr} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
        </div>

        {/* Row 6 */}
        <div className="grid md:grid-cols-3 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Entry Requirements</span>
            <input type="text" name="entry_requirements" value={formData.entry_requirements} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-medium mb-1">Ranking Score</span>
            <input type="number" name="ranking_score" step="0.01" value={formData.ranking_score} onChange={handleChange} required
              className="mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="international_affiliation" checked={formData.international_affiliation} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded" />
            <span className="text-gray-700 font-medium">International Affiliation</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-md disabled:bg-blue-300">
          {loading ? 'Submitting...' : 'Get Recommendation'}
        </button>

        {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}
      </form>
    </div>
  );
};

export default HeroSection;
