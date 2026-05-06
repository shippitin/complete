import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { QuoteFormHandle } from '../../types/QuoteFormHandle';
import LocationAutocomplete from '../LocationAutocomplete';

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

  const inputClass = `block w-full pl-3 pr-3 py-2 sm:text-sm bg-transparent border-0 border-b focus:ring-0 focus:border-blue-500 border-gray-300`;

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl shadow-md border border-gray-200 font-inter">

      {/* Row 1: Vessel Name, Port/Terminal, Service Category, Date */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name<span className="text-red-500">*</span></label>
          <input type="text" name="vesselName" value={formData.vesselName}
            placeholder="e.g. Ever Given" className={inputClass} onChange={handleChange} />
        </div>
        <div>
          <LocationAutocomplete label="Port / Terminal*" value={formData.portTerminal}
            onChange={(v) => setFormData({ ...formData, portTerminal: v })}
            placeholder="e.g. JNPT, Port of Singapore" locationType="seaport" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Category<span className="text-red-500">*</span></label>
          <select name="serviceCategory" value={formData.serviceCategory}
            className={inputClass} onChange={handleChange}>
            <option>Crew Change / Logistics</option>
            <option>Bunkering</option>
            <option>Technical Repairs</option>
            <option>Provisions & Stores</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date<span className="text-red-500">*</span></label>
          <input type="date" name="estimatedDate" value={formData.estimatedDate}
            className={inputClass} onChange={handleChange} />
        </div>
      </div>

      {/* Row 2: Specific Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specific Requirements (Optional)</label>
        <input type="text" name="specificRequirements" value={formData.specificRequirements}
          placeholder="e.g. Underwater inspection, special equipment..."
          className={inputClass} onChange={handleChange} />
      </div>

    </div>
  );
});

export default PortServicesQuoteForm;
