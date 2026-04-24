// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaGift,
  FaCogs,
  FaQuestionCircle,
  FaUser,
  FaBars,
  FaChevronDown,
  FaSignOutAlt,
  FaInfoCircle,
  FaHome,
  FaTimes
} from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('shippitin_token');
    const userStr = localStorage.getItem('shippitin_user');
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.full_name?.split(' ')[0] || 'User');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setIsLoggedIn(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('shippitin_token');
      localStorage.removeItem('shippitin_user');
      setIsLoggedIn(false);
      window.location.href = '/';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  const isActiveLink = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 backdrop-blur-md shadow-md py-2 md:py-3 sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/images/shippitin logo-1.svg" alt="Shippitin Logo" className="h-9 w-auto object-contain" />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <nav className="hidden lg:flex items-center gap-3 text-sm font-medium">
            <NavLink to="/aboutus" className={() => `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200 ${isActiveLink('/aboutus') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`}>
              <FaInfoCircle /> About Us
            </NavLink>
            <NavLink to="/track" className={() => `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200 ${isActiveLink('/track') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`}>
              <FaMapMarkerAlt /> Track
            </NavLink>
            <NavLink to="/offers" className={() => `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200 ${isActiveLink('/offers') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`}>
              <FaGift /> Offers
            </NavLink>
            <NavLink to="/services" className={() => `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200 ${isActiveLink('/services') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`}>
              <FaCogs /> Services
            </NavLink>
            <NavLink to="/support" className={() => `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200 ${isActiveLink('/support') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`}>
              <FaQuestionCircle /> Support
            </NavLink>
          </nav>

          {/* Auth Button */}
          {isLoggedIn ? (
            <div className="relative group">
              <button onClick={toggleProfileMenu} className="flex items-center gap-2 bg-blue-50 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition shadow-sm md:shadow-md ml-2">
                <FaUser /> Hi {userName || 'Shippitin'}
                <FaChevronDown className="ml-1 text-xs" />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-sm">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-black transition-colors" onClick={closeProfileMenu}>
                    <FaUser /> My Profile
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-black transition-colors" onClick={closeProfileMenu}>
                    <FaHome /> My Dashboard
                  </Link>
                  <Link to="/my-wallet" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-black transition-colors" onClick={closeProfileMenu}>
                    <FaGift /> My Wallet
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={() => { handleLogout(); closeProfileMenu(); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 bg-blue-50 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition shadow-sm md:shadow-md ml-2">
              <FaUser /> Login / Sign Up
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={toggleMobileMenu} className="lg:hidden text-gray-700 text-2xl ml-4 p-2 rounded-md hover:bg-gray-100 transition-colors">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={closeMobileMenu}></div>
      )}

      {/* Mobile Menu — fixed z-50 above overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-0 right-0 w-72 h-full bg-white shadow-2xl p-6 z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-blue-800">Menu</h3>
            <button onClick={closeMobileMenu} className="text-gray-500 hover:text-blue-600 p-1">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink to="/aboutus" className={() => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActiveLink('/aboutus') ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-blue-50'}`} onClick={closeMobileMenu}>
              <FaInfoCircle className="text-blue-500" /> About Us
            </NavLink>
            <NavLink to="/track" className={() => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActiveLink('/track') ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-blue-50'}`} onClick={closeMobileMenu}>
              <FaMapMarkerAlt className="text-blue-500" /> Track
            </NavLink>
            <NavLink to="/offers" className={() => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActiveLink('/offers') ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-blue-50'}`} onClick={closeMobileMenu}>
              <FaGift className="text-blue-500" /> Offers
            </NavLink>
            <NavLink to="/services" className={() => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActiveLink('/services') ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-blue-50'}`} onClick={closeMobileMenu}>
              <FaCogs className="text-blue-500" /> Services
            </NavLink>
            <NavLink to="/support" className={() => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActiveLink('/support') ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-blue-50'}`} onClick={closeMobileMenu}>
              <FaQuestionCircle className="text-blue-500" /> Support
            </NavLink>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-1">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50" onClick={closeMobileMenu}>
                    <FaUser className="text-blue-500" /> My Profile
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50" onClick={closeMobileMenu}>
                    <FaHome className="text-blue-500" /> My Dashboard
                  </Link>
                  <Link to="/my-wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50" onClick={closeMobileMenu}>
                    <FaGift className="text-blue-500" /> My Wallet
                  </Link>
                  <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50" onClick={closeMobileMenu}>
                  <FaUser className="text-blue-500" /> Login / Sign Up
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
