// src/components/RoleDashboard.tsx
//
// Role-based landing rendered at "/". Branches on the signed-in user's role
// (and CONCOR sub-role) stored in localStorage by signup/login, WITHOUT
// touching the booking/pricing flow:
//  • Each known persona → its own tailored PersonaDashboard.
//  • Logged-out / unknown role → the existing marketing + booking home.
//
import React from 'react';
import HomeLandingPage from '../pages/HomeLandingPage';
import PersonaDashboard from './dashboards/PersonaDashboard';
import { getDashboardConfig } from './dashboards/personaDashboards';
import type { ParsedVoiceCommand } from '../types/QuoteFormHandle';

interface Props {
  prefillData?: ParsedVoiceCommand;
}

const readUser = (): any => {
  try {
    return JSON.parse(localStorage.getItem('shippitin_user') || 'null');
  } catch {
    return null;
  }
};

const RoleDashboard: React.FC<Props> = ({ prefillData }) => {
  const user = readUser();
  const config = getDashboardConfig(user?.role, user?.concor_role);

  if (config) {
    return <PersonaDashboard config={config} />;
  }
  return <HomeLandingPage prefillData={prefillData} />;
};

export default RoleDashboard;
