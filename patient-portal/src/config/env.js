/**
 * Production Environment Configuration & Zero Fake Data Guardian
 * Fails closed: DEMO_MODE is strictly false in production.
 */
export const IS_PRODUCTION = import.meta.env.MODE === 'production' || import.meta.env.PROD === true;

export const IS_DEMO_MODE =
  !IS_PRODUCTION && import.meta.env.VITE_DEMO_MODE === 'true';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
