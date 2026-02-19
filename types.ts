export interface CustomerRequirement {
  id: string;
  name: string;
  mobile: string;
  altMobile?: string;
  email: string;
  budget: number;
  requirement: string;
  currentLocation: string;
  preferredLocation: string;
  direction: 'North' | 'South' | 'East' | 'West';
  floorPreference: number;
  flatSize: number;
  lookingFor: 'Gated' | 'Semi-gated' | 'Standalone';
  createdAt: string; // ISO string
  status: 'New' | 'Contacted' | 'Closed' | 'Spam';
}

export type SortField = 'createdAt' | 'budget' | 'flatSize';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  status: string;
  lookingFor: string;
  minBudget: string;
  maxBudget: string;
}

export interface AdminUser {
  email: string;
  token: string;
}

export interface CaptchaChallenge {
  num1: number;
  num2: number;
  answer: number;
}