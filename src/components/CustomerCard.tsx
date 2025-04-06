
import React from 'react';
import { Link } from 'react-router-dom';
import { Customer } from '@/types';
import { getPoliciesByCustomerId } from '@/utils/storage';
import { User, Phone, Mail, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CustomerCardProps {
  customer: Customer;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const policies = getPoliciesByCustomerId(customer.id);
  
  return (
    <Link to={`/customers/${customer.id}`}>
      <Card className="hover:shadow-md transition-shadow mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-insurance-blue rounded-full p-2 mr-3 text-white">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Phone size={14} className="mr-1" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Mail size={14} className="mr-1" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="flex items-center">
                <FileText size={14} className="mr-1" />
                {policies.length} {policies.length === 1 ? 'Policy' : 'Policies'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CustomerCard;
