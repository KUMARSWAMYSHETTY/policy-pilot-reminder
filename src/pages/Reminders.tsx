
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReminderCard from '@/components/ReminderCard';
import { 
  getReminders, getTodayReminders, getUpcomingReminders, 
  markReminderAsNotified
} from '@/utils/storage';
import { 
  Bell, Clock, Calendar, Check, Filter, Info
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Reminder } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Reminders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [allReminders, setAllReminders] = useState<Reminder[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [showNotified, setShowNotified] = useState(false);
  
  const loadData = () => {
    const today = getTodayReminders();
    const upcoming = getUpcomingReminders();
    const all = getReminders().sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setTodayReminders(today);
    setUpcomingReminders(upcoming);
    setAllReminders(all);
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleMarkAllAsNotified = () => {
    const toMarkAsNotified = todayReminders.filter(r => !r.notified);
    
    if (toMarkAsNotified.length === 0) {
      toast.info('No reminders to mark as notified');
      return;
    }
    
    toMarkAsNotified.forEach(reminder => {
      markReminderAsNotified(reminder.id);
    });
    
    toast.success(`${toMarkAsNotified.length} reminders marked as notified`);
    loadData();
  };
  
  const filteredReminders = (reminders: Reminder[]) => {
    if (showNotified) return reminders;
    return reminders.filter(r => !r.notified);
  };
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-0 md:pt-20">
      <header className="my-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-insurance-blue flex items-center">
          <Bell size={24} className="mr-2" />
          Reminders
        </h1>
        
        <div className="flex space-x-2">
          {activeTab === 'today' && todayReminders.length > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              className="border-insurance-blue text-insurance-blue"
              onClick={handleMarkAllAsNotified}
            >
              <Check size={14} className="mr-1" /> Mark All
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Filter size={14} className="mr-1" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setShowNotified(!showNotified)}>
                  <Check 
                    size={14} 
                    className={`mr-2 ${showNotified ? 'opacity-100' : 'opacity-0'}`} 
                  />
                  Show Notified Reminders
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full border-b mb-4 rounded-none bg-transparent space-x-4">
          <TabsTrigger 
            value="today" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-insurance-blue data-[state=active]:bg-transparent"
          >
            <Clock size={14} className="mr-1" /> Today ({todayReminders.length})
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-insurance-blue data-[state=active]:bg-transparent"
          >
            <Calendar size={14} className="mr-1" /> Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-insurance-blue data-[state=active]:bg-transparent"
          >
            All
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          {filteredReminders(todayReminders).length === 0 ? (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
              <Info size={32} className="mb-2 text-gray-400" />
              <p>No reminders for today</p>
            </div>
          ) : (
            filteredReminders(todayReminders).map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={loadData}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {filteredReminders(upcomingReminders).length === 0 ? (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
              <Info size={32} className="mb-2 text-gray-400" />
              <p>No upcoming reminders</p>
            </div>
          ) : (
            filteredReminders(upcomingReminders).map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={loadData}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {filteredReminders(allReminders).length === 0 ? (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
              <Info size={32} className="mb-2 text-gray-400" />
              <p>No reminders found</p>
            </div>
          ) : (
            filteredReminders(allReminders).map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={loadData}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      <Navbar />
    </div>
  );
};

export default Reminders;
