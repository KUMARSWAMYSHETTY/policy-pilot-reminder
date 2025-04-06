
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PolicyCard from '@/components/PolicyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getPolicies, getCustomers } from '@/utils/storage';
import { FileText, Search, PlusCircle, Info } from 'lucide-react';
import { Policy } from '@/types';

const Policies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCustomers, setHasCustomers] = useState(false);
  
  useEffect(() => {
    setPolicies(getPolicies());
    setHasCustomers(getCustomers().length > 0);
  }, []);
  
  const filteredPolicies = policies.filter(policy => 
    policy.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.policyType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-0 md:pt-20">
      <header className="my-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-insurance-teal flex items-center">
          <FileText size={24} className="mr-2" />
          Policies
        </h1>
        {hasCustomers && (
          <Link to="/customers">
            <Button className="bg-insurance-teal hover:bg-insurance-teal/90">
              <PlusCircle size={16} className="mr-1" /> Add
            </Button>
          </Link>
        )}
      </header>
      
      {hasCustomers && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search policies..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {!hasCustomers ? (
        <div className="text-center py-10">
          <div className="flex flex-col items-center">
            <Info size={32} className="mb-2 text-gray-400" />
            <p className="text-gray-500 mb-4">You need to add customers before adding policies</p>
            <Link to="/customers/new">
              <Button className="bg-insurance-blue hover:bg-insurance-dark-blue">
                <PlusCircle size={16} className="mr-1" /> Add Customer
              </Button>
            </Link>
          </div>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="text-center py-10">
          {searchQuery ? (
            <p className="text-gray-500">No policies match your search</p>
          ) : (
            <div className="flex flex-col items-center">
              <Info size={32} className="mb-2 text-gray-400" />
              <p className="text-gray-500 mb-4">You haven't added any policies yet</p>
              <Link to="/customers">
                <Button className="bg-insurance-teal hover:bg-insurance-teal/90">
                  <PlusCircle size={16} className="mr-1" /> Add Policy
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        filteredPolicies.map(policy => (
          <PolicyCard key={policy.id} policy={policy} showCustomer={true} />
        ))
      )}
      
      <Navbar />
    </div>
  );
};

export default Policies;
