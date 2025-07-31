// src/components/TruckBookingForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const TruckBookingForm: React.FC = () => {
  const { t } = useTranslation(); // Initialize t function

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* This is the ONLY place the main title should be rendered */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{t('create_booking_title')}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Location */}
        <div>
          <label htmlFor="pickupLocation" className="block text-gray-700 text-sm font-bold mb-2">
            {t('pickup_location_label')} {/* Correct label translation */}
          </label>
          {/* Correct placeholder translation */}
          <input
            type="text"
            id="pickupLocation"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('enter_pickup_location_placeholder')}
          />
        </div>

        {/* Drop Location */}
        <div>
          <label htmlFor="dropLocation" className="block text-gray-700 text-sm font-bold mb-2">
            {t('drop_location_label')}
          </label>
          <input
            type="text"
            id="dropLocation"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('enter_drop_location_placeholder')}
          />
        </div>

        {/* Pickup Date */}
        <div>
          <label htmlFor="pickupDate" className="block text-gray-700 text-sm font-bold mb-2">
            {t('pickup_date_label')}
          </label>
          <input
            type="date"
            id="pickupDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Materials */}
        <div>
          <label htmlFor="materials" className="block text-gray-700 text-sm font-bold mb-2">
            {t('materials_label')}
          </label>
          <select
            id="materials"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">{t('select_materials_placeholder')}</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            {/* Add more options as needed */}
          </select>
        </div>

        {/* Truck Type */}
        <div>
          <label htmlFor="truckType" className="block text-gray-700 text-sm font-bold mb-2">
            {t('truck_type_label')}
          </label>
          <select
            id="truckType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">{t('select_truck_type_placeholder')}</option>
            <option value="mini">Mini Truck</option>
            <option value="medium">Medium Truck</option>
            {/* Add more options as needed */}
          </select>
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="block text-gray-700 text-sm font-bold mb-2">
            {t('weight_in_ton_label')}
          </label>
          <input
            type="number"
            id="weight"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('enter_weight_ton_placeholder')}
          />
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-between mt-6">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
          >
            {t('back_button')}
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            {t('next_button')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TruckBookingForm;