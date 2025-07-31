// src/components/FirstLastMileBookingForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const FirstLastMileBookingForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{t('first_last_mile_booking_title')}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Address */}
        <div>
          <label htmlFor="pickupAddress" className="block text-gray-700 text-sm font-bold mb-2">
            {t('pickup_address_label')}
          </label>
          <input
            type="text"
            id="pickupAddress"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('full_pickup_address_placeholder')}
          />
        </div>

        {/* Delivery Address */}
        <div>
          <label htmlFor="deliveryAddress" className="block text-gray-700 text-sm font-bold mb-2">
            {t('delivery_address_label')}
          </label>
          <input
            type="text"
            id="deliveryAddress"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('full_delivery_address_placeholder')}
          />
        </div>

        {/* No. of Packages */}
        <div>
          <label htmlFor="numPackages" className="block text-gray-700 text-sm font-bold mb-2">
            {t('no_of_packages_label')}
          </label>
          <input
            type="number"
            id="numPackages"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('no_of_packages_placeholder')}
          />
        </div>

        {/* Special Instructions */}
        <div className="md:col-span-2">
          <label htmlFor="instructions" className="block text-gray-700 text-sm font-bold mb-2">
            {t('special_instructions_label')}
          </label>
          <textarea
            id="instructions"
            rows={3}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('special_instructions_placeholder')}
          ></textarea>
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

export default FirstLastMileBookingForm;