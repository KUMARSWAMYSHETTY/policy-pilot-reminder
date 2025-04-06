
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, FileText, BellRing, PlusCircle, Calendar, 
  ArrowRight, Bell, Info
} from 'lucide-react';
import { 
  getCustomers, getPolicies, getTodayReminders, getUpcomingReminders
} from '@/utils/storage';
import ReminderCard from '@/components/ReminderCard';
import { toast } from 'sonner';
import { Reminder } from '@/types';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  
  const loadData = () => {
    setCustomers(getCustomers());
    setPolicies(getPolicies());
    setTodayReminders(getTodayReminders());
    setUpcomingReminders(getUpcomingReminders());
  };
  
  useEffect(() => {
    loadData();
    
    // Check for reminders when app loads
    const today = getTodayReminders();
    if (today.length > 0) {
      toast(
        <div className="flex items-center">
          <Bell className="mr-2 text-insurance-blue" />
          <span>You have {today.length} payment reminders today!</span>
        </div>
      );
    }
    
    // Set up interval to check for reminders (every hour)
    const interval = setInterval(() => {
      setTodayReminders(getTodayReminders());
    }, 3600000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-0 md:pt-20">
      <header className="my-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-insurance-blue">
          Policy Reminder
        </h1>
        <div className="flex space-x-2">
          <Link to="/customers/new">
            <Button className="bg-insurance-blue hover:bg-insurance-dark-blue">
              <PlusCircle size={16} className="mr-1" /> Add Customer
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/customers">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="bg-insurance-light-blue rounded-full p-2 text-white">
                <Users size={20} />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/policies">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Policies</p>
                <p className="text-2xl font-bold">{policies.length}</p>
              </div>
              <div className="bg-insurance-teal rounded-full p-2 text-white">
                <FileText size={20} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Today's Reminders */}
      <Card className="mb-6">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <BellRing size={18} className="mr-2 text-insurance-red" />
              Today's Reminders
            </CardTitle>
            <Link to="/reminders">
              <Button size="sm" variant="ghost" className="text-insurance-blue">
                View All <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {todayReminders.length === 0 ? (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
              <Info size={32} className="mb-2 text-gray-400" />
              <p>No reminders for today</p>
            </div>
          ) : (
            todayReminders.map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={loadData}
              />
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Upcoming Reminders */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Calendar size={18} className="mr-2 text-insurance-blue" />
              Upcoming Reminders
            </CardTitle>
            <Link to="/calendar">
              <Button size="sm" variant="ghost" className="text-insurance-blue">
                View Calendar <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
              <Info size={32} className="mb-2 text-gray-400" />
              <p>No upcoming reminders</p>
            </div>
          ) : (
            upcomingReminders.slice(0, 3).map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={loadData}
              />
            ))
          )}
          
          {upcomingReminders.length > 3 && (
            <div className="text-center mt-2">
              <Link to="/reminders">
                <Button variant="link" className="text-insurance-blue">
                  View {upcomingReminders.length - 3} more reminders
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Navbar />
    </div>
  );
};

export default Dashboard;
