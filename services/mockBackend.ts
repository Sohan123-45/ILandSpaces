import { CustomerRequirement, AdminUser } from '../types';

// Keys for localStorage - Version bumped to v3 to ensure clean slate
const DB_KEY_CUSTOMERS = 'ilandspaces_customers_v3';
const DB_KEY_ADMIN = 'ilandspaces_admin_session_v3';

// Seed data is now empty to ensure dashboard starts clean
const SEED_DATA: CustomerRequirement[] = [];

// --- Mock Database Operations ---

export const getCustomers = (): CustomerRequirement[] => {
  const stored = localStorage.getItem(DB_KEY_CUSTOMERS);
  if (!stored) {
    localStorage.setItem(DB_KEY_CUSTOMERS, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const saveCustomer = (customer: Omit<CustomerRequirement, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const customers = getCustomers();
      const newCustomer: CustomerRequirement = {
        ...customer,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        status: 'New'
      };
      localStorage.setItem(DB_KEY_CUSTOMERS, JSON.stringify([newCustomer, ...customers]));
      resolve(true);
    }, 800);
  });
};

export const updateCustomerStatus = (id: string, status: CustomerRequirement['status']) => {
  const customers = getCustomers();
  const updated = customers.map(c => c.id === id ? { ...c, status } : c);
  localStorage.setItem(DB_KEY_CUSTOMERS, JSON.stringify(updated));
  return updated;
};

export const deleteCustomer = (id: string) => {
  const customers = getCustomers();
  const updated = customers.filter(c => c.id !== id);
  localStorage.setItem(DB_KEY_CUSTOMERS, JSON.stringify(updated));
  return updated;
};

// --- Mock Auth Operations ---

export const loginAdmin = (email: string, password: string): Promise<AdminUser | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Hardcoded credentials for DEMO
      if (email === 'admin@company.com' && password === '12345') {
        const user: AdminUser = {
          email,
          token: 'mock-jwt-token-' + Date.now()
        };
        localStorage.setItem(DB_KEY_ADMIN, JSON.stringify(user));
        resolve(user);
      } else {
        resolve(null);
      }
    }, 1000);
  });
};

export const getSession = (): AdminUser | null => {
  const stored = localStorage.getItem(DB_KEY_ADMIN);
  return stored ? JSON.parse(stored) : null;
};

export const logoutAdmin = () => {
  localStorage.removeItem(DB_KEY_ADMIN);
};