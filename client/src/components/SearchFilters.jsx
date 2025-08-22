import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Arabic', 
  'History', 'Geography', 'Computer Science', 'Economics', 'Psychology'
];

const levels = [
  'Elementary', 'Middle School', 'High School', 'University', 'Professional'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' }
];

export default function SearchFilters({ filters, onFiltersChange, onSearch }) {
  const [localFilters, setLocalFilters] = useState({
    subject: '',
    level: '',
    minPrice: 10,
    maxPrice: 100,
    language: '',
    rating: 0,
    verified: false,
    ...filters
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (values) => {
    const [min, max] = values;
    handleFilterChange('minPrice', min);
    handleFilterChange('maxPrice', max);
  };

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      subject: '',
      level: '',
      minPrice: 10,
      maxPrice: 100,
      language: '',
      rating: 0,
      verified: false
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6" data-testid="search-filters">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          data-testid="button-clear-filters"
        >
          Clear All
        </Button>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select 
          value={localFilters.subject} 
          onValueChange={(value) => handleFilterChange('subject', value)}
        >
          <SelectTrigger data-testid="select-subject">
            <SelectValue placeholder="Select subject..." />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="space-y-2">
        <Label htmlFor="level">Level</Label>
        <Select 
          value={localFilters.level} 
          onValueChange={(value) => handleFilterChange('level', value)}
        >
          <SelectTrigger data-testid="select-level">
            <SelectValue placeholder="Select level..." />
          </SelectTrigger>
          <SelectContent>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="px-2">
          <Slider
            value={[localFilters.minPrice, localFilters.maxPrice]}
            onValueChange={handlePriceChange}
            min={5}
            max={200}
            step={5}
            className="w-full"
            data-testid="slider-price"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>${localFilters.minPrice}</span>
            <span>${localFilters.maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select 
          value={localFilters.language} 
          onValueChange={(value) => handleFilterChange('language', value)}
        >
          <SelectTrigger data-testid="select-language">
            <SelectValue placeholder="Select language..." />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleFilterChange('rating', rating)}
              className={`p-1 rounded ${
                localFilters.rating >= rating 
                  ? 'text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
              data-testid={`button-rating-${rating}`}
            >
              <i className="fas fa-star"></i>
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {localFilters.rating > 0 ? `${localFilters.rating}+ stars` : 'Any rating'}
          </span>
        </div>
      </div>

      {/* Verified Only */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="verified"
          checked={localFilters.verified}
          onChange={(e) => handleFilterChange('verified', e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          data-testid="checkbox-verified"
        />
        <Label htmlFor="verified" className="text-sm">
          Verified tutors only
        </Label>
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch} 
        className="w-full"
        data-testid="button-search"
      >
        <i className="fas fa-search mr-2"></i>
        Apply Filters
      </Button>
    </div>
  );
}
