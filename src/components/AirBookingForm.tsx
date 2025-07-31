// src/components/AirBookingForm.tsx
import React from 'react';

const AirBookingForm: React.FC = () => {
  return (
    <form className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Air Booking Details</h2>
      <div className="mb-4">
        <label htmlFor="origin" className="block text-gray-700 text-sm font-bold mb-2">
          Origin:
        </label>
        <input
          type="text"
          id="origin"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter origin city or airport"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="destination" className="block text-gray-700 text-sm font-bold mb-2">
          Destination:
        </label>
        <input
          type="text"
          id="destination"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter destination city or airport"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="cargo-type" className="block text-gray-700 text-sm font-bold mb-2">
          Cargo Type:
        </label>
        <select
          id="cargo-type"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Cargo Type</option>
          <option value="general">General Cargo</option>
          <option value="perishable">Perishable Goods</option>
          <option value="hazardous">Hazardous Materials</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Get Air Quote
        </button>
      </div>
    </form>
  );
};

export default AirBookingForm;