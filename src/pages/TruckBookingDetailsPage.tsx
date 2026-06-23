// src/pages/TruckBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { truckConfig } from '../booking/truck.config';

const TruckBookingDetailsPage: React.FC = () => <BookingFlow config={truckConfig} />;

export default TruckBookingDetailsPage;
