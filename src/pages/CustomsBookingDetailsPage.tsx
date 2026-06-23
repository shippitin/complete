// src/pages/CustomsBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { customsConfig } from '../booking/customs.config';

const CustomsBookingDetailsPage: React.FC = () => <BookingFlow config={customsConfig} />;

export default CustomsBookingDetailsPage;
