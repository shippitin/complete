// src/components/GlobalFreightBookingForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const GlobalFreightBookingForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{t('global_freight_booking_title')}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin Country */}
        <div>
          <label htmlFor="originCountry" className="block text-gray-700 text-sm font-bold mb-2">
            {t('origin_country_label')}
          </label>
          <input
            type="text"
            id="originCountry"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('origin_country_placeholder')}
          />
        </div>

        {/* Origin City */}
        <div>
          <label htmlFor="originCity" className="block text-gray-700 text-sm font-bold mb-2">
            {t('origin_city_label')}
          </label>
          <input
            type="text"
            id="originCity"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('origin_city_placeholder')}
          />
        </div>

        {/* Destination Country */}
        <div>
          <label htmlFor="destinationCountry" className="block text-gray-700 text-sm font-bold mb-2">
            {t('destination_country_label')}
          </label>
          <input
            type="text"
            id="destinationCountry"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('destination_country_placeholder')}
          />
        </div>

        {/* Destination City */}
        <div>
          <label htmlFor="destinationCity" className="block text-gray-700 text-sm font-bold mb-2">
            {t('destination_city_label')}
          </label>
          <input
            type="text"
            id="destinationCity"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('destination_city_placeholder')}
          />
        </div>

        {/* Mode of Transport */}
        <div>
          <label htmlFor="modeOfTransport" className="block text-gray-700 text-sm font-bold mb-2">
            {t('mode_of_transport_label')}
          </label>
          <select
            id="modeOfTransport"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="air">{t('air_freight')}</option>
            <option value="sea">{t('sea_freight')}</option>
            {/* Add more options */}
          </select>
        </div>

        {/* Declared Value */}
        <div>
          <label htmlFor="declaredValue" className="block text-gray-700 text-sm font-bold mb-2">
            {t('declared_value_label')}
          </label>
          <input
            type="number"
            id="declaredValue"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('declared_value_placeholder')}
          />
        </div>

        {/* Cargo Type */}
        <div>
          <label htmlFor="cargoType" className="block text-gray-700 text-sm font-bold mb-2">
            {t('cargo_type_label')}
          </label>
          <input
            type="text"
            id="cargoType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('general_cargo_placeholder')}
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

export default GlobalFreightBookingForm;