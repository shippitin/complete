// src/components/Layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Shippitin</Link>
        <nav>
          <ul className="flex space-x-6">
            {/* ✅ Pass state to activate the "goods" tab */}
            <li>
              <Link
                to="/train-booking"
                state={{ activeService: 'Rail' }} // 👈 This is the key
                className="hover:text-blue-200"
              >
                Train Cargo
              </Link>
            </li>
            {/* Add other navigation links */}
            <li><a href="#" className="hover:text-blue-200">Air Cargo</a></li>
            <li><a href="#" className="hover:text-blue-200">Ocean Cargo</a></li>
            <li><a href="#" className="hover:text-blue-200">Contact Us</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;