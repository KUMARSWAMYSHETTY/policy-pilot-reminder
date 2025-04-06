
import { format, addDays, subDays, addMonths, isAfter, isBefore, isSameDay } from "date-fns";

// Format date to display
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy');
};

// Format date to display with time
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy, hh:mm a');
};

// Get next payment date based on payment day
export const getNextPaymentDate = (paymentDay: number): Date => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Create date for this month's payment
  let nextPayment = new Date(currentYear, currentMonth, paymentDay);
  
  // If this month's date has passed, get next month's date
  if (isBefore(nextPayment, today)) {
    nextPayment = new Date(currentYear, currentMonth + 1, paymentDay);
  }
  
  // Handle invalid dates (e.g., Feb 30)
  if (nextPayment.getDate() !== paymentDay) {
    // Use last day of the month
    nextPayment = new Date(currentYear, currentMonth + 1, 0);
  }
  
  return nextPayment;
};

// Get reminder date (3 days before payment)
export const getReminderDate = (paymentDate: Date): Date => {
  return subDays(paymentDate, 3);
};

// Check if a reminder should be sent today
export const shouldSendReminder = (paymentDay: number): boolean => {
  const today = new Date();
  const nextPayment = getNextPaymentDate(paymentDay);
  const reminderDate = getReminderDate(nextPayment);
  
  return isSameDay(today, reminderDate);
};

// Get all payment dates for next 3 months
export const getUpcomingPaymentDates = (paymentDay: number, months = 3): Date[] => {
  const today = new Date();
  const dates: Date[] = [];
  
  for (let i = 0; i < months; i++) {
    const month = (today.getMonth() + i) % 12;
    const year = today.getFullYear() + Math.floor((today.getMonth() + i) / 12);
    
    let paymentDate = new Date(year, month, paymentDay);
    
    // Handle invalid dates (e.g., Feb 30)
    if (paymentDate.getDate() !== paymentDay) {
      // Use last day of the month
      paymentDate = new Date(year, month + 1, 0);
    }
    
    if (isAfter(paymentDate, today) || isSameDay(paymentDate, today)) {
      dates.push(paymentDate);
    }
  }
  
  return dates;
};
