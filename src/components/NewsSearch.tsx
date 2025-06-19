import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { newsCategories, countries } from '../data/categories';

interface NewsSearchProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onCountryChange: (country: string) => void;
  loading: boolean;
}

const NewsSearch: React.FC<NewsSearchProps> = ({
  onSearch,
  onCategoryChange,
  onCountryChange,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedCountry, setSelectedCountry] = useState('tr');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    onCountryChange(country);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Haber ara..."
              className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </form>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="general">Genel</option>
          </select>
        </div>

        {/* Country Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Ülke:</span>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default NewsSearch; 