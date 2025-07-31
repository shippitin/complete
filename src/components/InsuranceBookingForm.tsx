// src/components/InsuranceBookingForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const InsuranceBookingForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{t('insurance_booking_title')}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cargo Type */}
        <div>
          <label htmlFor="cargoType" className="block text-gray-700 text-sm font-bold mb-2">
            {t('cargo_type_label')}
          </label>
          <input
            type="text"
            id="cargoType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('cargo_type_insurance_placeholder')}
          />
        </div>

        {/* Invoice No */}
        <div>
          <label htmlFor="invoiceNo" className="block text-gray-700 text-sm font-bold mb-2">
            {t('invoice_no_label')}
          </label>
          <input
            type="text"
            id="invoiceNo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('invoice_no_placeholder')}
          />
        </div>

        {/* Total Value (INR) */}
        <div>
          <label htmlFor="totalValue" className="block text-gray-700 text-sm font-bold mb-2">
            {t('total_value_inr_label')}
          </label>
          <input
            type="number"
            id="totalValue"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('total_value_inr_placeholder')}
          />
        </div>

        {/* Coverage */}
        <div>
          <label htmlFor="coverage" className="block text-gray-700 text-sm font-bold mb-2">
            {t('coverage_label')}
          </label>
          <select
            id="coverage"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="standard">{t('standard_coverage_option')}</option>
            <option value="premium">{t('premium_coverage_option')}</option>
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

export default InsuranceBookingForm;