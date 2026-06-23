// src/pages/ParcelBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { parcelConfig } from '../booking/parcel.config';

const ParcelBookingDetailsPage: React.FC = () => <BookingFlow config={parcelConfig} />;

export default ParcelBookingDetailsPage;
