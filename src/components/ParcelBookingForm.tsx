// src/components/ParcelBookingForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const ParcelBookingForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{t('parcel_booking_title')}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender Name */}
        <div>
          <label htmlFor="senderName" className="block text-gray-700 text-sm font-bold mb-2">
            {t('sender_label')}
          </label>
          <input
            type="text"
            id="senderName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('sender_name_placeholder')}
          />
        </div>

        {/* Recipient Name */}
        <div>
          <label htmlFor="recipientName" className="block text-gray-700 text-sm font-bold mb-2">
            {t('recipient_label')}
          </label>
          <input
            type="text"
            id="recipientName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('recipient_name_placeholder')}
          />
        </div>

        {/* Origin City/Address */}
        <div>
          <label htmlFor="origin" className="block text-gray-700 text-sm font-bold mb-2">
            {t('origin_label')}
          </label>
          <input
            type="text"
            id="origin"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('origin_city_address_placeholder')}
          />
        </div>

        {/* Destination City/Address */}
        <div>
          <label htmlFor="destination" className="block text-gray-700 text-sm font-bold mb-2">
            {t('destination_label')}
          </label>
          <input
            type="text"
            id="destination"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('destination_city_address_placeholder')}
          />
        </div>

        {/* Weight (kg) */}
        <div>
          <label htmlFor="weightKg" className="block text-gray-700 text-sm font-bold mb-2">
            {t('weight_kg_label')}
          </label>
          <input
            type="number"
            id="weightKg"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('weight_kg_placeholder')}
          />
        </div>

        {/* Dimensions (L×W×H in cm) */}
        <div>
          <label htmlFor="dimensions" className="block text-gray-700 text-sm font-bold mb-2">
            {t('dimensions_label')}
          </label>
          <input
            type="text"
            id="dimensions"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('dimensions_placeholder')}
          />
        </div>

        {/* Fragile? */}
        <div>
            <label htmlFor="fragile" className="block text-gray-700 text-sm font-bold mb-2">
                {t('fragile_label')}
            </label>
            <select
                id="fragile"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value="yes">{t('yes_option')}</option>
                <option value="no">{t('no_option')}</option>
            </select>
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

export default ParcelBookingForm;