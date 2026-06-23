// src/pages/AirBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { airConfig } from '../booking/air.config';

const AirBookingDetailsPage: React.FC = () => <BookingFlow config={airConfig} />;

export default AirBookingDetailsPage;
