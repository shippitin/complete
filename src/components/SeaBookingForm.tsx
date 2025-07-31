// src/components/SeaBookingForm.tsx
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const SeaBookingForm: React.FC = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    originPort: "",
    destinationPort: "",
    containerType: "",
    cargoDescription: "",
    weight: "",
    volume: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sea Booking Data:", formData);
    alert(t('sea_freight_booking') + ' submitted!');
  };

  const formFieldClass = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const buttonClass = "px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out";

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto my-10 md:my-20">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('sea_freight_booking')}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="originPort" className={labelClass}>{t('origin_port')}</label>
          <input
            type="text"
            id="originPort"
            name="originPort"
            value={formData.originPort}
            onChange={handleChange}
            className={formFieldClass}
            placeholder={t('origin_port_placeholder')}
            required
          />
        </div>
        <div>
          <label htmlFor="destinationPort" className={labelClass}>{t('destination_port')}</label>
          <input
            type="text"
            id="destinationPort"
            name="destinationPort"
            value={formData.destinationPort}
            onChange={handleChange}
            className={formFieldClass}
            placeholder={t('destination_port_placeholder')}
            required
          />
        </div>
        <div>
          <label htmlFor="containerType" className={labelClass}>{t('container_type')}</label>
          <select
            id="containerType"
            name="containerType"
            value={formData.containerType}
            onChange={handleChange}
            className={formFieldClass}
            required
          >
            <option value="">{t('select_container_type')}</option>
            <option value="20ft">{t('20ft_container')}</option>
            <option value="40ft">{t('40ft_container')}</option>
            <option value="LCL">{t('lcl_container')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="cargoDescription" className={labelClass}>{t('cargo_description')}</label>
          <textarea
            id="cargoDescription"
            name="cargoDescription"
            value={formData.cargoDescription}
            onChange={handleChange}
            rows={3}
            className={formFieldClass}
            placeholder={t('cargo_description_placeholder')}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="weight" className={labelClass}>{t('weight_kg')}</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className={formFieldClass}
            placeholder={t('total_weight_kg_placeholder')}
            required
          />
        </div>
        <div>
          <label htmlFor="volume" className={labelClass}>{t('volume_cbm')}</label>
          <input
            type="number"
            id="volume"
            name="volume"
            value={formData.volume}
            onChange={handleChange}
            className={formFieldClass}
            placeholder={t('volume_cbm_placeholder')}
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className={buttonClass}>
            {t('next')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SeaBookingForm;