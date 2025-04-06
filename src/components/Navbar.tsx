
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bell, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 md:top-0 md:bottom-auto">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center",
                isActive 
                  ? "text-insurance-blue" 
                  : "text-gray-500 hover:text-insurance-blue"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
