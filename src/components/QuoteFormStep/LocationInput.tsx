import type { QuoteFormData } from "../../types/QuoteFormData";

interface Props {
  label: string;
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
  isOrigin: boolean;
}

const LocationInput = ({ label, formData, setFormData, isOrigin }: Props) => {
  const location = isOrigin ? formData.origin : formData.destination;

  const handleChange = (field: keyof typeof location, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [isOrigin ? "origin" : "destination"]: {
        ...location,
        [field]: value,
      },
    }));
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-md font-semibold mb-2">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Country"
          value={location.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="City"
          value={location.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="ZIP Code"
          value={location.zipCode}
          onChange={(e) => handleChange("zipCode", e.target.value)}
          className="border p-2 rounded"
        />
      </div>
    </div>
  );
};

export default LocationInput;