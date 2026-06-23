// src/pages/FirstLastMileBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { firstLastMileConfig } from '../booking/firstLastMile.config';

const FirstLastMileBookingDetailsPage: React.FC = () => <BookingFlow config={firstLastMileConfig} />;

export default FirstLastMileBookingDetailsPage;
