
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Policy {
  id: string;
  customerId: string;
  policyNumber: string;
  policyType: string;
  startDate: string;
  paymentDate: number; // Day of month (1-31)
  premium: number;
  notes: string;
}

export interface Reminder {
  id: string;
  policyId: string;
  customerId: string;
  dueDate: string;
  notified: boolean;
}
