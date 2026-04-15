import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PortResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve the form data sent from the Quote Form
  const { formData } = location.state || {};

  // Mock data for port service providers (Technical/Bunkering/Repairs)
  const mockProviders = [
    { id: 1, name: "Alpha Marine Engineering", type: "Technical", rating: 4.8, price: "On Request", eta: "2 hours" },
    { id: 2, name: "Global Bunkering Co.", type: "Fuel", rating: 4.5, price: "Market Rate", eta: "Ready Now" },
    { id: 3, name: "CleanHull Specialists", type: "Cleaning", rating: 4.9, price: "$3,200", eta: "Tomorrow" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Search
        </button>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Port Service Providers</h1>
          <p className="text-gray-600 mt-2">
            Showing results for <span className="font-bold text-blue-600">{formData?.portLocation || 'Selected Port'}</span> 
            {formData?.vesselName && ` for vessel: ${formData.vesselName}`}
          </p>
        </header>

        <div className="grid gap-4">
          {mockProviders.map((provider) => (
            <div key={provider.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold uppercase px-2 py-1 bg-blue-100 text-blue-700 rounded mb-2 inline-block">
                  {provider.type}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{provider.name}</h3>
                <p className="text-sm text-gray-500">Rating: ⭐ {provider.rating} | Availability: {provider.eta}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 mb-2">{provider.price}</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Request Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortResultsPage;