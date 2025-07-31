// src/pages/MediaPage.tsx
import React from 'react';
import { FaVideo } from 'react-icons/fa';

const MediaPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          SHIPPITIN in the <span className="text-yellow-300">News</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Stay updated with our latest press releases, news, and media coverage.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Press Releases Section */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Press Releases</h2>
          <div className="space-y-6">
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">SHIPPITIN Announces Expansion into Southeast Asia</h3>
                <p className="text-gray-600 text-sm">Date: July 15, 2025</p>
              </div>
              <a href="#" className="mt-3 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Read More</a>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">New AI-Powered Tracking System Launched by SHIPPITIN</h3>
                <p className="text-gray-600 text-sm">Date: June 20, 2025</p>
              </div>
              <a href="#" className="mt-3 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Read More</a>
            </div>
          </div>
        </section>

        {/* Image Gallery (Placeholder) */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Image Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <img src="https://placehold.co/300x200/cccccc/333333?text=Gallery+Image+1" alt="Gallery Image 1" className="rounded-lg shadow-sm w-full h-auto object-cover" />
            <img src="https://placehold.co/300x200/cccccc/333333?text=Gallery+Image+2" alt="Gallery Image 2" className="rounded-lg shadow-sm w-full h-auto object-cover" />
            <img src="https://placehold.co/300x200/cccccc/333333?text=Gallery+Image+3" alt="Gallery Image 3" className="rounded-lg shadow-sm w-full h-auto object-cover" />
            <img src="https://placehold.co/300x200/cccccc/333333?text=Gallery+Image+4" alt="Gallery Image 4" className="rounded-lg shadow-sm w-full h-auto object-cover" />
          </div>
          <p className="text-center text-gray-600 mt-8">
            For high-resolution images or media kits, please <a href="/support" className="text-blue-600 hover:underline">contact our media relations team</a>.
          </p>
        </section>

        {/* Video Library (Placeholder) */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Video Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500">
              <FaVideo className="text-6xl" />
              <span className="ml-4">Video Placeholder 1</span>
            </div>
            <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500">
              <FaVideo className="text-6xl" />
              <span className="ml-4">Video Placeholder 2</span>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            Explore our YouTube channel for more videos.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MediaPage;
