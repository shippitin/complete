import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { FaAnchor, FaMapMarkerAlt, FaCalendarAlt, FaConciergeBell, FaClipboardList } from 'react-icons/fa';
import { QuoteFormHandle } from '../../types/QuoteFormHandle';

// This interface solves the TypeScript error in HeroSection
interface PortServicesProps {
  showButtons?: boolean;
}

const PortServicesQuoteForm = forwardRef<QuoteFormHandle, PortServicesProps>((props, ref) => {
  const initialState = {
    vesselName: '',
    portTerminal: '',
    serviceCategory: 'Crew Change / Logistics',
    estimatedDate: '',
    specificRequirements: ''
  };

  const [formData, setFormData] = useState(initialState);

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (!formData.vesselName || !formData.portTerminal || !formData.estimatedDate) {
        alert('Please fill in all required fields');
        return null;
      }
      return {
        bookingType: 'Port Services',
        vesselName: formData.vesselName,
        portLocation: formData.portTerminal,
        serviceDate: formData.estimatedDate,
        serviceCategory: formData.serviceCategory,
        specificRequirements: formData.specificRequirements,
        // Default values for mandatory interface fields
        specificService: formData.serviceCategory,
        readyDate: formData.estimatedDate,
        cargoType: 'N/A',
        totalWeight: 0,
      };
    },
    reset: () => setFormData(initialState)
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vessel Name */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-slate-700 flex items-center">
            Vessel Name<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <FaAnchor className="text-gray-400 mr-3" />
            <input
              type="text"
              name="vesselName"
              value={formData.vesselName}
              placeholder="e.g. Ever Given"
              className="w-full outline-none text-gray-700 bg-transparent"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Port / Terminal */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-slate-700 flex items-center">
            Port / Terminal<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <FaMapMarkerAlt className="text-gray-400 mr-3" />
            <input
              type="text"
              name="portTerminal"
              value={formData.portTerminal}
              placeholder="e.g. Port of Singapore"
              className="w-full outline-none text-gray-700 bg-transparent"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Service Category */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-slate-700 flex items-center">
            Service Category<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <FaConciergeBell className="text-gray-400 mr-3" />
            <select
              name="serviceCategory"
              value={formData.serviceCategory}
              className="w-full outline-none text-gray-700 bg-transparent cursor-pointer"
              onChange={handleChange}
            >
              <option>Crew Change / Logistics</option>
              <option>Bunkering</option>
              <option>Technical Repairs</option>
              <option>Provisions & Stores</option>
            </select>
          </div>
        </div>

        {/* Estimated Date */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-slate-700 flex items-center">
            Date<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <FaCalendarAlt className="text-gray-400 mr-3" />
            <input
              type="date"
              name="estimatedDate"
              value={formData.estimatedDate}
              className="w-full outline-none text-gray-700 bg-transparent cursor-pointer"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Specific Requirements */}
        <div className="md:col-span-2 flex flex-col space-y-1">
          <label className="text-sm font-semibold text-slate-700">Specific Requirements</label>
          <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <FaClipboardList className="text-gray-400 mr-3" />
            <input
              type="text"
              name="specificRequirements"
              value={formData.specificRequirements}
              placeholder="e.g. Underwater inspection..."
              className="w-full outline-none text-gray-700 bg-transparent"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default PortServicesQuoteForm;