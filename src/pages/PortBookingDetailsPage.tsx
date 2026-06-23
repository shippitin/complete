// src/pages/PortBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { portConfig } from '../booking/port.config';

const PortBookingDetailsPage: React.FC = () => <BookingFlow config={portConfig} />;

export default PortBookingDetailsPage;
