import React from 'react';
import type { QuoteFormData } from '../../types/QuoteFormData';

type Props = {
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
};

const LoadingInputSection = ({ formData, setFormData }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      load: {
        ...prev.load,
        [name]: value,
      },
    }));
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Load Details</h3>
      <input
        type="text"
        name="mode"
        placeholder="Load Mode"
        value={formData.load.mode}
        onChange={handleChange}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        name="units"
        placeholder="Units"
        value={formData.load.units}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

export default LoadingInputSection;