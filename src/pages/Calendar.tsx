
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, FileText } from 'lucide-react';
import { getPolicies, getCustomerById } from '@/utils/storage';
import { formatDate, getUpcomingPaymentDates } from '@/utils/dateUtils';
import { Policy } from '@/types';

const Calendar = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Type for calendar day
  interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    hasPayments: boolean;
    isToday: boolean;
    policies: Policy[];
  }
  
  useEffect(() => {
    setPolicies(getPolicies());
  }, []);
  
  useEffect(() => {
    generateCalendarDays();
  }, [policies, currentMonth, currentYear]);
  
  const generateCalendarDays = () => {
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // First day of month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Last day of month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // First day of calendar (might be from previous month)
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - dayOfWeek);
    
    // Calculate all the policies payment dates for current month
    const policyPaymentDays = new Map<number, Policy[]>();
    
    policies.forEach(policy => {
      const paymentDay = policy.paymentDate;
      
      // If this day exists in current month (e.g. not Feb 30)
      if (paymentDay <= lastDayOfMonth.getDate()) {
        if (!policyPaymentDays.has(paymentDay)) {
          policyPaymentDays.set(paymentDay, []);
        }
        policyPaymentDays.get(paymentDay)?.push(policy);
      }
    });
    
    // Generate 42 days (6 weeks)
    const currentDate = new Date(firstDayOfCalendar);
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === currentMonth;
      const dayOfMonth = currentDate.getDate();
      
      const dayPolicies = isCurrentMonth && policyPaymentDays.has(dayOfMonth) 
        ? policyPaymentDays.get(dayOfMonth) || [] 
        : [];
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        hasPayments: dayPolicies.length > 0,
        isToday: 
          currentDate.getDate() === today.getDate() && 
          currentDate.getMonth() === today.getMonth() && 
          currentDate.getFullYear() === today.getFullYear(),
        policies: dayPolicies
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };
  
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };
  
  const getMonthName = (month: number): string => {
    const date = new Date(2000, month, 1);
    return date.toLocaleString('default', { month: 'long' });
  };
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-0 md:pt-20">
      <header className="my-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-insurance-blue flex items-center">
          <CalendarIcon size={24} className="mr-2" />
          Calendar
        </h1>
      </header>
      
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft />
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <Button variant="link" onClick={goToCurrentMonth}>
            Today
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight />
        </Button>
      </div>
      
      {/* Calendar grid */}
      <div className="mb-6">
        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2 text-center font-medium text-gray-500">
          <div className="p-2">Sun</div>
          <div className="p-2">Mon</div>
          <div className="p-2">Tue</div>
          <div className="p-2">Wed</div>
          <div className="p-2">Thu</div>
          <div className="p-2">Fri</div>
          <div className="p-2">Sat</div>
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 border rounded-lg overflow-hidden bg-white">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`min-h-24 p-2 border-t border-r ${
                index % 7 === 0 ? '' : ''
              } ${
                index < 7 ? '' : ''
              } ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${
                day.isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                  day.isToday ? 'bg-insurance-blue text-white' : ''
                }`}>
                  {day.date.getDate()}
                </div>
                
                {day.hasPayments && (
                  <div className="bg-insurance-red text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                    {day.policies.length}
                  </div>
                )}
              </div>
              
              {day.hasPayments && (
                <div className="mt-1 text-xs space-y-1">
                  {day.policies.slice(0, 2).map(policy => {
                    const customer = getCustomerById(policy.customerId);
                    return (
                      <Link 
                        key={policy.id} 
                        to={`/policies/${policy.id}`}
                        className="block p-1 rounded bg-insurance-light-teal text-xs truncate"
                      >
                        {customer?.name}
                      </Link>
                    );
                  })}
                  {day.policies.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.policies.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* List upcoming payments */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Upcoming Payments</h2>
        <div className="space-y-2">
          {policies.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                <p>No policies found</p>
                <p className="text-sm mt-1">Add policies to see payment dates</p>
              </CardContent>
            </Card>
          ) : (
            policies.slice(0, 5).map(policy => {
              const customer = getCustomerById(policy.customerId);
              const nextPaymentDates = getUpcomingPaymentDates(policy.paymentDate, 1);
              
              return (
                <Link key={policy.id} to={`/policies/${policy.id}`}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="bg-insurance-teal rounded-full p-1 mr-2 text-white">
                            <FileText size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{policy.policyNumber}</p>
                            <div className="flex items-center text-xs text-gray-600">
                              <Users size={10} className="mr-1" />
                              <span>{customer?.name}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Next payment</p>
                          <p className="text-xs font-medium">
                            {nextPaymentDates.length > 0 
                              ? formatDate(nextPaymentDates[0]) 
                              : `Day ${policy.paymentDate}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Calendar;
