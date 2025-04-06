
import React from 'react';
import { Link } from 'react-router-dom';
import { Policy } from '@/types';
import { getCustomerById } from '@/utils/storage';
import { getNextPaymentDate, formatDate } from '@/utils/dateUtils';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PolicyCardProps {
  policy: Policy;
  showCustomer?: boolean;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, showCustomer = false }) => {
  const customer = getCustomerById(policy.customerId);
  const nextPayment = getNextPaymentDate(policy.paymentDate);
  
  return (
    <Link to={`/policies/${policy.id}`}>
      <Card className="hover:shadow-md transition-shadow mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <div className="bg-insurance-teal rounded-full p-2 mr-3 text-white">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{policy.policyNumber}</h3>
                  <p className="text-sm text-gray-600">{policy.policyType}</p>
                </div>
              </div>
              
              {showCustomer && customer && (
                <p className="text-sm mt-2 text-gray-700">
                  Customer: {customer.name}
                </p>
              )}
              
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>Next payment: {formatDate(nextPayment)}</span>
              </div>
            </div>
            
            <div>
              <Badge variant="outline" className="flex items-center bg-insurance-light-teal text-insurance-dark-blue">
                <DollarSign size={14} className="mr-1" />
                {policy.premium.toFixed(2)}
              </Badge>
              <div className="mt-2 text-xs text-right">
                Payment day: {policy.paymentDate}
                <sup>{getDaySuffix(policy.paymentDate)}</sup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
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

export default PolicyCard;
