// src/pages/CareersPage.tsx
import React from 'react';
import { FaBriefcase, FaUsers, FaLightbulb } from 'react-icons/fa';

const CareersPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Join Our <span className="text-yellow-300">Team</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Shape the future of logistics with SHIPPITIN.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Why Work With Us */}
        <section className="mb-16 text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Why Work <span className="text-blue-700">With Us?</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto mb-10">
            At SHIPPITIN, we believe our people are our greatest asset. We foster a dynamic, inclusive, and innovative environment where every team member can thrive and contribute to transforming the logistics industry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center transition-transform hover:scale-105">
              <FaBriefcase className="text-4xl text-blue-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Growth Opportunities</h3>
              <p className="text-gray-600 text-sm">Clear career paths and continuous learning programs.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center transition-transform hover:scale-105">
              <FaUsers className="text-4xl text-purple-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Collaborative Culture</h3>
              <p className="text-gray-600 text-sm">Work with diverse teams in a supportive environment.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center transition-transform hover:scale-105">
              <FaLightbulb className="text-4xl text-yellow-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation Driven</h3>
              <p className="text-gray-600 text-sm">Be part of a company that embraces new technologies.</p>
            </div>
          </div>
        </section>

        {/* Current Openings (Placeholder) */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Current Openings</h2>
          <div className="space-y-6">
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Logistics Operations Manager</h3>
                <p className="text-gray-600 text-sm">Location: Mumbai, India | Full-time</p>
              </div>
              <a href="#" className="mt-3 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Apply Now</a>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Software Engineer (Frontend)</h3>
                <p className="text-gray-600 text-sm">Location: Bengaluru, India | Full-time</p>
              </div>
              <a href="#" className="mt-3 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Apply Now</a>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Customer Support Executive</h3>
                <p className="text-gray-600 text-sm">Location: Remote | Full-time</p>
              </div>
              <a href="#" className="mt-3 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Apply Now</a>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            Don't see a role that fits? <a href="/support" className="text-blue-600 hover:underline">Send us your resume</a> for future consideration.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CareersPage;
