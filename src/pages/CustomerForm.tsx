
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { saveCustomer, getCustomerById } from '@/utils/storage';
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
import { Customer } from '@/types';
import { deleteCustomer } from '@/utils/storage';
import { generateId } from '@/utils/storage';

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== 'new';
  
  const [customer, setCustomer] = useState<Customer>({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  useEffect(() => {
    if (isEditing) {
      const existingCustomer = getCustomerById(id!);
      if (existingCustomer) {
        setCustomer(existingCustomer);
      } else {
        toast.error('Customer not found');
        navigate('/customers');
      }
    } else {
      // Initialize with a new ID for new customers
      setCustomer(prev => ({
        ...prev,
        id: generateId()
      }));
      console.log('Creating new customer');
    }
  }, [id, isEditing, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customer.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    if (!customer.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    
    try {
      // Save customer
      const savedCustomer = saveCustomer(customer);
      console.log('Customer saved:', savedCustomer);
      toast.success(`Customer ${isEditing ? 'updated' : 'added'} successfully`);
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer. Please try again.');
    }
  };
  
  const handleDelete = () => {
    deleteCustomer(id!);
    toast.success('Customer deleted successfully');
    navigate('/customers');
  };
  
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
          <h1 className="text-2xl font-bold text-insurance-blue ml-2">
            {isEditing ? 'Edit Customer' : 'Add Customer'}
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
                  This will permanently delete this customer and all their policies.
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
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            name="name"
            value={customer.name}
            onChange={handleInputChange}
            placeholder="Enter customer name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={customer.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={customer.email}
            onChange={handleInputChange}
            placeholder="Enter email address (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={customer.address}
            onChange={handleInputChange}
            placeholder="Enter address (optional)"
            rows={3}
          />
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-insurance-blue hover:bg-insurance-dark-blue"
          >
            <Save size={16} className="mr-1" /> 
            {isEditing ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
      
      <Navbar />
    </div>
  );
};

export default CustomerForm;
