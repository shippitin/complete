// src/components/RoleDashboard.tsx
//
// Role-based landing rendered at "/". Branches on the signed-in user's role
// (stored in localStorage by signup/login) WITHOUT touching the booking flow:
//  • Partner service providers (CHA, Truck Operator, Shipping Line, CTO, CONCOR)
//    → "Jobs Received" dashboard.
//  • Everyone else (Importer/Exporter, Freight Forwarder, Customer, admin,
//    logged-out, unknown role) → the existing booking/landing home.
//
import React from 'react';
import HomeLandingPage from '../pages/HomeLandingPage';
import JobsReceivedView from './JobsReceivedView';
import type { ParsedVoiceCommand } from '../types/QuoteFormHandle';

interface Props {
  prefillData?: ParsedVoiceCommand;
}

// Service-provider personas that receive jobs rather than book them.
const JOBS_ROLES = ['cha', 'transporter', 'shipping_line', 'cto', 'concor'];

const readUser = (): any => {
  try {
    return JSON.parse(localStorage.getItem('shippitin_user') || 'null');
  } catch {
    return null;
  }
};

const RoleDashboard: React.FC<Props> = ({ prefillData }) => {
  const user = readUser();
  const role: string | undefined = user?.role;

  if (role && JOBS_ROLES.includes(role)) {
    return <JobsReceivedView personaLabel={user?.persona_label} />;
  }

  return <HomeLandingPage prefillData={prefillData} />;
};

export default RoleDashboard;
