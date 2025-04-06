
import React from 'react';
import { Reminder } from '@/types';
import { getCustomerById, getPolicyById, markReminderAsNotified } from '@/utils/storage';
import { formatDate } from '@/utils/dateUtils';
import { Bell, Phone, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReminderCardProps {
  reminder: Reminder;
  onUpdate: () => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onUpdate }) => {
  const customer = getCustomerById(reminder.customerId);
  const policy = getPolicyById(reminder.policyId);
  
  if (!customer || !policy) return null;
  
  const handleCall = () => {
    window.open(`tel:${customer.phone}`);
  };
  
  const handleMarkAsNotified = () => {
    markReminderAsNotified(reminder.id);
    toast.success(`Reminder for ${customer.name} marked as notified`);
    onUpdate();
  };
  
  return (
    <Card className={`mb-4 ${reminder.notified ? 'bg-gray-50' : 'border-l-4 border-l-insurance-blue'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className={`rounded-full p-2 mr-3 text-white ${reminder.notified ? 'bg-gray-400' : 'bg-insurance-blue'}`}>
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <p className="text-sm text-gray-600">
                Policy: {policy.policyNumber} ({policy.policyType})
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Payment due: {formatDate(new Date(reminder.dueDate))}
                <span className="ml-2 font-medium text-insurance-red">
                  (Day {policy.paymentDate})
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Premium: ₹{policy.premium.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {!reminder.notified && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleCall}
                >
                  <Phone size={14} className="mr-1" /> Call
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleMarkAsNotified}
                >
                  <CheckCircle size={14} className="mr-1" /> Done
                </Button>
              </>
            )}
            {reminder.notified && (
              <Badge className="bg-gray-400">Notified</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-2 py-1 rounded text-white text-xs ${className}`}>
    {children}
  </div>
);

export default ReminderCard;
