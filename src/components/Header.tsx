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
  FaTimes // Added FaTimes for mobile menu close icon
} from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // State for profile dropdown
  // Removed isCurrencyLangMenuOpen, selectedCurrency, selectedLanguage states as they are no longer needed

  const location = useLocation(); // Hook to get current URL location

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      window.location.reload(); // Keeping reload for full state reset as per previous pattern
    } catch (error) {
      console.error("Error logging out:", error);
      console.error("Failed to log out. Please try again.");
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  // Removed toggleCurrencyLangMenu, closeCurrencyLangMenu, handleLanguageChange, handleCurrencyChange functions

  // Helper function to determine if a NavLink should be active
  const isActiveLink = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 backdrop-blur-md shadow-md py-2 md:py-3 sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/images/shippitin logo-1.svg"
            alt="Shippitin Logo"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <nav className="hidden lg:flex items-center gap-3 text-sm font-medium">
            <NavLink
              to="/aboutus"
              className={() =>
                `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200
                ${isActiveLink('/aboutus') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`
              }
            >
              <FaInfoCircle /> About Us
            </NavLink>
            <NavLink
              to="/track"
              className={() =>
                `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200
                ${isActiveLink('/track') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`
              }
            >
              <FaMapMarkerAlt /> Track
            </NavLink>
            <NavLink
              to="/offers"
              className={() =>
                `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200
                ${isActiveLink('/offers') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`
              }
            >
              <FaGift /> Offers
            </NavLink>
            <NavLink
              to="/services"
              className={() =>
                `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200
                ${isActiveLink('/services') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`
              }
            >
              <FaCogs /> Services
            </NavLink>
            <NavLink
              to="/support"
              className={() =>
                `flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors duration-200
                ${isActiveLink('/support') ? 'bg-blue-100 text-black font-semibold' : 'hover:bg-blue-50 hover:text-blue-700'}`
              }
            >
              <FaQuestionCircle /> Support
            </NavLink>
          </nav>

          {/* Removed Language / Currency Selectors section */}
          {/* <div className="hidden lg:flex items-center gap-2 relative">...</div> */}

          {/* Auth Button / Dropdown */}
          {isLoggedIn ? (
            <div className="relative group">
              <button
                onClick={toggleProfileMenu}
                // Changed text-blue-700 to text-gray-700 for the main button
                className="flex items-center gap-2 bg-blue-50 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition shadow-sm md:shadow-md ml-2 relative"
              >
                <FaUser /> Hi Shippitin
                <FaChevronDown className="ml-1 text-xs" />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-sm origin-top-right animate-fade-in-down">
                  <Link
                    to="/profile"
                    // Changed hover:text-blue-700 to hover:text-black for dropdown links
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-black transition-colors"
                    onClick={closeProfileMenu}
                  >
                    <FaUser className="text-base" /> My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    // Changed hover:text-blue-700 to hover:text-black for dropdown links
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-black transition-colors"
                    onClick={closeProfileMenu}
                  >
                    <FaHome className="text-base" /> My Dashboard
                  </Link>
                  <Link
                    to="/my-wallet"
                    // Changed hover:text-blue-700 to hover:text-black for dropdown links
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-black transition-colors"
                    onClick={closeProfileMenu}
                  >
                    <FaGift className="text-base" /> My Wallet
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => { handleLogout(); closeProfileMenu(); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="text-base" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              // Changed text-blue-700 to text-gray-700 for the login button
              className="flex items-center gap-2 bg-blue-50 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition shadow-sm md:shadow-md ml-2"
            >
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-4 z-50 transform transition-transform duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-6">
            {/* Kept text-blue-800 for "Menu" heading as it's a heading */}
            <h3 className="text-xl font-bold text-blue-800">Menu</h3>
            <button onClick={closeMobileMenu} className="text-gray-700 hover:text-blue-600">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-2">
            <NavLink
              to="/aboutus"
              className={() =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActiveLink('/aboutus') ? 'text-black bg-blue-100' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'}`
              }
              onClick={closeMobileMenu}
            >
              <FaInfoCircle /> About Us
            </NavLink>
            <NavLink
              to="/track"
              className={() =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActiveLink('/track') ? 'text-black bg-blue-100' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'}`
              }
              onClick={closeMobileMenu}
            >
              <FaMapMarkerAlt /> Track
            </NavLink>
            <NavLink
              to="/offers"
              className={() =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActiveLink('/offers') ? 'text-black bg-blue-100' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'}`
              }
              onClick={closeMobileMenu}
            >
              <FaGift /> Offers
            </NavLink>
            <NavLink
              to="/services"
              className={() =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActiveLink('/services') ? 'text-black bg-blue-100' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'}`
              }
              onClick={closeMobileMenu}
            >
              <FaCogs /> Services
            </NavLink>
            <NavLink
              to="/support"
              className={() =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                ${isActiveLink('/support') ? 'text-black bg-blue-100' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'}`
              }
              onClick={closeMobileMenu}
            >
              <FaQuestionCircle /> Support
            </NavLink>

            {/* Mobile Profile/Auth Links */}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-blue-50" onClick={closeMobileMenu}> {/* Changed hover:text-blue-700 to hover:text-black */}
                    <FaUser /> My Profile
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-blue-50" onClick={closeMobileMenu}> {/* Changed hover:text-blue-700 to hover:text-black */}
                    <FaHome /> My Dashboard
                  </Link>
                  <Link to="/my-wallet" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-blue-50" onClick={closeMobileMenu}> {/* Changed hover:text-blue-700 to hover:text-black */}
                    <FaGift /> My Wallet
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-blue-50" onClick={closeMobileMenu}> {/* Changed hover:text-blue-700 to hover:text-black */}
                  <FaUser /> Login / Sign Up
                </Link>
              )}
            </div>

            {/* Removed Mobile Language/Currency Selectors */}
            {/* <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">...</div> */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
