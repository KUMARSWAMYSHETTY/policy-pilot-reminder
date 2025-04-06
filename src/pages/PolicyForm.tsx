import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { savePolicy, getPolicyById, getCustomerById, getCustomers, generateId, getPolicies } from '@/utils/storage';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Policy, Customer } from '@/types';
import { deletePolicy } from '@/utils/storage';
import { formatDate } from '@/utils/dateUtils';

const PolicyForm = () => {
  const navigate = useNavigate();
  const { id, customerId } = useParams();
  const isEditing = id !== undefined && id !== 'new';
  
  const [policy, setPolicy] = useState<Policy>({
    id: '',
    customerId: customerId || '',
    policyNumber: '',
    policyType: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentDate: 1,
    premium: 0,
    notes: ''
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerName, setCustomerName] = useState('');
  
  useEffect(() => {
    console.log('PolicyForm initialized with id:', id, 'customerId:', customerId);
    console.log('isEditing:', isEditing);
    
    setCustomers(getCustomers());
    
    if (isEditing) {
      const existingPolicy = getPolicyById(id!);
      if (existingPolicy) {
        setPolicy(existingPolicy);
        
        const customer = getCustomerById(existingPolicy.customerId);
        if (customer) {
          setCustomerName(customer.name);
        }
      } else {
        toast.error('Policy not found');
        navigate('/policies');
      }
    } else if (customerId) {
      // Make sure we have a fresh ID for new policies
      const newId = generateId();
      setPolicy(prev => ({
        ...prev,
        id: newId,
        customerId: customerId
      }));
      console.log('Creating new policy with ID:', newId);
      
      const customer = getCustomerById(customerId);
      if (customer) {
        setCustomerName(customer.name);
      } else {
        toast.error('Customer not found');
        navigate('/customers');
      }
    }
  }, [id, customerId, isEditing, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPolicy(prev => ({
      ...prev,
      [name]: name === 'premium' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleDateChange = (value: number) => {
    setPolicy(prev => ({
      ...prev,
      paymentDate: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!policy.policyNumber.trim()) {
      toast.error('Policy number is required');
      return;
    }
    
    if (!policy.policyType.trim()) {
      toast.error('Policy type is required');
      return;
    }
    
    if (policy.premium <= 0) {
      toast.error('Premium must be greater than zero');
      return;
    }
    
    if (!policy.customerId) {
      toast.error('Customer is required');
      return;
    }
    
    try {
      console.log('Saving policy with data:', policy);
      
      // Save policy
      const savedPolicy = savePolicy(policy);
      console.log('Policy saved successfully:', savedPolicy);
      
      // Wait a moment to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the save
      const policies = getPolicies();
      const savedPolicyExists = policies.some(p => p.id === savedPolicy.id);
      
      if (!savedPolicyExists) {
        throw new Error('Policy was not saved successfully');
      }
      
      toast.success(`Policy ${isEditing ? 'updated' : 'added'} successfully`);
      
      if (isEditing) {
        navigate(-1);
      } else {
        navigate(`/customers/${policy.customerId}`);
      }
    } catch (error) {
      console.error('Error saving policy:', error);
      
      // Show specific error messages based on the error
      if (error instanceof Error) {
        if (error.message === 'Customer not found') {
          toast.error('Selected customer not found. Please select a valid customer.');
        } else if (error.message === 'Failed to save policy to storage') {
          toast.error('Failed to save policy. Please try again.');
        } else {
          toast.error(error.message || 'Failed to save policy');
        }
      } else {
        toast.error('An unexpected error occurred while saving the policy');
      }
    }
  };
  
  const handleDelete = () => {
    deletePolicy(id!);
    toast.success('Policy deleted successfully');
    navigate(-1);
  };
  
  // Generate days 1-31 for payment date selection
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
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
          <h1 className="text-2xl font-bold text-insurance-teal ml-2">
            {isEditing ? 'Edit Policy' : 'Add Policy'}
          </h1>
        </div>
        
        {isEditing && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 size={16} className="mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this policy.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Customer</Label>
          {isEditing || customerId ? (
            <Input value={customerName} disabled />
          ) : (
            <Select 
              value={policy.customerId} 
              onValueChange={(value) => {
                setPolicy(prev => ({ ...prev, customerId: value }));
                const customer = customers.find(c => c.id === value);
                if (customer) {
                  setCustomerName(customer.name);
                }
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="policyNumber">Policy Number *</Label>
          <Input
            id="policyNumber"
            name="policyNumber"
            value={policy.policyNumber}
            onChange={handleInputChange}
            placeholder="Enter policy number"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="policyType">Policy Type *</Label>
          <Select 
            value={policy.policyType} 
            onValueChange={(value) => setPolicy(prev => ({ ...prev, policyType: value }))}
            required
          >
            <SelectTrigger id="policyType">
              <SelectValue placeholder="Select policy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Life Insurance">Life Insurance</SelectItem>
              <SelectItem value="Health Insurance">Health Insurance</SelectItem>
              <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
              <SelectItem value="Home Insurance">Home Insurance</SelectItem>
              <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
              <SelectItem value="Term Insurance">Term Insurance</SelectItem>
              <SelectItem value="Endowment Plan">Endowment Plan</SelectItem>
              <SelectItem value="ULIP">ULIP</SelectItem>
              <SelectItem value="Pension Plan">Pension Plan</SelectItem>
              <SelectItem value="Child Plan">Child Plan</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={policy.startDate}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Monthly Payment Date *</Label>
          <Select 
            value={policy.paymentDate.toString()} 
            onValueChange={(value) => handleDateChange(parseInt(value))}
            required
          >
            <SelectTrigger id="paymentDate">
              <SelectValue placeholder="Select payment day" />
            </SelectTrigger>
            <SelectContent>
              {days.map(day => (
                <SelectItem key={day} value={day.toString()}>
                  {day}{getDaySuffix(day)} of every month
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="premium">Premium Amount (₹) *</Label>
          <Input
            id="premium"
            name="premium"
            type="number"
            step="0.01"
            min="0"
            value={policy.premium}
            onChange={handleInputChange}
            placeholder="Enter premium amount"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={policy.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes about this policy"
            rows={3}
          />
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-insurance-teal hover:bg-insurance-teal/90"
          >
            <Save size={16} className="mr-1" /> 
            {isEditing ? 'Update Policy' : 'Add Policy'}
          </Button>
        </div>
      </form>
      
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

export default PolicyForm;
