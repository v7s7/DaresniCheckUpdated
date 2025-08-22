import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { rankTutors } from "../lib/match";
import TutorCard from "../components/TutorCard";
import SearchFilters from "../components/SearchFilters";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Search() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    subject: urlParams.get('subject') || '',
    level: urlParams.get('level') || '',
    minPrice: parseInt(urlParams.get('minPrice')) || 10,
    maxPrice: parseInt(urlParams.get('maxPrice')) || 100,
    language: urlParams.get('language') || '',
    rating: parseInt(urlParams.get('rating')) || 0,
    verified: urlParams.get('verified') === 'true'
  });

  const [searchCriteria, setSearchCriteria] = useState(filters);

  // Fetch tutors
  const { data: tutors = [], isLoading, error } = useQuery({
    queryKey: ['tutors', searchCriteria],
    queryFn: async () => {
      let tutorsQuery = {
        role: 'tutor'
      };

      if (searchCriteria.verified) {
        tutorsQuery.verified = true;
      }

      const allTutors = await api.getTutors(tutorsQuery);
      
      // Get subjects for each tutor
      const tutorsWithSubjects = await Promise.all(
        allTutors.map(async (tutor) => {
          const subjects = await api.getTutorSubjects(tutor.id);
          return { ...tutor, subjects };
        })
      );

      // Filter by criteria
      let filteredTutors = tutorsWithSubjects.filter(tutor => {
        // Price filter
        if (tutor.pricePerHour < searchCriteria.minPrice || tutor.pricePerHour > searchCriteria.maxPrice) {
          return false;
        }

        // Rating filter
        if (searchCriteria.rating > 0 && (tutor.ratingAvg || 0) < searchCriteria.rating) {
          return false;
        }

        // Subject filter
        if (searchCriteria.subject && !tutor.subjects.some(subject => 
          subject.name.toLowerCase().includes(searchCriteria.subject.toLowerCase())
        )) {
          return false;
        }

        // Language filter
        if (searchCriteria.language && !tutor.languages?.includes(searchCriteria.language)) {
          return false;
        }

        return true;
      });

      // Apply matching algorithm and ranking
      const rankedTutors = rankTutors(filteredTutors, searchCriteria);
      
      return rankedTutors;
    }
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (searchFilters) => {
    setSearchCriteria(searchFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0 && value !== false) {
        params.set(key, value.toString());
      }
    });
    
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="error-search">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tutors</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Tutor</h1>
          <p className="text-lg text-gray-600">
            Browse through {tutors.length} qualified tutors and find the best match for your learning needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12" data-testid="loading-search">
                <LoadingSpinner size="large" />
              </div>
            ) : tutors.length === 0 ? (
              <div className="text-center py-12" data-testid="no-results">
                <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tutors Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters to see more results.
                </p>
                <button
                  onClick={() => {
                    const clearedFilters = {
                      subject: '',
                      level: '',
                      minPrice: 10,
                      maxPrice: 100,
                      language: '',
                      rating: 0,
                      verified: false
                    };
                    setFilters(clearedFilters);
                    handleSearch(clearedFilters);
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  data-testid="button-clear-search"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {tutors.length} Tutor{tutors.length !== 1 ? 's' : ''} Found
                    </h2>
                    {searchCriteria.subject && (
                      <p className="text-sm text-gray-600 mt-1">
                        Showing results for "{searchCriteria.subject}"
                      </p>
                    )}
                  </div>
                  
                  {/* Sort Options */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                      <option value="relevance">Best Match</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Tutors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="tutors-grid">
                  {tutors.map((tutor) => (
                    <TutorCard 
                      key={tutor.id} 
                      tutor={tutor} 
                      showMatchScore={true}
                    />
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-8">
                  <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Load More Tutors
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
