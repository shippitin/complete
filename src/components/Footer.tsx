// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    // Changed background to bg-blue-50 for a lighter look
    <footer className="bg-blue-50 text-gray-700 py-10 px-8">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us Column */}
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('about_us_title')}</h3>
          <ul className="space-y-2">
            {/* Corrected link to /aboutus */}
            <li><Link to="/aboutus" className="hover:text-blue-700 transition-colors duration-200 text-sm">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('careers')}</Link></li>
            <li><Link to="/media" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('media')}</Link></li>
            <li><Link to="/blog" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('blog')}</Link></li>
          </ul>
        </div>

        {/* Services Column */}
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('footer_services')}</h3>
          <ul className="space-y-2">
            {/* Updated links to point to the QuoteFormPage with activeService state */}
            <li><Link to="/truck-booking" state={{ activeService: "Truck" }} className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('road_freight')}</Link></li>
            <li><Link to="/air-booking" state={{ activeService: "Air" }} className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('air_freight')}</Link></li>
            <li><Link to="/sea-booking" state={{ activeService: "Sea" }} className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('sea_freight')}</Link></li>
            <li><Link to="/train-booking" state={{ activeService: "Rail" }} className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('rail_freight')}</Link></li>
            <li><Link to="/parcel-booking" state={{ activeService: "Parcel" }} className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('parcel')}</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('footer_support')}</h3>
          <ul className="space-y-2">
            {/* Updated links to point to the correct support page */}
            <li><Link to="/support" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('help_center')}</Link></li>
            <li><Link to="/support" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('report_issue')}</Link></li>
            <li><Link to="/support" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('partner_with_us')}</Link></li>
          </ul>
        </div>

        {/* Legal & Social Column */}
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('footer_legal')}</h3>
          <ul className="space-y-2 mb-6">
            <li><Link to="/terms" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('terms_of_use')}</Link></li>
            <li><Link to="/privacy" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('privacy_policy')}</Link></li>
            <li><Link to="/cookies" className="hover:text-blue-700 transition-colors duration-200 text-sm">{t('cookie_policy')}</Link></li>
          </ul>

          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('footer_follow')}</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xl transition-colors duration-200">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xl transition-colors duration-200">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xl transition-colors duration-200">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xl transition-colors duration-200">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-200 mt-10 pt-6 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Shippitin. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
