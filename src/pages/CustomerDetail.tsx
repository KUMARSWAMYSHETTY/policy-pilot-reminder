
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PolicyCard from '@/components/PolicyCard';
import { Button } from '@/components/ui/button';
import { 
  getCustomerById, getPoliciesByCustomerId
} from '@/utils/storage';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, 
  FileText, PlusCircle, Edit, Info 
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Policy } from '@/types';

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  
  useEffect(() => {
    if (id) {
      const customerData = getCustomerById(id);
      if (customerData) {
        setCustomer(customerData);
        setPolicies(getPoliciesByCustomerId(id));
      } else {
        toast.error('Customer not found');
        navigate('/customers');
      }
    }
  }, [id, navigate]);
  
  if (!customer) {
    return (
      <div className="container mx-auto px-4 text-center py-10">
        <p>Loading...</p>
      </div>
    );
  }
  
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
          <h1 className="text-2xl font-bold ml-2">Customer Details</h1>
        </div>
        
        <Link to={`/customers/edit/${id}`}>
          <Button size="sm" variant="outline">
            <Edit size={16} className="mr-1" /> Edit
          </Button>
        </Link>
      </header>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="bg-insurance-blue rounded-full p-3 mr-4 text-white">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold">{customer.name}</h2>
          </div>
          
          <div className="space-y-2 ml-2">
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-gray-500" />
              <p>{customer.phone}</p>
            </div>
            
            {customer.email && (
              <div className="flex items-center">
                <Mail size={16} className="mr-2 text-gray-500" />
                <p>{customer.email}</p>
              </div>
            )}
            
            {customer.address && (
              <div className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1 text-gray-500" />
                <p className="whitespace-pre-line">{customer.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FileText size={20} className="mr-2 text-insurance-teal" />
          Policies
        </h2>
        <Link to={`/policies/new/${id}`}>
          <Button size="sm" className="bg-insurance-teal hover:bg-insurance-teal/90">
            <PlusCircle size={16} className="mr-1" /> Add Policy
          </Button>
        </Link>
      </div>
      
      {policies.length === 0 ? (
        <div className="text-center py-6 text-gray-500 flex flex-col items-center">
          <Info size={32} className="mb-2 text-gray-400" />
          <p className="mb-4">No policies added for this customer</p>
          <Link to={`/policies/new/${id}`}>
            <Button className="bg-insurance-teal hover:bg-insurance-teal/90">
              <PlusCircle size={16} className="mr-1" /> Add Policy
            </Button>
          </Link>
        </div>
      ) : (
        policies.map(policy => (
          <PolicyCard key={policy.id} policy={policy} />
        ))
      )}
      
      <Navbar />
    </div>
  );
};

export default CustomerDetail;
