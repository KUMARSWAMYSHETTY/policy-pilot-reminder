import { Customer, Policy, Reminder } from "@/types";
import { getNextPaymentDate, getReminderDate } from "./dateUtils";

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
  console.log('Raw data from localStorage:', data);
  const policies = data ? JSON.parse(data) : [];
  console.log('Parsed policies:', policies);
  return policies;
};

export const savePolicy = (policy: Policy): Policy => {
  try {
    console.log('Starting to save policy:', policy);
    
    // Validate customer exists
    const customer = getCustomerById(policy.customerId);
    if (!customer) {
      console.error('Customer not found:', policy.customerId);
      throw new Error('Customer not found');
    }
    
    // Generate new ID if not exists
    const newPolicy = {
      ...policy,
      id: policy.id || generateId()
    };
    console.log('Policy with ID:', newPolicy);
    
    // Get existing policies
    let existingPolicies: Policy[] = [];
    try {
      const data = localStorage.getItem(POLICIES_KEY);
      existingPolicies = data ? JSON.parse(data) : [];
      console.log('Existing policies:', existingPolicies);
    } catch (error) {
      console.error('Error reading existing policies:', error);
      existingPolicies = [];
    }
    
    // Update or add the policy
    const isExisting = existingPolicies.some(p => p.id === newPolicy.id);
    const updatedPolicies = isExisting
      ? existingPolicies.map(p => p.id === newPolicy.id ? newPolicy : p)
      : [...existingPolicies, newPolicy];
    
    console.log('Updated policies array:', updatedPolicies);
    
    // Save to localStorage
    try {
      const policiesJson = JSON.stringify(updatedPolicies);
      localStorage.setItem(POLICIES_KEY, policiesJson);
      console.log('Saved policies to localStorage');
      
      // Immediate verification
      const savedData = localStorage.getItem(POLICIES_KEY);
      if (!savedData) {
        throw new Error('Failed to verify policy save - no data found');
      }
      
      const parsedSavedData = JSON.parse(savedData);
      const savedPolicy = parsedSavedData.find((p: Policy) => p.id === newPolicy.id);
      if (!savedPolicy) {
        throw new Error('Failed to verify policy save - policy not found in saved data');
      }
      
      console.log('Successfully verified saved policy:', savedPolicy);
      
      // Update reminders
      try {
        updatePolicyReminders(newPolicy);
      } catch (reminderError) {
        console.error('Error updating reminders:', reminderError);
        // Continue even if reminder update fails
      }
      
      return newPolicy;
    } catch (error) {
      console.error('Error in save/verify process:', error);
      throw new Error('Failed to save or verify policy');
    }
  } catch (error) {
    console.error('Error in policy save process:', error);
    throw error;
  }
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
  try {
    console.log('Starting to update reminders for policy:', policy);
    
    // Remove existing reminders for this policy
    const existingReminders = getReminders().filter(r => r.policyId !== policy.id);
    console.log('Existing reminders after filtering:', existingReminders);
    
    // Create new reminder for the next payment
    const nextPaymentDate = getNextPaymentDate(policy.paymentDate);
    console.log('Next payment date:', nextPaymentDate);
    
    const reminderDate = getReminderDate(nextPaymentDate);
    console.log('Reminder date:', reminderDate);
    
    const newReminder: Reminder = {
      id: generateId(),
      policyId: policy.id,
      customerId: policy.customerId,
      dueDate: reminderDate.toISOString(),
      notified: false
    };
    
    console.log('New reminder to save:', newReminder);
    
    // Save reminders
    const updatedReminders = [...existingReminders, newReminder];
    console.log('All reminders to save:', updatedReminders);
    
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    console.log('Successfully saved reminders');
    
    // Verify the save
    const savedReminders = localStorage.getItem(REMINDERS_KEY);
    console.log('Verified saved reminders:', savedReminders);
  } catch (error) {
    console.error('Error updating policy reminders:', error);
    throw error;
  }
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
