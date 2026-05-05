// src/components/LocationAutocomplete.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../services/api';

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  state: string;
  country: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  locationType?: string; // 'city' | 'seaport' | 'airport' | 'rail_terminal' | undefined (all)
  label?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'seaport': return '⚓';
    case 'airport': return '✈️';
    case 'rail_terminal': return '🚂';
    case 'city': return '🏙️';
    default: return '📍';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'seaport': return 'Seaport';
    case 'airport': return 'Airport';
    case 'rail_terminal': return 'Rail Terminal';
    case 'city': return 'City';
    default: return type;
  }
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Type to search...',
  locationType,
  label,
  required = false,
  className = '',
  id,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSelected(false);
    onChange(val); // keep parent in sync as user types

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params: any = { q: val };
        if (locationType) params.type = locationType;
        const response = await api.get('/locations/search', { params });
        setSuggestions(response.data.data || []);
        setShowDropdown(true);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleSelect = (location: Location) => {
    const displayValue = location.code
      ? `${location.name} (${location.code})`
      : location.name;
    setInputValue(displayValue);
    onChange(displayValue);
    setSelected(true);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSelected(false);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {loading ? <FaSpinner className="animate-spin text-blue-400 text-sm" /> : <FaMapMarkerAlt className="text-sm" />}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
          style={{ maxHeight: '280px', overflowY: 'auto' }}
        >
          {suggestions.map((loc, index) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition text-left border-b border-gray-50 last:border-0"
            >
              <span className="text-lg flex-shrink-0">{getTypeIcon(loc.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{loc.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {loc.state || loc.country}
                  {loc.code && <span className="ml-1 font-mono text-blue-500">· {loc.code}</span>}
                </p>
              </div>
              <span className="text-xs text-gray-300 flex-shrink-0 bg-gray-50 px-2 py-0.5 rounded-full">
                {getTypeLabel(loc.type)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown && !loading && suggestions.length === 0 && inputValue.length >= 2 && (
        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
          No locations found for "{inputValue}"
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
