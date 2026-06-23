// src/pages/DoorToDoorBookingDetailsPage.tsx — thin wrapper over the shared BookingFlow engine.
import React from 'react';
import BookingFlow from '../components/BookingFlow';
import { doorToDoorConfig } from '../booking/doorToDoor.config';

const DoorToDoorBookingDetailsPage: React.FC = () => <BookingFlow config={doorToDoorConfig} />;

export default DoorToDoorBookingDetailsPage;
