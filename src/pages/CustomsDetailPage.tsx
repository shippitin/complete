// src/pages/CustomsDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const CustomsDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Customs & <span className="text-yellow-300">Clearance</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Navigate international trade with ease, ensuring smooth customs processing.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Expert Customs Brokerage Services</h2>
          <p>
            Customs clearance can be a complex and time-consuming process, but with SHIPPITIN, it doesn't have to be. Our team of experienced customs brokers stays up-to-date with the latest regulations and procedures, ensuring your international shipments comply with all legal requirements. We handle all documentation, duties, and taxes, minimizing delays and ensuring a seamless flow of goods across borders.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Customs Expertise Ensures:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Compliance:</strong> Adherence to all import/export regulations.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Efficiency:</strong> Expedited clearance to reduce transit times.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Cost Savings:</strong> Avoidance of penalties and unnecessary charges.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Risk Mitigation:</strong> Expert handling to prevent issues and delays.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Documentation Support:</strong> Assistance with all required paperwork.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Customs Services Include:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Import & Export Declarations</li>
            <li>Duty & Tax Calculation</li>
            <li>Customs Consulting</li>
            <li>Bonded Warehousing</li>
            <li>Permit & License Acquisition</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Need Customs Assistance?</h3>
          <p className="text-lg mb-8">
            Get expert help with your customs clearance process.
          </p>
          <Link
            to="/customs-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Request Customs Consultation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomsDetailPage;
