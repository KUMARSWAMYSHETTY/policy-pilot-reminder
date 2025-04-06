
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  getPolicyById, getCustomerById, updatePolicyReminders
} from '@/utils/storage';
import { 
  ArrowLeft, FileText, User, Calendar, DollarSign, 
  AlarmClock, CalendarCheck, Edit, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, getNextPaymentDate, getReminderDate } from '@/utils/dateUtils';
import { Policy } from '@/types';

const PolicyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const policyData = getPolicyById(id);
      if (policyData) {
        setPolicy(policyData);
        
        const customerData = getCustomerById(policyData.customerId);
        if (customerData) {
          setCustomer(customerData);
        }
      } else {
        toast.error('Policy not found');
        navigate('/policies');
      }
    }
  }, [id, navigate]);
  
  const handleRefreshReminders = () => {
    if (policy) {
      updatePolicyReminders(policy);
      toast.success('Reminder updated successfully');
    }
  };
  
  if (!policy || !customer) {
    return (
      <div className="container mx-auto px-4 text-center py-10">
        <p>Loading...</p>
      </div>
    );
  }
  
  const nextPaymentDate = getNextPaymentDate(policy.paymentDate);
  const reminderDate = getReminderDate(nextPaymentDate);
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-0 md:pt-20">
      <header className="my-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Policy Details</h1>
        </div>
        
        <Link to={`/policies/edit/${id}`}>
          <Button size="sm" variant="outline">
            <Edit size={16} className="mr-1" /> Edit
          </Button>
        </Link>
      </header>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="bg-insurance-teal rounded-full p-3 mr-4 text-white">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{policy.policyNumber}</h2>
              <p className="text-sm text-gray-600">{policy.policyType}</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center">
              <User size={18} className="mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <Link to={`/customers/${customer.id}`} className="text-insurance-blue hover:underline">
                  {customer.name}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar size={18} className="mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p>{formatDate(new Date(policy.startDate))}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-insurance-blue" />
              <div>
                <p className="text-sm text-gray-600">Monthly Payment Date</p>
                <p className="font-medium">
                  {policy.paymentDate}
                  <sup>{getDaySuffix(policy.paymentDate)}</sup> of every month
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign size={18} className="mr-2 text-insurance-teal" />
              <div>
                <p className="text-sm text-gray-600">Premium Amount</p>
                <p className="font-medium">₹{policy.premium.toFixed(2)}</p>
              </div>
            </div>
            
            {policy.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="whitespace-pre-line">{policy.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 border-insurance-blue border-l-4">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg flex items-center mb-3">
            <AlarmClock size={18} className="mr-2 text-insurance-blue" />
            Payment Schedule
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Next Payment Date</p>
              <p className="font-semibold text-insurance-blue">{formatDate(nextPaymentDate)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Reminder Date (3 days prior)</p>
              <p>{formatDate(reminderDate)}</p>
            </div>
            
            <Button 
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={handleRefreshReminders}
            >
              <RefreshCw size={14} className="mr-1" /> Update Reminder
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Navbar />
    </div>
  );
};

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return 'th';
  
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default PolicyDetail;
