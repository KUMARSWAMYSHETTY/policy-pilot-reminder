import { Customer, Policy, Reminder } from "@/types";

// Local storage keys
const CUSTOMERS_KEY = 'insurance_customers';
const POLICIES_KEY = 'insurance_policies';
const REMINDERS_KEY = 'insurance_reminders';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Customer storage functions
export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCustomer = (customer: Customer): Customer => {
  // Ensure we have existing customers first
  const customers = getCustomers();
  
  // Make sure we have a valid ID
  const newCustomer = {
    ...customer,
    id: customer.id || generateId()
  };
  
  console.log('Saving customer:', newCustomer);
  console.log('Existing customers:', customers);
  
  // Check if we're updating or creating
  const isExisting = customers.some(c => c.id === newCustomer.id);
  let newCustomers;
  
  if (isExisting) {
    // Update existing customer
    newCustomers = customers.map(c => c.id === newCustomer.id ? newCustomer : c);
    console.log('Updating existing customer');
  } else {
    // Add new customer
    newCustomers = [...customers, newCustomer];
    console.log('Adding new customer');
  }
  
  // Save to localStorage
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(newCustomers));
    console.log('Successfully saved customers to localStorage');
    
    // Verify storage
    const savedData = localStorage.getItem(CUSTOMERS_KEY);
    console.log('Saved data in localStorage:', savedData);
    
    return newCustomer;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save customer data');
  }
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  
  // Also delete associated policies
  const policies = getPolicies().filter(p => p.customerId !== id);
  localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
  
  // And reminders
  const reminders = getReminders().filter(r => r.customerId !== id);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const getCustomerById = (id: string): Customer | undefined => {
  return getCustomers().find(c => c.id === id);
};

// Policy storage functions
export const getPolicies = (): Policy[] => {
  const data = localStorage.getItem(POLICIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePolicy = (policy: Policy): Policy => {
  const policies = getPolicies();
  const newPolicy = {
    ...policy,
    id: policy.id || generateId()
  };
  
  const newPolicies = policy.id 
    ? policies.map(p => p.id === policy.id ? newPolicy : p) 
    : [...policies, newPolicy];
  
  localStorage.setItem(POLICIES_KEY, JSON.stringify(newPolicies));
  
  // Update reminders when policy is saved
  updatePolicyReminders(newPolicy);
  
  return newPolicy;
};

export const deletePolicy = (id: string): void => {
  const policies = getPolicies().filter(p => p.id !== id);
  localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
  
  // Also delete associated reminders
  const reminders = getReminders().filter(r => r.policyId !== id);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const getPolicyById = (id: string): Policy | undefined => {
  return getPolicies().find(p => p.id === id);
};

export const getPoliciesByCustomerId = (customerId: string): Policy[] => {
  return getPolicies().filter(p => p.customerId === customerId);
};

// Reminder storage functions
export const getReminders = (): Reminder[] => {
  const data = localStorage.getItem(REMINDERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReminder = (reminder: Reminder): Reminder => {
  const reminders = getReminders();
  const newReminder = {
    ...reminder,
    id: reminder.id || generateId()
  };
  
  const newReminders = reminder.id 
    ? reminders.map(r => r.id === reminder.id ? newReminder : r) 
    : [...reminders, newReminder];
  
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
  return newReminder;
};

export const markReminderAsNotified = (id: string): void => {
  const reminders = getReminders();
  const updatedReminders = reminders.map(r => 
    r.id === id ? { ...r, notified: true } : r
  );
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
};

export const updatePolicyReminders = (policy: Policy): void => {
  // Remove existing reminders for this policy
  const existingReminders = getReminders().filter(r => r.policyId !== policy.id);
  
  // Import date functions
  const { getNextPaymentDate, getReminderDate } = require('./dateUtils');
  
  // Create new reminder for the next payment
  const nextPaymentDate = getNextPaymentDate(policy.paymentDate);
  const reminderDate = getReminderDate(nextPaymentDate);
  
  const newReminder: Reminder = {
    id: generateId(),
    policyId: policy.id,
    customerId: policy.customerId,
    dueDate: reminderDate.toISOString(),
    notified: false
  };
  
  // Save reminders
  localStorage.setItem(REMINDERS_KEY, JSON.stringify([...existingReminders, newReminder]));
};

// Get today's reminders
export const getTodayReminders = (): Reminder[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getReminders().filter(reminder => {
    const reminderDate = new Date(reminder.dueDate);
    reminderDate.setHours(0, 0, 0, 0);
    
    return reminderDate.getTime() === today.getTime() && !reminder.notified;
  });
};

// Get upcoming reminders (next 7 days)
export const getUpcomingReminders = (): Reminder[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  
  return getReminders().filter(reminder => {
    const reminderDate = new Date(reminder.dueDate);
    reminderDate.setHours(0, 0, 0, 0);
    
    return (
      reminderDate.getTime() >= today.getTime() && 
      reminderDate.getTime() <= oneWeekFromNow.getTime()
    );
  });
};
