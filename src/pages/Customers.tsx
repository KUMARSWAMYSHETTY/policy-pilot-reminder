
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CustomerCard from '@/components/CustomerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCustomers } from '@/utils/storage';
import { PlusCircle, Search, Users } from 'lucide-react';
import { Customer } from '@/types';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setCustomers(getCustomers());
  }, []);
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-0 md:pt-20">
      <header className="my-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-insurance-blue flex items-center">
          <Users size={24} className="mr-2" />
          Customers
        </h1>
        <Link to="/customers/new">
          <Button className="bg-insurance-blue hover:bg-insurance-dark-blue">
            <PlusCircle size={16} className="mr-1" /> Add
          </Button>
        </Link>
      </header>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search customers..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-10">
          {searchQuery ? (
            <p className="text-gray-500">No customers match your search</p>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">You haven't added any customers yet</p>
              <Link to="/customers/new">
                <Button className="bg-insurance-blue hover:bg-insurance-dark-blue">
                  <PlusCircle size={16} className="mr-1" /> Add Customer
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        filteredCustomers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))
      )}
      
      <Navbar />
    </div>
  );
};

export default Customers;
