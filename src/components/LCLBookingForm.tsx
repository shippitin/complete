// src/components/LclBookingForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LCLBookingForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{t('lcl_booking_title')}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin Port */}
        <div>
          <label htmlFor="originPort" className="block text-gray-700 text-sm font-bold mb-2">
            {t('origin_port_label')}
          </label>
          <input
            type="text"
            id="originPort"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('origin_port_placeholder')}
          />
        </div>

        {/* Destination Port */}
        <div>
          <label htmlFor="destinationPort" className="block text-gray-700 text-sm font-bold mb-2">
            {t('destination_port_label')}
          </label>
          <input
            type="text"
            id="destinationPort"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('destination_port_placeholder')}
          />
        </div>

        {/* Packages */}
        <div>
          <label htmlFor="packages" className="block text-gray-700 text-sm font-bold mb-2">
            {t('packages_label')}
          </label>
          <input
            type="number"
            id="packages"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('packages_placeholder')}
          />
        </div>

        {/* Total Weight (kg) */}
        <div>
          <label htmlFor="totalWeight" className="block text-gray-700 text-sm font-bold mb-2">
            {t('total_weight_kg_label')}
          </label>
          <input
            type="number"
            id="totalWeight"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('total_weight_kg_placeholder')}
          />
        </div>

        {/* Total Volume (cbm) */}
        <div>
          <label htmlFor="totalVolume" className="block text-gray-700 text-sm font-bold mb-2">
            {t('total_volume_cbm_label')}
          </label>
          <input
            type="number"
            id="totalVolume"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('total_volume_cbm_placeholder')}
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

export default LCLBookingForm;